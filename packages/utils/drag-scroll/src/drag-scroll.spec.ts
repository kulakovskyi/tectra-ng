import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxDragPanDelta, TxDragScroll } from './drag-scroll.directive';

@Component({
  imports: [TxDragScroll],
  template: `<div class="box" txDragScroll [panMode]="pan()" (panMove)="moves.push($event)" (dragEnd)="ends = ends + 1"><button type="button" (click)="clicks = clicks + 1">Item</button></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DragHost {
  readonly pan = signal(false);
  readonly moves: TxDragPanDelta[] = [];
  ends = 0;
  clicks = 0;
}

function pointer(type: string, x: number, y: number, extra: Partial<PointerEventInit> = {}): Event {
  const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 });
  Object.assign(event, { pointerId: 1, pointerType: 'mouse', ...extra });
  return event;
}

describe('txDragScroll', () => {
  function setup() {
    const fixture = TestBed.createComponent(DragHost);
    fixture.detectChanges();
    const box = fixture.nativeElement.querySelector('.box') as HTMLElement;
    box.scrollLeft = 100;
    box.scrollTop = 50;
    return { fixture, box };
  }

  it('scrolls the box while dragging and swallows the click after a drag', () => {
    const { fixture, box } = setup();
    box.dispatchEvent(pointer('pointerdown', 200, 200));
    box.dispatchEvent(pointer('pointermove', 202, 201));
    expect(fixture.componentInstance.ends).toBe(0);
    box.dispatchEvent(pointer('pointermove', 170, 180));
    fixture.detectChanges();
    expect(box.classList.contains('tx-drag-scroll--dragging')).toBe(true);
    expect(box.style.cursor).toBe('grabbing');
    box.dispatchEvent(pointer('pointerup', 170, 180));
    fixture.detectChanges();
    expect(fixture.componentInstance.ends).toBe(1);
    box.click();
    expect(box.style.cursor).toBe('grab');
  });

  it('reports deltas in pan mode', () => {
    const { fixture, box } = setup();
    fixture.componentInstance.pan.set(true);
    fixture.detectChanges();
    box.dispatchEvent(pointer('pointerdown', 0, 0));
    box.dispatchEvent(pointer('pointermove', 10, 0));
    box.dispatchEvent(pointer('pointermove', 15, 5));
    expect(fixture.componentInstance.moves).toEqual([
      { dx: 10, dy: 0 },
      { dx: 5, dy: 5 },
    ]);
  });

  it('leaves buttons and touch alone', () => {
    const { fixture, box } = setup();
    const button = box.querySelector('button') as HTMLButtonElement;
    button.dispatchEvent(pointer('pointerdown', 0, 0));
    box.dispatchEvent(pointer('pointermove', 50, 0));
    button.click();
    expect(fixture.componentInstance.clicks).toBe(1);
    box.dispatchEvent(pointer('pointerdown', 0, 0, { pointerType: 'touch' }));
    box.dispatchEvent(pointer('pointermove', 50, 0));
    expect(fixture.componentInstance.ends).toBe(0);
  });
});
