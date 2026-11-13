import { IsActiveMatchOptions } from '@angular/router';

/** Active-link rule that marks a rail section only on its exact path; use it for the home section. */
export const TX_CONSOLE_RAIL_EXACT_MATCH: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'ignored',
  matrixParams: 'ignored',
  fragment: 'ignored',
};

/** Active-link rule that marks a rail section for its path and everything below it. */
export const TX_CONSOLE_RAIL_SECTION_MATCH: IsActiveMatchOptions = {
  ...TX_CONSOLE_RAIL_EXACT_MATCH,
  paths: 'subset',
};
