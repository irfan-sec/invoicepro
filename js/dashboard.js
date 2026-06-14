// Invoice Data
let invoices = JSON.parse(localStorage.getItem("invoices")) || [];

// Elements
const totalInvoices = document.getElementById("totalInvoices");
const paidInvoices = document.getElementById("paidInvoices");
const pendingInvoices = document.getElementById("pendingInvoices");
const totalRevenue = document.getElementById("totalRevenue");
const invoiceList = document.getElementById("invoiceList");
const addInvoiceBtn = document.getElementById("addInvoiceBtn");

// Save Data
function saveData() {
    localStorage.setItem("invoices", JSON.stringify(invoices));
}

// Update Dashboard Cards
function updateDashboard() {

    totalInvoices.textContent = invoices.length;

    const paid = invoices.filter(
        invoice => invoice.status === "PAID"
    );

    const pending = invoices.filter(
        invoice => invoice.status === "PENDING"
    );

    paidInvoices.textContent = paid.length;
    pendingInvoices.textContent = pending.length;

    const revenue = paid.reduce(
        (total, invoice) => total + invoice.amount,
        0
    );

    totalRevenue.textContent = "$" + revenue.toFixed(2);
}

// Render Recent Invoices
function renderInvoices() {

    invoiceList.innerHTML =
    `
        <h3>Some Recent Invoices</h3>
    `;

    invoices.slice().reverse().forEach(invoice => {

        const div = document.createElement("div");

        div.classList.add("history_recent_invoice1");

        div.innerHTML = `
        
        <div class="invoice1_rec_number">
            <h4>${invoice.id}</h4>
            <h5>${invoice.client}</h5>
        </div>

        <div class="invoice1_price">
            <h4>$${invoice.amount}</h4>
            <h5>${invoice.status}</h5>
        </div>

        `;

        invoiceList.appendChild(div);

        const hr = document.createElement("hr");
        invoiceList.appendChild(hr);

    });

    updateDashboard();
    saveData();
}

// Add New Invoice
function addInvoice() {

    const client = prompt("Client Name:");

    if (!client) return;

    const amount = parseFloat(
        prompt("Invoice Amount:")
    );

    if (isNaN(amount)) return;

    const status = prompt(
        "Status (PAID / PENDING):"
    ).toUpperCase();

    if (
        status !== "PAID" &&
        status !== "PENDING"
    ) {
        alert("Invalid Status");
        return;
    }

    const invoice = {

        id: "INV-" + Date.now(),

        client: client,

        amount: amount,

        status: status
    };

    invoices.push(invoice);

    renderInvoices();
}

// Button Event
addInvoiceBtn.addEventListener(
    "click",
    addInvoice
);

// Initial Load
renderInvoices();
const ctx = document.getElementById('revenueChart');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun'
        ],
        datasets: [{
            label: 'Revenue',
            data: [
                1200,
                2500,
                1800,
                3200,
                4200,
                5500
            ],
            borderColor: '#ff6b35',
            backgroundColor: 'rgba(255,107,53,0.2)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 8
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: true
            },
            title: {
                display: true,
                text: 'Monthly Revenue'
            }
        },

        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Revenue ($)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Months'
                }
            }
        }
    }
});
function updateRevenueChart() {

    const monthlyRevenue = [0,0,0,0,0,0];

    invoices.forEach(invoice => {

        if(invoice.status === "PAID"){

            const month =
                new Date().getMonth();

            monthlyRevenue[month] += invoice.amount;
        }

    });

    revenueChart.data.datasets[0].data =
        monthlyRevenue;

    revenueChart.update();
}
const revenueChart = new Chart(
    document.getElementById("revenueChart"),
    {
        type: "line",
        data: {
            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun"
            ],
            datasets: [{
                label: "Revenue",
                data: [0,0,0,0,0,0],
                borderColor: "#ff6b35",
                backgroundColor: "rgba(255,107,53,.2)",
                fill: true,
                tension: .4
            }]
        }
    }
);