import { TxLocaleDefinition } from '@tectra/core/config';

export const TX_LOCALE_US: TxLocaleDefinition = {
  code: 'us',
  intl: 'en-US',
  firstDayOfWeek: 0,
  translations: {
    emptyMessage: 'No results found',
    searchPlaceholder: 'Search',
    clear: 'Clear',
    selectAll: 'Select all',
    close: 'Close',
    loading: 'Loading',
    today: 'Today',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    pageReport: '{first}–{last} of {total}',
    copy: 'Copy',
    copied: 'Copied',
  },
};

export const TX_LOCALE_UA: TxLocaleDefinition = {
  code: 'ua',
  intl: 'uk-UA',
  firstDayOfWeek: 1,
  translations: {
    emptyMessage: 'Нічого не знайдено',
    searchPlaceholder: 'Пошук',
    clear: 'Очистити',
    selectAll: 'Вибрати все',
    close: 'Закрити',
    loading: 'Завантаження',
    today: 'Сьогодні',
    previousPage: 'Попередня сторінка',
    nextPage: 'Наступна сторінка',
    pageReport: '{first}–{last} з {total}',
    copy: 'Копіювати',
    copied: 'Скопійовано',
  },
};

export const TX_LOCALES: Record<string, TxLocaleDefinition> = { us: TX_LOCALE_US, ua: TX_LOCALE_UA };
