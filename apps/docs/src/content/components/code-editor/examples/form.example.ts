import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TxCodeEditor } from '@tectra-ng/code-editor';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';

function jsonObject(control: AbstractControl<string | null>): ValidationErrors | null {
  try {
    const value: unknown = JSON.parse(control.value ?? '');
    return value && typeof value === 'object' && !Array.isArray(value) ? null : { json: true };
  } catch {
    return { json: true };
  }
}

@Component({
  selector: 'code-editor-form-example',
  imports: [TxCodeEditor, TxButton, TxField, ReactiveFormsModule],
  template: `
    <form class="wrap" (ngSubmit)="save()">
      <tx-field
        label="Settings"
        required
        hint="A JSON object"
        [control]="settings"
        [messages]="{ json: 'Write a JSON object' }"
      >
        <tx-code-editor
          language="json"
          height="200px"
          ariaLabel="Settings"
          [formControl]="settings"
        />
      </tx-field>
      <div class="actions">
        <button txButton type="submit" label="Save"></button>
        <button
          txButton
          type="button"
          variant="outlined"
          [label]="settings.disabled ? 'Enable' : 'Disable'"
          (click)="toggle()"
        ></button>
      </div>
      @if (saved()) {
        <p class="saved">Saved: {{ saved() }}</p>
      }
    </form>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    .saved {
      margin: 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeEditorFormExample {
  readonly settings = new FormControl('{\n  "theme": "dark",\n  "pageSize": 25\n}', [
    Validators.required,
    jsonObject,
  ]);
  readonly saved = signal('');

  save(): void {
    this.settings.markAsTouched();
    if (this.settings.valid) {
      this.saved.set(JSON.stringify(JSON.parse(this.settings.value ?? '{}')));
    }
  }

  toggle(): void {
    if (this.settings.disabled) {
      this.settings.enable();
    } else {
      this.settings.disable();
    }
  }
}
