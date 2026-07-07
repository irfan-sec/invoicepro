// Invoice Data
let invoices = JSON.parse(localStorage.getItem("invoices")) || [];

// Elements
const totalInvoices = document.getElementById("totalInvoices");
const paidInvoices = document.getElementById("paidInvoices");
const pendingInvoices = document.getElementById("pendingInvoices");
const totalRevenue = document.getElementById("totalRevenue");
const invoiceList = document.getElementById("invoiceList");
const addInvoiceBtn = document.getElementById("addInvoiceBtn");
const escapeHTML = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

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
        (total, invoice) => total + (parseFloat(invoice.amount) || 0),
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
            <h4>${escapeHTML(invoice.id)}</h4>
            <h5>${escapeHTML(invoice.client)}</h5>
        </div>

        <div class="invoice1_price">
            <h4>$${(parseFloat(invoice.amount) || 0).toFixed(2)}</h4>
            <h5>${escapeHTML(invoice.status)}</h5>
        </div>

        `;

        invoiceList.appendChild(div);

        const hr = document.createElement("hr");
        invoiceList.appendChild(hr);

    });

    updateDashboard();
    updateRevenueChart();
    saveData();
}

// Add New Invoice
function addInvoice() {
    window.location.href = "new-invoice.html";
}

// Button Event
if (addInvoiceBtn) {
    addInvoiceBtn.addEventListener(
        "click",
        addInvoice
    );
}

function updateRevenueChart() {

    const monthlyRevenue = [0,0,0,0,0,0];

    invoices.forEach(invoice => {

        if(invoice.status === "PAID"){

            const month =
                new Date().getMonth();

            monthlyRevenue[month] += parseFloat(invoice.amount) || 0;
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

// Initial Load
renderInvoices();