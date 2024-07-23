import * as React from 'react';
import { Steps } from 'storywright';
import { getStoryVariant, RTL, StoryWrightDecorator, TestWrapperDecorator } from '../utilities';
import { Nav, INavLink } from '@fluentui/react/lib/Nav';

const links: INavLink[] = [
  {
    name: 'Home',
    url: 'http://example.com',
    links: [
      {
        name: 'Activity',
        icon: 'Upload',
        url: 'http://msn.com',
        key: 'key1',
      },
      {
        name: 'News',
        url: 'http://msn.com',
        key: 'key2',
      },
    ],
    isExpanded: true,
  },
  {
    name: 'Documents',
    icon: 'Accept',
    url: 'http://example.com',
    key: 'key3',
  },
  {
    name: 'Pages',
    url: 'http://msn.com',
    key: 'key4',
  },
  {
    name: 'Notebook',
    url: 'http://msn.com',
    key: 'key5',
  },
  {
    name: 'Long Name Test for elipse',
    url: 'http://msn.com',
    key: 'key6',
  },
  {
    name: 'Edit',
    url: 'http://cnn.com',
    icon: 'Edit',
    key: 'key8',
  },
];

const disabledLinks: INavLink[] = [
  {
    name: 'Home',
    url: 'http://example.com',
    disabled: true,
    links: [
      {
        name: 'Activity',
        url: 'http://msn.com',
        key: 'key1',
      },
      {
        name: 'MSN',
        url: 'http://msn.com',
        key: 'key2',
        disabled: true,
      },
    ],
    isExpanded: true,
  },
  {
    name: 'Documents',
    url: 'http://example.com',
    key: 'key3',
  },
  {
    name: 'Unavailable Item',
    url: 'http://cnn.com',
    icon: 'News',
    disabled: true,
    key: 'key4',
  },
];

export default {
  title: 'Nav',

  decorators: [
    TestWrapperDecorator,
    StoryWrightDecorator(
      new Steps()
        .snapshot('default', { cropTo: '.testWrapper' })
        .hover('.ms-Nav-compositeLink')
        .snapshot('hover', { cropTo: '.testWrapper' })
        .click('.ms-Nav-chevronButton')
        .hover('.ms-Nav-compositeLink')
        .snapshot('click', { cropTo: '.testWrapper' })
        .end(),
    ),
  ],
};

export const Root = () => (
  <div style={{ width: '208px' }}>
    <Nav groups={[{ links }]} selectedKey="key3" />
  </div>
);

export const RootRTL = getStoryVariant(Root, RTL);

export const Disabled = () => (
  <div style={{ width: '208px' }}>
    <Nav groups={[{ links: disabledLinks }]} selectedKey="key3" />
  </div>
);

export const DisabledRTL = getStoryVariant(Disabled, RTL);
