const form = document.getElementById("transaction-form");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const date = document.getElementById("date");

const list = document.getElementById("transaction-list");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

let chart;

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const transaction = {
    id: Date.now(),
    description: description.value,
    amount: Number(amount.value),
    date: date.value,
  };

  transactions.push(transaction);

  updateLocalStorage();
  renderTransactions();
  updateTotals();
  updateChart();

  form.reset();
});

const themeToggle = document.getElementById("theme-toggle");
const themeLabel = document.getElementById("theme-label");

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
  themeLabel.textContent = document.body.classList.contains("dark-mode")
    ? "Dark Mode"
    : "Light Mode";
});

function renderTransactions(listData = transactions) {
  list.innerHTML = "";

  listData.forEach((t) => {
    const li = document.createElement("li");

    li.classList.add("transaction");

    const sign = t.amount > 0 ? "+" : "-";

    li.innerHTML = `
<div>
<strong>${t.description}</strong><br>
<small>${t.date}</small>
</div>

<span class="${t.amount > 0 ? "income" : "expense"}">
${sign}$${Math.abs(t.amount)}
</span>

<button class="delete" onclick="deleteTransaction(${t.id})">X</button>
`;

    list.appendChild(li);
  });
}

function quickAdd(type) {
  let amount;
  let description;

  if (type === "top") {
    amount = parseFloat(document.getElementById("top-up-amount").value);
    description = "Top Up";
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid Top Up amount.");
      return;
    }
  } else if (type === "transfer") {
    amount = -parseFloat(document.getElementById("transfer-amount").value); 
    description = "Transfer";
    if (isNaN(amount) || amount >= 0) {
      alert("Please enter a valid Transfer amount.");
      return;
    }
  }

  const transaction = {
    id: Date.now(),
    description: description,
    amount: amount,
    date: new Date().toISOString().split("T")[0], // 
  };

  transactions.push(transaction);
  updateLocalStorage();
  renderTransactions();
  updateTotals();
  updateChart();

  if (type === "top") document.getElementById("top-up-amount").value = "";
  if (type === "transfer") document.getElementById("transfer-amount").value = "";
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);

  updateLocalStorage();
  renderTransactions();
  updateTotals();
  updateChart();
}

function updateTotals() {
  const amounts = transactions.map((t) => t.amount);

  const total = amounts.reduce((acc, val) => acc + val, 0);

  const income = amounts
    .filter((v) => v > 0)
    .reduce((acc, val) => acc + val, 0);

  const expense = amounts
    .filter((v) => v < 0)
    .reduce((acc, val) => acc + val, 0);

  balanceEl.innerText = `$${total.toFixed(2)}`;
  incomeEl.innerText = `$${income.toFixed(2)}`;
  expenseEl.innerText = `$${Math.abs(expense).toFixed(2)}`;
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateChart() {
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("expense-chart"), {
    type: "pie",

    data: {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: ["green", "red"],
        },
      ],
    },
  });
}

function filterTransactions(type) {
  if (type === "income") {
    renderTransactions(transactions.filter((t) => t.amount > 0));
  } else if (type === "expense") {
    renderTransactions(transactions.filter((t) => t.amount < 0));
  } else {
    renderTransactions();
  }
}

renderTransactions();
updateTotals();
updateChart();



