import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCard } from '@tectra-ng/ui/card';
import { TxStyleClass } from '@tectra-ng/utils/style-class';

@Component({
  selector: 'style-class-menu-example',
  imports: [TxButton, TxCard, TxStyleClass],
  template: `
    <div class="anchor">
      <button
        txButton
        label="Shortcuts"
        icon="chevron-down"
        iconPos="right"
        severity="secondary"
        txStyleClass
        enterFromClass="is-hidden"
        enterActiveClass="fade-in"
        leaveActiveClass="fade-out"
        leaveToClass="is-hidden"
        hideOnOutsideClick
        hideOnEscape
      ></button>
      <tx-card class="panel is-hidden">
        <div class="shortcuts">
          <span>Search</span><kbd>/</kbd> <span>Command palette</span><kbd>Ctrl K</kbd>
          <span>New item</span><kbd>N</kbd>
        </div>
      </tx-card>
    </div>
  `,
  styles: `
    .anchor {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .panel {
      width: 260px;
    }
    .is-hidden {
      display: none;
    }
    .shortcuts {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px 16px;
      align-items: center;
    }
    .fade-in {
      animation: menu-in var(--tx-motion-duration) var(--tx-motion-easing);
    }
    .fade-out {
      animation: menu-in var(--tx-motion-duration) var(--tx-motion-easing) reverse;
    }
    @keyframes menu-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StyleClassMenuExample {}
