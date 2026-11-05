import { arc, circle, dot, fill, line, poly, rect, rotate } from '../geometry.mjs';

const ring = circle(12, 12, 9.25);
const check = poly(8, 12.25, 10.75, 15, 16, 9.5);

export default {
  plus: [line(12, 5, 12, 19), line(5, 12, 19, 12)],
  minus: line(5, 12, 19, 12),
  times: [line(6, 6, 18, 18), line(18, 6, 6, 18)],
  check: poly(4.5, 12.5, 9.5, 17.5, 19.5, 7),
  info: [line(12, 10.5, 12, 18.5), dot(12, 6.25, 0.7), line(10, 10.5, 12, 10.5), line(10, 18.5, 14, 18.5)],
  question: ['M8.5 8.75A3.5 3.5 0 1 1 13.6 11.9C12.65 12.4 12 13.25 12 14.4V15', dot(12, 19, 0.7)],
  'plus-circle': [ring, line(12, 8, 12, 16), line(8, 12, 16, 12)],
  'minus-circle': [ring, line(8, 12, 16, 12)],
  'times-circle': [ring, line(9.25, 9.25, 14.75, 14.75), line(14.75, 9.25, 9.25, 14.75)],
  'check-circle': [ring, check],
  'info-circle': [ring, line(12, 11, 12, 16.5), dot(12, 7.75, 0.6)],
  'question-circle': [ring, 'M9.75 9.75A2.25 2.25 0 1 1 13.1 11.7C12.45 12.1 12 12.6 12 13.4V13.75', dot(12, 16.75, 0.6)],
  'exclamation-circle': [ring, line(12, 7.5, 12, 13), dot(12, 16.5, 0.6)],
  'exclamation-triangle': [
    'M10.3 4.3L3.1 17A2 2 0 0 0 4.8 20H19.2A2 2 0 0 0 20.9 17L13.7 4.3A2 2 0 0 0 10.3 4.3Z',
    line(12, 9.5, 12, 13.5),
    dot(12, 16.75, 0.6),
  ],
  'check-square': [rect(4, 4, 16, 16, 3), check],
  circle: ring,
  'circle-fill': fill(ring),
  square: rect(4, 4, 16, 16, 3),
  dot: dot(12, 12, 1.75),
  'ellipsis-h': [dot(5.5, 12, 0.75), dot(12, 12, 0.75), dot(18.5, 12, 0.75)],
  'ellipsis-v': [dot(12, 5.5, 0.75), dot(12, 12, 0.75), dot(12, 18.5, 0.75)],
  bars: [line(4, 6, 20, 6), line(4, 12, 20, 12), line(4, 18, 20, 18)],
  ban: [ring, line(5.5, 5.5, 18.5, 18.5)],
  grip: [6, 12, 18].flatMap((y) => [6, 12, 18].map((x) => dot(x, y, 0.75))),
  'grip-horizontal': [9, 15].flatMap((y) => [6, 12, 18].map((x) => dot(x, y, 0.75))),
  'grip-vertical': [6, 12, 18].flatMap((y) => [9, 15].map((x) => dot(x, y, 0.75))),
  'spinner-dotted': [0, 45, 90, 135, 180, 225, 270, 315].flatMap((deg) => rotate(deg, dot(12, 3.75, 0.85))),
  spinner: arc(12, 12, 8.5, 0, 280),
};
