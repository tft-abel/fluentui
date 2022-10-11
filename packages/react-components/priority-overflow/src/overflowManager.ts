import { debounce } from './debounce';
import { createPriorityQueue } from './priorityQueue';
import type { OverflowGroupState, OverflowItemEntry, OverflowManager, ObserveOptions } from './types';

/**
 * @internal
 * @returns overflow manager instance
 */
export function createOverflowManager(): OverflowManager {
  let container: HTMLElement | undefined;
  let overflowMenu: HTMLElement | undefined;
  let observing = false;
  const options: Required<ObserveOptions> = {
    padding: 10,
    overflowAxis: 'horizontal',
    overflowDirection: 'end',
    minimumVisible: 0,
    onUpdateItemVisibility: () => undefined,
    onUpdateOverflow: () => undefined,
  };

  const overflowItems: Record<string, OverflowItemEntry> = {};
  const overflowGroups: Record<string, { visibleItemIds: Set<string>; invisibleItemIds: Set<string> }> = {};
  const resizeObserver = new ResizeObserver(entries => {
    if (!entries[0] || !container) {
      return;
    }

    update();
  });

  const invisibleItemQueue = createPriorityQueue<string>((a, b) => {
    const itemA = overflowItems[a];
    const itemB = overflowItems[b];
    // Higher priority at the top of the queue
    const priority = itemB.priority - itemA.priority;
    if (priority !== 0) {
      return priority;
    }

    const positionStatusBit =
      options.overflowDirection === 'end' ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING;

    // equal priority, use DOM order
    // eslint-disable-next-line no-bitwise
    return itemA.element.compareDocumentPosition(itemB.element) & positionStatusBit ? -1 : 1;
  });

  const visibleItemQueue = createPriorityQueue<string>((a, b) => {
    const itemA = overflowItems[a];
    const itemB = overflowItems[b];
    // Lower priority at the top of the queue
    const priority = itemA.priority - itemB.priority;

    if (priority !== 0) {
      return priority;
    }

    const positionStatusBit =
      options.overflowDirection === 'end' ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING;

    // equal priority, use DOM order
    // eslint-disable-next-line no-bitwise
    return itemA.element.compareDocumentPosition(itemB.element) & positionStatusBit ? -1 : 1;
  });

  const getOffsetSize = (el: HTMLElement) => {
    return options.overflowAxis === 'horizontal' ? el.offsetWidth : el.offsetHeight;
  };

  const makeItemVisible = () => {
    const nextVisible = invisibleItemQueue.dequeue();
    visibleItemQueue.enqueue(nextVisible);

    const item = overflowItems[nextVisible];
    options.onUpdateItemVisibility({ item, visible: true });
    if (item.groupId) {
      overflowGroups[item.groupId].invisibleItemIds.delete(item.id);
      overflowGroups[item.groupId].visibleItemIds.add(item.id);
    }

    return getOffsetSize(item.element);
  };

  const makeItemInvisible = () => {
    const nextInvisible = visibleItemQueue.dequeue();
    invisibleItemQueue.enqueue(nextInvisible);

    const item = overflowItems[nextInvisible];
    const width = getOffsetSize(item.element);
    options.onUpdateItemVisibility({ item, visible: false });
    if (item.groupId) {
      overflowGroups[item.groupId].visibleItemIds.delete(item.id);
      overflowGroups[item.groupId].invisibleItemIds.add(item.id);
    }

    return width;
  };

  const dispatchOverflowUpdate = () => {
    const visibleItemIds = visibleItemQueue.all();
    const invisibleItemIds = invisibleItemQueue.all();

    const visibleItems = visibleItemIds.map(itemId => overflowItems[itemId]);
    const invisibleItems = invisibleItemIds.map(itemId => overflowItems[itemId]);

    const groupVisibility: Record<string, OverflowGroupState> = {};
    Object.entries(overflowGroups).forEach(([groupId, groupState]) => {
      if (groupState.invisibleItemIds.size && groupState.visibleItemIds.size) {
        groupVisibility[groupId] = 'overflow';
      } else if (groupState.visibleItemIds.size === 0) {
        groupVisibility[groupId] = 'hidden';
      } else {
        groupVisibility[groupId] = 'visible';
      }
    });

    options.onUpdateOverflow({ visibleItems, invisibleItems, groupVisibility });
  };

  const processOverflowItems = (availableSize: number) => {
    if (!container) {
      return;
    }

    const overflowMenuOffset = overflowMenu ? getOffsetSize(overflowMenu) : 0;

    // Snapshot of the visible/invisible state to compare for updates
    const visibleTop = visibleItemQueue.peek();
    const invisibleTop = invisibleItemQueue.peek();

    const visibleItemIds = visibleItemQueue.all();
    let currentWidth = visibleItemIds.reduce((sum, visibleItemId) => {
      const child = overflowItems[visibleItemId].element;
      return sum + getOffsetSize(child);
    }, 0);

    // Add items until available width is filled
    while (currentWidth < availableSize && invisibleItemQueue.size() > 0) {
      currentWidth += makeItemVisible();
    }
    // Remove items until there's no more overlap
    while (currentWidth > availableSize && visibleItemQueue.size() > 0) {
      if (visibleItemQueue.size() === options.minimumVisible) {
        break;
      }
      currentWidth -= makeItemInvisible();
    }

    if (invisibleItemQueue.size() > 0 && currentWidth + overflowMenuOffset > availableSize) {
      makeItemInvisible();
    }

    // only update when the state of visible/invisible items has changed
    if (visibleItemQueue.peek() !== visibleTop || invisibleItemQueue.peek() !== invisibleTop) {
      dispatchOverflowUpdate();
    }
  };

  const forceUpdate: OverflowManager['forceUpdate'] = () => {
    if (!container) {
      return;
    }

    const availableSize = getOffsetSize(container) - options.padding;
    processOverflowItems(availableSize);
  };

  const update: OverflowManager['update'] = debounce(forceUpdate);

  const observe: OverflowManager['observe'] = (observedContainer, userOptions) => {
    Object.assign(options, userOptions);
    observing = true;
    Object.values(overflowItems).forEach(item => visibleItemQueue.enqueue(item.id));

    container = observedContainer;
    resizeObserver.observe(container);
  };

  const disconnect: OverflowManager['disconnect'] = () => {
    observing = false;
    resizeObserver.disconnect();
  };

  const addItem: OverflowManager['addItem'] = item => {
    if (overflowItems[item.id]) {
      return;
    }

    overflowItems[item.id] = item;

    // some options can affect priority which are only set on `observe`
    if (observing) {
      visibleItemQueue.enqueue(item.id);
    }

    if (item.groupId) {
      if (!overflowGroups[item.groupId]) {
        overflowGroups[item.groupId] = {
          visibleItemIds: new Set<string>(),
          invisibleItemIds: new Set<string>(),
        };
      }

      overflowGroups[item.groupId].visibleItemIds.add(item.id);
    }

    update();
  };

  const addOverflowMenu: OverflowManager['addOverflowMenu'] = el => {
    overflowMenu = el;
  };

  const removeOverflowMenu: OverflowManager['removeOverflowMenu'] = () => {
    overflowMenu = undefined;
  };

  const removeItem: OverflowManager['removeItem'] = itemId => {
    if (!overflowItems[itemId]) {
      return;
    }

    const item = overflowItems[itemId];
    visibleItemQueue.remove(itemId);
    invisibleItemQueue.remove(itemId);

    if (item.groupId) {
      overflowGroups[item.groupId].visibleItemIds.delete(item.id);
      overflowGroups[item.groupId].invisibleItemIds.delete(item.id);
    }

    delete overflowItems[itemId];
    update();
  };

  return {
    addItem,
    disconnect,
    forceUpdate,
    observe,
    removeItem,
    update,
    addOverflowMenu,
    removeOverflowMenu,
  };
}