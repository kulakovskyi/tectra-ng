import { linkDescribedBy } from './described-by';

describe('linkDescribedBy', () => {
  it('adds an id to aria-describedby once and removes only it', () => {
    const field = document.createElement('input');
    field.setAttribute('aria-describedby', 'own');
    const unlink = linkDescribedBy(field, 'hint');
    linkDescribedBy(field, 'hint');
    expect(field.getAttribute('aria-describedby')).toBe('own hint');
    unlink();
    expect(field.getAttribute('aria-describedby')).toBe('own');
  });

  it('removes the attribute when nothing is left', () => {
    const field = document.createElement('input');
    const unlink = linkDescribedBy(field, 'error');
    unlink();
    expect(field.hasAttribute('aria-describedby')).toBe(false);
  });
});
