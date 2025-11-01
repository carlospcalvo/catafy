export const categoryType = ["income", "expense", "transfer"] as const;

export const accountType = [
  "cash",
  "bank",
  "credit_card",
  "investment",
  "loan",
  "asset",
] as const;

export const periodType = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom",
] as const;

export const usdExchangeRateSourceType = [
  "blue",
  "oficial",
  "tarjeta",
] as const;
