import { TAGS, type TestTag } from '@config/test-tags';

export interface NavigationEntry {
  name: string;
  path: string;
  tag: TestTag;
}

/** Top landing links — Add/Remove Elements is the critical @smoke path; others are @regression. */
export const NAVIGATION_MAP: NavigationEntry[] = [
  { name: 'Add/Remove Elements', path: '/add_remove_elements', tag: TAGS.SMOKE },
  { name: 'A/B Testing', path: '/abtest', tag: TAGS.REGRESSION },
  { name: 'Broken Images', path: '/broken_images', tag: TAGS.REGRESSION },
  { name: 'Challenging DOM', path: '/challenging_dom', tag: TAGS.REGRESSION },
  { name: 'Checkboxes', path: '/checkboxes', tag: TAGS.REGRESSION },
  { name: 'Context Menu', path: '/context_menu', tag: TAGS.REGRESSION },
  { name: 'Disappearing Elements', path: '/disappearing_elements', tag: TAGS.REGRESSION },
  { name: 'Drag and Drop', path: '/drag_and_drop', tag: TAGS.REGRESSION },
  { name: 'Dropdown', path: '/dropdown', tag: TAGS.REGRESSION },
  { name: 'Dynamic Controls', path: '/dynamic_controls', tag: TAGS.REGRESSION },
];
