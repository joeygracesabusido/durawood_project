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
                    let status = sale.status || 0; // Number of days past due

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
                        <tr>
                            <td>${sale.customer}</td>
                            <td>${sale.invoice_no}</td>
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
                        <tr style="font-weight: bold; background: gray; color: red;">
                            <td colspan="1">${customer}</td>
                            <td colspan="1">Total:</td>
                            <td>${formatCurrency(totals.col_1_30)}</td>
                            <td>${formatCurrency(totals.col_31_60)}</td>
                            <td>${formatCurrency(totals.col_61_90)}</td>
                            <td>${formatCurrency(totals.col_91_over)}</td>
                        </tr>`;
                    $("#table_sales tbody").append(totalRow);
                });

                initializeDataTable();
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






// this is for DataTable
const initializeDataTable = () => {

    new DataTable('#table_sales', {
        layout: {
            topStart: 'buttons'
        },
        buttons: ['copy',  {
            extend: 'csv',
            filename: 'Sales Transasction', // Cust wom name for the exported CSV file
            title: 'Sales Transaction' // Optional: Title for the CSV file's content
        }],
        perPage: 10,
        searchable: true,
        sortable: true,

        responsive: true,
        scrollX: true,          // Enable horizontal scrolling if needed
        autoWidth: false,       // Disable fixed width
        scrollY: true,       // Set a specific height
        scrollCollapse: true,
        destroy: true // Destroy any existing DataTable instance


    });

    };



