$(document).ready(function () {
    function fetchSalesReport() {
        $.ajax({
            url: "/api-get-ar-aging-report/",
            type: "GET",
            success: function (data) {
                console.log("Sales Report Data:", data); // Debugging output
                $("#table_sales tbody").empty(); // Clear table before adding new rows

                let customerTotals = {}; // Object to store totals per customer

                $.each(data, function (index, sale) {
                    let balance = sale.balance || 0;
                    let status = sale.status ; // Number of days past due

                    let col_1_30 = 0, col_31_60 = 0, col_61_90 = 0, col_91_over = 0;

                    // Categorize balance based on status
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

                    // Store totals per customer
                    if (!customerTotals[sale.customer]) {
                        customerTotals[sale.customer] = { col_1_30: 0, col_31_60: 0, col_61_90: 0, col_91_over: 0 };
                    }
                    customerTotals[sale.customer].col_1_30 += col_1_30;
                    customerTotals[sale.customer].col_31_60 += col_31_60;
                    customerTotals[sale.customer].col_61_90 += col_61_90;
                    customerTotals[sale.customer].col_91_over += col_91_over;
                });

                // Append total row for each customer
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

               // initializeDataTable();
            },
            error: function (xhr, status, error) {
                console.error("Error fetching sales report:", error);
                alert("Failed to load sales data.");
            }
        });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US',
      { minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }

    fetchSalesReport(); // Call function when page loads
});


$("#printPDF").on("click", function () {
    const content = document.getElementById("table_sales").outerHTML; // Get table content only
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


//this function is for exporting to excel
// this function is to implement exporting to excel
  $(document).ready(function() {
   
    $('#exportExcel').on('click', function() {
        // Extract data from the report table
        const reportTable = document.getElementById('table_sales');
        const workbook = XLSX.utils.table_to_book(reportTable, {sheet: "AR Aging"});
        XLSX.writeFile(workbook, 'ar_aging.xlsx');
    });
});




  // new DataTable('#table_sales', {
    //     layout: {
    //         topStart: 'buttons'
    //     },
    //     buttons: ['copy',  {
    //         extend: 'csv',
    //         filename: 'Sales Transasction', // Cust wom name for the exported CSV file
    //         title: 'Sales Transaction' // Optional: Title for the CSV file's content
    //     }],
    //     perPage: 10,
    //     searchable: true,
    //     sortable: true,
    //
    //     responsive: true,
    //     scrollX: true,          // Enable horizontal scrolling if needed
    //     autoWidth: false,       // Disable fixed width
    //     scrollY: true,       // Set a specific height
    //     scrollCollapse: true,
    //     destroy: true // Destroy any existing DataTable instance
    //
    //
    // });


