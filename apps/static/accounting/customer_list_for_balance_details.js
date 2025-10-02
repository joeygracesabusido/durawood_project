$(document).ready(function () {
    function fetchCustomerBalance() {
        $.ajax({
            url: '/api-get-per-customer-balance',
            type: 'GET',
            success: function (data) {
                console.log(data);
                let rows = '';

                let grandTotal = 0;

                if (data.length > 0) {
                    data.forEach(item => {
                        rows += `
                            <tr class="border-b border-gray-300" data-customer="${item.customer}">
                                <td class="py-2 px-4 text-left">${item.customer}</td>
                                <td class="py-2 px-4 text-left">${item.category}</td>
                                <td class="py-2 px-4 text-right">${formatNumber(item.total_balance)}</td>
                            </tr>
                        `;

                          grandTotal += parseFloat(item.total_balance);
                    });

                      rows += `
                          <tr class="bg-gray-300 font-bold">
                            <td class="py-2 px-4 text-left">Grand Total</td>
                            <td></td>
                            <td class="py-2 px-4 text-right">${formatNumber(grandTotal)}</td>
                          </tr>`


                } else {
                    rows = `
                        <tr>
                            <td colspan="3" class="py-2 px-4 text-center">No data available</td>
                        </tr>
                    `;
                }
                $('#table_sales tbody').html(rows);
            },
            error: function (xhr) {
                console.error('Error fetching data:', xhr.responseText);
                alert('Failed to load data.');
            }
        });
    }

    // Function to format number with thousand separators and two decimal places
    function formatNumber(value) {
        return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Fetch data on page load
    fetchCustomerBalance();

    // Search functionality
    $('#search').on('input', function () {
        let value = $(this).val().toLowerCase();
        $('#table_sales tbody tr').filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    // Double click to redirect to customer transaction list
    $('#table_sales').on('dblclick', 'tr[data-customer]', function () {
        let customer = $(this).data('customer');
        window.location.href = `/api-template-customer-transaction-balance-details?customer=${encodeURIComponent(customer)}`;
    });


    // Export to Excel
    $('#exportExcel').on('click', function () {
        const table = document.getElementById('table_sales');
        const workbook = XLSX.utils.table_to_book(table, { sheet: "Customer List" });
        XLSX.writeFile(workbook, 'customer_list.xlsx');
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
                <title>Customer List</title>
                <style>
                    @media print {
                        body { margin: 1rem; }
                        button { display: none; }
                    }
                    table { border-collapse: collapse; width: 100%; }
                    table, th, td { border: 1px solid black; }
                    td { padding: 2px; text-align: center; }
                    th { background-color: gray;
                         color: white;
                         text-align: center;
                    }
                    .category-total td {
                        background-color: gray;
                        color: yellow;
                    }
                </style>
            </head>
            <body>
                <h3 style="text-align:center">Durawood Construction & Lumber Supply, Inc.</h3>
                <h3 style="text-align:center">Customer List Report as of ${today}</h3>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });
});

