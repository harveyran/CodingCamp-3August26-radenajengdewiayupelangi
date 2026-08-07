# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly, single-page web application that helps users track their daily spending. Users can add and delete transactions, view their running total balance, and see a visual breakdown of spending by category via a pie chart. The app is built with plain HTML, CSS, and Vanilla JavaScript, stores all data in the browser's Local Storage, and requires no build tools or backend infrastructure.

---

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A single spending record consisting of an Item Name, an Amount, and a Category.
- **Item_Name**: A non-empty text label describing a transaction (e.g., "Lunch", "Bus fare").
- **Amount**: A positive numeric value representing the cost of a transaction, expressed in the user's local currency.
- **Category**: One of the three predefined spending classifications: Food, Transport, or Fun.
- **Transaction_List**: The scrollable UI component that displays all stored transactions.
- **Balance_Display**: The UI element at the top of the App that shows the current total balance.
- **Chart**: The pie chart rendered by Chart.js that visualises spending distribution by Category.
- **Input_Form**: The HTML form containing the Item_Name field, Amount field, Category selector, and Submit button.
- **Storage**: The browser's Local Storage API used as the sole persistence layer.
- **Validator**: The client-side logic responsible for checking that all Input_Form fields are filled before a Transaction is accepted.

---

## Requirements

### Requirement 1: Input Form — Transaction Entry

**User Story:** As a user, I want to fill in a form with the item name, amount, and category so that I can add a new spending transaction to my tracker.

#### Acceptance Criteria

1. THE Input_Form SHALL contain an Item_Name text field (max 100 characters), an Amount numeric field (accepting values from 0.01 to 999,999,999.99), and a Category selector with exactly the options Food, Transport, and Fun.
2. WHEN the user submits the Input_Form, THE Validator SHALL verify that the Item_Name field is non-empty, the Amount field contains a value between 0.01 and 999,999,999.99, and a Category option is selected.
3. IF the Validator detects that the Item_Name field is empty, THEN THE Input_Form SHALL display an inline error message "Item name is required" adjacent to the Item_Name field and SHALL NOT add a Transaction.
4. IF the Validator detects that the Amount field is empty, zero, negative, or outside the accepted range, THEN THE Input_Form SHALL display an inline error message "Please enter a valid amount (0.01–999,999,999.99)" adjacent to the Amount field and SHALL NOT add a Transaction.
5. IF the Validator detects that no Category option is selected, THEN THE Input_Form SHALL display an inline error message "Please select a category" adjacent to the Category selector and SHALL NOT add a Transaction.
6. WHEN the Input_Form passes validation, THE App SHALL create a new Transaction record containing the submitted Item_Name, Amount, and Category values and add it to the Transaction_List.
7. WHEN a Transaction is successfully added, THE Input_Form SHALL reset all fields to their default empty/unselected state within 300ms of the addition completing.

---

### Requirement 2: Transaction List — Display and Deletion

**User Story:** As a user, I want to see all my transactions in a scrollable list and be able to delete any entry so that I can review and correct my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display every stored Transaction showing the Item_Name, Amount (formatted to 2 decimal places), and Category for each entry.
2. THE Transaction_List SHALL be scrollable when the number of transactions causes its height to exceed the visible viewport height.
3. WHEN a new Transaction is added, THE Transaction_List SHALL immediately reflect the new entry without requiring a page reload.
4. THE Transaction_List SHALL render a clearly labelled Delete button for each Transaction entry.
5. WHEN the user activates the Delete button for a Transaction, THE App SHALL display a confirmation prompt asking the user to confirm deletion before proceeding.
6. WHEN the user confirms deletion, THE App SHALL remove that Transaction from the Transaction_List and from Storage.
7. WHEN a Transaction is deleted, THE Transaction_List SHALL update immediately to reflect the removal without requiring a page reload.
8. WHILE no Transactions exist, THE Transaction_List SHALL display an empty-state message such as "No transactions yet. Add one above!" so users understand the list is empty rather than broken.

---

### Requirement 3: Total Balance Display

**User Story:** As a user, I want to see my total balance prominently at the top of the page so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance_Display SHALL be positioned at the top of the App's main view and SHALL show the cumulative sum of all Transaction Amount values, where each Transaction Amount is added to the running total.
2. WHEN a Transaction is added, THE Balance_Display SHALL recalculate and update the displayed total within 100ms of the addition completing.
3. WHEN a Transaction is deleted, THE Balance_Display SHALL recalculate and update the displayed total within 100ms of the deletion completing.
4. WHILE no Transactions exist, THE Balance_Display SHALL show a total of zero formatted with exactly 2 decimal places and a currency symbol (e.g., "$0.00").
5. THE Balance_Display SHALL format all totals with exactly 2 decimal places and a currency symbol (e.g., "$1,234.56") to ensure consistent numeric display.
6. IF the calculated total is negative, THEN THE Balance_Display SHALL render the value in a visually distinct style (e.g., red colour) to clearly indicate an overdrawn or negative balance.

---

### Requirement 4: Visual Spending Chart

**User Story:** As a user, I want to see a pie chart that shows how my spending is distributed across categories so that I can understand where my money is going at a glance.

#### Acceptance Criteria

1. THE Chart SHALL be a pie chart rendered using the Chart.js library and SHALL display one segment per Category that has at least one Transaction, with each segment's arc size proportional to that Category's share of the total spending.
2. THE Chart SHALL label each segment with the corresponding Category name and the percentage of total spending that Category represents, rounded to one decimal place.
3. WHEN a Transaction is added or deleted, THE Chart SHALL update to reflect the new spending distribution within 100ms of the change completing.
4. WHILE no Transactions exist, THE Chart SHALL display a placeholder message "No spending data yet" rather than throwing a rendering error.
5. THE Chart SHALL assign a distinct, consistent colour to each Category (Food, Transport, Fun) regardless of how many Transactions are present, so that categories are visually distinguishable across all chart states.
6. IF a Transaction Amount is zero or negative, THEN THE Chart SHALL exclude that Transaction from the spending distribution calculation to prevent incorrect segment rendering.

---

### Requirement 5: Data Persistence via Local Storage

**User Story:** As a user, I want my transactions to be saved automatically so that my data is still available when I reopen the app or refresh the page.

#### Acceptance Criteria

1. WHEN a Transaction is added, THE App SHALL write the updated Transaction collection to Storage before the Input_Form resets.
2. WHEN a Transaction is deleted, THE App SHALL write the updated Transaction collection to Storage before the Transaction_List updates.
3. WHEN the App initialises, THE App SHALL read all Transactions from Storage and populate the Transaction_List, Balance_Display, and Chart with the persisted data within 500ms of page load.
4. IF Storage is unavailable or returns malformed data during initialisation, THEN THE App SHALL initialise with an empty Transaction collection and SHALL display a non-blocking warning message indicating that saved data could not be loaded.
5. IF a Storage write operation fails after a Transaction is added or deleted, THEN THE App SHALL display a non-blocking error message to the user, retain the change in memory for the current session, and SHALL NOT revert the Transaction_List or Balance_Display.

---

### Requirement 6: Mobile-Friendly Responsive Layout

**User Story:** As a user, I want the app to work comfortably on my phone so that I can log expenses on the go.

#### Acceptance Criteria

1. THE App SHALL render a fully functional and legible layout on viewport widths from 320px to 1920px without horizontal scrolling, with a minimum body font size of 14px and a minimum interactive tap-target size of 44×44 CSS pixels.
2. WHEN the viewport width is less than 768px, THE App SHALL render a single-column layout stacking the Input_Form, Balance_Display, Transaction_List, and Chart vertically.
3. WHEN the viewport width is 768px or greater, THE App MAY render a multi-column layout (e.g., form and chart side-by-side) provided all components remain fully visible and usable without horizontal scrolling.
4. THE Input_Form, Transaction_List, Balance_Display, and Chart SHALL each remain reachable by touch without requiring a keyboard or mouse.
5. THE App SHALL use a single CSS file located at `css/styles.css` and a single JavaScript file located at `js/app.js`.

---

### Requirement 7: Browser Compatibility

**User Story:** As a user, I want the app to work in any modern browser so that I am not restricted to a specific platform.

#### Acceptance Criteria

1. THE App SHALL produce the same observable results (correct Transaction display, Balance_Display values, Chart rendering, and Storage behaviour) in the current stable releases of Chrome, Firefox, Edge, and Safari without polyfills or transpilation.
2. THE App SHALL operate as a standalone HTML file with all external assets referenced via CDN or relative paths, openable directly in a browser without a web server.
3. IF the App is opened in a browser that does not support the Local Storage API or the Canvas API required by Chart.js, THEN THE App SHALL display a visible error message indicating that the browser is not supported.

---

### Requirement 8: Performance

**User Story:** As a user, I want the app to feel fast and responsive so that logging expenses does not feel slow or cumbersome.

#### Acceptance Criteria

1. THE App SHALL complete initial page load and render all persisted data within 2 seconds when accessed on a connection of at least 10 Mbps download speed and with up to 500 stored Transactions.
2. WHEN the user interacts with the Input_Form, Transaction_List, or Chart (keypress, click, or scroll event), THE App SHALL produce a visible DOM update within 100ms of the end of the user action, with up to 500 stored Transactions.
3. WHEN the App contains more than 500 stored Transactions, THE App SHALL remain functional and SHALL complete visible DOM updates within 500ms of any user interaction, with no hard failure or crash.
