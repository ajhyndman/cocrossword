/**
 * Usage : compose functions right to left
 *
 * The resulting function can accept as many arguments as the first function.
 *
 * Implementation inspired by:
 * https://medium.com/@dtipson/creating-an-es6ish-compose-in-javascript-ac580b95104a
 *
 * @example
 * compose(add2, multiply)(4, 10) === 42
 * compose(minus8, add10, multiply10)(4) === 42
 */
const compose = (...fns: ((...args: any[]) => any)[]) =>
  fns.reduce(
    (f, g) =>
      (...args: any[]) =>
        f(g(...args)),
  );
