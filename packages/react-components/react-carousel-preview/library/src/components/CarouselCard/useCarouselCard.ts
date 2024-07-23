import { getIntrinsicElementProps, slot, useMergedRefs } from '@fluentui/react-utilities';
import * as React from 'react';

import { CAROUSEL_ACTIVE_ITEM, CAROUSEL_ITEM } from '../constants';
import { useCarouselStore_unstable } from '../useCarouselStore';
import { EMBLA_VISIBILITY_EVENT } from '../useEmblaCarousel';
import type { CarouselCardProps, CarouselCardState } from './CarouselCard.types';
import { CarouselVisibilityChangeEvent } from '../Carousel/Carousel.types';

/**
 * Create the state required to render CarouselCard.
 *
 * The returned state can be modified with hooks such as useCarouselCardStyles_unstable,
 * before being passed to renderCarouselCard_unstable.
 *
 * @param props - props from this instance of CarouselCard
 * @param ref - reference to root HTMLDivElement of CarouselCard
 */

export const useCarouselCard_unstable = (
  props: CarouselCardProps,
  ref: React.Ref<HTMLDivElement>,
): CarouselCardState => {
  const { value } = props;

  const elementRef = React.useRef<HTMLDivElement>(null);
  const isActiveIndex = useCarouselStore_unstable(snapshot => snapshot.activeValue === value);

  React.useEffect(() => {
    const element = elementRef.current;

    if (element) {
      const listener = (_e: Event) => {
        const event = _e as CarouselVisibilityChangeEvent;
        const hidden = !event.detail.isVisible;

        element.ariaHidden = hidden.toString();
        element.inert = hidden;

        // TODO: handle "tabIndex" ?
      };

      element.addEventListener(EMBLA_VISIBILITY_EVENT, listener);

      return () => {
        element.removeEventListener(EMBLA_VISIBILITY_EVENT, listener);
      };
    }
  }, []);

  const state: CarouselCardState = {
    value,
    components: {
      root: 'div',
    },
    root: slot.always(
      getIntrinsicElementProps('div', {
        ref: useMergedRefs(elementRef, ref),
        [CAROUSEL_ITEM]: value,
        [CAROUSEL_ACTIVE_ITEM]: isActiveIndex,
        role: 'presentation',
        ...props,
      }),
      { elementType: 'div' },
    ),
  };

  return state;
};
