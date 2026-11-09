import { TxCommandPaletteItem } from '@tectra-ng/blocks/command-palette';
import { TxKanbanColumn } from '@tectra-ng/blocks/kanban';
import { TxPillTone } from '@tectra-ng/ui/pill';
import { TxMonthCalendarEvent } from '@tectra-ng/ui/month-calendar';

export interface StudioCustomer {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  tone: TxPillTone;
  mrr: number;
  seats: number;
}

export interface StudioTask {
  id: string;
  title: string;
  tag: string;
  tone: TxPillTone;
  owner: string;
  due: string;
}

export const STUDIO_CUSTOMERS: StudioCustomer[] = [
  { id: 1, name: 'Northwind Studio', email: 'billing@northwind.io', plan: 'Business', status: 'Active', tone: 'success', mrr: 1240, seats: 48 },
  { id: 2, name: 'Lumen Labs', email: 'ops@lumenlabs.dev', plan: 'Pro', status: 'Trial', tone: 'info', mrr: 320, seats: 12 },
  { id: 3, name: 'Atlas & Co', email: 'finance@atlas.co', plan: 'Pro', status: 'Active', tone: 'success', mrr: 640, seats: 24 },
  { id: 4, name: 'Brightline', email: 'hello@brightline.app', plan: 'Starter', status: 'Overdue', tone: 'warn', mrr: 48, seats: 3 },
  { id: 5, name: 'Oakline Partners', email: 'it@oakline.com', plan: 'Business', status: 'Active', tone: 'success', mrr: 2180, seats: 86 },
  { id: 6, name: 'Silverleaf', email: 'team@silverleaf.io', plan: 'Pro', status: 'Paused', tone: 'neutral', mrr: 0, seats: 9 },
  { id: 7, name: 'Granite Works', email: 'admin@granite.works', plan: 'Business', status: 'Active', tone: 'success', mrr: 1560, seats: 61 },
];

export const STUDIO_BOARD: TxKanbanColumn<StudioTask>[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    items: [
      { id: 'a', title: 'Usage-based pricing page', tag: 'Design', tone: 'help', owner: 'Olena Koval', due: 'Nov 21' },
      { id: 'b', title: 'SSO with SAML', tag: 'Enterprise', tone: 'primary', owner: 'Mark Ellis', due: 'Dec 2' },
      { id: 'c', title: 'Audit log export', tag: 'Compliance', tone: 'info', owner: 'Sara Lind', due: 'Dec 9' },
    ],
  },
  {
    id: 'doing',
    title: 'In progress',
    items: [
      { id: 'd', title: 'Onboarding wizard', tag: 'Product', tone: 'info', owner: 'Ivan Petrenko', due: 'Nov 14' },
      { id: 'e', title: 'Invoice PDF redesign', tag: 'High', tone: 'danger', owner: 'Anna Koval', due: 'Nov 12' },
    ],
  },
  {
    id: 'review',
    title: 'In review',
    items: [{ id: 'f', title: 'Dark theme polish', tag: 'Design', tone: 'help', owner: 'Taras Melnyk', due: 'Nov 10' }],
  },
  {
    id: 'done',
    title: 'Done',
    items: [
      { id: 'g', title: 'Command palette', tag: 'Shipped', tone: 'success', owner: 'Olena Koval', due: 'Nov 3' },
      { id: 'h', title: 'Network status', tag: 'Shipped', tone: 'success', owner: 'Mark Ellis', due: 'Nov 1' },
    ],
  },
];

export const STUDIO_EVENTS: TxMonthCalendarEvent[] = [
  { id: '1', start: '2026-11-02', end: '2026-11-06', title: 'Sprint 46', tone: 'primary', avatar: { name: 'Olena Koval' } },
  { id: '2', start: '2026-11-04', title: 'Design review', tone: 'info' },
  { id: '3', start: '2026-11-10', end: '2026-11-12', title: 'Team offsite', tone: 'warn', avatar: { name: 'Mark Ellis' } },
  { id: '4', start: '2026-11-12', title: 'Release 3.0', tone: 'success' },
  { id: '5', start: '2026-11-16', end: '2026-11-20', title: 'Sprint 47', tone: 'primary', avatar: { name: 'Sara Lind' } },
  { id: '6', start: '2026-11-18', title: 'Board meeting', tone: 'info' },
  { id: '7', start: '2026-11-24', end: '2026-11-27', title: 'Vacation', tone: 'neutral', avatar: { name: 'Ivan Petrenko' } },
  { id: '8', start: '2026-11-26', title: 'Incident review', tone: 'danger' },
];

export const STUDIO_PALETTE: TxCommandPaletteItem[] = [
  { id: 'p1', group: 'Pages', label: 'Customers', sublabel: '7 accounts', icon: 'users' },
  { id: 'p2', group: 'Pages', label: 'Billing', sublabel: 'Invoices and plans', icon: 'credit-card' },
  { id: 'p3', group: 'Pages', label: 'Reports', sublabel: 'Revenue and usage', icon: 'chart-bar' },
  { id: 'c1', group: 'Customers', label: 'Northwind Studio', sublabel: 'Business · 48 seats', icon: 'building' },
  { id: 'c2', group: 'Customers', label: 'Lumen Labs', sublabel: 'Pro · trial', icon: 'building' },
  { id: 'a1', group: 'Actions', label: 'Invite a teammate', icon: 'user-plus' },
  { id: 'a2', group: 'Actions', label: 'Create an invoice', icon: 'file' },
];

export const STUDIO_DOCUMENT = `<h1>Q4 product review</h1>
<p>We shipped <strong>twelve blocks</strong> this quarter, and every one of them renders on the server. The highlights are below — the full list is in the <a href="#">changelog</a>.</p>
<h2>What shipped</h2>
<ul><li><p>A kanban board that moves with the pointer and the keyboard</p></li><li><p>A command palette with search as you type</p></li><li><p>QR codes with our own encoder — no dependency</p></li></ul>
<blockquote><p>The new onboarding cut the time to the first report from nine minutes to three.</p></blockquote>
<h2>Next</h2>
<p>Charts, a heatmap and an org chart. Feedback is welcome — leave a comment on any paragraph.</p>`;
