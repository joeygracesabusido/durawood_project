
$(document).ready(function () {
    function fetchSalesReport() {
        $.ajax({
            url: "/api-get-sales-report/",
            type: "GET",
            success: function (data) {
                console.log("Sales Report Data:", data); // Debugging output
                $("#table_sales tbody").empty(); // Clear table before adding new rows

                $.each(data, function (index, sale) {
                    
                   let statusColor = sale.status > 1 ? "style='color: orange;											 font-weight: ;'" : ""; 
												let row = `
                        <tr>
                            <td>${sale.date}</td>
                            <td>${sale.customer}</td>
                            <td>${sale.customer_id}</td>
                            <td>${sale.invoice_no}</td>
                            <td>${sale.terms}</td>
                            <td>${sale.due_date}</td>

                            <td ${statusColor}>${sale.status !== null ? sale.status + "                               days overdue" : "N/A"}</td>

                            <td>${sale.tax_type}</td>
                            <td>${formatCurrency(sale.amount)}</td>
                                                    </tr>
                    `;
                    $("#table_sales tbody").append(row);
                });
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
