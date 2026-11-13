/** Step of a color scale, from the lightest `50` to the darkest `950`. */
export type TectraColorStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/** A color scale: a color for each step from `50` to `950`. */
export type TectraColorScale = Record<TectraColorStep, string>;

/** A neutral scale: the steps of a color scale plus `0` for white. */
export type TectraSurfaceScale = TectraColorScale & { 0: string };
