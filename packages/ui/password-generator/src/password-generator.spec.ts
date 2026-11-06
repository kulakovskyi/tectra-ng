import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxPassword } from '@tectra-ng/ui/password';
import { TxPasswordGenerate } from './password-generate.directive';
import { TxPasswordGenerator } from './password-generator.service';

@Component({
  imports: [TxPassword, TxPasswordGenerate, ReactiveFormsModule],
  template: `
    <tx-password #password ariaLabel="Password" [formControl]="password1" [toggleMask]="true" />
    <button id="fill-password" [txPasswordGenerate]="password" [length]="20" (generated)="last = $event">Generate</button>
    <button id="fill-control" [txPasswordGenerate]="token" [symbols]="false" [excludeSimilar]="true" [length]="32">Token</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly password1 = new FormControl('');
  readonly token = new FormControl('');
  readonly passwordRef = viewChild.required(TxPassword);
  last = '';
}

describe('TxPasswordGenerator', () => {
  const generator = () => TestBed.inject(TxPasswordGenerator);

  it('generates the length with every enabled set', () => {
    for (let run = 0; run < 50; run += 1) {
      const password = generator().generate({ length: 12 });
      expect(password).toHaveLength(12);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/\d/);
      expect(password).toMatch(/[^a-zA-Z\d]/);
    }
  });

  it('limits the sets and leaves out look-alike characters', () => {
    const digits = generator().generate({ length: 40, lowercase: false, uppercase: false, symbols: false, excludeSimilar: true });
    expect(digits).toMatch(/^[2-9]{40}$/);
    const own = generator().generate({ length: 30, lowercase: false, uppercase: false, digits: false, symbolSet: '*' });
    expect(own).toBe('*'.repeat(30));
    expect(() => generator().generate({ lowercase: false, uppercase: false, digits: false, symbols: false })).toThrow();
  });

  it('keeps the old generatePassword(length) call and returns different values', () => {
    const first = generator().generatePassword(16);
    expect(first).toHaveLength(16);
    expect(generator().generatePassword(16)).not.toBe(first);
  });
});

describe('TxPasswordGenerate', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('fills a tx-password and shows it', async () => {
    const button = fixture.nativeElement.querySelector('#fill-password') as HTMLButtonElement;
    expect(button.type).toBe('button');
    button.click();
    await fixture.whenStable();
    const value = fixture.componentInstance.password1.value ?? '';
    expect(value).toHaveLength(20);
    expect(fixture.componentInstance.last).toBe(value);
    expect((fixture.nativeElement.querySelector('tx-password input') as HTMLInputElement).type).toBe('text');
  });

  it('fills a form control with the chosen sets', async () => {
    (fixture.nativeElement.querySelector('#fill-control') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.token.value).toMatch(/^[A-Za-z2-9]{32}$/);
    expect(fixture.componentInstance.token.dirty).toBe(true);
  });
});
