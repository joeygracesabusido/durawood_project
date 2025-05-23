
$(document).ready(function () {
    function fetchTransactionHistory(customer) {
        $.ajax({
            url: `/api-get-transaction-history?customer=${encodeURIComponent(customer)}`,
            type: 'GET',
            success: function (data) {
                console.log(data);
                let rows = '';
                let cumulativeBalance = 0;
                let totalSales = 0;
                let totalPayments = 0;
                let totalTransaction = 0;

                if (data.length > 0) {
                    data.forEach(item => {
                        const salesAmount = item.sales_amount || 0;
                        const paymentAmount = item.payment_amount || 0;
                        const transactionAmount = salesAmount - paymentAmount;

                        cumulativeBalance += transactionAmount;
                        totalSales += salesAmount;
                        totalPayments += paymentAmount;
                        totalTransaction += transactionAmount;

                        rows += `
                            <tr class="border-b border-gray-300">
                                <td class="py-1 px-1 text-right">${formatDate(item.date)}</td>
                                <td class="text-right">${item.type || ''}</td>
                                <td class="text-right">${item.invoice_no || ''}</td>
                                <td class="text-right">${formatDate(item.due_date)}</td>
                                <td class="text-right">${formatNumber(transactionAmount)}</td>
                                <td class="text-right">${formatNumber(transactionAmount)}</td>
                                <td class="text-right">${formatNumber(cumulativeBalance)}</td>
                            </tr>
                        `;
                    });

                    // Add total row
                    rows += `
                        <tr class="font-bold bg-gray-200">
                            <td colspan="4" class="text-right py-2 px-1">Total:</td>
                            <td class="text-right">${formatNumber(totalTransaction)}</td>
                            <td class="text-right">${formatNumber(totalTransaction)}</td>
                            <td class="text-right">${formatNumber(totalTransaction)}</td>
                        </tr>
                    `;

                    // Display customer name
                    rows += `
                        <tr>
                            <td colspan="7" class="text-left py-2 px-1 font-bold">Customer: ${customer}</td>
                        </tr>
                    `;
                } else {
                    rows = `
                        <tr>
                            <td colspan="7" class="py-2 px-4 text-center">No data available</td>
                        </tr>
                    `;
                }

                $('#table_sales tbody').html(rows);
            },
            error: function (xhr) {
                console.error('Error fetching data:', xhr.responseText);
                alert('Failed to load data.');
            }
        });
    }

    // Function to format date as MM/DD/YYYY
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US');
    }

    // Function to format number with thousand separators and two decimal places
    function formatNumber(value) {
        if (value === null || value === undefined) return '';
        return parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Example: Fetch data for a specific customer on page load
    const customer = new URLSearchParams(window.location.search).get('customer');
    if (customer) {
        fetchTransactionHistory(customer);
    }

    // Export to Excel
    $('#exportExcel').on('click', function () {
        const table = document.getElementById('table_sales');
        const workbook = XLSX.utils.table_to_book(table, { sheet: "Transaction History" });
        XLSX.writeFile(workbook, 'transaction_history.xlsx');
    });

    // Print PDF
    $('#printPDF').on('click', function () {
        const content = document.getElementById('table_sales').outerHTML;
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>Customer Transaction History</title>
                <style>
                    @media print {
                        body { margin: 1rem; }
                        button { display: none; }
                    }
                    table { border-collapse: collapse; width: 100%; }
                    table, th, td { border: 1px solid black; }
                    td { padding: 2px; text-align: center; }
                    th { background-color: gray; color: white; text-align: center; }
                </style>
            </head>
            <body>
                <h3 style="text-align:center">Durawood Construction & Lumber Supply, Inc.</h3>
                <h3 style="text-align:center">Transaction History Report as of ${today}</h3>
                <h4 style="text-align:left">Customer: ${customer}</h4>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });
});

