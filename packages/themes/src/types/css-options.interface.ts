import { TectraAccent } from '@tectra-ng/tokens';

/** Unit of the sizes in the written CSS variables: `px` as the tokens are, or `rem` to follow the root font size. */
export type TectraCssUnits = 'px' | 'rem';

/** How a preset is written as CSS variables: extra palettes and the unit of sizes. */
export interface TectraCssOptions {
  /**
   * Accent palettes written as `--tx-<palette>-<step>` next to the severity palettes, e.g. `['teal', 'rose']`; none by
   * default. Names of severity palettes (`red`, `green`, `orange`, `yellow`, `sky`, `purple`, `amber`, `blue`) are always
   * written, from the severity palettes.
   */
  palettes?: readonly TectraAccent[];
  /**
   * `rem` writes every px size of the tokens as rem (`px / rootFontSize`), so components scale with `html { font-size }`;
   * values of 1px and less stay in px so hairline borders stay sharp (default `px`).
   */
  units?: TectraCssUnits;
  /** Root font size in px that rem sizes are counted from (default 16). */
  rootFontSize?: number;
}
