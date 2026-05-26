const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");

const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const transactionId = document.getElementById("transaction-id");

let transactions =
  JSON.parse(localStorage.getItem("transactions")) || [];

// Generate ID
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// Save Transaction
form.addEventListener("submit", function(e) {

  e.preventDefault();

  const name = text.value.trim();
  const amt = +amount.value;

  if(name === "" || amt === 0){
    alert("Please enter valid data");
    return;
  }

  // UPDATE
  if(transactionId.value){

    transactions = transactions.map(t => {
      if(t.id == transactionId.value){
        return {
          id:t.id,
          text:name,
          amount:amt
        };
      }
      return t;
    });

  } else {

    // CREATE
    const transaction = {
      id:generateID(),
      text:name,
      amount:amt
    };

    transactions.push(transaction);
  }

  updateLocalStorage();
  init();

  form.reset();
  transactionId.value = "";
});

// READ
function init(){

  list.innerHTML = "";

  transactions.forEach(addTransactionDOM);

  updateValues();
}

// Display Transaction
function addTransactionDOM(transaction){

  const sign = transaction.amount < 0 ? "minus" : "plus";

  const li = document.createElement("li");

  li.classList.add(sign);

  li.innerHTML = `
    <span>
      ${transaction.text}
      (${transaction.amount})
    </span>

    <div class="actions">

      <button class="edit-btn"
        onclick="editTransaction(${transaction.id})">
        Edit
      </button>

      <button class="delete-btn"
        onclick="deleteTransaction(${transaction.id})">
        Delete
      </button>

    </div>
  `;

  list.appendChild(li);
}

// UPDATE
function editTransaction(id){

  const transaction =
    transactions.find(t => t.id === id);

  text.value = transaction.text;
  amount.value = transaction.amount;

  transactionId.value = transaction.id;
}

// DELETE
function deleteTransaction(id){

  transactions =
    transactions.filter(t => t.id !== id);

  updateLocalStorage();

  init();
}

// Update Balance
function updateValues(){

  const amounts =
    transactions.map(t => t.amount);

  const total =
    amounts.reduce((acc,item) => acc + item,0);

  const income =
    amounts
      .filter(item => item > 0)
      .reduce((acc,item) => acc + item,0);

  const expense =
    amounts
      .filter(item => item < 0)
      .reduce((acc,item) => acc + item,0) * -1;

  balance.innerText = `₹${total}`;

  money_plus.innerText = `+₹${income}`;

  money_minus.innerText = `-₹${expense}`;
}

// Local Storage
function updateLocalStorage(){

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
}

/////////////////////////////////////////////////////
// EXPORT PDF
/////////////////////////////////////////////////////

function exportPDF(){

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.text("Expense Tracker Report", 20, 20);

  let y = 40;

  transactions.forEach((t,index) => {

    doc.text(
      `${index+1}. ${t.text} : ₹${t.amount}`,
      20,
      y
    );

    y += 10;
  });

  doc.save("expense-report.pdf");
}

/////////////////////////////////////////////////////
// EXPORT EXCEL
/////////////////////////////////////////////////////

function exportExcel(){

  const worksheet =
    XLSX.utils.json_to_sheet(transactions);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Transactions"
  );

  XLSX.writeFile(
    workbook,
    "expense-report.xlsx"
  );
}

// Initial Load
init();