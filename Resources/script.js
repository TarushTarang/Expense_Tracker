const API_BASE = 'http://localhost:8080/api/expenses';
let totalIncome = 0;

// Helper function to format ISO date to "YYYY-MM-DD"
function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
}

// Update dashboard metrics
function updateDashboard() {
    fetch(API_BASE)
        .then(response => response.json())
        .then(expenses => {
            const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            const mostSpentCategory = expenses.reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
            }, {});
            const mostSpentOn = Object.keys(mostSpentCategory).reduce((a, b) => mostSpentCategory[a] > mostSpentCategory[b] ? a : b, '-');
            const totalEntries = expenses.length;

            const leftAmount = totalIncome - totalExpenses;

            document.getElementById('total-expenses').innerText = `₹${totalExpenses}`;
            document.getElementById('most-category').innerText = mostSpentOn || '-';
            document.getElementById('total-entries').innerText = totalEntries;
            document.getElementById('total-income').innerText = `₹${totalIncome}`;
            document.getElementById('left-amount').innerText = `₹${leftAmount}`;
        });
}

// Fetch and display expenses in the table
function fetchExpenses() {
    fetch(API_BASE)
        .then(response => response.json())
        .then(expenses => {
            const tableBody = document.getElementById('expense-table-body');
            tableBody.innerHTML = '';
            expenses.forEach(expense => {
                const row = `
                    <tr>
                        <td>${formatDate(expense.date)}</td>
                        <td>${expense.category}</td>
                        <td>₹${expense.amount}</td>
                        <td>${expense.description || '-'}</td>
                        <td>
                            <button onclick="deleteExpense(${expense.id})">Delete</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        });
}

// Add an expense
document.getElementById('expense-form').addEventListener('submit', event => {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;

    fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, category, amount, description })
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add expense');
            return response.json();
        })
        .then(() => {
            document.getElementById('expense-form').reset();
            updateDashboard();
            fetchExpenses();
        });
});

// Add income
document.getElementById('income-form').addEventListener('submit', event => {
    event.preventDefault();

    const incomeAmount = parseFloat(document.getElementById('income-amount').value);
    totalIncome += incomeAmount;

    document.getElementById('income-form').reset();
    updateDashboard();
});

// Delete an expense
function deleteExpense(id) {
    fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
        .then(() => {
            updateDashboard();
            fetchExpenses();
        });
}

// Initialize dashboard and expenses
updateDashboard();
fetchExpenses();
