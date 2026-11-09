import { IsActiveMatchOptions } from '@angular/router';

export const TX_CONSOLE_RAIL_EXACT_MATCH: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'ignored',
  matrixParams: 'ignored',
  fragment: 'ignored',
};

export const TX_CONSOLE_RAIL_SECTION_MATCH: IsActiveMatchOptions = {
  ...TX_CONSOLE_RAIL_EXACT_MATCH,
  paths: 'subset',
};
