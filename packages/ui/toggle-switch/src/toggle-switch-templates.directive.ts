import { Directive, TemplateRef, inject } from '@angular/core';
import { TxToggleSwitchHandleContext } from './toggle-switch.types';

@Directive({ selector: 'ng-template[txToggleSwitchHandle]' })
export class TxToggleSwitchHandleTemplate {
  readonly templateRef = inject<TemplateRef<TxToggleSwitchHandleContext>>(TemplateRef);
}
