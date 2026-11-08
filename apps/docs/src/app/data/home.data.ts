import { TxIconName } from '@tectra-ng/icons';

export const HOME_FEATURES: { icon: TxIconName; title: string; text: string }[] = [
  { icon: 'bolt', title: 'Signals, zoneless', text: 'Standalone, OnPush, signal inputs. No legacy.' },
  { icon: 'palette', title: 'Design tokens', text: 'Every size and colour is a CSS variable.' },
  { icon: 'sliders-h', title: 'dt · pt · unstyled', text: 'Restyle one instance or the whole app.' },
  { icon: 'sparkles', title: 'Motion that feels right', text: 'Ripple, transitions, reduced-motion aware.' },
  { icon: 'th-large', title: '334 icons', text: 'Drawn for tectra on one grid.' },
  { icon: 'shield', title: 'Accessible', text: 'Keyboard, ARIA, focus rings built in.' },
];

export const HOME_ROLES = [
  { label: 'Developer', value: 'developer' },
  { label: 'Designer', value: 'designer' },
  { label: 'Manager', value: 'manager' },
];

export const HOME_MARQUEE_ICONS: TxIconName[] = [
  'home', 'search', 'bell', 'user', 'cog', 'heart', 'star', 'bolt', 'cloud', 'lock', 'calendar', 'chart-line', 'trash', 'pencil',
  'send', 'gift', 'globe', 'camera', 'map-marker', 'filter', 'download', 'link', 'bookmark', 'sparkles', 'database', 'code',
];

export const INSTALL_COMMAND = 'npm i tectra-ng';
