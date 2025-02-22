
$(document).ready(function () {
    function fetchSalesReport() {
        $.ajax({
            url: "/api-get-sales-report2/",
            type: "GET",
            success: function (data) {
                console.log("Sales Report Data:", data); // Debugging output
                $("#table_sales tbody").empty(); // Clear table before adding new rows

                $.each(data, function (index, sale) {
                    
                   let statusColor = sale.status > 1 ? "style='color: orange;											 font-weight: ;'" : ""; 
												let row = `
                        <tr>
                            <td>${sale.date ? sale.date.split("T")[0] : "NA"}</td>
                           
                            <td>${sale.customer}</td>
                            <td>${sale.customer_id}</td>
                            <td>${sale.invoice_no}</td>
                            <td>${sale.terms}</td>
                            <td>${sale.due_date ? sale.due_date.split("T")[0] : "NA"}</td>

                           <td ${statusColor} style="${sale.status !== null && sale.balance <= 0 ? 'color: green; font-weight: bold;' : ''}">
                                ${sale.status !== null 
                                    ? (sale.balance > 0 ? Math.floor(sale.status) + " days overdue" : "Paid") 
                                    : "N/A"}
                           </td>

                            <td>${sale.tax_type}</td>
                            <td>${formatCurrency(sale.balance)}</td>
                                                    </tr>
                    `;
                    $("#table_sales tbody").append(row);
                      
                });
              initializeDataTable()
            },
            error: function (xhr, status, error) {
                console.error("Error fetching sales report:", error);
                alert("Failed to load sales data.");
            }
        });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'Php' }).format(amount);
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



