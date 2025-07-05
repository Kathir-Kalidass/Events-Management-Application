export const getCurrency = (input) => {

  let amount = Number(input);

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
  return formatted;
};
