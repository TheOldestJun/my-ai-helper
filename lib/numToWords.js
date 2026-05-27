import { toWords, toCurrency } from 'to-words/uk-UA';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const toWordsWithOpts = (num, decimalStyle) =>
  Number.isInteger(num) ? toWords(num) : toWords(num, { decimalStyle });

export const numToWords = (num, opts = {}) => {
  const { decimalStyle = 'fraction' } = opts;
  return capitalize(toWordsWithOpts(num, decimalStyle));
};

export const numToWordsUpper = (num, opts = {}) => {
  const { decimalStyle = 'fraction' } = opts;
  return toWordsWithOpts(num, decimalStyle).toUpperCase();
};

export const numToWordsLower = (num, opts = {}) => {
  const { decimalStyle = 'fraction' } = opts;
  return toWordsWithOpts(num, decimalStyle).toLowerCase();
};

export const numToCurrency = (num) => {
  const words = toCurrency(num);
  return capitalize(words);
};
