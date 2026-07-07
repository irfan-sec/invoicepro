document.addEventListener("DOMContentLoaded", () => {
    const clientNameInput = document.getElementById("clientName");
    const invoiceNumberInput = document.getElementById("invoiceNumber");
    const issueDateInput = document.getElementById("issueDate");
    const dueDateInput = document.getElementById("dueDate");
    const discountInput = document.getElementById("discountInput");
    const taxInput = document.getElementById("taxInput");
    const subtotalAmountInput = document.getElementById("subtotalAmount");
    const grandTotalInput = document.getElementById("grandTotal");
    const paymentTermInput = document.getElementById("paymentTerm");
    const currencyInput = document.getElementById("currency");
    const additionalInfoInput = document.getElementById("additionalInfo");
    const lineItemsContainer = document.getElementById("lineItems");
    const addLineItemBtn = document.getElementById("addLineItem");
    const generateBtn = document.getElementById("generate");
    const cancelBtn = document.getElementById("cancel");
    const printBtn = document.getElementById("printInvoice");
    const previewContainer = document.getElementById("invoicePreview");

    if (!lineItemsContainer || !generateBtn || !cancelBtn || !previewContainer) {
        return;
    }

    const today = new Date().toISOString().slice(0, 10);
    if (issueDateInput && !issueDateInput.value) {
        issueDateInput.value = today;
    }

    const parseNumber = (value) => {
        const normalized = String(value || "").replace(/[^0-9.-]/g, "");
        const number = parseFloat(normalized);
        return Number.isFinite(number) ? number : 0;
    };

    const toMoney = (value) => parseNumber(value).toFixed(2);

    const calculateRowSubtotal = (row) => {
        const qty = Math.max(0, parseNumber(row.querySelector(".item-qty")?.value));
        const unitPrice = Math.max(0, parseNumber(row.querySelector(".item-price")?.value));
        const subtotal = qty * unitPrice;
        const subtotalInput = row.querySelector(".line-subtotal");
        if (subtotalInput) {
            subtotalInput.value = toMoney(subtotal);
        }
        return subtotal;
    };

    const calculateTotals = () => {
        const rows = lineItemsContainer.querySelectorAll(".item-row");
        let subtotal = 0;
        rows.forEach((row) => {
            subtotal += calculateRowSubtotal(row);
        });

        const discountPercent = Math.max(0, parseNumber(discountInput?.value));
        const taxPercent = Math.max(0, parseNumber(taxInput?.value));
        const discountAmount = subtotal * (discountPercent / 100);
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const taxAmount = taxableAmount * (taxPercent / 100);
        const total = taxableAmount + taxAmount;

        if (subtotalAmountInput) {
            subtotalAmountInput.value = toMoney(subtotal);
        }
        if (grandTotalInput) {
            grandTotalInput.value = toMoney(total);
        }

        return {
            subtotal,
            discountPercent,
            taxPercent,
            discountAmount,
            taxAmount,
            total
        };
    };

    const createLineItemRow = () => {
        const row = document.createElement("div");
        row.className = "iteminput item-row";
        row.innerHTML = `
            <input class="item-name" type="text" placeholder="Item">
            <input class="item-description" type="text" placeholder="Description">
            <input class="item-qty" type="number" min="0" step="1" placeholder="1">
            <input class="item-price" type="number" min="0" step="0.01" placeholder="10.00">
            <input class="line-subtotal" type="text" value="0.00" readonly>
            <button class="remove-item" type="button" aria-label="Remove item">Remove</button>
        `;
        return row;
    };

    const resetLineItemRow = (row) => {
        const fields = row.querySelectorAll(".item-name, .item-description, .item-qty, .item-price");
        fields.forEach((field) => {
            field.value = "";
        });
        const subtotalField = row.querySelector(".line-subtotal");
        if (subtotalField) {
            subtotalField.value = "0.00";
        }
    };

    const getInvoiceItems = () => {
        const rows = [...lineItemsContainer.querySelectorAll(".item-row")];
        return rows
            .map((row) => {
                const item = row.querySelector(".item-name")?.value.trim() || "";
                const description = row.querySelector(".item-description")?.value.trim() || "";
                const qty = Math.max(0, parseNumber(row.querySelector(".item-qty")?.value));
                const amount = Math.max(0, parseNumber(row.querySelector(".item-price")?.value));
                const subtotal = qty * amount;
                return {
                    item,
                    description,
                    qty,
                    amount,
                    subtotal
                };
            })
            .filter((entry) => entry.item || entry.description || entry.qty > 0 || entry.amount > 0);
    };

    const escapeHTML = (value) => String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const renderPreview = (invoice) => {
        const itemRows = invoice.items.map((item) => `
            <tr>
                <td>${escapeHTML(item.item)}</td>
                <td>${escapeHTML(item.description)}</td>
                <td>${item.qty}</td>
                <td>${toMoney(item.amount)}</td>
                <td>${toMoney(item.subtotal)}</td>
            </tr>
        `).join("");

        previewContainer.innerHTML = `
            <h2>Invoice Preview</h2>
            <p><strong>Invoice #:</strong> ${escapeHTML(invoice.id)}</p>
            <p><strong>Client:</strong> ${escapeHTML(invoice.client)}</p>
            <p><strong>Issue Date:</strong> ${escapeHTML(invoice.issueDate || "")} &nbsp; <strong>Due Date:</strong> ${escapeHTML(invoice.dueDate || "")}</p>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Amount</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows}
                </tbody>
            </table>
            <p><strong>Subtotal:</strong> ${toMoney(invoice.subtotal)}</p>
            <p><strong>Discount:</strong> ${invoice.discountPercent}%</p>
            <p><strong>Tax:</strong> ${invoice.taxPercent}%</p>
            <p><strong>Grand Total:</strong> ${toMoney(invoice.amount)} ${escapeHTML(invoice.currency || "")}</p>
            <p><strong>Payment Term:</strong> ${escapeHTML(invoice.paymentTerm || "")}</p>
            <p><strong>Additional Info:</strong> ${escapeHTML(invoice.additionalInfo || "")}</p>
        `;
        previewContainer.hidden = false;
    };

    lineItemsContainer.addEventListener("input", (event) => {
        if (event.target.closest(".item-row")) {
            calculateTotals();
        }
    });

    lineItemsContainer.addEventListener("click", (event) => {
        const removeBtn = event.target.closest(".remove-item");
        if (!removeBtn) {
            return;
        }
        const rows = lineItemsContainer.querySelectorAll(".item-row");
        const row = removeBtn.closest(".item-row");
        if (!row) {
            return;
        }
        if (rows.length === 1) {
            resetLineItemRow(row);
        } else {
            row.remove();
        }
        calculateTotals();
    });

    if (addLineItemBtn) {
        addLineItemBtn.addEventListener("click", () => {
            lineItemsContainer.appendChild(createLineItemRow());
        });
    }

    if (discountInput) {
        discountInput.addEventListener("input", calculateTotals);
    }

    if (taxInput) {
        taxInput.addEventListener("input", calculateTotals);
    }

    generateBtn.addEventListener("click", () => {
        const client = clientNameInput?.value.trim() || "";
        if (!client) {
            alert("Please enter client name.");
            return;
        }

        const items = getInvoiceItems();
        if (items.length === 0) {
            alert("Please add at least one line item.");
            return;
        }

        const totals = calculateTotals();
        const id = invoiceNumberInput?.value.trim() || `INV-${Date.now()}`;
        const invoice = {
            id,
            client,
            issueDate: issueDateInput?.value || "",
            dueDate: dueDateInput?.value || "",
            paymentTerm: paymentTermInput?.value.trim() || "",
            currency: (currencyInput?.value.trim() || "USD").toUpperCase(),
            additionalInfo: additionalInfoInput?.value.trim() || "",
            discountPercent: totals.discountPercent,
            taxPercent: totals.taxPercent,
            subtotal: totals.subtotal,
            amount: totals.total,
            items,
            status: "PENDING"
        };

        const invoices = JSON.parse(localStorage.getItem("invoices")) || [];
        const existingIndex = invoices.findIndex((entry) => entry.id === invoice.id);
        if (existingIndex >= 0) {
            invoices[existingIndex] = invoice;
        } else {
            invoices.push(invoice);
        }
        localStorage.setItem("invoices", JSON.stringify(invoices));

        renderPreview(invoice);
    });

    cancelBtn.addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });

    if (printBtn) {
        printBtn.addEventListener("click", () => {
            calculateTotals();
            window.print();
        });
    }

    calculateTotals();
});