import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxRatingOnIconTemplate } from './rating-templates.directive';
import { TxRating } from './rating.component';

@Component({
  imports: [TxRating, TxRatingOnIconTemplate, ReactiveFormsModule],
  template: `
    <tx-rating id="score" ariaLabel="Score" [formControl]="score" [allowHalf]="allowHalf()" [clearable]="true" clearLabel="Clear" [readonly]="readonly()" [dt]="{ root: { iconSize: '30px' } }" (rated)="events.push($event.value)" />
    <tx-rating id="hearts" [stars]="3" ariaLabel="Love">
      <ng-template txRatingOnIcon let-index><b class="own">{{ index }}</b></ng-template>
    </tx-rating>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly score = new FormControl<number | null>(3);
  readonly allowHalf = signal(false);
  readonly readonly = signal(false);
  events: (number | null)[] = [];
}

describe('TxRating', () => {
  let fixture: ComponentFixture<Host>;
  const slider = (id = 'score') => fixture.nativeElement.querySelector(`#${id} [role="slider"]`) as HTMLElement;
  const stars = (id = 'score') => Array.from(fixture.nativeElement.querySelectorAll(`#${id} .tx-rating__star`)) as HTMLElement[];
  const key = async (name: string) => {
    slider().dispatchEvent(new KeyboardEvent('keydown', { key: name, cancelable: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('is a slider with its value text and fills the stars', () => {
    expect(slider().getAttribute('aria-label')).toBe('Score');
    expect(slider().getAttribute('aria-valuenow')).toBe('3');
    expect(slider().getAttribute('aria-valuemax')).toBe('5');
    expect(slider().getAttribute('aria-valuetext')).toBe('3 of 5');
    const widths = stars().map((star) => (star.querySelector('.tx-rating__on') as HTMLElement).style.width);
    expect(widths).toEqual(['100%', '100%', '100%', '0%', '0%']);
    expect(fixture.nativeElement.querySelector('#score').style.getPropertyValue('--tx-rating-icon-size')).toBe('30px');
  });

  it('rates with a click and previews on hover', async () => {
    stars()[4].dispatchEvent(new MouseEvent('pointermove', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#score').classList).toContain('tx-rating--preview');
    expect((stars()[4].querySelector('.tx-rating__on') as HTMLElement).style.width).toBe('100%');
    stars()[4].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.score.value).toBe(5);
    slider().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#score').classList).not.toContain('tx-rating--preview');
  });

  it('moves with the keyboard and clears', async () => {
    await key('ArrowRight');
    expect(fixture.componentInstance.score.value).toBe(4);
    await key('End');
    expect(fixture.componentInstance.score.value).toBe(5);
    await key('ArrowRight');
    expect(fixture.componentInstance.score.value).toBe(5);
    await key('2');
    expect(fixture.componentInstance.score.value).toBe(2);
    await key('Home');
    await key('ArrowLeft');
    expect(fixture.componentInstance.score.value).toBeNull();
    expect(fixture.componentInstance.events).toEqual([4, 5, 2, 1, null]);
  });

  it('steps by half and fills half a star', async () => {
    fixture.componentInstance.allowHalf.set(true);
    await fixture.whenStable();
    await key('ArrowLeft');
    expect(fixture.componentInstance.score.value).toBe(2.5);
    expect((stars()[2].querySelector('.tx-rating__on') as HTMLElement).style.width).toBe('50%');
    expect(slider().getAttribute('aria-valuetext')).toBe('2.5 of 5');
  });

  it('clears with the button and ignores input when readonly', async () => {
    (fixture.nativeElement.querySelector('#score .tx-rating__clear') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.score.value).toBeNull();
    fixture.componentInstance.score.setValue(4);
    fixture.componentInstance.readonly.set(true);
    await fixture.whenStable();
    await key('ArrowLeft');
    stars()[0].click();
    expect(fixture.componentInstance.score.value).toBe(4);
    expect(slider().getAttribute('aria-readonly')).toBe('true');
  });

  it('disables from the form control and renders own icons', async () => {
    expect(fixture.nativeElement.querySelectorAll('#hearts .own')).toHaveLength(3);
    fixture.componentInstance.score.disable();
    await fixture.whenStable();
    expect(slider().getAttribute('tabindex')).toBe('-1');
    expect(slider().getAttribute('aria-disabled')).toBe('true');
  });
});
