$(document).ready(function () {
    function formatNumber(value) {
        return parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatDate(value) {


		const date = new Date(value);

				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits
				const day = String(date.getDate()).padStart(2, '0'); // Ensure 2 digits
				
				// Format time to HH:MM AM/PM
				const time = date.toLocaleTimeString('en-US', {
						hour: '2-digit',
						minute: '2-digit',
						hour12: false,
				});

				return `${year}-${month}-${day} ${time}`;

};

    function fetchPayments() {

        let dateFrom = $("#date_from").val();
        let dateTo = $("#date_to").val();
        $.ajax({
            url: `/api-get-payment-with-params/?date_from=${dateFrom}&date_to=${dateTo}`,
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (data) {
                let tableBody = $("#table_payment tbody");
                tableBody.empty(); // Clear existing rows

                data.forEach(function (payment) {
                    let row = `
                        <tr>
                            <td>${payment.date}</td>
                            <td>${payment.customer}</td>
                            <td>${payment.cr_no}</td>
                            <td>${payment.payment_method}</td>
                            <td>${payment.invoice_no}</td>
                            <td>${formatNumber(payment.cash_amount)}</td>
                            <td>${formatNumber(payment.amount_2307)}</td>
                            <td>${payment.remarks}</td>
                            <td>${formatDate(payment.date_created)}</td>
                            <td>${formatDate(payment.date_updated)}</td>
                            <td>${payment.user}</td>




                            <td>
                                <!-- Add action buttons here if needed -->
                                <!--<button class="btn btn-primary btn-sm">Edit</button>-->

                                <a href="/update-collection-transaction/${payment.id}"> \
                                <button type="button" class="btn btn-primary btn-sm"> \
                                 Edit</button></a>

                                <!--<button class="btn btn-danger btn-sm">Delete</button> -->
                            </td>


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
   $("#search_data").on("click", function () {

    fetchPayments();

  });

  // fetchPayments();
});






// $(document).ready(function() {
//     $("#printPDF").on("click", function () {
//         const content = document.getElementById("table_payment").outerHTML; // Get table content only
//         const today = new Date().toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//         const printWindow = window.open("", "", "width=800,height=600");
//         printWindow.document.write(`
//             <html>
//             <head>
//                 <title>Collection List Report</title>
//                 <style>
//                     table { width: 100%; border-collapse: collapse; }
//                     table, th, td { border: 1px solid black; }
//                     th, td { padding: 8px; text-align: center; font-size: 12px; }
//                     th { background-color: #f0f0f0; }
//                     @media print {
//                         body { margin: 20px; }
//                         button { display: none; }
//                     }
//                 </style>
//             </head>
//             <body>
//                 <h2 style="text-align:center">Collection List as of ${today}</h2>
//                 ${content}
//             </body>
//             </html>
//         `);
//         printWindow.document.close();
//         printWindow.print();
//     });
//
//     $('#exportExcel').on('click', function() {
//         const reportTable = document.getElementById('table_payment');
//         const workbook = XLSX.utils.table_to_book(reportTable, {sheet: "AR Aging"});
//         XLSX.writeFile(workbook, 'payment_list.xlsx');
//     });
// });
//
//
$("#printPDF").on("click", function () {
    // Clone the table so we don't modify the actual one
    const originalTable = document.getElementById("table_payment");
    const clonedTable = originalTable.cloneNode(true);

  
    const userString = localStorage.getItem("user");
      const user = JSON.parse(userString);

    // Remove the last column (Action column) from all rows (thead + tbody)
    $(clonedTable).find('thead tr, tbody tr').each(function () {
        $(this).find('td:last-child, th:last-child').remove();
    });

    const content = clonedTable.outerHTML;  // Use modified table for printing

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
        <html>
        <head>
            <title>Collection List Report</title>
            <style>
                table { width: 100%; border-collapse: collapse; }
                table, th, td { border: 1px solid black; }
                th, td { padding: 8px; text-align: center; font-size: 12px; }
                th { background-color: #f0f0f0; }
                @media print {
                    body { margin: 20px; }
                    button { display: none; }

                .prepared-by {
                    margin-top: 30px;
                    text-align: left;
                    font-size: 14px;
                }
                }
            </style>
        </head>
        <body>
            <h2 style="text-align:center">Collection List as of ${today}</h2>
            ${content}

            <div class="prepared-by">
                <p>Prepared by: ${user.full_name}</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
});


$('#exportExcel').on('click', function() {
    const originalTable = document.getElementById('table_payment');
    const clonedTable = originalTable.cloneNode(true);

    // Remove the last column (Action column) from all rows
    $(clonedTable).find('thead tr, tbody tr').each(function () {
        $(this).find('td:last-child, th:last-child').remove();
    });

    const workbook = XLSX.utils.table_to_book(clonedTable, {sheet: "AR Aging"});
    XLSX.writeFile(workbook, 'payment_list.xlsx');
});
