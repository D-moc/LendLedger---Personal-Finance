export const calculateMonthlyInterest = (
  principal,
  interestRate
) => {
  if (principal <= 0 || interestRate <= 0) {
    return 0;
  }

  const interest =
    (principal * interestRate) / 100;

  return Number(interest.toFixed(2));
};