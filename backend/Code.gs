/**
 * Google Apps Script backend for the expense tracker.
 *
 * Deploy as: Web App
 * Execute as: Me
 * Who has access: Anyone
 *
 * Security is handled in code — every request is verified via Google's
 * tokeninfo endpoint and checked against an email allow-list.
 */

// ── Config ──────────────────────────────────────────────────────────
var ALLOWED_EMAILS = ['catagracia8@gmail.com', 'carloscalvonazabal@gmail.com']
var OAUTH_CLIENT_ID = '999086101021-1gs8qqhmt26dbkgc192rm2aqds1upr9q.apps.googleusercontent.com'

// Column indices in the "Expenses" tab (1-indexed, matching Sheet API)
var COL_ID = 1
var COL_DATE = 2
var COL_AMOUNT = 3
var COL_CATEGORY = 4
var COL_DESCRIPTION = 5
var COL_WHO_PAID = 6
var COL_PAYMENT_METHOD = 7
var COL_NOTES = 8
var COL_INSTALLMENTS = 9
var COL_COUNT = 9

// Tab names
var TAB_EXPENSES = 'App - Gastos'
var TAB_LISTS = 'App - Listas'

// ── Entry points ────────────────────────────────────────────────────

function doPost(e) {
  try {
    var auth = verifyRequest(e)
    if (!auth.ok) return respond(auth)

    var action = e.parameter.action
    if (action === 'lists') return handleLists()
    if (action === 'recent') return handleRecent()
    if (action === 'create') return handleCreate(e.parameter)
    if (action === 'update') return handleUpdate(e.parameter)
    if (action === 'delete') return handleDelete(e.parameter)
    if (action === 'add-description') return handleAddDescription(e.parameter)
    return respond({ error: 'Unknown action' })
  } catch (err) {
    return respond({ error: 'Script error', message: err.message })
  }
}


// ── Handlers ────────────────────────────────────────────────────────

function handleLists() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_LISTS)
  if (!sheet) return respond({ descriptions: [], categories: [], paymentMethods: [] })

  var data = sheet.getDataRange().getValues()
  var descriptions = []
  var categories = []
  var paymentMethods = []

  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) descriptions.push(data[i][0])
    if (data[i][1]) categories.push(data[i][1])
    if (data[i][2]) paymentMethods.push(data[i][2])
  }

  return respond({ descriptions: descriptions, categories: categories, paymentMethods: paymentMethods })
}

function handleAddDescription(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_LISTS)
  if (!data.description) return respond({ success: false, error: 'Descripción vacía' })

  // Find the first empty row in column A, or append at the end
  sheet.appendRow([data.description])
  return respond({ success: true })
}

function handleRecent() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_EXPENSES)
  if (!sheet) return respond({ expenses: [] })

  var data = sheet.getDataRange().getValues()
  if (data.length < 2) return respond({ expenses: [] })

  var expenses = []
  // Skip header row, take last 20
  var start = Math.max(1, data.length - 20)
  for (var i = data.length - 1; i >= start; i--) {
    expenses.push(rowToExpense(data[i]))
  }

  return respond({ expenses: expenses })
}

function parseAmount(raw) {
  var n = Number(raw)
  if (!n || n <= 0) return null
  return n
}

function handleCreate(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_EXPENSES)

  var amount = parseAmount(data.amount)
  if (!amount) return respond({ success: false, error: 'Monto inválido' })

  var installments = data.installments ? Number(data.installments) : 1
  var row = [
    uuidv7(),
    data.date,
    amount,
    data.category,
    data.description,
    data.whoPaid,
    data.paymentMethod,
    data.notes || '',
    installments,
  ]

  sheet.appendRow(row)
  return respond({ success: true })
}

function handleUpdate(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_EXPENSES)
  var rowIndex = findRowById(sheet, data.id)
  if (!rowIndex) return respond({ success: false, error: 'Expense not found' })

  var amount = parseAmount(data.amount)
  if (!amount) return respond({ success: false, error: 'Monto inválido' })

  sheet.getRange(rowIndex, COL_DATE).setValue(data.date)
  sheet.getRange(rowIndex, COL_AMOUNT).setValue(amount)
  sheet.getRange(rowIndex, COL_CATEGORY).setValue(data.category)
  sheet.getRange(rowIndex, COL_DESCRIPTION).setValue(data.description)
  sheet.getRange(rowIndex, COL_WHO_PAID).setValue(data.whoPaid)
  sheet.getRange(rowIndex, COL_PAYMENT_METHOD).setValue(data.paymentMethod)
  sheet.getRange(rowIndex, COL_NOTES).setValue(data.notes || '')
  sheet.getRange(rowIndex, COL_INSTALLMENTS).setValue(data.installments ? Number(data.installments) : 1)

  return respond({ success: true })
}

function handleDelete(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_EXPENSES)
  var rowIndex = findRowById(sheet, data.id)
  if (!rowIndex) return respond({ success: false, error: 'Expense not found' })

  sheet.deleteRow(rowIndex)
  return respond({ success: true })
}

// ── Helpers ─────────────────────────────────────────────────────────

function rowToExpense(row) {
  return {
    id: row[COL_ID - 1],
    date: row[COL_DATE - 1],
    amount: Number(row[COL_AMOUNT - 1]),
    category: row[COL_CATEGORY - 1],
    description: row[COL_DESCRIPTION - 1],
    whoPaid: row[COL_WHO_PAID - 1],
    paymentMethod: row[COL_PAYMENT_METHOD - 1],
    notes: row[COL_NOTES - 1] || '',
    installments: row[COL_INSTALLMENTS - 1] ? Number(row[COL_INSTALLMENTS - 1]) : 1,
  }
}

function findRowById(sheet, id) {
  var data = sheet.getDataRange().getValues()
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][COL_ID - 1]) === String(id)) {
      return i + 1 // Sheets is 1-indexed
    }
  }
  return null
}

// ── UUIDv7 generator ───────────────────────────────────────────────

function uuidv7() {
  // UUID v7 format: tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
  var hexChars = '0123456789abcdef'
  var uuid = ''

  var now = Date.now()
  var timestampHex = now.toString(16).padStart(12, '0')

  for (var i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-'
    } else if (i === 14) {
      uuid += '7'
    } else if (i === 19) {
      uuid += hexChars.charAt(Math.floor(Math.random() * 4) + 8) // 8, 9, a, b
    } else if (i < 12) {
      uuid += timestampHex[i]
    } else {
      uuid += hexChars.charAt(Math.floor(Math.random() * 16))
    }
  }

  return uuid
}

// ── Auth ────────────────────────────────────────────────────────────

function verifyRequest(e) {
  var result = {}

  var token = extractToken(e)
  if (!token) { result.reason = 'no_token'; return result }

  var tokenInfo = verifyGoogleToken(token)
  if (!tokenInfo) { result.reason = 'token_verification_failed'; return result }

  if (tokenInfo.audience !== OAUTH_CLIENT_ID) {
    result.reason = 'audience_mismatch'
    result.expected = OAUTH_CLIENT_ID
    result.got = tokenInfo.audience
    return result
  }

  var email = tokenInfo.email
  if (ALLOWED_EMAILS.indexOf(email) === -1) {
    result.reason = 'email_not_allowed'
    result.email = email
    return result
  }

  result.ok = true
  return result
}


function extractToken(e) {
  // Works for GET (query params) and POST (form-encoded body)
  return e.parameter && e.parameter.token
}

function verifyGoogleToken(idToken) {
  var url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken)

  try {
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true })
    var status = response.getResponseCode()

    if (status !== 200) return null

    var payload = JSON.parse(response.getContentText())
    return {
      email: payload.email,
      audience: payload.aud,
      subject: payload.sub,
      issuer: payload.iss,
    }
  } catch (err) {
    return null
  }
}

// ── Response helper ─────────────────────────────────────────────────

function respond(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON)
}
