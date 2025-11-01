CREATE TABLE users (
  id BLOB PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  avatar_url TEXT,
  active BOOLEAN default 1
);

CREATE TABLE currencies (
  id BLOB PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  symbol TEXT NOT NULL,
  is_default BOOLEAN DEFAULT 0
);

CREATE TABLE exchange_rates (
  id BLOB PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  date DATETIME NOT NULL,
  from_currency_id BLOB NOT NULL,
  to_currency_id BLOB NOT NULL,
  rate REAL NOT NULL,
  source TEXT,
  FOREIGN KEY (from_currency_id) REFERENCES currencies (id),
  FOREIGN KEY (to_currency_id) REFERENCES currencies (id),
  UNIQUE (from_currency_id, to_currency_id, date, source)
);

CREATE INDEX exchange_rates_date_idx ON exchange_rates (date);

CREATE TABLE categories (
  id BLOB PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  parent_category_id BLOB,
  user_id BLOB NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  type TEXT,
  FOREIGN KEY (parent_category_id) REFERENCES categories (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX categories_parent_category_id_idx ON categories (parent_category_id);

CREATE TABLE ledgers (
  id BLOB PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  notes TEXT,
  account_type TEXT NOT NULL,
  category_id BLOB,
  user_id BLOB NOT NULL,
  currency_id BLOB NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  card_close_date DATETIME,
  card_payment_due_date DATETIME,
  FOREIGN KEY (category_id) REFERENCES categories (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (currency_id) REFERENCES currencies (id)
);

CREATE INDEX ledgers_user_id_is_active_idx ON ledgers (user_id, is_active);

CREATE TABLE transactions (
  id BLOB PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  date DATETIME NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  amount INTEGER NOT NULL,
  currency_id BLOB NOT NULL,
  amount_base_currency INTEGER,
  exchange_rate REAL,
  base_currency_id BLOB,
  category_id BLOB,
  from_ledger_id BLOB,
  to_ledger_id BLOB,
  user_id BLOB NOT NULL,
  reference_number TEXT,
  is_reconciled BOOLEAN DEFAULT 0,
  reconciled_at DATETIME,
  FOREIGN KEY (currency_id) REFERENCES currencies (id),
  FOREIGN KEY (base_currency_id) REFERENCES currencies (id),
  FOREIGN KEY (category_id) REFERENCES categories (id),
  FOREIGN KEY (from_ledger_id) REFERENCES ledgers (id),
  FOREIGN KEY (to_ledger_id) REFERENCES ledgers (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX transactions_user_id_date_idx ON transactions (user_id, date);

CREATE INDEX transactions_from_ledger_id_date_idx ON transactions (from_ledger_id, date);

CREATE INDEX transactions_to_ledger_id_date_idx ON transactions (to_ledger_id, date);

CREATE INDEX transactions_category_id_date_idx ON transactions (category_id, date);

CREATE INDEX transactions_is_reconciled_idx ON transactions (is_reconciled);

CREATE TABLE budgets (
  id BLOB PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  category_id BLOB NOT NULL,
  user_id BLOB NOT NULL,
  amount INTEGER NOT NULL,
  currency_id BLOB NOT NULL,
  period_type TEXT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (category_id) REFERENCES categories (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (currency_id) REFERENCES currencies (id)
);

/*
    How Transaction Splits Work:
    Main Transaction: Let's say you go to a store and spend $100, but you buy different types of items:

    $60 for groceries
    $25 for household supplies
    $15 for personal care items

    The Problem: You have one receipt, one payment, one transaction - but it spans multiple expense categories.
    The Solution: Transaction splits let you:

    Create one main transaction for $100 in the transactions table
    Create three entries in transaction_splits:

    Split 1: $60 → "Groceries" category
    Split 2: $25 → "Household" category
    Split 3: $15 → "Personal Care" category
*/
CREATE TABLE transaction_splits (
  id BLOB PRIMARY KEY,
  transaction_id BLOB NOT NULL,
  ledger_id BLOB NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  FOREIGN KEY (transaction_id) REFERENCES transactions (id),
  FOREIGN KEY (ledger_id) REFERENCES ledgers (id),
  UNIQUE (transaction_id, ledger_id)
);

CREATE TABLE credit_card_statements (
  id BLOB PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ledger_id BLOB NOT NULL,
  user_id BLOB NOT NULL,
  statement_date DATETIME NOT NULL,
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  due_date DATETIME NOT NULL,
  minimum_payment INTEGER NOT NULL,
  previous_balance INTEGER DEFAULT 0,
  payments_credits INTEGER DEFAULT 0,
  purchases INTEGER NOT NULL,
  interest_charges INTEGER DEFAULT 0,
  fees INTEGER DEFAULT 0,
  current_balance INTEGER NOT NULL,
  available_credit INTEGER,
  credit_limit INTEGER NOT NULL,
  paid_amount_ars INTEGER DEFAULT 0,
  paid_date DATETIME,
  is_paid BOOLEAN DEFAULT 0,
  is_overdue BOOLEAN DEFAULT 0,
  exchange_rate_id BLOB,
  currency_id BLOB NOT NULL,
  statement_number TEXT,
  notes TEXT,
  FOREIGN KEY (ledger_id) REFERENCES ledgers (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (exchange_rate_id) REFERENCES exchange_rates (id),
  FOREIGN KEY (currency_id) REFERENCES currencies (id)
);

CREATE INDEX credit_card_statements_ledger_id_period_end_idx ON credit_card_statements (ledger_id, period_end);

CREATE INDEX credit_card_statements_user_id_due_date_idx ON credit_card_statements (user_id, due_date);

CREATE INDEX credit_card_statements_is_paid_is_overdue_idx ON credit_card_statements (is_paid, is_overdue);
