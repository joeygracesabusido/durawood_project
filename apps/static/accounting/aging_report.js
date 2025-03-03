$(document).ready(function () {
    function fetchSalesReport() {
        $.ajax({
            url: "/api-get-ar-aging-report/",
            type: "GET",
            success: function (data) {
                console.log("Sales Report Data:", data); 
                $("#table_sales tbody").empty();

                let customerTotals = {}; 

                $.each(data, function (index, sale) {
                    let balance = sale.balance || 0;
                    let status = sale.status;

                    let col_1_30 = 0, col_31_60 = 0, col_61_90 = 0, col_91_over = 0;

                    if (status <= 30) {
                        col_1_30 = balance;
                    } else if (status <= 60) {
                        col_31_60 = balance;
                    } else if (status <= 90) {
                        col_61_90 = balance;
                    } else {
                        col_91_over = balance;
                    }

                    let row = `
                        <tr class="text-right text-sm">
                            <td class="text-center">${sale.customer}</td>
                            <td class="text-center">${sale.invoice_no}</td>
                            <td class="text-center">${sale.category}</td>
                            <td>${formatCurrency(col_1_30)}</td>
                            <td>${formatCurrency(col_31_60)}</td>
                            <td>${formatCurrency(col_61_90)}</td>
                            <td>${formatCurrency(col_91_over)}</td>
                        </tr>`;

                    $("#table_sales tbody").append(row);

                    if (!customerTotals[sale.customer]) {
                        customerTotals[sale.customer] = { col_1_30: 0, col_31_60: 0, col_61_90: 0, col_91_over: 0 };
                    }
                    customerTotals[sale.customer].col_1_30 += col_1_30;
                    customerTotals[sale.customer].col_31_60 += col_31_60;
                    customerTotals[sale.customer].col_61_90 += col_61_90;
                    customerTotals[sale.customer].col_91_over += col_91_over;
                });

                $.each(customerTotals, function (customer, totals) {
                    let totalRow = `
                        <tr class="bg-gray-500 text-yellow-400 text-right">
                            <td colspan="1">${customer}</td>
                            <td colspan="2">Total:</td>
                            <td>${formatCurrency(totals.col_1_30)}</td>
                            <td>${formatCurrency(totals.col_31_60)}</td>
                            <td>${formatCurrency(totals.col_61_90)}</td>
                            <td>${formatCurrency(totals.col_91_over)}</td>
                        </tr>`;
                    $("#table_sales tbody").append(totalRow);
                });
            },
            error: function (xhr, status, error) {
                console.error("Error fetching sales report:", error);
                alert("Failed to load sales data.");
            }
        });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    fetchSalesReport();
//✅ Move search filter handler INSIDE document ready
    $('#search').on('keyup', function() {
        let searchValue = $(this).val().toLowerCase();
        $('#table_sales tbody tr').each(function() {
            let text = $(this).text().toLowerCase();
            $(this).toggle(text.includes(searchValue));
        });
    });
 // Export to Excel
    $('#exportExcel').on('click', function() {
        const table = document.getElementById('table_sales');
        const workbook = XLSX.utils.table_to_book(table, { sheet: "AR Aging" });
        XLSX.writeFile(workbook, 'ar_aging.xlsx');
});

// Print PDF
    $("#printPDF").on("click", function () {
        const content = document.getElementById("table_sales").outerHTML;
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const printWindow = window.open("", "", "width=800,height=600");
        printWindow.document.write(`
            <html>
            <head>
                <title>Account Receivable Aging Report</title>
                <style>
                    table { width: 100%; border-collapse: collapse; }
                    table, th, td { border: 1px solid black; }
                    th, td { padding: 8px; text-align: center; font-size: 12px; }
                    th { background-color: #f0f0f0; }
                    @media print {
                        body { margin: 20px; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h2 style="text-align:center">Account Receivable Aging Report as of ${today}</h2>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });


});

