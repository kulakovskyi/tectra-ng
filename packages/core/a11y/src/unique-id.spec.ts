import { uniqueId } from './unique-id';

describe('uniqueId', () => {
  it('never repeats', () => {
    expect(uniqueId('x')).not.toBe(uniqueId('x'));
    expect(uniqueId('list')).toMatch(/^list-\d+$/);
  });
});
