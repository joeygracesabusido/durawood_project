$(document).ready(function () {
    // Function to fetch report using the initial endpoint (on page load)
    function fetchInitialSalesReport() {
        $.ajax({
            url: `/api-get-sales/`,
            type: "GET",
            cache: false,
            success: function (data) {
                console.log("Initial Sales Report Data:", data);
                updateTable(data);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching initial sales report:", error);
                alert("Failed to load sales data.");
            }
        });
    }

    // Function to fetch report based on date range
    function fetchSalesReportByDate() {
        let dateFrom = $("#date_from").val();
        let dateTo = $("#date_to").val();

        $.ajax({
            url: `/api-get-sales/?date_from=${dateFrom}&date_to=${dateTo}`,
            type: "GET",
            cache: false,
            success: function (data) {
                console.log("Filtered Sales Report Data:", data);
                updateTable(data);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching sales report:", error);
                alert("Failed to load sales data.");
            }
        });
    }

    // Function to format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // Function to update the table
    function updateTable(data) {
        // Destroy existing DataTable instance if exists
        if ($.fn.DataTable.isDataTable("#table_sales")) {
            $('#table_sales').DataTable().clear().destroy();
        }

        $("#table_sales tbody").empty(); // Clear table before adding new rows

        $.each(data, function (index, sale) {
            let statusColor = sale.status > 1 ? "style='color: orange;'" : "";
            let row = `
                <tr>
                    <td class="text-xs">${sale.invoice_date ? sale.invoice_date.split("T")[0] : "NA"}</td>
                    <td class="text-xs">${sale.customer}</td>
                    <td class="text-xs">${sale.category}</td>
                    <td class="text-xs">${sale.dr_no}</td>
                    <td class="text-xs">${sale.invoice_no}</td>
                    <td class="text-xs">${sale.terms}</td>
                    <td class="text-xs">${sale.due_date ? sale.due_date.split("T")[0] : "NA"}</td>
                    <td ${statusColor} style="${sale.status !== null && sale.balance <= 0 ? 'color: green;' : ''}" class="text-xs">
                        ${sale.status !== null
                            ? (sale.balance > 0 ? Math.floor(sale.status) + " days overdue" : "Paid")
                            : "N/A"}
                    </td>
                    <td class="text-xs">${sale.tax_type}</td>
                    <td class="text-xs">${formatCurrency(sale.amount)}</td>
                    <td class="text-xs">${formatCurrency(sale.balance)}</td>
                </tr>
            `;
            $("#table_sales tbody").append(row);
        });

        initializeDataTable(); // Initialize DataTable after updating table
    }

    // Initialize DataTable
    function initializeDataTable() {
        new DataTable('#table_sales', {
            layout: { topStart: 'buttons' },
            buttons: ['copy', {
                extend: 'csv',
                filename: 'Sales Transaction',
                title: 'Sales Transaction'
            }],
            perPage: 10,
            searchable: true,
            sortable: true,
            responsive: true,
            scrollX: true,
            scrollY: true,
            scrollCollapse: true,
            autoWidth: false,
            destroy: true
        });
    }

    // ✅ Load initial report on page load
    fetchInitialSalesReport();

    // ✅ Fetch report based on date range when button is clicked
    $("#search_data").on("click", function () {
        fetchSalesReportByDate();
    });
});


