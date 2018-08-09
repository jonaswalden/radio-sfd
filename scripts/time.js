
const date = new Date();
const thisMonth = [date.getFullYear(), date.getMonth()];

export const today = [...thisMonth, date.getDate()];
export const tomorrow = [...thisMonth, today[2] + 1];

export function moment (day, time) {
  return new Date(...day, ...time.split(':')).getTime();
}
