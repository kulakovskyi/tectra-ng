import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { TxFormChangeTracker, deepEqual, trackFormChanges } from './form-changes';

const makeForm = () =>
  new FormGroup({
    name: new FormControl('Ann'),
    due: new FormControl<Date | null>(new Date(2026, 0, 1)),
    tags: new FormArray([new FormControl('a')]),
    address: new FormGroup({ city: new FormControl({ value: 'Kyiv', disabled: true }) }),
  });

describe('form changes', () => {
  it('compares deeply, dates by time, empty values as equal', () => {
    expect(deepEqual({ a: [1, { b: new Date(1) }] }, { a: [1, { b: new Date(1) }] })).toBe(true);
    expect(deepEqual({ a: [1, 2] }, { a: [1, 2, 3] })).toBe(false);
    expect(deepEqual(null, '')).toBe(true);
    expect(deepEqual({ a: null }, { a: undefined })).toBe(true);
    expect(deepEqual(0, '')).toBe(false);
    expect(deepEqual([], {})).toBe(false);
  });

  it('keeps the original tracker API', () => {
    const form = makeForm();
    const tracker = new TxFormChangeTracker();
    expect(tracker.hasFormChanges(form)).toBe(false);
    tracker.initFormTracking(form);
    form.patchValue({ name: 'Ann' });
    expect(tracker.hasFormChanges(form)).toBe(false);
    form.controls.tags.push(new FormControl('b'));
    form.controls.due.setValue(new Date(2026, 0, 2));
    expect(tracker.hasFormChanges(form)).toBe(true);
    tracker.resetFormToInitial(form);
    expect(form.controls.due.value?.getDate()).toBe(1);
    form.controls.name.setValue('Bob');
    tracker.updateInitialFormState(form);
    expect(tracker.hasFormChanges(form)).toBe(false);
    tracker.resetFormTracking();
    expect(tracker.hasFormChanges(form)).toBe(false);
  });

  it('counts disabled controls too', () => {
    const form = makeForm();
    const tracker = new TxFormChangeTracker();
    tracker.initFormTracking(form);
    form.controls.address.controls.city.setValue('Lviv');
    expect(tracker.hasFormChanges(form)).toBe(true);
  });

  it('gives a changed signal with commit and revert', () => {
    const form = makeForm();
    const changes = TestBed.runInInjectionContext(() => trackFormChanges(form));
    expect(changes.changed()).toBe(false);
    form.controls.name.setValue('Mark');
    expect(changes.changed()).toBe(true);
    form.controls.name.setValue('Ann');
    expect(changes.changed()).toBe(false);
    form.controls.name.setValue('Mark');
    changes.commit();
    expect(changes.changed()).toBe(false);
    form.controls.name.setValue('Zoe');
    changes.revert();
    expect(form.controls.name.value).toBe('Mark');
    expect(changes.changed()).toBe(false);
  });
});
