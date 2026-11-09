import { TxIconName } from '@tectra-ng/icons';
import { DOC_COMPONENTS } from '../../generated/registry';
import { DocNavSection } from '../types/navigation.interface';

export const CATEGORY_ICONS: Record<string, TxIconName> = {
  Actions: 'bolt',
  Blocks: 'objects-column',
  Data: 'table',
  Display: 'eye',
  Feedback: 'comment',
  Form: 'pencil',
  Layout: 'th-large',
  Media: 'image',
  Navigation: 'bars',
  Overlay: 'window-maximize',
};

const categories = [...new Set(DOC_COMPONENTS.map((component) => component.category))].sort();

export const DOC_NAVIGATION: DocNavSection[] = [
  {
    groups: [
      {
        title: 'Get started',
        icon: 'compass',
        links: [
          { label: 'Introduction', path: '/docs' },
          { label: 'Installation', path: '/getting-started' },
          { label: 'Theming', path: '/theming' },
          { label: 'Icons', path: '/icons' },
        ],
      },
      {
        title: 'Core',
        icon: 'cog',
        links: [
          { label: 'Overlay', path: '/core/overlay' },
          { label: 'Locale', path: '/core/locale' },
        ],
      },
    ],
  },
  {
    title: 'Components',
    groups: categories.map((category) => ({
      title: category,
      icon: CATEGORY_ICONS[category] ?? 'box',
      links: DOC_COMPONENTS.filter((component) => component.category === category).map((component) => ({
        label: component.title,
        path: `/components/${component.name}`,
      })),
    })),
  },
];
