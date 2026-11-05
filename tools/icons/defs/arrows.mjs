import { circle, fill, flipX, line, move, poly, polygon, rect, rotate } from '../geometry.mjs';

const arrowUp = [line(12, 19.5, 12, 4.5), poly(6, 10.5, 12, 4.5, 18, 10.5)];
const arrowUpRight = [line(6, 18, 18, 6), poly(8.5, 6, 18, 6, 18, 15.5)];
const angleDown = poly(8, 10, 12, 14, 16, 10);
const angleDoubleDown = [poly(7.5, 6.5, 12, 11, 16.5, 6.5), poly(7.5, 13, 12, 17.5, 16.5, 13)];
const chevronDown = poly(6, 9, 12, 15, 18, 9);
const caretDown = fill(polygon(6.5, 9.5, 17.5, 9.5, 12, 15.5));
const ring = circle(12, 12, 9.25);
const arrowCircleDown = [ring, line(12, 7.5, 12, 16.5), poly(8.5, 13, 12, 16.5, 15.5, 13)];
const chevronCircleDown = [ring, poly(8, 10.5, 12, 14.5, 16, 10.5)];
const four = (name, base) => ({
  [`${name}-up`]: rotate(180, base),
  [`${name}-right`]: rotate(270, base),
  [`${name}-down`]: [base].flat(),
  [`${name}-left`]: rotate(90, base),
});

const letterA = [poly(14, 10.5, 16.5, 3.5, 19, 10.5), line(14.9, 8, 18.1, 8)];
const letterZ = poly(14, 13.5, 19, 13.5, 14, 20.5, 19, 20.5);
const digitOne = poly(15, 5.5, 17.25, 3.5, 17.25, 10.5);
const digitNine = [circle(16.75, 6.25, 2.25), 'M19 6.25V8A2.75 2.75 0 0 1 16.25 10.75H15'];
const sortArrowDown = [line(6.5, 4, 6.5, 20), poly(3, 16.5, 6.5, 20, 10, 16.5)];
const sortArrowUp = [line(6.5, 20, 6.5, 4), poly(3, 7.5, 6.5, 4, 10, 7.5)];
const down = (shape) => move(0, 10, shape);
const sortAlt = [line(8, 4, 8, 20), poly(4.5, 7.5, 8, 4, 11.5, 7.5), line(16, 4, 16, 20), poly(12.5, 16.5, 16, 20, 19.5, 16.5)];
const barsDecreasing = [line(11.5, 6, 21, 6), line(11.5, 10.5, 18, 10.5), line(11.5, 15, 15, 15)];
const barsIncreasing = [line(11.5, 6, 15, 6), line(11.5, 10.5, 18, 10.5), line(11.5, 15, 21, 15)];
const forward = [polygon(3.5, 6, 11.5, 12, 3.5, 18), polygon(12, 6, 20, 12, 12, 18)];
const fastForward = [polygon(3, 6, 10.5, 12, 3, 18), polygon(10.5, 6, 18, 12, 10.5, 18), line(20.5, 6, 20.5, 18)];
const stepForward = [polygon(6, 5.5, 16, 12, 6, 18.5), line(18.5, 5.5, 18.5, 18.5)];
const stepForwardAlt = [line(5.5, 5.5, 5.5, 18.5), polygon(8.5, 5.5, 18.5, 12, 8.5, 18.5)];
const uTurnUpLeft = [poly(9, 4.5, 4.5, 9, 9, 13.5), 'M4.5 9H14.25A5.25 5.25 0 0 1 14.25 19.5H8'];

export default {
  'arrow-up': arrowUp,
  'arrow-right': rotate(90, arrowUp),
  'arrow-down': rotate(180, arrowUp),
  'arrow-left': rotate(270, arrowUp),
  'arrow-up-right': arrowUpRight,
  'arrow-down-right': rotate(90, arrowUpRight),
  'arrow-down-left': rotate(180, arrowUpRight),
  'arrow-up-left': rotate(270, arrowUpRight),
  ...four('angle', angleDown),
  ...four('angle-double', angleDoubleDown),
  ...four('chevron', chevronDown),
  ...four('caret', caretDown),
  ...four('arrow-circle', arrowCircleDown),
  ...four('chevron-circle', chevronCircleDown),
  'arrows-h': [line(3, 12, 21, 12), poly(6.5, 8.5, 3, 12, 6.5, 15.5), poly(17.5, 8.5, 21, 12, 17.5, 15.5)],
  'arrows-v': rotate(90, [line(3, 12, 21, 12), poly(6.5, 8.5, 3, 12, 6.5, 15.5), poly(17.5, 8.5, 21, 12, 17.5, 15.5)]),
  'arrows-alt': [line(12, 3, 12, 21), line(3, 12, 21, 12), ...[0, 90, 180, 270].flatMap((deg) => rotate(deg, poly(9.5, 5.5, 12, 3, 14.5, 5.5)))],
  'arrow-right-arrow-left': [line(4, 8, 20, 8), poly(16.5, 4.5, 20, 8, 16.5, 11.5), line(20, 16, 4, 16), poly(7.5, 12.5, 4, 16, 7.5, 19.5)],
  'arrow-u-turn-up-left': uTurnUpLeft,
  'arrow-u-turn-up-right': flipX(uTurnUpLeft),
  'arrow-down-left-and-arrow-up-right-to-center': [line(20, 4, 14, 10), poly(14, 5.5, 14, 10, 18.5, 10), line(4, 20, 10, 14), poly(5.5, 14, 10, 14, 10, 18.5)],
  'arrow-up-right-and-arrow-down-left-from-center': [line(14, 10, 20, 4), poly(15.5, 4, 20, 4, 20, 8.5), line(10, 14, 4, 20), poly(4, 15.5, 4, 20, 8.5, 20)],
  sort: [fill(polygon(7.5, 9.5, 12, 4.5, 16.5, 9.5)), fill(polygon(7.5, 14.5, 12, 19.5, 16.5, 14.5))],
  'sort-up': polygon(6.5, 14.5, 12, 8.5, 17.5, 14.5),
  'sort-up-fill': fill(polygon(6.5, 14.5, 12, 8.5, 17.5, 14.5)),
  'sort-down': polygon(6.5, 9.5, 17.5, 9.5, 12, 15.5),
  'sort-down-fill': fill(polygon(6.5, 9.5, 17.5, 9.5, 12, 15.5)),
  'sort-alt': sortAlt,
  'sort-alt-slash': [...sortAlt, line(3.5, 3.5, 20.5, 20.5)],
  'sort-amount-down': [...sortArrowDown, ...barsDecreasing],
  'sort-amount-down-alt': [...sortArrowDown, ...barsIncreasing],
  'sort-amount-up': [...sortArrowUp, ...barsDecreasing],
  'sort-amount-up-alt': [...sortArrowUp, ...barsIncreasing],
  'sort-alpha-down': [...sortArrowDown, ...letterA, letterZ],
  'sort-alpha-down-alt': [...sortArrowDown, ...move(0, -10, letterZ), ...move(0, 10, letterA)],
  'sort-alpha-up': [...sortArrowUp, ...letterA, letterZ],
  'sort-alpha-up-alt': [...sortArrowUp, ...move(0, -10, letterZ), ...move(0, 10, letterA)],
  'sort-numeric-down': [...sortArrowDown, digitOne, ...down(digitNine)],
  'sort-numeric-down-alt': [...sortArrowDown, ...digitNine, ...down(digitOne)],
  'sort-numeric-up': [...sortArrowUp, digitOne, ...down(digitNine)],
  'sort-numeric-up-alt': [...sortArrowUp, ...digitNine, ...down(digitOne)],
  forward,
  backward: flipX(forward),
  'fast-forward': fastForward,
  'fast-backward': flipX(fastForward),
  'step-forward': stepForward,
  'step-backward': flipX(stepForward),
  'step-forward-alt': stepForwardAlt,
  'step-backward-alt': flipX(stepForwardAlt),
  play: polygon(7, 4.5, 19, 12, 7, 19.5),
  pause: [rect(6, 5, 4, 14, 1), rect(14, 5, 4, 14, 1)],
  stop: rect(5.5, 5.5, 13, 13, 2),
  eject: [polygon(12, 5, 19, 12.5, 5, 12.5), line(5, 18, 19, 18)],
  'play-circle': [ring, polygon(10, 8.5, 15.5, 12, 10, 15.5)],
  'pause-circle': [ring, line(10, 9, 10, 15), line(14, 9, 14, 15)],
  'stop-circle': [ring, rect(9, 9, 6, 6, 1)],
};
