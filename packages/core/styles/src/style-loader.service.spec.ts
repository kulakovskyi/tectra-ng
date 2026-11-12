import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxStyleLoader } from './style-loader.service';

@Component({
  template: '',
  styles: '.tx-style-loader-probe { color: inherit; }',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ProbeStyles {}

const probeStyles = () => [...document.querySelectorAll('style')].filter((style) => style.textContent?.includes('.tx-style-loader-probe'));

describe('TxStyleLoader', () => {
  it('adds the styles of a component once', () => {
    const loader = TestBed.inject(TxStyleLoader);
    loader.load(ProbeStyles);
    loader.load(ProbeStyles);
    expect(probeStyles()).toHaveLength(1);
  });
});
