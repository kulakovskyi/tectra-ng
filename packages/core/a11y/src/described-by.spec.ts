import { linkAriaReference, linkDescribedBy } from './described-by';

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

  it('links any id reference attribute', () => {
    const button = document.createElement('button');
    const unlink = linkAriaReference(button, 'aria-labelledby', 'name');
    expect(button.getAttribute('aria-labelledby')).toBe('name');
    unlink();
    expect(button.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('removes the attribute when nothing is left', () => {
    const field = document.createElement('input');
    const unlink = linkDescribedBy(field, 'error');
    unlink();
    expect(field.hasAttribute('aria-describedby')).toBe(false);
  });
});
