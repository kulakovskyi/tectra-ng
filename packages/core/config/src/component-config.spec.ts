import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tectra } from '@tectra-ng/themes';
import { injectPassThrough, injectUnstyled } from './component-config';
import { TxPassThrough, TxPassThroughOptions } from './pass-through.interface';
import { provideTectra } from './provide-tectra';
import { TectraConfig } from './tectra-config.interface';

type Part = 'root' | 'label';

function setup(config: Partial<TectraConfig>) {
  TestBed.configureTestingModule({ providers: [provideTectra({ preset: Tectra, ...config })] });
}

describe('injectUnstyled', () => {
  it('prefers the local value, then the global one', () => {
    setup({ unstyled: true });
    const local = signal<boolean | undefined>(undefined);
    const unstyled = TestBed.runInInjectionContext(() => injectUnstyled(local));
    expect(unstyled()).toBe(true);
    local.set(false);
    expect(unstyled()).toBe(false);
  });
});

describe('injectPassThrough', () => {
  const instance = { loading: signal(false) };

  function passThrough(local: TxPassThrough<Part, typeof instance> | undefined, options?: TxPassThroughOptions) {
    return TestBed.runInInjectionContext(() => injectPassThrough('button', instance, signal(local), signal(options)));
  }

  it('keeps global parts not mentioned locally and lets a local part win', () => {
    setup({ pt: { button: { root: { class: 'global-root' }, label: { class: 'global-label' } } } });
    const result = passThrough({ label: { class: 'local-label' } })();
    expect(result.root?.class).toBe('global-root');
    expect(result.label?.class).toBe('local-label');
  });

  it('joins classes and styles with mergeProps', () => {
    setup({ pt: { button: { label: { class: 'a', style: { color: 'red' } } } } });
    const result = passThrough({ label: { class: 'b', style: { margin: '0' } } }, { mergeProps: true })();
    expect(result.label).toEqual({ class: 'a b', style: { color: 'red', margin: '0' } });
  });

  it('drops global parts with mergeSections false', () => {
    setup({ pt: { button: { root: { class: 'global-root' } } } });
    const result = passThrough({ label: { class: 'local' } }, { mergeSections: false })();
    expect(result.root).toBeUndefined();
  });

  it('resolves functions against the instance and reacts to its signals', () => {
    setup({});
    const result = passThrough({ root: ({ instance: button }) => ({ class: button.loading() ? 'busy' : 'idle' }) });
    expect(result().root?.class).toBe('idle');
    instance.loading.set(true);
    expect(result().root?.class).toBe('busy');
  });
});
