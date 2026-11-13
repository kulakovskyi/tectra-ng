import { Signal, computed, inject } from '@angular/core';
import {
  TxPassThrough,
  TxPassThroughOptions,
  TxPassThroughPart,
  TxPassThroughValue,
  TxResolvedPassThrough,
} from './pass-through.interface';
import { TECTRA_CONFIG } from './tectra-config.token';

/**
 * Signal that tells whether a component is unstyled: its own `unstyled` input, else the global config, else
 * `false`.
 */
export function injectUnstyled(local: Signal<boolean | undefined>): Signal<boolean> {
  const config = inject(TECTRA_CONFIG, { optional: true });
  return computed(() => local() ?? config?.unstyled ?? false);
}

function resolvePart<TInstance>(value: TxPassThroughValue<TInstance> | undefined, instance: TInstance): TxPassThroughPart | undefined {
  return typeof value === 'function' ? value({ instance }) : value;
}

function mergeParts(global: TxPassThroughPart, local: TxPassThroughPart): TxPassThroughPart {
  return {
    class: [global.class, local.class].filter(Boolean).join(' ') || undefined,
    style: { ...global.style, ...local.style },
  };
}

/** Signal with the pass-through of a component, merging the global config and the local `pt` by the merge options. */
export function injectPassThrough<TPart extends string, TInstance>(
  component: string,
  instance: TInstance,
  local: Signal<TxPassThrough<TPart, TInstance> | undefined>,
  localOptions: Signal<TxPassThroughOptions | undefined>,
): Signal<TxResolvedPassThrough<TPart>> {
  const config = inject(TECTRA_CONFIG, { optional: true });

  return computed(() => {
    const global = (config?.pt?.[component] ?? {}) as TxPassThrough<TPart, TInstance>;
    const own: TxPassThrough<TPart, TInstance> = local() ?? {};
    const mergeSections = localOptions()?.mergeSections ?? config?.ptOptions?.mergeSections ?? true;
    const mergeProps = localOptions()?.mergeProps ?? config?.ptOptions?.mergeProps ?? false;
    const ownParts = Object.keys(own) as TPart[];
    const parts = mergeSections || !ownParts.length ? [...new Set([...(Object.keys(global) as TPart[]), ...ownParts])] : ownParts;

    return Object.fromEntries(
      parts.map((part) => {
        const fromGlobal = resolvePart(global[part], instance);
        const fromLocal = resolvePart(own[part], instance);
        const resolved = fromGlobal && fromLocal ? (mergeProps ? mergeParts(fromGlobal, fromLocal) : fromLocal) : (fromLocal ?? fromGlobal);
        return [part, resolved];
      }),
    ) as TxResolvedPassThrough<TPart>;
  });
}
