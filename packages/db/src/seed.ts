import { randomUUID } from "crypto";
import { parseISO } from "date-fns";
import { db } from ".";
import schema from "./schema";
import {
  accountType,
  categoryType,
  usdExchangeRateSourceType,
} from "./schema/enums";

const seedData = {
  userID: randomUUID(),
  arsCurrencyID: randomUUID(),
  usdCurrencyID: randomUUID(),
  eurCurrencyID: randomUUID(),

  supermercadoCatID: randomUUID(),
  combustibleCatID: randomUUID(),
  restauranteCatID: randomUUID(),
  farmaciaCatID: randomUUID(),
  ropaCatID: randomUUID(),
  serviciosCatID: randomUUID(),
  entretenimientoCatID: randomUUID(),
  saludCatID: randomUUID(),
  educacionCatID: randomUUID(),
  otrosCatID: randomUUID(),
  salarioCatID: randomUUID(),
  freelanceCatID: randomUUID(),
  inversionesCatID: randomUUID(),

  visaSantanderAccID: randomUUID(),
  amexAccID: randomUUID(),
  hipotecarioAccID: randomUUID(),
  ciudadAccID: randomUUID(),
  efectivoAccID: randomUUID(),
};

async function seedUsers() {
  console.log("👤 Seeding users...");
  await db.insert(schema.auth.user).values({
    id: seedData.userID,
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocJ-g_s-6_g_s-6_g_s-6_g_s-6_g_s-6=s96-c",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(schema.auth.account).values({
    id: randomUUID(),
    userId: seedData.userID,
    providerId: "google",
    accountId: "109522628210791200000",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function seedCurrencies() {
  console.log("💰 Seeding currencies...");
  const currencies = [
    {
      id: seedData.arsCurrencyID,
      name: "Peso Argentino",
      code: "ARS",
      symbol: "$",
      isDefault: true,
    },
    {
      id: seedData.usdCurrencyID,
      name: "US Dollar",
      code: "USD",
      symbol: "US$",
      isDefault: false,
    },
    {
      id: seedData.eurCurrencyID,
      name: "Euro",
      code: "EUR",
      symbol: "€",
      isDefault: false,
    },
  ];

  for (const currency of currencies) {
    await db.insert(schema.app.currencies).values(currency);
  }
}

async function seedExchangeRates() {
  console.log("📈 Seeding exchange rates...");
  const rates = [
    { date: "2025-09-01", source: usdExchangeRateSourceType[0], rate: 1345 },
    { date: "2025-09-01", source: usdExchangeRateSourceType[1], rate: 1385 },
    { date: "2025-09-01", source: usdExchangeRateSourceType[2], rate: 1800.5 },
    { date: "2025-09-03", source: usdExchangeRateSourceType[0], rate: 1360 },
    { date: "2025-09-03", source: usdExchangeRateSourceType[1], rate: 1375 },
    { date: "2025-09-03", source: usdExchangeRateSourceType[2], rate: 1787.5 },
    { date: "2025-09-05", source: usdExchangeRateSourceType[0], rate: 1365 },
    { date: "2025-09-05", source: usdExchangeRateSourceType[1], rate: 1380 },
    { date: "2025-09-05", source: usdExchangeRateSourceType[2], rate: 1794 },
    { date: "2025-09-08", source: usdExchangeRateSourceType[0], rate: 1370 },
    { date: "2025-09-08", source: usdExchangeRateSourceType[1], rate: 1425 },
    { date: "2025-09-08", source: usdExchangeRateSourceType[2], rate: 1852.5 },
    { date: "2025-09-09", source: usdExchangeRateSourceType[0], rate: 1385 },
    { date: "2025-09-09", source: usdExchangeRateSourceType[1], rate: 1425 },
    { date: "2025-09-09", source: usdExchangeRateSourceType[2], rate: 1852.5 },
    { date: "2025-09-10", source: usdExchangeRateSourceType[0], rate: 1385 },
    { date: "2025-09-10", source: usdExchangeRateSourceType[1], rate: 1435 },
    { date: "2025-09-10", source: usdExchangeRateSourceType[2], rate: 1865.5 },
    { date: "2025-09-11", source: usdExchangeRateSourceType[0], rate: 1395 },
    { date: "2025-09-11", source: usdExchangeRateSourceType[1], rate: 1445 },
    { date: "2025-09-11", source: usdExchangeRateSourceType[2], rate: 1878.5 },
    { date: "2025-09-12", source: usdExchangeRateSourceType[0], rate: 1410 },
    { date: "2025-09-12", source: usdExchangeRateSourceType[1], rate: 1465 },
    { date: "2025-09-12", source: usdExchangeRateSourceType[2], rate: 1904.5 },
    { date: "2025-09-15", source: usdExchangeRateSourceType[0], rate: 1425 },
    { date: "2025-09-15", source: usdExchangeRateSourceType[1], rate: 1475 },
    { date: "2025-09-15", source: usdExchangeRateSourceType[2], rate: 1917.5 },
    { date: "2025-09-16", source: usdExchangeRateSourceType[1], rate: 1480 },
    { date: "2025-09-16", source: usdExchangeRateSourceType[2], rate: 1924 },
  ];

  for (const r of rates) {
    await db.insert(schema.app.exchangeRates).values({
      id: randomUUID(),
      date: parseISO(r.date),
      fromCurrencyId: seedData.usdCurrencyID,
      toCurrencyId: seedData.arsCurrencyID,
      rate: r.rate,
      source: r.source,
    });
  }
}

async function seedCategories() {
  console.log("📁 Seeding categories...");
  const categories = [
    // Expense categories
    {
      id: seedData.supermercadoCatID,
      name: "Supermercado",
      description: "Gastos en supermercado y comida",
      color: "#4CAF50",
      icon: "🛒",
      type: categoryType[1],
    },
    {
      id: seedData.combustibleCatID,
      name: "Combustible",
      description: "Gastos de combustible y transporte",
      color: "#FF9800",
      icon: "⛽",
      type: categoryType[1],
    },
    {
      id: seedData.restauranteCatID,
      name: "Restaurante",
      description: "Comidas en restaurantes",
      color: "#E91E63",
      icon: "🍽️",
      type: categoryType[1],
    },
    {
      id: seedData.farmaciaCatID,
      name: "Farmacia",
      description: "Medicamentos y productos de farmacia",
      color: "#00BCD4",
      icon: "💊",
      type: categoryType[1],
    },
    {
      id: seedData.ropaCatID,
      name: "Ropa",
      description: "Compras de ropa y vestimenta",
      color: "#9C27B0",
      icon: "👕",
      type: categoryType[1],
    },
    {
      id: seedData.serviciosCatID,
      name: "Servicios",
      description: "Servicios públicos y gastos del hogar",
      color: "#607D8B",
      icon: "🏠",
      type: categoryType[1],
    },
    {
      id: seedData.entretenimientoCatID,
      name: "Entretenimiento",
      description: "Cine, teatro, entretenimiento",
      color: "#FF5722",
      icon: "🎬",
      type: categoryType[1],
    },
    {
      id: seedData.saludCatID,
      name: "Salud",
      description: "Gastos médicos y de salud",
      color: "#03A9F4",
      icon: "⚕️",
      type: categoryType[1],
    },
    {
      id: seedData.educacionCatID,
      name: "Educación",
      description: "Gastos educativos",
      color: "#FFC107",
      icon: "📚",
      type: categoryType[1],
    },
    {
      id: seedData.otrosCatID,
      name: "Otros",
      description: "Gastos varios sin categorizar",
      color: "#9E9E9E",
      icon: "📦",
      type: categoryType[1],
    },
    // Income categories
    {
      id: seedData.salarioCatID,
      name: "Salario",
      description: "Ingresos por salario",
      color: "#8BC34A",
      icon: "💰",
      type: categoryType[0],
    },
    {
      id: seedData.freelanceCatID,
      name: "Freelance",
      description: "Ingresos por trabajos independientes",
      color: "#4CAF50",
      icon: "💻",
      type: categoryType[0],
    },
    {
      id: seedData.inversionesCatID,
      name: "Inversiones",
      description: "Rendimientos de inversiones",
      color: "#2196F3",
      icon: "📈",
      type: categoryType[0],
    },
  ];

  for (const category of categories) {
    await db.insert(schema.app.categories).values({
      ...category,
      userId: seedData.userID,
    });
  }
}

async function seedLedgers() {
  console.log("🏦 Seeding ledgers (accounts)...");
  const ledgers = [
    {
      id: seedData.visaSantanderAccID,
      name: "Visa Santander",
      notes: "Tarjeta de crédito Visa del Banco Santander",
      accountType: accountType[2],
      currencyId: seedData.arsCurrencyID,
    },
    {
      id: seedData.amexAccID,
      name: "American Express",
      notes: "Tarjeta de crédito American Express",
      accountType: accountType[2],
      currencyId: seedData.usdCurrencyID,
    },
    {
      id: seedData.hipotecarioAccID,
      name: "Banco Hipotecario",
      notes: "Cuenta corriente Banco Hipotecario",
      accountType: accountType[1],
      currencyId: seedData.arsCurrencyID,
    },
    {
      id: seedData.ciudadAccID,
      name: "Banco Ciudad",
      notes: "Cuenta en Banco Ciudad",
      accountType: accountType[1],
      currencyId: seedData.arsCurrencyID,
    },
    {
      id: seedData.efectivoAccID,
      name: "Efectivo",
      notes: "Dinero en efectivo",
      accountType: accountType[0],
      currencyId: seedData.arsCurrencyID,
    },
  ];

  for (const ledger of ledgers) {
    await db.insert(schema.app.ledgers).values({
      ...ledger,
      userId: seedData.userID,
    });
  }
}

async function seedTransactions() {
  console.log("💳 Seeding transactions...");
  const parseDate = (dateStr: string) => parseISO(dateStr);

  const transactions = [
    // Visa Santander transactions (expenses)
    {
      date: parseDate("2025-09-15"),
      description: "Supermercado Coto",
      notes: "Compra semanal",
      amount: -4500000,
      currencyId: seedData.arsCurrencyID,
      categoryId: seedData.supermercadoCatID,
      fromLedgerId: seedData.visaSantanderAccID,
    },
    {
      date: parseDate("2025-09-18"),
      description: "Farmacity",
      notes: "Medicamentos",
      amount: -1200000,
      currencyId: seedData.arsCurrencyID,
      categoryId: seedData.farmaciaCatID,
      fromLedgerId: seedData.visaSantanderAccID,
    },
    {
      date: parseDate("2025-09-20"),
      description: "Shell",
      notes: "Combustible",
      amount: -2800000,
      currencyId: seedData.arsCurrencyID,
      categoryId: seedData.combustibleCatID,
      fromLedgerId: seedData.visaSantanderAccID,
    },
    // American Express transactions (USD amounts in cents)
    {
      date: parseDate("2025-09-22"),
      description: "Amazon Purchase",
      notes: "Compra online",
      amount: -8500,
      currencyId: seedData.usdCurrencyID,
      categoryId: seedData.otrosCatID,
      fromLedgerId: seedData.amexAccID,
    },
    {
      date: parseDate("2025-09-25"),
      description: "Netflix",
      notes: "Suscripción mensual",
      amount: -1599,
      currencyId: seedData.usdCurrencyID,
      categoryId: seedData.entretenimientoCatID,
      fromLedgerId: seedData.amexAccID,
    },
    // Banco Hipotecario transactions
    {
      date: parseDate("2025-09-01"),
      description: "Salario",
      notes: "Depósito de salario",
      amount: 120000000,
      currencyId: seedData.arsCurrencyID,
      categoryId: seedData.salarioCatID,
      toLedgerId: seedData.hipotecarioAccID,
    },
    {
      date: parseDate("2025-09-05"),
      description: "Alquiler",
      notes: "Pago de alquiler mensual",
      amount: -35000000,
      currencyId: seedData.arsCurrencyID,
      categoryId: seedData.serviciosCatID,
      fromLedgerId: seedData.hipotecarioAccID,
    },
    {
      date: parseDate("2025-09-10"),
      description: "Edenor",
      notes: "Factura de luz",
      amount: -1850000,
      currencyId: seedData.arsCurrencyID,
      categoryId: seedData.serviciosCatID,
      fromLedgerId: seedData.hipotecarioAccID,
    },
    // Banco Ciudad transactions (Transfer)
    {
      date: parseDate("2025-09-12"),
      description: "Retiro ATM",
      notes: "Extracción de efectivo",
      amount: -5000000,
      currencyId: seedData.arsCurrencyID,
      fromLedgerId: seedData.ciudadAccID,
      toLedgerId: seedData.efectivoAccID,
    },
    // Efectivo transactions
    {
      date: parseDate("2025-09-16"),
      description: "Panadería",
      notes: "Pan y facturas",
      amount: -800000,
      currencyId: seedData.arsCurrencyID,
      categoryId: seedData.supermercadoCatID,
      fromLedgerId: seedData.efectivoAccID,
    },
    {
      date: parseDate("2025-09-19"),
      description: "Kiosco",
      notes: "Diarios y revistas",
      amount: -500000,
      currencyId: seedData.arsCurrencyID,
      categoryId: seedData.otrosCatID,
      fromLedgerId: seedData.efectivoAccID,
    },
  ];

  for (const txn of transactions) {
    await db.insert(schema.app.transactions).values({
      ...txn,
      id: randomUUID(),
      userId: seedData.userID,
    });
  }
}

// async function seedBudgets() {
//   console.log("📊 Seeding budgets...");
//   const startDate = parseISO("2025-09-01");
//   const budgets = [
//     {
//       name: "Presupuesto Supermercado",
//       categoryId: seedData.supermercadoCatID,
//       amount: 20000000,
//       currencyId: seedData.arsCurrencyID,
//       periodType: "monthly",
//       startDate,
//     },
//     {
//       name: "Presupuesto Combustible",
//       categoryId: seedData.combustibleCatID,
//       amount: 15000000,
//       currencyId: seedData.arsCurrencyID,
//       periodType: "monthly",
//       startDate,
//     },
//     {
//       name: "Presupuesto Entretenimiento",
//       categoryId: seedData.entretenimientoCatID,
//       amount: 8000000,
//       currencyId: seedData.arsCurrencyID,
//       periodType: "monthly",
//       startDate,
//     },
//     {
//       name: "Presupuesto Servicios",
//       categoryId: seedData.serviciosCatID,
//       amount: 25000000,
//       currencyId: seedData.arsCurrencyID,
//       periodType: "monthly",
//       startDate,
//     },
//   ];

//   for (const budget of budgets) {
//     await db.insert(schema.app.budgets).values({
//       ...budget,
//       userId: seedData.userID,
//     });
//   }
// }

async function seedCreditCardStatements() {
  console.log("📄 Seeding credit card statements...");

  const statement = {
    id: randomUUID(),
    ledgerId: seedData.visaSantanderAccID,
    userId: seedData.userID,
    statementDate: parseISO("2025-09-30"),
    periodStart: parseISO("2025-09-01"),
    periodEnd: parseISO("2025-09-30"),
    dueDate: parseISO("2025-10-15"),
    minimumPayment: 850000,
    previousBalance: 2500000,
    purchases: 8500000,
    interestCharges: 125000,
    currentBalance: 11125000,
    availableCredit: 38875000,
    creditLimit: 50000000,
    currencyId: seedData.arsCurrencyID,
    statementNumber: "VS202509001",
  };

  await db.insert(schema.app.creditCardStatements).values(statement);
}

function printSummary() {
  console.log("\n" + "====================================");
  console.log("📋 SEEDING SUMMARY");
  console.log("====================================");
  console.log("👤 Users: 1");
  console.log("💰 Currencies: 3 (ARS, USD, EUR)");
  console.log("📈 Exchange Rates: 29");
  console.log("📁 Categories: 13 (10 expenses + 3 income types)");
  console.log("🏦 Ledgers (Accounts): 5 (2 credit cards, 2 banks, 1 cash)");
  console.log("💳 Transactions: 11 sample transactions");
  console.log("📊 Budgets: 4 monthly budgets");
  console.log("📄 Credit Card Statements: 1");
  console.log("====================================");
  console.log(`🆔 User ID: ${seedData.userID}`);
  console.log(`💵 ARS Currency ID: ${seedData.arsCurrencyID}`);
  console.log(`💲 USD Currency ID: ${seedData.usdCurrencyID}`);
  console.log("====================================");
  console.log("\n💡 Notes:");
  console.log("• All amounts are stored as integers (cents)");
  console.log("• UUIDs generated using crypto.randomUUID()");
  console.log("• Transaction categories reflect Argentine spending patterns");
  console.log("• Multi-currency support with ARS as default");
  console.log("• Credit card statement includes realistic data");
}

async function main() {
  console.log("🚀 Starting database seeding...");

  await seedUsers();
  await seedCurrencies();
  await seedExchangeRates();
  await seedCategories();
  await seedLedgers();
  await seedTransactions();
  // await seedBudgets();
  await seedCreditCardStatements();

  console.log("✅ Database seeding completed successfully!");
  printSummary();
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
