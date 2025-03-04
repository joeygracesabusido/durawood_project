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

$(document).ready(function () {
    function fetchSalesReport() {
        $.ajax({
            url: "/api-get-ar-aging-report/",
            type: "GET",
            success: function (data) {
                $("#table_sales tbody").empty();

                let customerTotals = {};
                let categoryTotals = {};
                let tableHtml = "";
                let lastCustomer = null;

                data.forEach(sale => {
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

                    // If customer changes, insert subtotal for previous customer (if any)
                    if (lastCustomer && sale.customer !== lastCustomer) {
                        let totals = customerTotals[lastCustomer];
                        tableHtml += `
                            <tr class="bg-gray-500 text-yellow-400 text-right font-bold font-sans">
                                <td colspan="3" class="text-center">${lastCustomer} Total:</td>
                                <td>${formatCurrency(totals.col_1_30)}</td>
                                <td>${formatCurrency(totals.col_31_60)}</td>
                                <td>${formatCurrency(totals.col_61_90)}</td>
                                <td>${formatCurrency(totals.col_91_over)}</td>
                            </tr>`;
                    }

                    // Append actual row
                    tableHtml += `
                        <tr class="text-right text-sm">
                            <td class="text-center">${sale.customer}</td>
                            <td class="text-center">${sale.invoice_no}</td>
                            <td class="text-center">${sale.category}</td>
                            <td>${formatCurrency(col_1_30)}</td>
                            <td>${formatCurrency(col_31_60)}</td>
                            <td>${formatCurrency(col_61_90)}</td>
                            <td>${formatCurrency(col_91_over)}</td>
                        </tr>`;

                    // Track running totals per customer
                    if (!customerTotals[sale.customer]) {
                        customerTotals[sale.customer] = { col_1_30: 0, col_31_60: 0, col_61_90: 0, col_91_over: 0 };
                    }
                    customerTotals[sale.customer].col_1_30 += col_1_30;
                    customerTotals[sale.customer].col_31_60 += col_31_60;
                    customerTotals[sale.customer].col_61_90 += col_61_90;
                    customerTotals[sale.customer].col_91_over += col_91_over;

                    // Track running totals per category
                    if (!categoryTotals[sale.category]) {
                        categoryTotals[sale.category] = { col_1_30: 0, col_31_60: 0, col_61_90: 0, col_91_over: 0 };
                    }
                    categoryTotals[sale.category].col_1_30 += col_1_30;
                    categoryTotals[sale.category].col_31_60 += col_31_60;
                    categoryTotals[sale.category].col_61_90 += col_61_90;
                    categoryTotals[sale.category].col_91_over += col_91_over;

                    lastCustomer = sale.customer;
                });

                // Add final customer total after loop ends
                if (lastCustomer) {
                    let totals = customerTotals[lastCustomer];
                    tableHtml += `
                        <tr class="bg-gray-500 text-yellow-400 text-right font-bold">
                            <td colspan="3" class="text-center">${lastCustomer} Total:</td>
                            <td>${formatCurrency(totals.col_1_30)}</td>
                            <td>${formatCurrency(totals.col_31_60)}</td>
                            <td>${formatCurrency(totals.col_61_90)}</td>
                            <td>${formatCurrency(totals.col_91_over)}</td>
                        </tr>`;
                }

                // Append category totals at bottom
                for (let category in categoryTotals) {
                    let totals = categoryTotals[category];
                    tableHtml += `
                        <tr class="category-total" class="bg-white text-red-500 font-bold text-right">
                            <td colspan="3" class="text-right text-red-500">${category} Total:</td>
                            <td class="text-right text-red-500">${formatCurrency(totals.col_1_30)}</td>
                            <td class="text-right text-red-500">${formatCurrency(totals.col_31_60)}</td>
                            <td class="text-right text-red-500">${formatCurrency(totals.col_61_90)}</td>
                            <td class="text-right text-red-500">${formatCurrency(totals.col_91_over)}</td>
                        </tr>`;
                }

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
                 <h3 style="text-align:center">DCLSI</h3>

                <h3 style="text-align:center">Account Receivable Aging Report as of ${today}</h3>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });


});

