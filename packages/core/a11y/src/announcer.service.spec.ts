import { TestBed } from '@angular/core/testing';
import { TxAnnouncer } from './announcer.service';

describe('TxAnnouncer', () => {
  it('hides its live region from sight', async () => {
    const announcer = TestBed.inject(TxAnnouncer);
    const styles = Array.from(document.querySelectorAll('style')).map((style) => style.textContent ?? '');
    expect(styles.some((text) => text.includes('.cdk-visually-hidden') && text.includes('clip'))).toBe(true);
    void announcer.announce('Saved');
    await new Promise((resolve) => setTimeout(resolve, 150));
    const region = document.querySelector('.cdk-live-announcer-element');
    expect(region?.classList).toContain('cdk-visually-hidden');
    expect(region?.textContent).toBe('Saved');
  });

  it('clears the live region', async () => {
    const announcer = TestBed.inject(TxAnnouncer);
    void announcer.announce('Loading');
    await new Promise((resolve) => setTimeout(resolve, 150));
    announcer.clear();
    expect(document.querySelector('.cdk-live-announcer-element')?.textContent).toBe('');
  });
});
