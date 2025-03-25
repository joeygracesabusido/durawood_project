$(document).ready(function () {
    function formatNumber(value) {
        return parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatDate(value) {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date)) return ''; // Handle invalid dates

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        return `${year}-${month}-${day} ${time}`;
    } 


		function formatDate2(value) {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date)) return ''; // Handle invalid dates

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        return `${year}-${month}-${day}`;
    }


    function initDataTable() {
        if (!$.fn.DataTable.isDataTable("#table_payment")) {

            new DataTable('#table_payment', {
            layout: { topStart: 'buttons' },
            buttons: ['copy', {
                extend: 'csv',
                filename: 'PaymentTransaction',
                title: 'Payment Transaction'
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
    }

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
                          <td class="text-xs">${formatDate2(payment.date)}</td>
                            <td class="text-xs">${payment.customer || ''}</td>
                            <td class="text-xs">${payment.cr_no || ''}</td>
                            <td class="text-xs">${payment.payment_method || ''}</td>
                            <td class="text-xs">${payment.invoice_no || ''}</td>
                            <td class="text-xs">${formatNumber(payment.cash_amount)}</td>
                            <td class="text-xs">${formatNumber(payment.amount_2307)}</td>
                            <td class="text-xs">${payment.remarks || ''}</td>
                            <td class="text-xs">${formatDate(payment.date_created)}</td>
                            <td class="text-xs">${formatDate(payment.date_updated)}</td>
                            <td class="text-xs">${payment.user || ''}</td>
                            <td class="text-xs">
                                <a href="/update-collection-transaction/${payment.id}">
                                    <button type="button" class="btn btn-primary btn-sm">Edit</button>
                                </a>
                            </td>
                        </tr>
                    `;
                    tableBody.append(row);
                });

                // Initialize DataTable after data load
                initDataTable();
            },
            error: function (xhr) {
                console.error("❌ Error fetching data:", xhr);
                alert("Error fetching payment data.");
            }
        });
    }

    function fetchGraphQlPayment() {
        $.ajax({
            url: '/graphql/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                query: `
                    query {
                        getCollectionList {
                            date
                            customer
                            crNo
                            paymentMethod
                            invoiceNo
                            cashAmount
                            amount2307
                            remarks
                            user
                            dateCreated
                            dateUpdated
                            id
                        }
                    }
                `
            }),
            success: function (response) {
                let tableBody = $("#table_payment tbody");
                tableBody.empty();

                let data = response.data.getCollectionList;
                data.forEach(function (payment) {
                    let row = `
                        <tr class="text-xs">
                            <td>${formatDate2(payment.date)}</td>
                            <td>${payment.customer || ''}</td>
                            <td>${payment.crNo || ''}</td>
                            <td>${payment.paymentMethod || ''}</td>
                            <td>${payment.invoiceNo || ''}</td>
                            <td>${formatNumber(payment.cashAmount)}</td>
                            <td>${formatNumber(payment.amount2307)}</td>
                            <td>${payment.remarks || ''}</td>
                            <td>${formatDate(payment.dateCreated)}</td>
                            <td>${formatDate(payment.dateUpdated)}</td>
                            <td>${payment.user || ''}</td>
                            <td>
                                <a href="/update-collection-transaction/${payment.id}">
                                    <button type="button" class="btn btn-primary btn-sm">Edit</button>
                                </a>
                            </td>
                        </tr>
                    `;
                    tableBody.append(row);
                });

                // Initialize DataTable after data load
                initDataTable();
            },
            error: function (xhr) {
                console.error("❌ Error fetching GraphQL data:", xhr);
                alert("Failed to load data");
            }
        });
    }

    // Event Handlers
    $("#search_data").on("click", fetchPayments);

    $("#printPDF").on("click", function () {
        const originalTable = document.getElementById("table_payment");
        const clonedTable = originalTable.cloneNode(true);

        // Remove last column (Action buttons)
        $(clonedTable).find('thead tr, tbody tr').each(function () {
            $(this).find('td:last-child, th:last-child').remove();
        });

        const userString = localStorage.getItem("user");
        const user = JSON.parse(userString);

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
                        .prepared-by { margin-top: 30px; text-align: left; font-size: 14px; }
                    }
                </style>
            </head>
            <body>
                <h2 style="text-align:center">Collection List as of ${today}</h2>
                ${clonedTable.outerHTML}
                <div class="prepared-by">
                    <p>Prepared by: ${user?.full_name || 'Unknown'}</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });

    $("#exportExcel").on("click", function () {
        const table = document.getElementById('table_payment');
        const workbook = XLSX.utils.table_to_book(table, { sheet: "Payment Report" });
        XLSX.writeFile(workbook, 'payment_list.xlsx');
    });

    // Initial Data Fetch
    fetchGraphQlPayment();
});

