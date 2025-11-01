import { relations } from "drizzle-orm";
import {
  // budgets,
  categories,
  creditCardStatements,
  currencies,
  exchangeRates,
  ledgers,
  transactions,
  transactionSplits,
} from "./app";
import { user } from "./auth";

export const userRelations = relations(user, ({ many }) => ({
  categories: many(categories),
  ledgers: many(ledgers),
  transactions: many(transactions),
  // budgets: many(budgets),
  creditCardStatements: many(creditCardStatements),
}));

export const currenciesRelations = relations(currencies, ({ many }) => ({
  exchangeRatesFrom: many(exchangeRates, { relationName: "fromCurrency" }),
  exchangeRatesTo: many(exchangeRates, { relationName: "toCurrency" }),
  ledgers: many(ledgers),
  transactions: many(transactions),
  baseCurrencyTransactions: many(transactions, {
    relationName: "baseCurrency",
  }),
  // budgets: many(budgets),
  creditCardStatements: many(creditCardStatements),
}));

export const exchangeRatesRelations = relations(exchangeRates, ({ one }) => ({
  fromCurrency: one(currencies, {
    fields: [exchangeRates.fromCurrencyId],
    references: [currencies.id],
    relationName: "fromCurrency",
  }),
  toCurrency: one(currencies, {
    fields: [exchangeRates.toCurrencyId],
    references: [currencies.id],
    relationName: "toCurrency",
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parentCategory: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
    relationName: "parent",
  }),
  subCategories: many(categories, { relationName: "parent" }),
  user: one(user, {
    fields: [categories.userId],
    references: [user.id],
  }),
  ledgers: many(ledgers),
  transactions: many(transactions),
  // budgets: many(budgets),
}));

export const ledgersRelations = relations(ledgers, ({ one, many }) => ({
  category: one(categories, {
    fields: [ledgers.categoryId],
    references: [categories.id],
  }),
  user: one(user, {
    fields: [ledgers.userId],
    references: [user.id],
  }),
  currency: one(currencies, {
    fields: [ledgers.currencyId],
    references: [currencies.id],
  }),
  transactionsFrom: many(transactions, { relationName: "fromLedger" }),
  transactionsTo: many(transactions, { relationName: "toLedger" }),
  transactionSplits: many(transactionSplits),
  creditCardStatements: many(creditCardStatements),
}));

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    currency: one(currencies, {
      fields: [transactions.currencyId],
      references: [currencies.id],
    }),
    baseCurrency: one(currencies, {
      fields: [transactions.baseCurrencyId],
      references: [currencies.id],
      relationName: "baseCurrency",
    }),
    category: one(categories, {
      fields: [transactions.categoryId],
      references: [categories.id],
    }),
    fromLedger: one(ledgers, {
      fields: [transactions.fromLedgerId],
      references: [ledgers.id],
      relationName: "fromLedger",
    }),
    toLedger: one(ledgers, {
      fields: [transactions.toLedgerId],
      references: [ledgers.id],
      relationName: "toLedger",
    }),
    user: one(user, {
      fields: [transactions.userId],
      references: [user.id],
    }),
    splits: many(transactionSplits),
  })
);

// export const budgetsRelations = relations(budgets, ({ one }) => ({  // budgets: many(budgets),
//   category: one(categories, {
//     fields: [budgets.categoryId],
//     references: [categories.id],
//   }),
//   user: one(user, {
//     fields: [budgets.userId],
//     references: [user.id],
//   }),
//   currency: one(currencies, {
//     fields: [budgets.currencyId],
//     references: [currencies.id],
//   }),
// }));

export const transactionSplitsRelations = relations(
  transactionSplits,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionSplits.transactionId],
      references: [transactions.id],
    }),
    ledger: one(ledgers, {
      fields: [transactionSplits.ledgerId],
      references: [ledgers.id],
    }),
  })
);

export const creditCardStatementsRelations = relations(
  creditCardStatements,
  ({ one }) => ({
    ledger: one(ledgers, {
      fields: [creditCardStatements.ledgerId],
      references: [ledgers.id],
    }),
    user: one(user, {
      fields: [creditCardStatements.userId],
      references: [user.id],
    }),
    exchangeRate: one(exchangeRates, {
      fields: [creditCardStatements.exchangeRateId],
      references: [exchangeRates.id],
    }),
    currency: one(currencies, {
      fields: [creditCardStatements.currencyId],
      references: [currencies.id],
    }),
  })
);
