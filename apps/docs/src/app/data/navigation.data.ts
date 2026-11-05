import { DOC_COMPONENTS } from '../../generated/registry';
import { DocNavGroup } from '../types/navigation.interface';

const categories = [...new Set(DOC_COMPONENTS.map((component) => component.category))].sort();

export const DOC_NAVIGATION: DocNavGroup[] = [
  {
    title: 'Get started',
    links: [
      { label: 'Introduction', path: '/' },
      { label: 'Installation', path: '/getting-started' },
      { label: 'Theming', path: '/theming' },
      { label: 'Icons', path: '/icons' },
    ],
  },
  ...categories.map((category) => ({
    title: category,
    links: DOC_COMPONENTS.filter((component) => component.category === category).map((component) => ({
      label: component.title,
      path: `/components/${component.name}`,
    })),
  })),
];
