export interface TxListNavigationOptions {
  count: number;
  current: number;
  loop?: boolean;
  pageSize?: number;
  isDisabled?: (index: number) => boolean;
}
