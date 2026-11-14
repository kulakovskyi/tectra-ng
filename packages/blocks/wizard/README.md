# Wizard

A full-screen step-by-step flow for onboarding and setup: the step on the left — a brand row with the progress, the step heading and its content, the back / skip / next footer — and an illustrated stage on the right that slides its scenes in the direction of the move. Below 1024px the stage becomes a band above the step.

```html
<tx-wizard-layout>
  <tx-wizard-progress txWizardHeader [total]="steps.length" [current]="index()" [label]="'Step ' + (index() + 1) + ' of ' + steps.length" />
  <div txWizardBody>
    @switch (step().id) {
      @case ('profile') {
        <section class="tx-wizard-step" animate.enter="tx-wizard-step--enter">
          <tx-wizard-step-head icon="user" title="Your profile" lead="Tell the team who you are" />
          …
        </section>
      }
    }
  </div>
  <tx-wizard-footer txWizardFooter [showBack]="index() > 0" (back)="back()" (next)="next()" />
  <tx-wizard-stage txWizardVisual [direction]="direction()" [number]="index() + 1" [caption]="step().title">
    @switch (step().id) {
      @case ('profile') {
        <div class="tx-wizard-scene" animate.enter="tx-wizard-scene--enter" animate.leave="tx-wizard-scene--leave">…</div>
      }
    }
  </tx-wizard-stage>
</tx-wizard-layout>
```

Give each step `animate.enter="tx-wizard-step--enter"` to rise in, and each scene the `tx-wizard-scene` class with `animate.enter="tx-wizard-scene--enter"` / `animate.leave="tx-wizard-scene--leave"`: the scenes stack on the stage and slide forward or back by `direction`. Motion is off with reduced motion.

## Inputs
| Name | Description |
|---|---|
| responsive | `tx-wizard-layout`: what the 640px / 1024px breakpoints measure — `viewport` (default) or `container`, the layout itself (a preview, a frame) |
| total | `tx-wizard-progress`: number of steps (segments) |
| current | `tx-wizard-progress`: zero-based current step; earlier segments are filled |
| label | `tx-wizard-progress`: text above the segments, e.g. "Step 2 of 5"; also names the list |
| stepLabels | `tx-wizard-progress`: names of the steps, read by screen readers on each segment |
| title | `tx-wizard-step-head`: step title, an `h1` |
| icon | `tx-wizard-step-head`: icon in a tinted square above the title |
| lead | `tx-wizard-step-head`: muted paragraph under the title |
| badge | `tx-wizard-step-head`: small neutral pill next to the title, e.g. "Optional" |
| direction | `tx-wizard-stage`: `forward` or `back` — the way the scenes slide |
| number | `tx-wizard-stage`: step number before the caption, two digits |
| caption | `tx-wizard-stage`: caption under the stage; it rises in when it changes |
| nextLabel | `tx-wizard-footer`: text of the primary button; the translated "Next" by default |
| nextIcon | `tx-wizard-footer`: icon of the primary button (`arrow-right`) |
| backLabel | `tx-wizard-footer`: text of the back button; the translated "Back" by default |
| showBack | `tx-wizard-footer`: `false` hides the back button (the first step) |
| skipLabel | `tx-wizard-footer`: text of a quiet skip button; without it there is none |
| loading | `tx-wizard-footer`: a spinner on the primary button, all buttons disabled |
| dt | Design tokens of this instance (`wizard`) |
| pt | Classes and styles of the parts: layout `root`, `panel`, `header`, `body`, `footer`, `visual`; progress `root`, `label`, `segments`, `segment`; step head `root`, `icon`, `title`, `lead`; stage `root`, `stage`, `caption`; footer `root`, `back`, `skip`, `next` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| back | `tx-wizard-footer`: the back button was pressed |
| next | `tx-wizard-footer`: the primary button was pressed |
| skip | `tx-wizard-footer`: the skip button was pressed |

## Slots
| Name | Description |
|---|---|
| txWizardHeader | `tx-wizard-layout`: top of the step column — a brand row and the progress |
| txWizardBody | `tx-wizard-layout`: the step |
| txWizardFooter | `tx-wizard-layout`: under the step, usually `tx-wizard-footer` |
| txWizardVisual | `tx-wizard-layout`: the right column, as tall as the step (a band on top below 1024px), usually `tx-wizard-stage`, which keeps its scene in view while a long step scrolls |
| txWizardBackdrop | `tx-wizard-stage`: a decorative layer behind the scenes |
| default | `tx-wizard-stage`: the scenes, hidden from screen readers |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves through the step fields and the footer buttons |
