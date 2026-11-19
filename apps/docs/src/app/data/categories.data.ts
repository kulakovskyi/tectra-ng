import { DOC_COMPONENTS } from '../../generated/registry';
import { DocCategory, DocCategoryText } from '../types/category.interface';
import { CATEGORY_ICONS } from './navigation.data';

const CATEGORY_TEXT: Record<string, DocCategoryText> = {
  Actions: {
    heading: 'Angular button components',
    title: 'Angular button components: button, split button, speed dial — tectra',
    intro:
      'Buttons for Angular apps: a button attribute for native buttons and links with severities, icons, badges and a loading state, button groups, split buttons with a menu and a speed dial. Every one is a standalone component on signals, themed by design tokens and usable from the keyboard.',
  },
  Blocks: {
    heading: 'Angular page blocks and app layouts',
    title: 'Angular page blocks: app layout, page header, command palette, kanban — tectra',
    intro:
      'Ready parts of an Angular app built from the kit components: an app layout with a sidebar, a console layout, page headers, a command palette, a kanban board, a wizard, empty states, a cookie notice and theme and language switches. Drop them into a page and change them through inputs and templates.',
  },
  Charts: {
    heading: 'Angular charts',
    title: 'Angular charts: line, bar, pie, sankey, gantt and more SVG charts — tectra',
    intro:
      'Chart components for Angular drawn as SVG by the components themselves — no chart library to load. Line, column and bar, pie and donut, sankey, gantt, heatmap, treemap, candlestick, funnel, radar, gauge and more. They render on the server, take every colour from the design tokens so light and dark themes just work, and come with tooltips and legends, readable with the keyboard and screen readers.',
  },
  Code: {
    heading: 'Angular code editor and syntax highlighting',
    title: 'Angular code editor, code diff and syntax highlighting — tectra',
    intro:
      'A code editor for Angular forms with syntax highlighting for HTML, CSS, TypeScript, JSON and Markdown, search and replace, undo history and bracket matching, a code diff inline or side by side, and static highlighted code that renders on the server without loading an editor.',
  },
  Data: {
    heading: 'Angular data table and data components',
    title: 'Angular data table, tree table, paginator and data components — tectra',
    intro:
      'Components for showing data in Angular: a data table with sorting, filters, pagination, server data, selection, editing and row actions, a tree table, a tree, a data view with list and grid layouts, a paginator, a virtual scroller, a timeline, stat tiles, sparklines and export to CSV, Excel, PDF and more.',
  },
  Display: {
    heading: 'Angular display components',
    title: 'Angular display components: avatar, badge, chip, tag — tectra',
    intro:
      'Small components that show a value in Angular templates: avatars, badges and overlay badges, chips, tags, pills, status icons, links, formatted amounts, countries with flags, highlighted search matches and truncated text with a hint.',
  },
  Feedback: {
    heading: 'Angular feedback components',
    title: 'Angular feedback components: message, progress bar, spinner, skeleton — tectra',
    intro:
      'Components that tell people what is happening in an Angular app: inline messages and field errors, progress bars, progress spinners and skeleton placeholders while content loads.',
  },
  Form: {
    heading: 'Angular form components',
    title: 'Angular form components: input, select, datepicker, autocomplete — tectra',
    intro:
      'Form controls for Angular that work with reactive forms, template-driven forms and signal forms: inputs and input masks, number inputs, selects, multiselects, autocomplete, a datepicker, checkboxes, radio buttons, switches, sliders, file upload, a rich text editor and more. Every control has a label, a hint and an error slot, keyboard support and ARIA wiring out of the box.',
  },
  Layout: {
    heading: 'Angular layout components',
    title: 'Angular layout components: card, panel, splitter, toolbar — tectra',
    intro:
      'Containers that structure an Angular page: cards, panels with header actions, fieldsets that collapse, dividers, a resizable splitter, a toolbar and a scroll panel with slim themed scroll bars.',
  },
  Media: {
    heading: 'Angular image and gallery components',
    title: 'Angular image, gallery and carousel components — tectra',
    intro:
      'Components for pictures in Angular: an image with a full-screen preview, zoom and rotate, a gallery with thumbnails, a slideshow and a full-screen mode, and a carousel for cards and slides with swipes and keyboard navigation.',
  },
  Misc: {
    heading: 'Angular clock and countdown components',
    title: 'Angular analog clock and countdown components — tectra',
    intro: 'An analog clock that shows the time of any time zone and a countdown to a date, both as standalone Angular components.',
  },
  Navigation: {
    heading: 'Angular navigation components',
    title: 'Angular navigation components: tabs, menubar, breadcrumb, stepper — tectra',
    intro:
      'Navigation for Angular apps: tabs, a menubar, a panel menu for sidebars, breadcrumbs, a stepper and an accordion. They work with the Angular router, mark the current page and move with the arrow keys.',
  },
  Overlay: {
    heading: 'Angular dialog, popover and overlay components',
    title: 'Angular dialog, drawer, popover, tooltip and toast components — tectra',
    intro:
      'Layers over the page in Angular: dialogs and confirmations, drawers, popovers, menus, tooltips and toasts. They place themselves next to their trigger, follow it while the page scrolls, trap and return focus and animate in and out.',
  },
  Utilities: {
    heading: 'Angular utilities: pipes, directives and helpers',
    title: 'Angular pipes, directives, validators and helpers — tectra',
    intro:
      'Small Angular utilities next to the components: pipes for dates, numbers, currency, relative time and plurals, directives for auto focus, clipboard, drag scroll and in-view, form validators and change tracking, filter and selection state, HTTP and polling helpers.',
  },
};

const slug = (category: string): string => category.toLowerCase().replace(/\s+/g, '-');

export const categoryPath = (category: string): string => `/categories/${slug(category)}`;

export const DOC_CATEGORIES: DocCategory[] = [...new Set(DOC_COMPONENTS.map((component) => component.category))]
  .sort()
  .map((name) => {
    const components = DOC_COMPONENTS.filter((component) => component.category === name);
    const text = CATEGORY_TEXT[name] ?? {
      heading: `Angular ${name.toLowerCase()} components`,
      title: `Angular ${name.toLowerCase()} components — tectra`,
      intro: `${name} components for Angular from the tectra UI kit.`,
    };
    return {
      ...text,
      name,
      slug: slug(name),
      path: categoryPath(name),
      icon: CATEGORY_ICONS[name] ?? 'box',
      description: text.intro,
      components: components.map(({ name: component, title, summary }) => ({ name: component, title, summary })),
    };
  });

export const findCategory = (slugOrName: string | null | undefined): DocCategory | undefined =>
  DOC_CATEGORIES.find((category) => category.slug === slugOrName || category.name === slugOrName);
