

$(document).ready(function() {
    $('#search_data').on('click', function() {
        const date_to = $('#date_to').val();
        const category = $('#category').val();

        const url = `/api-get-ar-aging-per-category?date_to=${date_to}&category=${category}`;

        // Show loading spinner
        $('#loadingSpinner').show();

        $.getJSON(url, function(data) {
            $('#table_sales tbody').empty(); // Clear old rows

            if (data.length === 0) {
                $('#table_sales tbody').append(`
                    <tr>
                        <td colspan="8" class="text-center text-gray-500 py-3">No records found.</td>
                    </tr>
                `);
                $('#loadingSpinner').hide();
                return;
            }

            // ✅ Initialize grand total outside the loop
            let grandTotal = {
                days_1_15: 0,
                days_16_30: 0,
                days_31_60: 0,
                days_61_90: 0,
                days_over_90: 0
            };

            data.forEach(group => {
                const category = group._id.category || 'N/A';
                const customer = group._id.customer || 'N/A';

                let customerTotal = {
                    days_1_15: 0,
                    days_16_30: 0,
                    days_31_60: 0,
                    days_61_90: 0,
                    days_over_90: 0
                };

                let rowSpanCount = group.details.length;
                let firstRow = true;

                group.details.forEach(detail => {
                    let status = detail.status || 0;

                    let days_1_15 = 0, days_16_30 = 0, days_31_60 = 0, days_61_90 = 0, days_over_90 = 0;

                    if (status <= 15) {
                        days_1_15 = detail.balance;
                    } else if (status <= 30) {
                        days_16_30 = detail.balance;
                    } else if (status <= 60) {
                        days_31_60 = detail.balance;
                    } else if (status <= 90) {
                        days_61_90 = detail.balance;
                    } else {
                        days_over_90 = detail.balance;
                    }

                    customerTotal.days_1_15 += days_1_15;
                    customerTotal.days_16_30 += days_16_30;
                    customerTotal.days_31_60 += days_31_60;
                    customerTotal.days_61_90 += days_61_90;
                    customerTotal.days_over_90 += days_over_90;

                    grandTotal.days_1_15 += days_1_15;
                    grandTotal.days_16_30 += days_16_30;
                    grandTotal.days_31_60 += days_31_60;
                    grandTotal.days_61_90 += days_61_90;
                    grandTotal.days_over_90 += days_over_90;

                    let row = `<tr>`;
                    if (firstRow) {
                        row += `<td rowspan="${rowSpanCount}">${customer}</td>`;
                        firstRow = false;
                    }
                    row += `
                        <td>${detail.invoice_no}</td>
                        <td>${category}</td>
                        <td class="text-right">${formatAmount(days_1_15)}</td>
                        <td class="text-right">${formatAmount(days_16_30)}</td>
                        <td class="text-right">${formatAmount(days_31_60)}</td>
                        <td class="text-right">${formatAmount(days_61_90)}</td>
                        <td class="text-right">${formatAmount(days_over_90)}</td>
                    `;
                    row += `</tr>`;

                    $('#table_sales tbody').append(row);
                });

                $('#table_sales tbody').append(`
                    <tr class="bg-gray-200 font-bold">
                        <td colspan="3" class="text-right">Subtotal for ${customer}:</td>
                        <td class="text-right">${formatAmount(customerTotal.days_1_15)}</td>
                        <td class="text-right">${formatAmount(customerTotal.days_16_30)}</td>
                        <td class="text-right">${formatAmount(customerTotal.days_31_60)}</td>
                        <td class="text-right">${formatAmount(customerTotal.days_61_90)}</td>
                        <td class="text-right">${formatAmount(customerTotal.days_over_90)}</td>
                    </tr>
                `);
            });

            // ✅ Add grand total after all data processed:w

            $('#table_sales tbody').append(`
                <tr class="bg-gray-500 text-yellow-300 font-bold">
                    <td colspan="3" class="text-right">Grand Total:</td>
                    <td class="text-right">${formatAmount(grandTotal.days_1_15)}</td>
                    <td class="text-right">${formatAmount(grandTotal.days_16_30)}</td>
                    <td class="text-right">${formatAmount(grandTotal.days_31_60)}</td>
                    <td class="text-right">${formatAmount(grandTotal.days_61_90)}</td>
                    <td class="text-right">${formatAmount(grandTotal.days_over_90)}</td>
                </tr>
            `);

        }).fail(function(xhr) {
            $('#table_sales tbody').append(`
                <tr>
                    <td colspan="8" class="text-center text-red-500 py-3">Failed to fetch data. Please check your connection or API.</td>
                </tr>
            `);
        }).always(function() {
            $('#loadingSpinner').hide();
        });
    });

    // ✅ Search filter
    $('#search').on('keyup', function() {
        let searchValue = $(this).val().toLowerCase();
        $('#table_sales tbody tr').each(function() {
            let text = $(this).text().toLowerCase();
            $(this).toggle(text.includes(searchValue));
        });
    });

    // ✅ Format numbers to currency
    function formatAmount(amount) {
        if (amount === 0 || amount == null) return '';
        return Number(amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    // ✅ Export to Excel
    $('#exportExcel').on('click', function() {
        const table = document.getElementById('table_sales');
        const workbook = XLSX.utils.table_to_book(table, { sheet: "AR Aging" });
        XLSX.writeFile(workbook, 'ar_aging.xlsx');
    });

    // ✅ Print PDF
    $("#printPDF").on("click", function () {
        const content = document.getElementById("table_sales").outerHTML;
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let date_print = $('#date_to').val() || today;

        const printWindow = window.open("", "", "width=800,height=600");
        printWindow.document.write(`
            <html>
            <head>
                <title>Account Receivable Aging Report</title>
                <style>
                    @media print { body { margin: 1rem; } button { display: none; } }
                    table { border-collapse: collapse; width: 100%; }
                    table, th, td { border: 1px solid black; }
                    td { padding: 2px; text-align: right; }
                    th { background-color: gray; color: white; text-align: right; }
                    .category-total td { background-color: gray; color: yellow; }
                </style>
            </head>
            <body>
                <h3 style="text-align:center">DCLSI</h3>
                <h3 style="text-align:center">Account Receivable Aging Report as of ${date_print}</h3>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });
});

//this function is for autocomplete of category

// Use jQuery in noConflict mode
jQuery.noConflict();

jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "branch_name"
    $(document).on('focus', '#category', function() {
        $("#category").autocomplete({
            source: function(request, response) {
                // AJAX call to fetch data for the autocomplete suggestions
                $.ajax({
                    url: "/api-autocomplete-category/", 
                    data: { term: request.term }, 
                    dataType: "json",               
                    success: function(data) {
                        response(data);             
                    },
                    error: function(err) {
                        console.error("Error fetching autocomplete data:", err);  // Log errors
                        // Optionally, provide user feedback about the error
                    }
                });
            },
            minLength: 0,  // Minimum input length before triggering autocomplete
            select: function(event, ui) {
                // Set the selected value in the input field
                $("#category").val(ui.item.value);
              
                return false; // Prevent the default select action
            }
        });
    });
});








