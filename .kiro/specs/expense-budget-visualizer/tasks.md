# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a zero-build-tool, single-page expense tracker using plain HTML, CSS, and Vanilla JavaScript. The app stores data in `localStorage`, renders a Chart.js pie chart, and follows a unidirectional read-modify-write data flow. All logic lives in three files: `index.html`, `css/styles.css`, and `js/app.js`.

---

## Tasks

- [ ] 1. Project scaffold — create file structure and wire static assets
  - Create `index.html` at the project root with the HTML5 boilerplate (`<!DOCTYPE html>`, `<meta charset>`, `<meta name="viewport" content="width=device-width, initial-scale=1">`)
  - Add a `<link>` to `css/styles.css` in `<head>`
  - Add the Chart.js CDN `<script>` tag (`https://cdn.jsdelivr.net/npm/chart.js`) before the closing `</body>`
  - Add a `<script src="js/app.js" defer></script>` tag after the Chart.js tag
  - Create the empty files `css/styles.css` and `js/app.js`
  - _Requirements: 6.5, 7.2_

- [ ] 2. HTML semantic structure
  - [ ] 2.1 Build the application shell and header
    - Add `<div class="app-container">` wrapping the entire content
    - Add `<header>` containing `<h1>Expense & Budget Visualizer</h1>` and `<div id="balance-display"><span id="balance-amount">$0.00</span></div>`
    - _Requirements: 3.1, 3.4_

  - [ ] 2.2 Build the input form markup
    - Add `<section class="form-section">` containing `<form id="transaction-form">`
    - Inside the form add: `<label for="item-name">` + `<input type="text" id="item-name" maxlength="100">` + `<span id="item-name-error" class="error-msg" aria-live="assertive"></span>`
    - Add: `<label for="amount">` + `<input type="number" id="amount" min="0.01" max="999999999.99" step="0.01">` + `<span id="amount-error" class="error-msg" aria-live="assertive"></span>`
    - Add: `<label for="category">` + `<select id="category">` with a disabled placeholder option and three options: Food, Transport, Fun + `<span id="category-error" class="error-msg" aria-live="assertive"></span>`
    - Add: `<button type="submit" id="submit-btn">Add Transaction</button>`
    - Wire `aria-describedby` on each input pointing to its corresponding error span
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 6.1_

  - [ ] 2.3 Build the chart and transaction list sections
    - Add `<section class="chart-section">` containing `<canvas id="spending-chart"></canvas>` and `<p id="chart-empty-state" hidden>No spending data yet</p>`
    - Add `<section class="list-section">` containing `<ul id="transaction-list"></ul>` and `<p id="list-empty-state">No transactions yet. Add one above!</p>`
    - Add `<div id="toast-container" aria-live="polite"></div>` before the closing `</div>` of `app-container`
    - _Requirements: 2.8, 4.4, 5.4_

- [ ] 3. CSS — mobile-first base styles
  - [ ] 3.1 Typography, reset, and layout foundation
    - Apply a CSS reset (`box-sizing: border-box`, margin/padding reset)
    - Set `body` font-size to at least 14px, a legible font-family, and a neutral background colour
    - Style `.app-container` with `max-width`, horizontal `auto` margins, and padding for breathing room
    - Style `header` with a prominent background, centred text, and consistent padding
    - _Requirements: 6.1, 6.2_

  - [ ] 3.2 Input form component styles
    - Style `.form-section` as a card (background, border-radius, padding, box-shadow)
    - Style all `<label>` elements as block-level with adequate spacing
    - Style `<input>` and `<select>` as full-width (`width: 100%`) with a minimum height of 44px for tap targets
    - Style `#submit-btn` with a minimum size of 44×44px, clear background colour, and `:hover`/`:focus` states
    - Style `.error-msg` as red, small text, hidden by default via empty content — visible when text content is set
    - _Requirements: 1.3, 1.4, 1.5, 6.1, 6.4_

  - [ ] 3.3 Balance display, transaction list, and chart styles
    - Style `#balance-display` to be visually prominent; style `#balance-amount.negative` with a red colour (Req 3.6)
    - Style `#transaction-list` as a scrollable container (`overflow-y: auto`, `max-height`) with no list bullets
    - Style each transaction `<li>` row with flex layout: item name, amount, category badge, and delete button side by side
    - Style category badges with distinct background colours per category
    - Style delete buttons with a minimum 44×44px tap target and a clear destructive colour; add `aria-label` placeholder in CSS via `::after` if needed
    - Style `.chart-section` to centre the canvas and size it responsively
    - _Requirements: 2.1, 2.2, 2.4, 3.6, 6.1, 6.4_

  - [ ] 3.4 Toast notification styles
    - Style `#toast-container` as a fixed overlay (bottom-right or bottom-centre)
    - Style `.toast` divs with padding, border-radius, colour variants for `warning` and `error` types
    - Add a fade-in/out CSS transition
    - _Requirements: 5.4, 5.5_

  - [ ] 3.5 Responsive breakpoint — 768px and wider
    - Add a `@media (min-width: 768px)` block
    - Inside the breakpoint, arrange `.form-section` and `.chart-section` in a two-column grid or flex row
    - Ensure `.list-section` spans full width below the two-column row
    - Verify no horizontal scroll appears at any viewport width from 320px to 1920px
    - _Requirements: 6.2, 6.3_

- [ ] 4. JavaScript — data model, storage module, and browser compatibility checks
  - [ ] 4.1 Set up module structure, in-memory state, and browser compatibility guards
    - In `js/app.js`, declare `let transactions = []` as the single source of truth
    - Detect `localStorage` availability (`try { localStorage.setItem('__test','1'); localStorage.removeItem('__test'); } catch(e) { … }`)
    - Detect `Canvas` API availability (`!!document.createElement('canvas').getContext`)
    - If either API is unavailable, inject a visible, non-dismissible banner into the DOM and stop further initialisation
    - _Requirements: 7.1, 7.3_

  - [ ] 4.2 Implement the storage module (`loadTransactions` / `saveTransactions`)
    - Write `function loadTransactions()`: reads `localStorage['expense_tracker_transactions']`, `JSON.parse`s it, validates the array shape (each entry must have `id` string, `itemName` non-empty string, `amount` positive number, `category` one of Food/Transport/Fun, `createdAt` number) — on any error call `showToast` with a warning and return `[]`
    - Write `function saveTransactions(transactions)`: `JSON.stringify`s and writes the array — catches `QuotaExceededError`/`SecurityError` and calls `showToast` with an error without reverting in-memory state
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 4.3 Write property test for storage round-trip (Property 5)
    - **Property 5: Storage round-trip preserves transaction data**
    - For any valid array of transactions, `saveTransactions` followed by `loadTransactions` SHALL return a deeply equal array
    - Use `fast-check` with `fc.array(validTransaction)` arbitrary; minimum 100 iterations
    - Tag: `// Feature: expense-budget-visualizer, Property 5: Storage round-trip`
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 5. JavaScript — validation and form handling
  - [ ] 5.1 Implement `validateForm(itemName, amount, category)`
    - Returns `{ valid: boolean, errors: { itemName?, amount?, category? } }`
    - `itemName` is invalid if empty or contains only whitespace characters
    - `amount` is invalid if `NaN`, `≤ 0`, or `> 999999999.99`
    - `category` is invalid if not one of `"Food"`, `"Transport"`, `"Fun"`
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 5.2 Write property test for form validation — whitespace item names (Property 1)
    - **Property 1: Form validation rejects all whitespace/empty item names**
    - Use `fc.string()` filtered to strings that `.trim()` to `""` (empty/whitespace-only)
    - Assert `validateForm(itemName, 1, 'Food').valid === false` and errors contain `itemName`
    - Tag: `// Feature: expense-budget-visualizer, Property 1: Whitespace item name rejection`
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 5.3 Write property test for form validation — out-of-range amounts (Property 2)
    - **Property 2: Form validation rejects out-of-range amounts**
    - Use `fc.oneof(fc.float({ max: 0 }), fc.constant(NaN), fc.constant(Infinity))` as the amount
    - Assert `validateForm('Lunch', amount, 'Food').valid === false` and errors contain `amount`
    - Tag: `// Feature: expense-budget-visualizer, Property 2: Out-of-range amount rejection`
    - **Validates: Requirements 1.2, 1.4**

  - [ ] 5.4 Implement `handleFormSubmit(event)` and `resetForm()`
    - `handleFormSubmit`: prevents default, reads field values, calls `validateForm`, displays inline errors on failure (sets error span `textContent`), on success creates a `Transaction` object (use `crypto.randomUUID()` with `Date.now().toString()` fallback for `id`, record `createdAt: Date.now()`), pushes to `transactions`, calls `saveTransactions`, calls `renderAll`, calls `resetForm`
    - `resetForm`: clears all field values, resets `<select>` to placeholder, clears all error spans — completes within 300ms
    - Wire `document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit)`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.1_

  - [ ]* 5.5 Write property test for adding a transaction grows the list by exactly one (Property 3)
    - **Property 3: Adding a valid transaction grows the list by exactly one**
    - Use `fc.array(validTransaction)` as initial state, `fc.record({ itemName: fc.string(), amount: fc.float({ min: 0.01 }), category: fc.constantFrom('Food','Transport','Fun') })` as new input
    - Call the add logic; assert `transactions.length === prevLength + 1` and new entry appears in the rendered `#transaction-list`
    - Tag: `// Feature: expense-budget-visualizer, Property 3: Adding transaction grows list by 1`
    - **Validates: Requirements 1.6, 2.3**

- [ ] 6. JavaScript — balance display and currency formatter
  - [ ] 6.1 Implement `formatCurrency(value)` and `renderBalanceDisplay(transactions)`
    - `formatCurrency`: use `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` with a manual fallback (`value.toFixed(2)` prefixed with `$`) for environments where `Intl` is unavailable; always returns a string matching `^\$[\d,]+\.\d{2}$`
    - `renderBalanceDisplay`: sums all `transaction.amount` values, calls `formatCurrency`, sets `#balance-amount` `textContent`, toggles `.negative` class when the total is `< 0`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 6.2 Write property test for balance equals sum of all transaction amounts (Property 4)
    - **Property 4: Balance equals the sum of all transaction amounts**
    - Use `fc.array(validTransaction, { minLength: 0, maxLength: 500 })` as input
    - Assert displayed balance value equals arithmetic sum formatted to 2 decimal places with `$`
    - Tag: `// Feature: expense-budget-visualizer, Property 4: Balance equals sum`
    - **Validates: Requirements 3.1, 3.4, 3.5**

  - [ ]* 6.3 Write property test for currency formatter (Property 8)
    - **Property 8: Currency formatter output is valid for any non-negative number**
    - Use `fc.float({ min: 0, noNaN: true, noDefaultInfinity: true })` as input
    - Assert result matches regex `^\$[\d,]+\.\d{2}$`
    - Tag: `// Feature: expense-budget-visualizer, Property 8: Currency formatter validity`
    - **Validates: Requirements 3.5, 3.4**

- [ ] 7. JavaScript — transaction list renderer and delete handler
  - [ ] 7.1 Implement `renderTransactionList(transactions)`
    - Clears `#transaction-list` innerHTML
    - If `transactions` is empty: show `#list-empty-state`, return early
    - Otherwise: hide `#list-empty-state`, create an `<li>` for each transaction containing: item name text node, formatted amount (`formatCurrency`), category badge `<span>`, and a `<button>` with `aria-label="Delete ${itemName}"` wired to `handleDeleteClick(transaction.id)`
    - Amounts are formatted to 2 decimal places with currency symbol
    - _Requirements: 2.1, 2.3, 2.4, 2.7, 2.8_

  - [ ] 7.2 Implement `handleDeleteClick(id)` and `deleteTransaction(id)`
    - `handleDeleteClick`: calls `window.confirm('Delete this transaction?')`; on `true` calls `deleteTransaction(id)`
    - `deleteTransaction`: filters `transactions` array to exclude the entry with matching `id`, calls `saveTransactions`, calls `renderAll`
    - _Requirements: 2.5, 2.6, 2.7, 5.2_

  - [-] 7.3 Write property test for delete removes only the target entry (Property 7)
    - **Property 7: Deleting a transaction produces a list without that entry**
    - Use `fc.array(validTransaction, { minLength: 1 })` as initial state; pick a random `id` from the array
    - Call `deleteTransaction(id)`; assert resulting array contains no entry with that `id`, and all other entries are preserved
    - Tag: `// Feature: expense-budget-visualizer, Property 7: Delete removes only target`
    - **Validates: Requirements 2.5, 2.6, 2.7**

- [ ] 8. Checkpoint — wire renderAll and verify core data flow
  - Implement `function renderAll()` that calls `renderBalanceDisplay(transactions)`, `renderTransactionList(transactions)`, and `renderChart(transactions)` in sequence
  - Verify that adding a transaction updates the balance, list, and chart in under 100ms (manual browser check or console timing)
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 3.2, 3.3, 4.3_

- [ ] 9. JavaScript — Chart.js pie chart renderer
  - [ ] 9.1 Implement `getCategoryTotals(transactions)`
    - Iterates over `transactions`, accumulates `amount` per category key (`Food`, `Transport`, `Fun`)
    - Excludes transactions where `amount ≤ 0`
    - Returns `{ Food: number, Transport: number, Fun: number }`
    - _Requirements: 4.1, 4.6_

  

  - [ ] 9.3 Implement `renderChart(transactions)`
    - Declare `let chartInstance = null` at module level
    - Filter `transactions` to those with `amount > 0`; call `getCategoryTotals`
    - If no positive-amount transactions: hide `#spending-chart`, show `#chart-empty-state`, destroy `chartInstance` if exists, return
    - Otherwise: show `#spending-chart`, hide `#chart-empty-state`
    - Destroy `chartInstance` if it exists (`chartInstance.destroy()`)
    - Create a new `Chart` instance on `#spending-chart` of type `'pie'` with:
      - Labels: `['Food', 'Transport', 'Fun']`
      - Data: corresponding totals from `getCategoryTotals`
      - Fixed background colours: Food `#FF6384`, Transport `#36A2EB`, Fun `#FFCE56`
      - Tooltip and legend showing category name and percentage rounded to 1 decimal place
    - Handle the case where `Chart` is undefined (CDN failed): show an error toast and hide the chart section
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 10. JavaScript — toast notifications
  - [ ] 10.1 Implement `showToast(message, type)`
    - Creates a `<div class="toast toast--${type}">` element with the given message
    - Appends to `#toast-container`
    - After 4000ms removes the element from the DOM
    - `#toast-container` uses `aria-live="polite"` (already set in HTML) for screen-reader announcements
    - _Requirements: 5.4, 5.5_

- [ ] 11. JavaScript — app initialisation
  - [ ] 11.1 Implement `function initApp()`
    - Calls browser compatibility checks (from task 4.1); if failing, stop
    - Calls `loadTransactions()` and assigns result to `transactions`
    - Calls `renderAll()`
    - Wires the form `submit` event listener
    - Calls `initApp()` inside a `DOMContentLoaded` listener (or at the bottom of the script after `defer`)
    - Verify that persisted data is loaded and rendered within 500ms of page load
    - _Requirements: 5.3, 7.1, 8.1_

- [ ] 12. Accessibility audit and tap-target verification
  - [ ] 12.1 Verify and fix all accessibility requirements
    - Confirm every `<input>` and `<select>` has an associated `<label>` (for= / id= pairing)
    - Confirm all error spans are linked via `aria-describedby` on their corresponding inputs
    - Confirm `#toast-container` has `aria-live="polite"`
    - Confirm each delete button has a descriptive `aria-label="Delete <itemName>"`
    - Confirm all interactive elements (inputs, select, buttons) have a rendered size of at least 44×44 CSS pixels — adjust CSS if any fail
    - _Requirements: 6.1, 6.4_

- [ ] 13. Final checkpoint — cross-browser and responsive sanity
  - Open `index.html` directly in Chrome, Firefox, Edge, and Safari; confirm no console errors
  - Add transactions in all three categories; confirm list, balance, and chart update correctly
  - Refresh the page; confirm data persists correctly
  - Delete all transactions; confirm empty states appear for list and chart
  - Resize the viewport from 320px to 1920px; confirm no horizontal scroll appears
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 7.1, 6.2, 6.3, 8.1, 8.2_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP — they implement the property-based tests from the design's Correctness Properties section.
- The design specifies full re-renders for all UI components on every state change; do not implement incremental patching.
- `crypto.randomUUID()` is the preferred ID generator; include a `Date.now().toString()` fallback for Safari versions that lack it.
- Chart.js is loaded via CDN — always guard with a `typeof Chart !== 'undefined'` check before instantiating.
- All property tests use `fast-check` and should be runnable in Node.js with jsdom (no browser required).
- Each task references specific requirements for traceability.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "2.3", "3.1", "4.1"] },
    { "id": 1, "tasks": ["3.2", "3.3", "3.4", "3.5", "4.2", "5.1"] },
    { "id": 2, "tasks": ["4.3", "5.2", "5.3", "5.4", "6.1", "7.1", "9.1", "10.1"] },
    { "id": 3, "tasks": ["5.5", "6.2", "6.3", "7.2", "9.2", "9.3"] },
    { "id": 4, "tasks": ["7.3", "11.1"] },
    { "id": 5, "tasks": ["12.1"] }
  ]
}
```
