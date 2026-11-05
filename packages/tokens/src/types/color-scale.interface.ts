export type TectraColorStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export type TectraColorScale = Record<TectraColorStep, string>;

export type TectraSurfaceScale = TectraColorScale & { 0: string };
