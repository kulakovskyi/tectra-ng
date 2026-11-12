import { TxFormControlBase } from './form-control-base';

class TestControl extends TxFormControlBase<string> {
  change(value: string): void {
    this.updateValue(value);
  }

  touch(): void {
    this.markTouched();
  }
}

describe('TxFormControlBase', () => {
  it('writes, reports changes and touches', () => {
    const control = new TestControl();
    const onChange = vi.fn();
    const onTouched = vi.fn();
    control.registerOnChange(onChange);
    control.registerOnTouched(onTouched);
    control.writeValue('a');
    expect(control.value()).toBe('a');
    control.change('b');
    expect(onChange).toHaveBeenCalledWith('b');
    control.touch();
    expect(onTouched).toHaveBeenCalled();
    control.setDisabledState(true);
    expect(control.disabled()).toBe(true);
  });

  it('changes and touches safely before the form registers callbacks', () => {
    const control = new TestControl();
    control.change('c');
    control.touch();
    expect(control.value()).toBe('c');
  });
});
