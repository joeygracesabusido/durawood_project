$(document).ready(function () {
    function formatNumber(value) {
        return parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function fetchPayments() {
        $.ajax({
            url: "/api-get-payment/",
            type: "GET",
            dataType: "json",
            success: function (data) {
                let tableBody = $("#table_payment tbody");
                tableBody.empty(); // Clear existing rows

                data.forEach(function (payment) {
                    let row = `
                        <tr>
                            <td>${payment.date}</td>
                            <td>${payment.customer}</td>
                            <td>${payment.customer_id}</td>
                            <td>${payment.customer_id}</td>

                            <td>${payment.invoice_no}</td>
                            <td>${formatNumber(payment.cash_amount)}</td>
                            <td>${formatNumber(payment.amount_2307)}</td>
                            <td>${payment.remarks}</td>
                        </tr>
                    `;
                    tableBody.append(row);
                });

                // Initialize DataTable (if not already initialized)
                if (!$.fn.DataTable.isDataTable("#table_payment")) {
                    $("#table_payment").DataTable({
                        responsive: true,
                        paging: true,
                        searching: true,
                        ordering: true,
                        info: true,
                        autoWidth: false,
                    });
                }
            },
            error: function (xhr) {
                console.error("❌ Error fetching data:", xhr);
                alert("Error fetching payment data.");
            }
        });
    }

    // Fetch data when the page loads
    fetchPayments();
});
