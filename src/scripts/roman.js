export const toRoman = (num) => {
  const map = ["", "I", "II", "III", "IV", "V", "VI"];
  return map[num] ?? String(num);
};
