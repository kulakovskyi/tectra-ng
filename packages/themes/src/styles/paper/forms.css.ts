const selectHosts = ['tx-select', 'tx-multiselect', 'tx-autocomplete', 'tx-cascade-select', 'tx-tree-select'];

interface FilledField {
  field: string;
  hover: string;
  focus: string;
  invalid: string;
}

const input = ".tx-input[data-styled][data-variant='filled']";
const chips = ".tx-chips-input[data-styled][data-variant='filled']";

const filledFields: FilledField[] = [
  {
    field: input,
    hover: `${input}:enabled:not([readonly], .tx-input--invalid):hover`,
    focus: `${input}:enabled:not([readonly]):focus`,
    invalid: `${input}.tx-input--invalid`,
  },
  ...selectHosts.map((host) => {
    const root = `.${host}[data-styled][data-variant='filled']`;
    return {
      field: `${root} .tx-select__box`,
      hover: `${root}:not(.${host}--disabled, .${host}--readonly, .${host}--invalid) .tx-select__box:hover`,
      focus: `${root} .tx-select__box:has(.tx-select__trigger:focus)`,
      invalid: `${root}.${host}--invalid .tx-select__box`,
    };
  }),
  {
    field: `${chips} .tx-chips-input__box`,
    hover: `${chips}:not(.tx-chips-input--disabled, .tx-chips-input--readonly, .tx-chips-input--invalid) .tx-chips-input__box:hover`,
    focus: `${chips} .tx-chips-input__box:focus-within`,
    invalid: `${chips}.tx-chips-input--invalid .tx-chips-input__box`,
  },
];

const list = (key: keyof FilledField, prefix = '') => filledFields.map((field) => `${prefix}${field[key]}`).join(',\n');

const filledInputGroup = ".tx-input-group:has([data-variant='filled']) > .tx-input-group-addon";
const filledInputNumber = ".tx-input-number[data-styled]:has(.tx-input[data-variant='filled'])";

export const paperFormsCss = `
:root {
  --_paper-field-line: var(--tx-form-field-border-color);
  --_paper-field-hover-line: var(--tx-form-field-hover-border-color);
  --_paper-field-accent: var(--tx-form-field-focus-border-color);
  --_paper-field-invalid: var(--tx-form-field-invalid-border-color);
}

${list('field')} {
  --tx-form-field-border-color: transparent;
  --tx-form-field-hover-border-color: transparent;
  --tx-form-field-focus-border-color: transparent;
  --tx-form-field-invalid-border-color: transparent;
  --tx-form-field-focus-ring-width: 0px;
  --_paper-line: var(--_paper-field-line);
  --_paper-accent: var(--_paper-field-accent);
  --_paper-accent-size: 0%;

  background-image: linear-gradient(var(--_paper-accent), var(--_paper-accent)), linear-gradient(var(--_paper-line), var(--_paper-line));
  background-position: 50% 100%, 50% 100%;
  background-size: var(--_paper-accent-size) 2px, 100% 1px;
  background-origin: border-box;
  background-repeat: no-repeat;
}

${list('field', ':root ')} {
  border-end-start-radius: 0;
  border-end-end-radius: 0;
  transition:
    background-color var(--tx-form-field-transition-duration),
    background-size 0.3s cubic-bezier(0.64, 0.09, 0.08, 1),
    box-shadow var(--tx-form-field-transition-duration);
}

${list('hover')} {
  --_paper-line: var(--_paper-field-hover-line);
}

${list('focus')} {
  --_paper-accent-size: 100%;
}

${list('invalid')} {
  --_paper-line: var(--_paper-field-invalid);
  --_paper-accent: var(--_paper-field-invalid);
}

@media (prefers-reduced-motion: reduce) {
  ${list('field', ':root ')} {
    transition:
      background-color var(--tx-form-field-transition-duration),
      box-shadow var(--tx-form-field-transition-duration);
  }
}

:root ${filledInputGroup} {
  border-top-color: var(--tx-form-field-filled-background);
  border-inline-color: var(--tx-form-field-filled-background);
  border-end-start-radius: 0;
  border-end-end-radius: 0;
  background: var(--tx-form-field-filled-background);
}

:root .tx-input-number[data-styled] .tx-input-number__stack {
  top: 2px;
  right: 2px;
  bottom: 2px;
}

:root ${filledInputNumber}[data-layout='horizontal'] .tx-input-number__button {
  border-top-color: var(--tx-form-field-filled-background);
  border-inline-color: var(--tx-form-field-filled-background);
  border-end-start-radius: 0;
  border-end-end-radius: 0;
  background: var(--tx-form-field-filled-background);
}

:root ${filledInputNumber}[data-layout='vertical'] .tx-input-number__button {
  border-block-color: var(--tx-form-field-filled-background);
  border-inline-color: var(--tx-form-field-filled-background);
  background: var(--tx-form-field-filled-background);
}

:root ${filledInputNumber}[data-layout='vertical'] .tx-input-number__increment {
  border-block-end: 1px solid var(--_paper-field-line);
}

:root .tx-autocomplete[data-styled] .tx-autocomplete__dropdown:focus-visible {
  background: var(--tx-select-dropdown-button-hover-background);
  color: var(--tx-select-dropdown-button-hover-color);
}
`;
