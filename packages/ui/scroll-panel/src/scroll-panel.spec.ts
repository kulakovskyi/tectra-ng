import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxScrollPanel } from './scroll-panel.component';

@Component({
  imports: [TxScrollPanel],
  template: `
    <tx-scroll-panel
      [step]="20"
      ariaLabel="Release notes"
      [dt]="{ bar: { size: '6px' } }"
      [pt]="{ content: { class: 'own-content' }, barY: { class: 'own-bar' } }"
    >
      <p class="text">Long text</p>
    </tx-scroll-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly panel = viewChild.required(TxScrollPanel);
}

@Component({
  imports: [TxScrollPanel],
  template: `<tx-scroll-panel unstyled><span>Short</span></tx-scroll-panel>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {}

interface Box {
  top: number;
  left: number;
}

function fakeScrollBox(element: HTMLElement, size: { scrollWidth: number; scrollHeight: number; clientWidth: number; clientHeight: number }): Box {
  const box: Box = { top: 0, left: 0 };
  for (const [name, value] of Object.entries(size)) {
    Object.defineProperty(element, name, { configurable: true, get: () => value });
  }
  Object.defineProperty(element, 'scrollTop', { configurable: true, get: () => box.top, set: (value: number) => (box.top = value) });
  Object.defineProperty(element, 'scrollLeft', { configurable: true, get: () => box.left, set: (value: number) => (box.left = value) });
  return box;
}

function pointer(type: string, clientX: number, clientY: number): Event {
  return new MouseEvent(type, { bubbles: true, clientX, clientY, button: 0 });
}

describe('TxScrollPanel', () => {
  let fixture: ComponentFixture<Host>;
  let box: Box;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    box = fakeScrollBox(el('.tx-scroll-panel__content'), { scrollWidth: 100, scrollHeight: 400, clientWidth: 100, clientHeight: 100 });
    fixture.componentInstance.panel().refresh();
    await fixture.whenStable();
  });

  it('projects the content into a focusable, named region with the parts', () => {
    const content = el('.tx-scroll-panel__content');
    expect(el('.text').closest('.tx-scroll-panel__content')).toBe(content);
    expect(content.getAttribute('tabindex')).toBe('0');
    expect(content.getAttribute('role')).toBe('region');
    expect(content.getAttribute('aria-label')).toBe('Release notes');
    expect(content.classList).toContain('own-content');
    expect(el('.tx-scroll-panel__bar--y').classList).toContain('own-bar');
    expect(el('tx-scroll-panel').style.getPropertyValue('--tx-scroll-panel-bar-size')).toBe('6px');
  });

  it('shows only the bar of the overflowing axis, sized from the content', () => {
    const barY = el('.tx-scroll-panel__bar--y');
    expect(el('.tx-scroll-panel__bar--x').hidden).toBe(true);
    expect(barY.hidden).toBe(false);
    expect(barY.style.height).toBe('25px');
    expect(barY.style.top).toBe('0px');
    expect(barY.getAttribute('role')).toBe('scrollbar');
    expect(barY.getAttribute('aria-orientation')).toBe('vertical');
    expect(barY.getAttribute('aria-controls')).toBe(el('.tx-scroll-panel__content').id);
    expect(barY.getAttribute('aria-valuenow')).toBe('0');
  });

  it('moves the bar on scroll and scrollTop()', async () => {
    box.top = 150;
    el('.tx-scroll-panel__content').dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(el('.tx-scroll-panel__bar--y').style.top).toBe('37.5px');
    expect(el('.tx-scroll-panel__bar--y').getAttribute('aria-valuenow')).toBe('50');
    fixture.componentInstance.panel().scrollTop(1000);
    await fixture.whenStable();
    expect(box.top).toBe(300);
    expect(el('.tx-scroll-panel__bar--y').style.top).toBe('75px');
  });

  it('drags the content with the bar', async () => {
    const bar = el('.tx-scroll-panel__bar--y');
    bar.dispatchEvent(pointer('pointerdown', 0, 0));
    await fixture.whenStable();
    expect(el('tx-scroll-panel').getAttribute('data-grabbed')).toBe('y');
    bar.dispatchEvent(pointer('pointermove', 0, 30));
    expect(box.top).toBe(120);
    bar.dispatchEvent(pointer('pointerup', 0, 30));
    await fixture.whenStable();
    expect(el('tx-scroll-panel').hasAttribute('data-grabbed')).toBe(false);
  });

  it('scrolls with the bar keys', () => {
    const bar = el('.tx-scroll-panel__bar--y');
    const press = (key: string) => bar.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    press('ArrowDown');
    expect(box.top).toBe(20);
    press('PageDown');
    expect(box.top).toBe(120);
    press('End');
    expect(box.top).toBe(300);
    press('ArrowUp');
    expect(box.top).toBe(280);
    press('Home');
    expect(box.top).toBe(0);
  });

  it('shows the horizontal bar for wide content', async () => {
    fakeScrollBox(el('.tx-scroll-panel__content'), { scrollWidth: 200, scrollHeight: 100, clientWidth: 100, clientHeight: 100 });
    fixture.componentInstance.panel().scrollLeft(50);
    await fixture.whenStable();
    const barX = el('.tx-scroll-panel__bar--x');
    expect(barX.hidden).toBe(false);
    expect(el('.tx-scroll-panel__bar--y').hidden).toBe(true);
    expect(barX.style.width).toBe('50px');
    expect(barX.style.insetInlineStart).toBe('25px');
  });
});

describe('TxScrollPanel unstyled', () => {
  it('keeps the behaviour without the styles', async () => {
    const fixture = TestBed.createComponent(PlainHost);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('tx-scroll-panel') as HTMLElement;
    expect(host.hasAttribute('data-styled')).toBe(false);
    expect(host.querySelector('.tx-scroll-panel__content')?.hasAttribute('role')).toBe(false);
    expect((host.querySelector('.tx-scroll-panel__bar--y') as HTMLElement).hidden).toBe(true);
  });
});
