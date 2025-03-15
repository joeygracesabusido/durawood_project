// $(document).ready(function () {
//     function fetchSalesReport() {
//         $.ajax({
//             url: "/api-get-ar-aging-report/",
//             type: "GET",
//             success: function (data) {
//                 console.log("Sales Report Data:", data); 
//                 $("#table_sales tbody").empty();
//
//                 let customerTotals = {}; 
//
//                 $.each(data, function (index, sale) {
//                     let balance = sale.balance || 0;
//                     let status = sale.status;
//
//                     let col_1_30 = 0, col_31_60 = 0, col_61_90 = 0, col_91_over = 0;
//
//                     if (status <= 30) {
//                         col_1_30 = balance;
//                     } else if (status <= 60) {
//                         col_31_60 = balance;
//                     } else if (status <= 90) {
//                         col_61_90 = balance;
//                     } else {
//                         col_91_over = balance;
//                     }
//
//                     let row = `
//                         <tr class="text-right text-sm">
//                             <td class="text-center">${sale.customer}</td>
//                             <td class="text-center">${sale.invoice_no}</td>
//                             <td class="text-center">${sale.category}</td>
//                             <td>${formatCurrency(col_1_30)}</td>
//                             <td>${formatCurrency(col_31_60)}</td>
//                             <td>${formatCurrency(col_61_90)}</td>
//                             <td>${formatCurrency(col_91_over)}</td>
//                         </tr>`;
//
//                     $("#table_sales tbody").append(row);
//
//                     if (!customerTotals[sale.customer]) {
//                         customerTotals[sale.customer] = { col_1_30: 0, col_31_60: 0, col_61_90: 0, col_91_over: 0 };
//                     }
//                     customerTotals[sale.customer].col_1_30 += col_1_30;
//                     customerTotals[sale.customer].col_31_60 += col_31_60;
//                     customerTotals[sale.customer].col_61_90 += col_61_90;
//                     customerTotals[sale.customer].col_91_over += col_91_over;
//                 });
//
//                 $.each(customerTotals, function (customer, totals) {
//                     let totalRow = `
//                         <tr class="bg-gray-500 text-yellow-400 text-right">
//                             <td colspan="1">${customer}</td>
//                             <td colspan="2">Total:</td>
//                             <td>${formatCurrency(totals.col_1_30)}</td>
//                             <td>${formatCurrency(totals.col_31_60)}</td>
//                             <td>${formatCurrency(totals.col_61_90)}</td>
//                             <td>${formatCurrency(totals.col_91_over)}</td>
//                         </tr>`;
//                     $("#table_sales tbody").append(totalRow);
//                 });
//             },
//             error: function (xhr, status, error) {
//                 console.error("Error fetching sales report:", error);
//                 alert("Failed to load sales data.");
//             }
//         });
//     }
//
//     function formatCurrency(amount) {
//         return new Intl.NumberFormat('en-US', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         }).format(amount);
//     }
//
//     fetchSalesReport();

// $(documen






$(document).ready(function () {
    function fetchSalesReport() {
        $.ajax({
            url: "/api-get-ar-aging-report/",
            type: "GET",
            success: function (data) {
                $("#table_sales tbody").empty();

                let customerTotals = {};
                let categoryTotals = {};
                let grandTotals = {
                    col_1_15: 0, col_16_30: 0, col_31_60: 0,
                    col_61_90: 0, col_91_over: 0, total: 0
                };

                let tableHtml = "";
                let lastCustomer = null;

                data.forEach(sale => {
                    let balance = sale.balance || 0;
                    let status = sale.status;

                    let col_1_15 = 0, col_16_30 = 0, col_31_60 = 0, col_61_90 = 0, col_91_over = 0;
                    if (status <= 15) {
                        col_1_15 = balance;
                    } else if (status <= 30) {
                        col_16_30 = balance;
                    } else if (status <= 60) {
                        col_31_60 = balance;
                    } else if (status <= 90) {
                        col_61_90 = balance;
                    } else if (status > 90) {
                        col_91_over = balance;
                    }

                    // ✅ Calculate row total
                    let rowTotal = col_1_15 + col_16_30 + col_31_60 + col_61_90 + col_91_over;

                    // ✅ Add customer subtotal when customer changes
                    if (lastCustomer && sale.customer !== lastCustomer) {
                        let totals = customerTotals[lastCustomer];
                        tableHtml += `
                            <tr class="bg-gray-500 text-yellow-400 text-right text-sm">
                                <td colspan="3" class="text-right">${lastCustomer} Total:</td>
                                <td>${formatCurrency(totals.col_1_15)}</td>
                                <td>${formatCurrency(totals.col_16_30)}</td>
                                <td>${formatCurrency(totals.col_31_60)}</td>
                                <td>${formatCurrency(totals.col_61_90)}</td>
                                <td>${formatCurrency(totals.col_91_over)}</td>
                                <td>${formatCurrency(totals.total)}</td>
                            </tr>`;
                    }

                    // ✅ Add row with calculated total
                    tableHtml += `
                        <tr class="text-right text-sm">
                            <td class="text-left">${sale.customer}</td>
                            <td class="text-left">${sale.invoice_no}</td>
                            <td class="text-left">${sale.category}</td>
                            <td>${formatCurrency(col_1_15)}</td>
                            <td>${formatCurrency(col_16_30)}</td>
                            <td>${formatCurrency(col_31_60)}</td>
                            <td>${formatCurrency(col_61_90)}</td>
                            <td>${formatCurrency(col_91_over)}</td>
                            <td>${formatCurrency(rowTotal)}</td>
                        </tr>`;

                    // ✅ Track running totals per customer
                    if (!customerTotals[sale.customer]) {
                        customerTotals[sale.customer] = {
                            col_1_15: 0, col_16_30: 0, col_31_60: 0,
                            col_61_90: 0, col_91_over: 0, total: 0
                        };
                    }
                    customerTotals[sale.customer].col_1_15 += col_1_15;
                    customerTotals[sale.customer].col_16_30 += col_16_30;
                    customerTotals[sale.customer].col_31_60 += col_31_60;
                    customerTotals[sale.customer].col_61_90 += col_61_90;
                    customerTotals[sale.customer].col_91_over += col_91_over;
                    customerTotals[sale.customer].total += rowTotal;

                    // ✅ Track running totals per category
                    if (!categoryTotals[sale.category]) {
                        categoryTotals[sale.category] = {
                            col_1_15: 0, col_16_30: 0, col_31_60: 0,
                            col_61_90: 0, col_91_over: 0, total: 0
                        };
                    }
                    categoryTotals[sale.category].col_1_15 += col_1_15;
                    categoryTotals[sale.category].col_16_30 += col_16_30;
                    categoryTotals[sale.category].col_31_60 += col_31_60;
                    categoryTotals[sale.category].col_61_90 += col_61_90;
                    categoryTotals[sale.category].col_91_over += col_91_over;
                    categoryTotals[sale.category].total += rowTotal;

                    // ✅ Track running grand totals
                    grandTotals.col_1_15 += col_1_15;
                    grandTotals.col_16_30 += col_16_30;
                    grandTotals.col_31_60 += col_31_60;
                    grandTotals.col_61_90 += col_61_90;
                    grandTotals.col_91_over += col_91_over;
                    grandTotals.total += rowTotal;

                    lastCustomer = sale.customer;
                });

                // ✅ Add final customer total
                if (lastCustomer) {
                    let totals = customerTotals[lastCustomer];
                    tableHtml += `
                        <tr class="bg-gray-500 text-yellow-400 text-right text-sm">
                            <td colspan="3" class="text-center">${lastCustomer} Total:</td>
                            <td>${formatCurrency(totals.col_1_15)}</td>
                            <td>${formatCurrency(totals.col_16_30)}</td>
                            <td>${formatCurrency(totals.col_31_60)}</td>
                            <td>${formatCurrency(totals.col_61_90)}</td>
                            <td>${formatCurrency(totals.col_91_over)}</td>
                            <td>${formatCurrency(totals.total)}</td>
                        </tr>`;
                }

                // ✅ Add category totals
                for (let category in categoryTotals) {
                    let totals = categoryTotals[category];
                    tableHtml += `
                        <tr class="category-total bg-white text-red-500 text-right text-sm">
                            <td colspan="3" class="text-center">${category} Total:</td>
                            <td>${formatCurrency(totals.col_1_15)}</td>
                            <td>${formatCurrency(totals.col_16_30)}</td>
                            <td>${formatCurrency(totals.col_31_60)}</td>
                            <td>${formatCurrency(totals.col_61_90)}</td>
                            <td>${formatCurrency(totals.col_91_over)}</td>
                            <td>${formatCurrency(totals.total)}</td>
                        </tr>`;
                }

                // ✅ Add grand total row
                tableHtml += `
                    <tr class="bg-gray-700 text-white font-bold text-right text-sm">
                        <td colspan="3" class="text-center">GRAND TOTAL:</td>
                        <td>${formatCurrency(grandTotals.col_1_15)}</td>
                        <td>${formatCurrency(grandTotals.col_16_30)}</td>
                        <td>${formatCurrency(grandTotals.col_31_60)}</td>
                        <td>${formatCurrency(grandTotals.col_61_90)}</td>
                        <td>${formatCurrency(grandTotals.col_91_over)}</td>
                        <td>${formatCurrency(grandTotals.total)}</td>
                    </tr>`;

                $("#table_sales tbody").html(tableHtml);
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
                    @media print {
                        body { margin: 1rem; }
                        button { display: none; }
                      }
                    table { border-collapse: collapse; width: 100%; }
                    table, th, td { border: 1px solid black; }
                    td { padding: 2px; text-align: right; }
                    th { background-color: gray;
                         color: white;
                         text-align: right;
                        }
                    .category-total td {
                      background-color: gray;
                      color: yellow;
                      }
              
                </style>
            </head>
            <body>
                 <h3 style="text-align:center">Durawwod Construction & Lumber Supply, Inc.</h3>

                <h3 style="text-align:center">Account Receivable Aging Report as of ${today}</h3>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });


});

