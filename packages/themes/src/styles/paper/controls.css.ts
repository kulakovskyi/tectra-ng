/* @__NO_SIDE_EFFECTS__ */
const halo = (color: string, transparency: string) => `0 0 1px 10px color-mix(in srgb, ${color}, transparent ${transparency})`;
const elevation = 'var(--tx-toggle-switch-handle-shadow)';

/* @__NO_SIDE_EFFECTS__ */
const selectionHalo = (block: string, checkedColor: string) => `
.${block}[data-styled] .${block}__box {
  border-radius: 50%;
  transition: box-shadow var(--${block}-transition-duration);
}

.${block}[data-styled]:not(.${block}--disabled) .${block}__box:has(.${block}__input:hover) {
  box-shadow: ${halo('var(--tx-text-primary)', '96%')};
}

.${block}[data-styled]:not(.${block}--disabled) .${block}__box:has(.${block}__input:focus-visible) {
  box-shadow: ${halo('var(--tx-text-primary)', '88%')};
}

.${block}[data-styled]:is(.${block}--checked, .${block}--indeterminate):not(.${block}--disabled) .${block}__box:has(.${block}__input:hover) {
  box-shadow: ${halo(checkedColor, '92%')};
}

.${block}[data-styled]:is(.${block}--checked, .${block}--indeterminate):not(.${block}--disabled) .${block}__box:has(.${block}__input:focus-visible) {
  box-shadow: ${halo(checkedColor, '84%')};
}
`;

/* @__NO_SIDE_EFFECTS__ */
function controlsCss(): string {
  return `
.tx-button[data-styled]:focus-visible {
  border-color: var(--_active-border-color);
  background: var(--_active-background);
}

.tx-button[data-styled][data-variant='link']:focus-visible {
  border-color: transparent;
  background: color-mix(in srgb, var(--tx-primary-base), transparent 84%);
}

.tx-toggle-button.tx-toggle-button[data-styled] .tx-toggle-button__control:focus-visible:not(:disabled) {
  background: var(--tx-toggle-button-hover-background);
}
${selectionHalo('tx-checkbox', 'var(--tx-checkbox-checked-background)')}${selectionHalo('tx-radio-button', 'var(--tx-radio-button-checked-border-color)')}
.tx-toggle-switch[data-styled] .tx-toggle-switch__input {
  inset: min(0px, calc((var(--_height) - var(--_handle)) / 2)) 0;
  height: auto;
}

.tx-toggle-switch[data-styled] .tx-toggle-switch__track .tx-toggle-switch__handle {
  transition:
    left var(--tx-toggle-switch-transition-duration) cubic-bezier(0.2, 0, 0, 1),
    background-color var(--tx-toggle-switch-transition-duration),
    color var(--tx-toggle-switch-transition-duration),
    box-shadow var(--tx-toggle-switch-transition-duration);
}

.tx-toggle-switch[data-styled]:not(.tx-toggle-switch--disabled):has(.tx-toggle-switch__input:hover) .tx-toggle-switch__handle {
  box-shadow: ${halo('var(--tx-text-primary)', '96%')}, ${elevation};
}

.tx-toggle-switch[data-styled]:not(.tx-toggle-switch--disabled):has(.tx-toggle-switch__input:focus-visible) .tx-toggle-switch__handle {
  box-shadow: ${halo('var(--tx-text-primary)', '88%')}, ${elevation};
}

.tx-toggle-switch[data-styled].tx-toggle-switch--checked:not(.tx-toggle-switch--disabled):has(.tx-toggle-switch__input:hover) .tx-toggle-switch__handle {
  box-shadow: ${halo('var(--tx-toggle-switch-handle-checked-background)', '92%')}, ${elevation};
}

.tx-toggle-switch[data-styled].tx-toggle-switch--checked:not(.tx-toggle-switch--disabled):has(.tx-toggle-switch__input:focus-visible) .tx-toggle-switch__handle {
  box-shadow: ${halo('var(--tx-toggle-switch-handle-checked-background)', '84%')}, ${elevation};
}

[data-styled].tx-rating .tx-rating__stars .tx-rating__star[data-index] {
  border-radius: 50%;
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color var(--tx-rating-transition-duration),
    box-shadow var(--tx-rating-transition-duration);
}

[data-styled].tx-rating:not(.tx-rating--readonly):not(.tx-rating--disabled) .tx-rating__star[data-index]:hover {
  background: color-mix(in srgb, var(--tx-text-muted), transparent 96%);
  box-shadow: 0 0 1px 8px color-mix(in srgb, var(--tx-text-muted), transparent 96%);
}

[data-styled].tx-rating:not(.tx-rating--readonly):not(.tx-rating--disabled) .tx-rating__star--active[data-index]:hover {
  background: color-mix(in srgb, var(--tx-rating-active-color), transparent 92%);
  box-shadow: 0 0 1px 8px color-mix(in srgb, var(--tx-rating-active-color), transparent 92%);
}

.tx-slider[data-styled]:not(.tx-slider--disabled) .tx-slider__track .tx-slider__handle:focus-visible,
.tx-slider[data-styled]:not(.tx-slider--disabled) .tx-slider__track .tx-slider__handle:focus:hover {
  box-shadow: var(--tx-slider-handle-shadow), ${halo('var(--tx-slider-handle-background)', '84%')};
}

@media (prefers-reduced-motion: reduce) {
  .tx-checkbox[data-styled] .tx-checkbox__box,
  .tx-radio-button[data-styled] .tx-radio-button__box,
  .tx-toggle-switch[data-styled] .tx-toggle-switch__track .tx-toggle-switch__handle,
  [data-styled].tx-rating .tx-rating__stars .tx-rating__star[data-index] {
    transition: none;
  }
}
`;
}

export const paperControlsCss = controlsCss();
