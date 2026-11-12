import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxWizardFooter } from './wizard-footer.component';
import { TxWizardLayout } from './wizard-layout.component';
import { TxWizardProgress } from './wizard-progress.component';
import { TxWizardStage } from './wizard-stage.component';
import { TxWizardStepHead } from './wizard-step-head.component';

@Component({
  imports: [TxWizardLayout, TxWizardProgress, TxWizardStepHead, TxWizardStage, TxWizardFooter],
  template: `
    <tx-wizard-layout responsive="container" [dt]="{ layout: { maxWidth: '600px' } }">
      <tx-wizard-progress txWizardHeader [total]="4" [current]="index()" label="Step 2 of 4" [stepLabels]="['Welcome', 'Profile', 'Team', 'Done']" />
      <div txWizardBody>
        <tx-wizard-step-head icon="user" title="Your profile" lead="Tell the team who you are" badge="Optional" />
      </div>
      <tx-wizard-footer
        txWizardFooter
        skipLabel="Skip"
        [showBack]="index() > 0"
        [loading]="loading()"
        (back)="events.push('back')"
        (next)="events.push('next')"
        (skip)="events.push('skip')"
      />
      <tx-wizard-stage txWizardVisual [direction]="direction()" [number]="index() + 1" caption="Profile">
        <div class="tx-wizard-scene">Scene</div>
      </tx-wizard-stage>
    </tx-wizard-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly index = signal(1);
  readonly loading = signal(false);
  readonly direction = signal<'forward' | 'back'>('forward');
  readonly events: string[] = [];
}

describe('TxWizard', () => {
  it('lays out the progress, step head, footer and stage', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-wizard-layout') as HTMLElement;
    expect(root.getAttribute('data-responsive')).toBe('container');
    expect(root.style.getPropertyValue('--tx-wizard-layout-max-width')).toBe('600px');
    expect(root.querySelector('.tx-wizard-layout__header tx-wizard-progress')).not.toBeNull();
    expect(root.querySelector('.tx-wizard-layout__visual tx-wizard-stage')).not.toBeNull();

    const segments = Array.from(root.querySelectorAll('.tx-wizard-progress__segment'));
    expect(segments).toHaveLength(4);
    expect(segments[0].classList).toContain('tx-wizard-progress__segment--done');
    expect(segments[1].getAttribute('aria-current')).toBe('step');
    expect(segments[1].getAttribute('aria-label')).toBe('Profile');
    expect(root.querySelector('.tx-wizard-progress__segments')?.getAttribute('aria-label')).toBe('Step 2 of 4');

    const head = root.querySelector('tx-wizard-step-head') as HTMLElement;
    expect(head.querySelector('h1')?.textContent?.trim()).toBe('Your profile');
    expect(head.querySelector('tx-pill')?.textContent?.trim()).toBe('Optional');
    expect(head.querySelector('.tx-wizard-step-head__lead')?.textContent?.trim()).toBe('Tell the team who you are');

    const stage = root.querySelector('tx-wizard-stage') as HTMLElement;
    expect(stage.getAttribute('data-responsive')).toBe('container');
    expect(stage.querySelector('.tx-wizard-stage__stage')?.getAttribute('aria-hidden')).toBe('true');
    expect(stage.querySelector('.tx-wizard-stage__number')?.textContent?.trim()).toBe('02');
    expect(stage.querySelector('.tx-wizard-stage__title')?.textContent?.trim()).toBe('Profile');
  });

  it('runs the footer buttons, hides back on the first step and blocks them while loading', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = () => Array.from(root.querySelectorAll<HTMLButtonElement>('tx-wizard-footer button'));
    expect(buttons().map((button) => button.textContent?.trim())).toEqual(['Back', 'Skip', 'Next']);
    buttons().forEach((button) => button.click());
    expect(fixture.componentInstance.events).toEqual(['back', 'skip', 'next']);

    fixture.componentInstance.index.set(0);
    fixture.componentInstance.loading.set(true);
    fixture.componentInstance.direction.set('back');
    await fixture.whenStable();
    expect(buttons().map((button) => button.textContent?.trim())).toEqual(['Skip', 'Next']);
    expect(buttons().every((button) => button.disabled)).toBe(true);
    expect(root.querySelector('tx-wizard-stage')?.getAttribute('data-direction')).toBe('back');
  });
});

@Component({
  imports: [TxWizardProgress, TxWizardStepHead, TxWizardStage, TxWizardFooter],
  template: `
    <tx-wizard-progress [total]="total()" [current]="0" />
    <tx-wizard-step-head title="Welcome" />
    <tx-wizard-footer nextLabel="Start" nextIcon="check" />
    <tx-wizard-stage [caption]="caption()"><div class="scene">Scene</div></tx-wizard-stage>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BareHost {
  readonly total = signal(2);
  readonly caption = signal<string | undefined>(undefined);
}

describe('TxWizard parts on their own', () => {
  it('fall back to the default labels and leave out the optional pieces', async () => {
    const fixture = TestBed.createComponent(BareHost);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.tx-wizard-progress__label')).toBeNull();
    expect(root.querySelector('.tx-wizard-progress__segments')?.getAttribute('aria-label')).toBe('Progress');
    const segments = Array.from(root.querySelectorAll('.tx-wizard-progress__segment'));
    expect(segments.map((segment) => segment.hasAttribute('aria-label'))).toEqual([false, false]);

    const head = root.querySelector('tx-wizard-step-head') as HTMLElement;
    expect(head.querySelector('.tx-wizard-step-head__icon')).toBeNull();
    expect(head.querySelector('tx-pill')).toBeNull();
    expect(head.querySelector('.tx-wizard-step-head__lead')).toBeNull();

    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('tx-wizard-footer button'));
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Back', 'Start']);

    const stage = root.querySelector('tx-wizard-stage') as HTMLElement;
    expect(stage.getAttribute('data-responsive')).toBe('viewport');
    expect(stage.getAttribute('data-direction')).toBe('forward');
    expect(stage.querySelector('.tx-wizard-stage__caption')).toBeNull();

    fixture.componentInstance.caption.set('Hello');
    fixture.componentInstance.total.set(-1);
    await fixture.whenStable();
    expect(stage.querySelector('.tx-wizard-stage__number')).toBeNull();
    expect(stage.querySelector('.tx-wizard-stage__title')?.textContent?.trim()).toBe('Hello');
    expect(root.querySelectorAll('.tx-wizard-progress__segment')).toHaveLength(0);
  });
});
