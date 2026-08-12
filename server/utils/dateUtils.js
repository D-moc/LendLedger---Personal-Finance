export const addOneMonth = (date) => {
  const result = new Date(date);

  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + 1);

  const lastDayOfMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();

  result.setDate(
    Math.min(originalDay, lastDayOfMonth)
  );

  return result;
};

export const daysBetween = (date1, date2) => {
  const first = new Date(date1);
  const second = new Date(date2);

  const difference =
    second.getTime() - first.getTime();

  return Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );
};

export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

export const isWithinDays = (
  targetDate,
  days
) => {
  const now = new Date();

  const target = new Date(targetDate);

  const difference =
    target.getTime() - now.getTime();

  const differenceInDays =
    difference /
    (1000 * 60 * 60 * 24);

  return (
    differenceInDays >= 0 &&
    differenceInDays <= days
  );
};