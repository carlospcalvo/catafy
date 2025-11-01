import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { accountType, categoryType, usdExchangeRateSourceType } from "./enums";

export const currencies = sqliteTable("currencies", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  name: text("name").notNull(),
  code: text("code").unique().notNull(),
  symbol: text("symbol").notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
});

export const exchangeRates = sqliteTable(
  "exchange_rates",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
    date: integer("date", { mode: "timestamp" }).notNull(),
    fromCurrencyId: text("from_currency_id")
      .notNull()
      .references(() => currencies.id),
    toCurrencyId: text("to_currency_id")
      .notNull()
      .references(() => currencies.id),
    rate: real("rate").notNull(),
    source: text("source", { enum: usdExchangeRateSourceType }).notNull(),
  },
  (table) => [
    index("exchange_rates_date_idx").on(table.date),
    uniqueIndex("exchange_rates_unq").on(
      table.fromCurrencyId,
      table.toCurrencyId,
      table.date,
      table.source
    ),
  ]
);

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color"),
    icon: text("icon"),
    parentCategoryId: text("parent_category_id").references(
      (): AnySQLiteColumn => categories.id
    ),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    type: text("type", { enum: categoryType }).notNull(),
  },
  (table) => [
    index("categories_parent_category_id_idx").on(table.parentCategoryId),
  ]
);

export const ledgers = sqliteTable(
  "ledgers",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
    name: text("name").notNull(),
    notes: text("notes"),
    accountType: text("account_type", {
      enum: accountType,
    }).notNull(),
    categoryId: text("category_id").references(() => categories.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    currencyId: text("currency_id")
      .notNull()
      .references(() => currencies.id),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    cardCloseDate: integer("card_close_date", { mode: "timestamp" }),
    cardPaymentDueDate: integer("card_payment_due_date", {
      mode: "timestamp",
    }),
  },
  (table) => [
    index("ledgers_user_id_is_active_idx").on(table.userId, table.isActive),
  ]
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
    date: integer("date", { mode: "timestamp" }).notNull(),
    description: text("description").notNull(),
    notes: text("notes"),
    amount: integer("amount").notNull(),
    currencyId: text("currency_id")
      .notNull()
      .references(() => currencies.id),
    amountBaseCurrency: integer("amount_base_currency"),
    exchangeRate: real("exchange_rate"),
    baseCurrencyId: text("base_currency_id").references(() => currencies.id),
    categoryId: text("category_id").references(() => categories.id),
    fromLedgerId: text("from_ledger_id").references(() => ledgers.id),
    toLedgerId: text("to_ledger_id").references(() => ledgers.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    referenceNumber: text("reference_number"),
    isReconciled: integer("is_reconciled", { mode: "boolean" }).default(false),
    reconciledAt: integer("reconciled_at", { mode: "timestamp" }),
  },
  (table) => [
    index("transactions_user_id_date_idx").on(table.userId, table.date),
    index("transactions_from_ledger_id_date_idx").on(
      table.fromLedgerId,
      table.date
    ),
    index("transactions_to_ledger_id_date_idx").on(
      table.toLedgerId,
      table.date
    ),
    index("transactions_category_id_date_idx").on(table.categoryId, table.date),
    index("transactions_is_reconciled_idx").on(table.isReconciled),
  ]
);

// export const budgets = sqliteTable("budgets", {
//   id: text("id").primaryKey(),
//   createdAt: integer("created_at", { mode: "timestamp" }),
//   updatedAt: integer("updated_at", { mode: "timestamp" }),
//   name: text("name").notNull(),
//   categoryId: text("category_id")
//     .notNull()
//     .references(() => categories.id),
//   userId: text("user_id")
//     .notNull()
//     .references(() => user.id),
//   amount: integer("amount").notNull(),
//   currencyId: text("currency_id")
//     .notNull()
//     .references(() => currencies.id),
//   periodType: text("period_type", {
//     enum: periodType,
//   }).notNull(),
//   startDate: integer("start_date", { mode: "timestamp" }).notNull(),
//   endDate: integer("end_date", { mode: "timestamp" }),
//   isActive: integer("is_active", { mode: "boolean" }).default(true),
// });

export const transactionSplits = sqliteTable(
  "transaction_splits",
  {
    id: text("id").primaryKey(),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transactions.id),
    ledgerId: text("ledger_id")
      .notNull()
      .references(() => ledgers.id),
    amount: integer("amount").notNull(),
    description: text("description"),
  },
  (table) => [
    uniqueIndex("transaction_splits_unq").on(
      table.transactionId,
      table.ledgerId
    ),
  ]
);

export const creditCardStatements = sqliteTable(
  "credit_card_statements",
  {
    id: text("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
    ledgerId: text("ledger_id")
      .notNull()
      .references(() => ledgers.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    statementDate: integer("statement_date", { mode: "timestamp" }).notNull(),
    periodStart: integer("period_start", { mode: "timestamp" }).notNull(),
    periodEnd: integer("period_end", { mode: "timestamp" }).notNull(),
    dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
    minimumPayment: integer("minimum_payment").notNull(),
    previousBalance: integer("previous_balance").default(0),
    paymentsCredits: integer("payments_credits").default(0),
    purchases: integer("purchases").notNull(),
    interestCharges: integer("interest_charges").default(0),
    fees: integer("fees").default(0),
    currentBalance: integer("current_balance").notNull(),
    availableCredit: integer("available_credit"),
    creditLimit: integer("credit_limit").notNull(),
    paidAmountArs: integer("paid_amount_ars").default(0),
    paidDate: integer("paid_date", { mode: "timestamp" }),
    isPaid: integer("is_paid", { mode: "boolean" }).default(false),
    isOverdue: integer("is_overdue", { mode: "boolean" }).default(false),
    exchangeRateId: text("exchange_rate_id").references(() => exchangeRates.id),
    currencyId: text("currency_id")
      .notNull()
      .references(() => currencies.id),
    statementNumber: text("statement_number"),
    notes: text("notes"),
  },
  (table) => [
    index("credit_card_statements_ledger_id_period_end_idx").on(
      table.ledgerId,
      table.periodEnd
    ),
    index("credit_card_statements_user_id_due_date_idx").on(
      table.userId,
      table.dueDate
    ),
    index("credit_card_statements_is_paid_is_overdue_idx").on(
      table.isPaid,
      table.isOverdue
    ),
  ]
);
