$(document).ready(function () {
    // ====== UTILITY FUNCTIONS ======
    
    function formatNumber(value) {
        if (isNaN(value) || value === null || value === undefined) {
            return '₱0.00';
        }
        return '₱' + parseFloat(value || 0).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }

    function formatDate(value) {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date)) return '';

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

    function formatDateOnly(value) {
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date)) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    // ====== DATA MANAGEMENT ======

    let allPaymentData = [];

    function calculateSummary(data) {
        let totalCash = 0;
        let total2307 = 0;
        let totalCollections = 0;

        data.forEach(payment => {
            totalCash += parseFloat(payment.cash_amount || 0);
            total2307 += parseFloat(payment.amount_2307 || 0);
        });

        totalCollections = totalCash + total2307;

        // Update summary cards
        $('#total_cash').text(formatNumber(totalCash));
        $('#total_2307').text(formatNumber(total2307));
        $('#total_collections').text(formatNumber(totalCollections));
        $('#total_transactions').text(data.length);
    }

    function initDataTable() {
        if ($.fn.DataTable.isDataTable("#table_payment")) {
            $('#table_payment').DataTable().destroy();
        }

        new DataTable('#table_payment', {
            layout: { topStart: 'buttons' },
            buttons: [],
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
            searchable: true,
            sortable: true,
            responsive: false,
            scrollX: true,
            scrollCollapse: true,
            autoWidth: false,
            destroy: true,
            processing: true,
            columnDefs: [
                { orderable: false, targets: [9] }, // Disable sorting on Action column
                { targets: "_all", "bSortable": true }
            ]
        });
    }

    function renderTable(data) {
        let tableBody = $("#table_payment tbody");
        tableBody.empty();

        if (data.length === 0) {
            tableBody.append(`
                <tr>
                    <td colspan="10" class="text-center py-4 text-muted">
                        <i class="bi bi-inbox" style="font-size: 32px; opacity: 0.3;"></i>
                        <p style="margin-top: 10px;">No transactions found</p>
                    </td>
                </tr>
            `);
            calculateSummary([]);
            return;
        }

        data.forEach(function (payment) {
            let row = `
                <tr>
                    <td class="table-date">${formatDateOnly(payment.date)}</td>
                    <td class="table-customer">${payment.customer || '-'}</td>
                    <td>${payment.invoice_no || '-'}</td>
                    <td>${payment.cr_no || '-'}</td>
                    <td>
                        <span class="table-method">${payment.payment_method || 'N/A'}</span>
                    </td>
                    <td class="text-end table-amount">${formatNumber(payment.cash_amount)}</td>
                    <td class="text-end table-amount">${formatNumber(payment.amount_2307)}</td>
                    <td><small>${payment.remarks || '-'}</small></td>
                    <td><small>${payment.user || '-'}</small></td>
                    <td>
                        <a href="/update-collection-transaction/${payment.id}" class="btn btn-action btn-action-edit btn-sm">
                            <i class="bi bi-pencil"></i> Edit
                        </a>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });

        calculateSummary(data);
        initDataTable();
    }

    // ====== API CALLS ======

    function fetchPayments(filters = {}) {
        let url = '/api-get-payment-with-params/?';
        let params = new URLSearchParams();

        if (filters.date_from) {
            params.append('date_from', filters.date_from);
        }
        if (filters.date_to) {
            params.append('date_to', filters.date_to);
        }

        url += params.toString();

        console.log("📊 Fetching from URL:", url);

        $.ajax({
            url: url,
            type: "GET",
            cache: false,
            dataType: "json",
            beforeSend: function () {
                $('#table_payment tbody').html(`
                    <tr>
                        <td colspan="10" class="text-center py-4">
                            <div class="spinner"></div>
                            <p>Loading transactions...</p>
                        </td>
                    </tr>
                `);
            },
            success: function (data) {
                console.log("✅ Data received from API:", data.length, "records");
                console.log("📋 Full data:", data);
                
                allPaymentData = data;

                // Apply client-side filters
                let filteredData = filterDataClientSide(data, filters);
                console.log("🔍 After client-side filtering:", filteredData.length, "records");
                
                renderTable(filteredData);
            },
            error: function (xhr) {
                console.error("❌ Error fetching data:", xhr);
                $('#table_payment tbody').html(`
                    <tr>
                        <td colspan="10" class="text-center py-4 text-danger">
                            <i class="bi bi-exclamation-triangle" style="font-size: 24px;"></i>
                            <p>Error loading transactions. Please try again.</p>
                        </td>
                    </tr>
                `);
            }
        });
    }

    function filterDataClientSide(data, filters) {
        let filtered = data;

        // Filter by customer
        if (filters.customer) {
            filtered = filtered.filter(payment =>
                payment.customer && payment.customer.toLowerCase().includes(filters.customer.toLowerCase())
            );
        }

        // Filter by payment method
        if (filters.payment_method) {
            filtered = filtered.filter(payment =>
                payment.payment_method === filters.payment_method
            );
        }

        // Filter by quick search
        if (filters.quick_search) {
            const searchLower = filters.quick_search.toLowerCase();
            filtered = filtered.filter(payment =>
                (payment.customer && payment.customer.toLowerCase().includes(searchLower)) ||
                (payment.invoice_no && payment.invoice_no.toLowerCase().includes(searchLower)) ||
                (payment.cr_no && payment.cr_no.toLowerCase().includes(searchLower))
            );
        }

        return filtered;
    }

    // ====== EVENT HANDLERS ======

    // Toggle Filters Panel
    $("#btn_filters").on("click", function () {
        $("#filters_panel").toggleClass("hidden");
        $(this).toggleClass("active");
    });

    // Search with Filters
    $("#btn_search").on("click", function () {
        let filters = {
            date_from: $("#date_from").val(),
            date_to: $("#date_to").val(),
            customer: $("#customer_filter").val(),
            payment_method: $("#payment_method_filter").val()
        };

        console.log("🔍 Searching with filters:", filters);
        fetchPayments(filters);
    });

    // Clear Filters
    $("#btn_clear_filters").on("click", function () {
        $("#date_from").val('');
        $("#date_to").val('');
        $("#customer_filter").val('');
        $("#payment_method_filter").val('');
        $("#quick_search").val('');
        
        console.log("🔄 Clearing all filters - fetching ALL records");
        
        // Fetch all records without any date filter
        fetchPayments({
            date_from: null,
            date_to: null,
            customer: '',
            payment_method: ''
        });
        
        // Hide filters panel
        $("#filters_panel").addClass("hidden");
    });

    // Refresh Data
    $("#btn_refresh").on("click", function () {
        let filters = {
            date_from: $("#date_from").val(),
            date_to: $("#date_to").val()
        };
        fetchPayments(filters);
    });

    // Quick Search (Client-side)
    let quickSearchTimeout;
    $("#quick_search").on("keyup", function () {
        clearTimeout(quickSearchTimeout);
        quickSearchTimeout = setTimeout(function () {
            let filters = {
                date_from: $("#date_from").val(),
                date_to: $("#date_to").val(),
                customer: $("#customer_filter").val(),
                payment_method: $("#payment_method_filter").val(),
                quick_search: $("#quick_search").val()
            };

            let filteredData = filterDataClientSide(allPaymentData, filters);
            renderTable(filteredData);
        }, 300);
    });

    // Print to PDF
    $("#btn_print_pdf").on("click", function () {
        const originalTable = document.getElementById("table_payment");
        const clonedTable = originalTable.cloneNode(true);

        // Remove action column
        $(clonedTable).find('thead tr, tbody tr').each(function () {
            $(this).find('td:last-child, th:last-child').remove();
        });

        const userString = localStorage.getItem("user");
        const user = JSON.parse(userString) || {};

        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let summaryHTML = `
            <div style="margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
                <h2 style="margin: 0; text-align: center;">Collections & Receipts Report</h2>
                <p style="margin: 5px 0; text-align: center; color: #666; font-size: 12px;">As of ${today}</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; font-size: 11px;">
                <div style="text-align: center; padding: 10px; border: 1px solid #ccc;">
                    <strong>Total Cash Collected</strong>
                    <p>${$('#total_cash').text()}</p>
                </div>
                <div style="text-align: center; padding: 10px; border: 1px solid #ccc;">
                    <strong>Total Bank Deposits (2307)</strong>
                    <p>${$('#total_2307').text()}</p>
                </div>
                <div style="text-align: center; padding: 10px; border: 1px solid #ccc;">
                    <strong>Total Collections</strong>
                    <p>${$('#total_collections').text()}</p>
                </div>
                <div style="text-align: center; padding: 10px; border: 1px solid #ccc;">
                    <strong>Total Transactions</strong>
                    <p>${$('#total_transactions').text()}</p>
                </div>
            </div>
        `;

        const printWindow = window.open("", "", "width=1000,height=800");
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Collections & Receipts Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    table, th, td {
                        border: 1px solid #999;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        font-size: 12px;
                    }
                    th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .text-end {
                        text-align: right;
                    }
                    .prepared-by {
                        margin-top: 30px;
                        font-size: 12px;
                    }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${summaryHTML}
                ${clonedTable.outerHTML}
                <div class="prepared-by">
                    <p><strong>Prepared by:</strong> ${user?.full_name || 'Unknown'}</p>
                    <p><strong>Date Printed:</strong> ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
    });

    // Export to Excel
    $("#btn_export_excel").on("click", function () {
        const table = document.getElementById('table_payment');
        const workbook = XLSX.utils.table_to_book(table, { sheet: "Collections Report" });
        XLSX.writeFile(workbook, `Collections_Report_${new Date().getTime()}.xlsx`);
    });

    // Set default date range (last 30 days) - but can be overridden
    function setDefaultDateRange() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };

        $('#date_from').val(formatDate(thirtyDaysAgo));
        $('#date_to').val(formatDate(today));
    }

    // Initial Setup - Fetch all records without date filter initially
    setDefaultDateRange();
    
    // Add a tip button to clear filters and see all data
    let initialLoad = true;
    
    fetchPayments({
        // Don't apply date filter on initial load - fetch all records
        date_from: null,
        date_to: null
    });
    
    // After initial load, add event listener to show tip
    setTimeout(function() {
        console.log("💡 Tip: Click 'Clear Filters' button to see all records without date restrictions");
    }, 1000);
});
