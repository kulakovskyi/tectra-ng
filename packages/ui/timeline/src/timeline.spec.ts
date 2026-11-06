import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTimeline } from './timeline.component';
import { TxTimelineConnector, TxTimelineContent, TxTimelineMarker, TxTimelineOpposite } from './timeline.templates';
import { TxTimelineAlign, TxTimelineLayout } from './timeline.types';

interface Step {
  status: string;
  date: string;
}

@Component({
  imports: [TxTimeline, TxTimelineContent, TxTimelineOpposite],
  template: `
    <tx-timeline
      id="plain"
      ariaLabel="Order history"
      [value]="events()"
      [layout]="layout()"
      [align]="align()"
      [dt]="{ eventMarker: { size: '20px' } }"
      [pt]="{ event: { class: 'own-event' }, eventContent: { style: { color: 'red' } } }"
    >
      <ng-template txTimelineContent let-event let-index="index" let-last="last">
        <span class="status">{{ index }}:{{ event.status }}:{{ last }}</span>
      </ng-template>
      <ng-template txTimelineOpposite let-event><span class="date">{{ event.date }}</span></ng-template>
    </tx-timeline>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly events = signal<Step[]>([
    { status: 'Ordered', date: '15/10' },
    { status: 'Processing', date: '15/10' },
    { status: 'Shipped', date: '16/10' },
  ]);
  readonly layout = signal<TxTimelineLayout>('vertical');
  readonly align = signal<TxTimelineAlign | undefined>(undefined);
}

@Component({
  imports: [TxTimeline, TxTimelineMarker, TxTimelineConnector],
  template: `
    <tx-timeline [value]="events" unstyled>
      <ng-template txTimelineMarker let-event><i class="own-marker">{{ event }}</i></ng-template>
      <ng-template txTimelineConnector let-first="first"><i class="own-connector" [attr.data-first]="first"></i></ng-template>
    </tx-timeline>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplatesHost {
  readonly events = ['a', 'b', 'c'];
}

describe('TxTimeline', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders the events as an ordered list with a name', () => {
    const list = el('#plain ol');
    expect(list.getAttribute('aria-label')).toBe('Order history');
    expect(all('#plain li')).toHaveLength(3);
    expect(all('.status').map((node) => node.textContent)).toEqual(['0:Ordered:false', '1:Processing:false', '2:Shipped:true']);
    expect(all('.date').map((node) => node.textContent)).toEqual(['15/10', '15/10', '16/10']);
  });

  it('draws a decorative marker for every event and a connector between them', () => {
    expect(all('.tx-timeline__marker')).toHaveLength(3);
    expect(all('.tx-timeline__connector')).toHaveLength(2);
    expect(el('.tx-timeline__marker').getAttribute('aria-hidden')).toBe('true');
    expect(all('li')[2].querySelector('.tx-timeline__connector')).toBeNull();
  });

  it('defaults the alignment to the layout and follows changes', async () => {
    expect(el('#plain').getAttribute('data-layout')).toBe('vertical');
    expect(el('#plain').getAttribute('data-align')).toBe('left');
    fixture.componentInstance.layout.set('horizontal');
    await fixture.whenStable();
    expect(el('#plain').getAttribute('data-align')).toBe('top');
    fixture.componentInstance.align.set('alternate');
    await fixture.whenStable();
    expect(el('#plain').getAttribute('data-align')).toBe('alternate');
  });

  it('updates with the value and draws nothing for an empty list', async () => {
    fixture.componentInstance.events.set([{ status: 'Delivered', date: '17/10' }]);
    await fixture.whenStable();
    expect(all('li')).toHaveLength(1);
    expect(all('.tx-timeline__connector')).toHaveLength(0);
    fixture.componentInstance.events.set([]);
    await fixture.whenStable();
    expect(all('li')).toHaveLength(0);
  });

  it('applies design tokens and pass-through', () => {
    expect(el('#plain').hasAttribute('data-styled')).toBe(true);
    expect(el('#plain').style.getPropertyValue('--tx-timeline-event-marker-size')).toBe('20px');
    expect(all('li.own-event')).toHaveLength(3);
    expect(el('.tx-timeline__content').style.color).toBe('red');
  });

  it('uses own marker and connector templates and drops the styles when unstyled', async () => {
    const templates = TestBed.createComponent(TemplatesHost);
    templates.autoDetectChanges();
    await templates.whenStable();
    const root = templates.nativeElement as HTMLElement;
    expect(root.querySelector('tx-timeline')?.hasAttribute('data-styled')).toBe(false);
    expect(Array.from(root.querySelectorAll('.own-marker')).map((node) => node.textContent)).toEqual(['a', 'b', 'c']);
    expect(root.querySelectorAll('.tx-timeline__marker')).toHaveLength(0);
    expect(Array.from(root.querySelectorAll('.own-connector')).map((node) => node.getAttribute('data-first'))).toEqual(['true', 'false']);
  });
});
