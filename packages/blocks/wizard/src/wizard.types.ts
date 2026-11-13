/** Direction of a step change, `forward` or `back`; the stage slides its scene that way. */
export type TxWizardDirection = 'forward' | 'back';

/** What the wizard breakpoints measure: the `viewport` (window) or the `container` (the layout itself). */
export type TxWizardResponsive = 'viewport' | 'container';

/** Names of the parts of `tx-wizard-layout` that its `pt` input can style. */
export type TxWizardLayoutPart = 'root' | 'panel' | 'header' | 'body' | 'footer' | 'visual';

/** Names of the parts of `tx-wizard-progress` that its `pt` input can style. */
export type TxWizardProgressPart = 'root' | 'label' | 'segments' | 'segment';

/** Names of the parts of `tx-wizard-step-head` that its `pt` input can style. */
export type TxWizardStepHeadPart = 'root' | 'icon' | 'title' | 'lead';

/** Names of the parts of `tx-wizard-stage` that its `pt` input can style. */
export type TxWizardStagePart = 'root' | 'stage' | 'caption';

/** Names of the parts of `tx-wizard-footer` that its `pt` input can style. */
export type TxWizardFooterPart = 'root' | 'back' | 'skip' | 'next';
