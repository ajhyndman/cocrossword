/**
 * Select a random item from a list of items.
 */
export const randomItem = <T>(list: T[]): T => {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};
