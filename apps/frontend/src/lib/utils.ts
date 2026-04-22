export const capitalize = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

export const removeDuplicates = <T>(arr: T[]): T[] =>
  arr.filter((item, index) => arr.indexOf(item) === index);
