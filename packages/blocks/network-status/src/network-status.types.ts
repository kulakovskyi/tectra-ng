/**
 * State of the connection shown by `tx-network-status`: `online`, `offline` or `restored` just after
 * it came back.
 */
export type TxNetworkState = 'online' | 'offline' | 'restored';

/** Names of the parts of `tx-network-status` that its `pt` input can style. */
export type TxNetworkStatusPart = 'root' | 'pill' | 'icon' | 'text';
