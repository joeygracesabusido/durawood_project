$(document).ready(function () {
    function fetchSalesReport() {
        $.ajax({
            url: "/api-get-ar-aging-report/",
            type: "GET",
            success: function (data) {
                console.log("Sales Report Data:", data); // Debugging output
                $("#table_sales tbody").empty(); // Clear table before adding new rows

                $.each(data, function (index, sale) {
                    let balance = sale.balance || 0;
                    let status = sale.status || 0; // Number of days past due

                    // Initialize all columns with empty values
                    let col_1_30 = "", col_31_60 = "", col_61_90 = "", col_91_over = "";

                    // Categorize balance based on status
                    if (status <= 30) {
                        col_1_30 = formatCurrency(balance);
                    } else if (status <= 60) {
                        col_31_60 = formatCurrency(balance);
                    } else if (status <= 90) {
                        col_61_90 = formatCurrency(balance);
                    } else {
                        col_91_over = formatCurrency(balance);
                    }

                    let row = `
                        <tr>
                            <td>${sale.customer}</td>
                            <td>${sale.invoice_no}</td>
                            <td>${col_1_30}</td>
                            <td>${col_31_60}</td>
                            <td>${col_61_90}</td>
                            <td>${col_91_over}</td>
                        </tr>`;

                    $("#table_sales tbody").append(row);
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
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
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
        scrollY: '450px',       // Set a specific height
        scrollCollapse: true,
        destroy: true // Destroy any existing DataTable instance


    });

    };



