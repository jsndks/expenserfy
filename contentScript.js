'use strict';

const selectionList = [];

/**
 * createEl
 * Helper to create a DOM structure from an HTML string
 */
function createEl(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}

/**
 * updateDom
 * Refreshes the JointTransfers panel with new values
 */
function updateDom(parent, params) {
  const html = `
    <div class="jointTransfers">
      <div class="jointTransfers-hd">
        <span class="title">Joint Transfers</span>
        <span class="subhead">($${params.amount})</span>
      </div>
      <div class="jointTransfers-bd">
        <div class="title_2">Items:</div>
        <ul class="itemsList"></ul>
      </div>
    </div>
  `;

  const existing = document.querySelector('.jointTransfers');
  if (existing) {
    existing.remove();
  }
  const jointTransfers = createEl(html);
  parent.prepend(jointTransfers);

  const itemsList = parent.querySelector('.itemsList');
  if (params.transactions) {
    params.transactions.forEach(transaction => {
      const date = transaction.querySelector('.transactions-date').innerHTML;
      const name = transaction.querySelector('.transactions-description').innerHTML;
      const category = transaction.querySelector('.transactions-category').innerHTML;
      const amount = transaction.querySelector('.transactions-amount').innerHTML;

      const item = createEl(`<li>${date} - ${category} - ${name} - ${amount}</li>`);
      itemsList.appendChild(item);
    });
  }
}

/**
 * updateExpenses
 * Recalculates the values after a change
 */
function updateExpenses(transactionRows, item) {
  const selected = [...transactionRows].filter(row => {
    return row.querySelector('.expenseCheck').checked == true;
  });

  const total = [...transactionRows]
    .filter(row => row.querySelector('.expenseCheck').checked == true)
    .map(row => row.querySelector('.transactions-amount').innerText)
    .map(amount => parseFloat(amount.replace(/\$/g,'')))
    .reduce((acc, cur) => {
      return acc + parseFloat(cur);
    }, 0);

  const transactionsView = document.querySelector('.transactionsView');
  updateDom(transactionsView, { amount: total, transactions: selected });
};

/**
 * addRefreshBtn
 * Adds a refresh button to the page for checkbox re-render
 * Needed due to Angular repaints
 */
function addRefreshBtn() {
  const body = document.getElementsByTagName('body')[0];
  const html = `<button class="btnRefresh">Refresh</button>`;
  const btn = createEl(html);
  body.appendChild(btn);

  document.querySelector('.btnRefresh').addEventListener('click', function(event) {
    attachInputs();
  });
}

/**
 * attachInputs
 * Attaches checkbox inputs on all transaction rows
 */
function attachInputs() {
  // Add checkbox inputs on each transaction row
  const transactionRows = document.querySelectorAll('.transaction-entry');
  transactionRows.forEach(row => {
    const existing = row.querySelector('.expenseCheck');
    if (!existing) {
      const rowId = row.getAttribute('id');
      const selected = selectionList.indexOf(rowId) > -1;
      const checkAttr = selected ? 'checked' : '';
      const checkbox = createEl(`<input type="checkbox" class="expenseCheck" ${checkAttr} />`);
      row.querySelector('.transactions-data-row').appendChild(checkbox);

      checkbox.addEventListener('click', function(event) {
        event.stopPropagation();
      });
    }
  });

  // Attach click handler to each
  const expenseChecks = document.querySelectorAll('.expenseCheck');
  expenseChecks.forEach(check => {
    check.onclick = function(event) {
      event.stopPropagation();
      handleSelectExpense(event.target.closest('.transaction-entry').getAttribute('id'));
    }
  });
}

/**
 * handleSelectExpense
 * expense select handler
 */
function handleSelectExpense(selectionId) {
  if (selectionId) {
    const exists = selectionList.indexOf(selectionId) > -1;
    if (!exists) {
      selectionList.push(selectionId);
    }
  }

  const transactionRows = selectionList.map(selectionItem => document.querySelector(`#${selectionItem}`));
  updateExpenses(transactionRows);
}

/**
 * Main Extension Entry Point
 * Sets timeout to wait until after the DOM is done shuffling
 */
setTimeout(() => {
  attachInputs();

  // Initially attach the joint expenses panel with amount of 0
  const transactionsView = document.querySelector('.transactionsView');
  updateDom(transactionsView, { amount: 0 });

  // Attach the refresh button
  addRefreshBtn();
}, 6000);