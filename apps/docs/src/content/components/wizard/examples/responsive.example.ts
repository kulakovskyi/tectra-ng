import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxWizardDirection,
  TxWizardFooter,
  TxWizardLayout,
  TxWizardProgress,
  TxWizardStage,
  TxWizardStepHead,
} from '@tectra-ng/blocks/wizard';
import { TxIcon } from '@tectra-ng/icons';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'profile', title: 'Profile' },
  { id: 'team', title: 'Team' },
  { id: 'done', title: 'Ready' },
];

@Component({
  selector: 'wizard-responsive-example',
  imports: [
    FormsModule,
    TxWizardLayout,
    TxWizardProgress,
    TxWizardStepHead,
    TxWizardStage,
    TxWizardFooter,
    TxIcon,
    TxAvatar,
    TxCheckbox,
    TxInput,
    TxLabel,
    TxPill,
    TxSelect,
    TxTabs,
  ],
  template: `
    <tx-tabs
      class="devices"
      variant="pills"
      ariaLabel="Device"
      [tabs]="devices"
      [(value)]="device"
    />
    <div class="stage">
      <div class="screen" [style.width]="width()">
        <tx-wizard-layout responsive="container" [dt]="{ layout: { minHeight: '558px' } }">
          <div txWizardHeader class="brand-row">
            <span class="brand"><img src="/favicon.svg" alt="" width="24" height="24" /> Acme</span>
            <tx-wizard-progress
              [total]="steps.length"
              [current]="index()"
              [label]="'Step ' + (index() + 1) + ' of ' + steps.length"
              [stepLabels]="titles"
            />
          </div>
          <div txWizardBody>
            @switch (step().id) {
              @case ('welcome') {
                <section class="step" animate.enter="tx-wizard-step--enter">
                  <tx-wizard-step-head
                    icon="sparkles"
                    title="Welcome to Acme"
                    lead="Three short steps and your workspace is ready."
                  />
                </section>
              }
              @case ('profile') {
                <section class="step" animate.enter="tx-wizard-step--enter">
                  <tx-wizard-step-head
                    icon="user"
                    title="Your profile"
                    lead="Tell the team who you are."
                  />
                  <div class="fields">
                    <div>
                      <tx-label for="wizard-name">Full name</tx-label>
                      <input txInput id="wizard-name" fluid [(ngModel)]="name" />
                    </div>
                    <div>
                      <tx-label for="wizard-role">Role</tx-label>
                      <tx-select inputId="wizard-role" [options]="roles" [(ngModel)]="role" />
                    </div>
                  </div>
                </section>
              }
              @case ('team') {
                <section class="step" animate.enter="tx-wizard-step--enter">
                  <tx-wizard-step-head
                    icon="users"
                    title="Invite your team"
                    badge="Optional"
                    lead="Pick who joins now; you can invite more later."
                  />
                  <div class="fields">
                    @for (person of people; track person) {
                      <tx-checkbox
                        binary
                        [label]="person"
                        [ngModel]="invited().includes(person)"
                        (ngModelChange)="toggle(person)"
                      />
                    }
                  </div>
                </section>
              }
              @default {
                <section class="step" animate.enter="tx-wizard-step--enter">
                  <tx-wizard-step-head
                    icon="check-circle"
                    title="All set"
                    [lead]="'Your workspace is ready, ' + (firstName() || 'friend') + '.'"
                  />
                </section>
              }
            }
          </div>
          <tx-wizard-footer
            txWizardFooter
            [showBack]="index() > 0"
            [skipLabel]="step().id === 'team' ? 'Skip' : undefined"
            [nextLabel]="isLast() ? 'Finish' : 'Next'"
            [nextIcon]="isLast() ? 'check' : 'arrow-right'"
            [loading]="loading()"
            (back)="go(-1)"
            (next)="isLast() ? finish() : go(1)"
            (skip)="go(1)"
          />
          <tx-wizard-stage
            txWizardVisual
            [direction]="direction()"
            [number]="index() + 1"
            [caption]="step().title"
          >
            <div txWizardBackdrop class="dots"></div>
            @switch (step().id) {
              @case ('welcome') {
                <div
                  class="tx-wizard-scene"
                  animate.enter="tx-wizard-scene--enter"
                  animate.leave="tx-wizard-scene--leave"
                >
                  <div class="scene">
                    <div class="tile"><tx-icon name="sparkles" /></div>
                  </div>
                </div>
              }
              @case ('profile') {
                <div
                  class="tx-wizard-scene"
                  animate.enter="tx-wizard-scene--enter"
                  animate.leave="tx-wizard-scene--leave"
                >
                  <div class="scene">
                    <div class="card">
                      <tx-avatar size="xlarge" [name]="name() || 'You'" />
                      <strong>{{ name() || 'Your name' }}</strong>
                      <tx-pill tone="info" size="small" [value]="roleLabel()" />
                    </div>
                  </div>
                </div>
              }
              @case ('team') {
                <div
                  class="tx-wizard-scene"
                  animate.enter="tx-wizard-scene--enter"
                  animate.leave="tx-wizard-scene--leave"
                >
                  <div class="scene">
                    <div class="card">
                      <div class="avatars">
                        @for (person of invited(); track person) {
                          <tx-avatar size="large" [name]="person" />
                        } @empty {
                          <tx-avatar size="large" icon="users" />
                        }
                      </div>
                      <span>{{ invited().length }} invited</span>
                    </div>
                  </div>
                </div>
              }
              @default {
                <div
                  class="tx-wizard-scene"
                  animate.enter="tx-wizard-scene--enter"
                  animate.leave="tx-wizard-scene--leave"
                >
                  <div class="scene">
                    <div class="tile tile--done"><tx-icon name="check" /></div>
                  </div>
                </div>
              }
            }
          </tx-wizard-stage>
        </tx-wizard-layout>
      </div>
    </div>
  `,
  styles: `
    .devices {
      display: block;
      margin-bottom: 16px;
    }

    .stage {
      width: 100%;
      overflow-x: auto;
    }

    .screen {
      height: 560px;
      overflow: auto;
      border: 1px solid var(--tx-surface-border);
      border-radius: 12px;
      transition: width 0.3s ease;
    }

    @media (prefers-reduced-motion: reduce) {
      .screen {
        transition: none;
      }
    }

    .brand-row {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .step,
    .fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .fields {
      margin-top: 20px;
    }

    .dots {
      position: absolute;
      inset: 0;
      z-index: -1;
      background-image: radial-gradient(
        circle at 1px 1px,
        var(--tx-surface-border) 1px,
        transparent 0
      );
      background-size: 24px 24px;
    }

    .scene {
      display: grid;
      place-items: center;
      height: 100%;
    }

    .tile {
      display: grid;
      place-items: center;
      width: 160px;
      height: 160px;
      border-radius: 40px;
      background: var(--tx-surface-card);
      box-shadow: var(--tx-shadow-overlay);
      color: var(--tx-primary-base);
      font-size: 64px;
    }

    .tile--done {
      background: var(--tx-primary-base);
      color: var(--tx-primary-contrast);
    }

    .card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      min-width: 220px;
      padding: 28px;
      border-radius: 20px;
      background: var(--tx-surface-card);
      box-shadow: var(--tx-shadow-overlay);
    }

    .avatars {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WizardResponsiveExample {
  readonly devices: TxTabItem[] = [
    { value: 'phone', label: 'Phone', icon: 'mobile' },
    { value: 'tablet', label: 'Tablet', icon: 'tablet' },
    { value: 'desktop', label: 'Desktop', icon: 'desktop' },
  ];
  readonly device = signal<TxTabValue | undefined>('phone');
  readonly width = computed(
    () => ({ phone: '375px', tablet: '820px' })[String(this.device())] ?? '1180px',
  );
  readonly steps = STEPS;
  readonly titles = STEPS.map((item) => item.title);
  readonly roles = [
    { label: 'Designer', value: 'design' },
    { label: 'Developer', value: 'dev' },
    { label: 'Manager', value: 'manager' },
  ];
  readonly people = ['Olena Koval', 'Mark Ellis', 'Sara Lind'];
  readonly index = signal(0);
  readonly direction = signal<TxWizardDirection>('forward');
  readonly loading = signal(false);
  readonly name = signal('');
  readonly role = signal<string | null>('design');
  readonly invited = signal<string[]>(['Mark Ellis']);
  readonly step = computed(() => STEPS[this.index()]);
  readonly isLast = computed(() => this.index() === STEPS.length - 1);
  readonly firstName = computed(() => this.name().trim().split(' ')[0]);
  readonly roleLabel = computed(
    () => this.roles.find((item) => item.value === this.role())?.label ?? 'No role',
  );

  go(offset: number): void {
    this.direction.set(offset > 0 ? 'forward' : 'back');
    this.index.update((index) => Math.min(Math.max(index + offset, 0), STEPS.length - 1));
  }

  toggle(person: string): void {
    this.invited.update((list) =>
      list.includes(person) ? list.filter((item) => item !== person) : [...list, person],
    );
  }

  finish(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.direction.set('back');
      this.index.set(0);
    }, 1200);
  }
}
