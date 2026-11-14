import { Directive, TemplateRef, inject } from '@angular/core';
import { TxDatePickerButtonBarContext, TxDatePickerDateContext, TxDatePickerDecadeContext } from './datepicker.types';

@Directive({ selector: 'ng-template[txDatePickerDate]' })
export class TxDatePickerDate {
  readonly templateRef = inject<TemplateRef<TxDatePickerDateContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxDatePickerDate, context: unknown): context is TxDatePickerDateContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txDatePickerHeader]' })
export class TxDatePickerHeader {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txDatePickerFooter]' })
export class TxDatePickerFooter {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txDatePickerDecade]' })
export class TxDatePickerDecade {
  readonly templateRef = inject<TemplateRef<TxDatePickerDecadeContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxDatePickerDecade, context: unknown): context is TxDatePickerDecadeContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txDatePickerButtonBar]' })
export class TxDatePickerButtonBar {
  readonly templateRef = inject<TemplateRef<TxDatePickerButtonBarContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxDatePickerButtonBar, context: unknown): context is TxDatePickerButtonBarContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txDatePickerTriggerIcon]' })
export class TxDatePickerTriggerIcon {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txDatePickerInputIcon]' })
export class TxDatePickerInputIcon {
  readonly templateRef = inject<TemplateRef<{ $implicit: () => void }>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxDatePickerInputIcon, context: unknown): context is { $implicit: () => void } {
    return !!context;
  }
}
