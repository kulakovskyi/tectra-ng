import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import {
  TxStep,
  TxStepItem,
  TxStepPanel,
  TxStepPanelContent,
  TxStepper,
  TxStepValue,
} from '@tectra-ng/ui/stepper';

interface Task {
  id: string;
  title: string;
  text: string;
  done: boolean;
}

@Component({
  selector: 'stepper-dynamic-steps-example',
  imports: [TxButton, TxStepper, TxStepItem, TxStep, TxStepPanel, TxStepPanelContent],
  template: `
    <tx-stepper [(value)]="step">
      @for (task of tasks(); track task.id) {
        <tx-step-item [value]="task.id" [completed]="task.done">
          <tx-step>{{ task.title }}</tx-step>
          <tx-step-panel>
            <ng-template txStepPanelContent>
              <p class="text">{{ task.text }}</p>
              <button
                txButton
                size="small"
                [severity]="task.done ? 'secondary' : 'primary'"
                [label]="task.done ? 'Mark as not done' : 'Mark as done'"
                (click)="toggle(task.id)"
              ></button>
            </ng-template>
          </tx-step-panel>
        </tx-step-item>
      }
    </tx-stepper>
    <div class="actions">
      <button
        txButton
        size="small"
        severity="secondary"
        icon="plus"
        label="Add a step"
        [disabled]="tasks().length >= 5"
        (click)="add()"
      ></button>
    </div>
  `,
  styles: `
    .text {
      margin: 0 0 12px;
    }
    .actions {
      margin-top: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperDynamicStepsExample {
  readonly step = signal<TxStepValue | undefined>('profile');
  readonly tasks = signal<Task[]>([
    {
      id: 'profile',
      title: 'Fill in the profile',
      text: 'Name, photo and a short bio.',
      done: false,
    },
    { id: 'team', title: 'Invite the team', text: 'Send invites by email or a link.', done: true },
    {
      id: 'billing',
      title: 'Set up billing',
      text: 'Add a card or ask for an invoice.',
      done: false,
    },
  ]);

  toggle(id: string): void {
    this.tasks.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  }

  add(): void {
    const number = this.tasks().length + 1;
    this.tasks.update((tasks) => [
      ...tasks,
      {
        id: `step-${number}`,
        title: `Extra step ${number}`,
        text: 'Added while the stepper was open.',
        done: false,
      },
    ]);
  }
}
