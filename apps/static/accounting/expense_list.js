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

        return `${year}-${month}-${day}`;
    }

    function getStatusBadge(status) {
        if (status === 'Approved') {
            return '<span class="badge-status badge-approved">Approved</span>';
        } else if (status === 'Pending') {
            return '<span class="badge-status badge-pending">Pending</span>';
        } else if (status === 'Rejected') {
            return '<span class="badge-status badge-rejected">Rejected</span>';
        }
        return '<span class="badge-status">' + status + '</span>';
    }

    // ====== DATA MANAGEMENT ======

    let allExpenseData = [];

    function calculateSummary(data) {
        let totalAmount = 0;
        let approvedCount = 0;
        let pendingCount = 0;

        data.forEach(expense => {
            totalAmount += parseFloat(expense.amount || 0);
            if (expense.status === 'Approved') {
                approvedCount++;
            } else if (expense.status === 'Pending') {
                pendingCount++;
            }
        });

        // Update summary cards
        $('#total_expenses').text(formatNumber(totalAmount));
        $('#approved_count').text(approvedCount);
        $('#pending_count').text(pendingCount);
        $('#total_records').text(data.length);
    }

    function initDataTable() {
        if ($.fn.DataTable.isDataTable("#table_expenses")) {
            $('#table_expenses').DataTable().destroy();
        }

        new DataTable('#table_expenses', {
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
                { orderable: false, targets: [8] }, // Disable sorting on Action column
                { targets: "_all", "bSortable": true }
            ]
        });
    }

    function renderTable(data) {
        let tableBody = $("#table_expenses tbody");
        tableBody.empty();

        if (data.length === 0) {
            tableBody.append(`
                <tr>
                    <td colspan="9" class="text-center py-4 text-muted">
                        <i class="bi bi-inbox" style="font-size: 32px; opacity: 0.3;"></i>
                        <p style="margin-top: 10px;">No expenses found</p>
                    </td>
                </tr>
            `);
            calculateSummary([]);
            return;
        }

        data.forEach(function (expense) {
            let row = `
                <tr>
                    <td class="table-date">${formatDate(expense.date)}</td>
                    <td class="table-category">${expense.category || '-'}</td>
                    <td>${expense.vendor || '-'}</td>
                    <td><small>${expense.description || '-'}</small></td>
                    <td>${expense.payment_method || '-'}</td>
                    <td class="text-end table-amount">${formatNumber(expense.amount)}</td>
                    <td>${getStatusBadge(expense.status)}</td>
                    <td>${expense.reference_no || '-'}</td>
                    <td>
                        <a href="/edit-expense/${expense.id}" class="btn btn-action btn-action-edit btn-sm">
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

    function fetchExpenses(filters = {}) {
        let url = '/api-get-expenses/?';
        let params = new URLSearchParams();

        if (filters.date_from) {
            params.append('date_from', filters.date_from);
        }
        if (filters.date_to) {
            params.append('date_to', filters.date_to);
        }
        if (filters.category) {
            params.append('category', filters.category);
        }

        url += params.toString();

        console.log("📊 Fetching from URL:", url);

        $.ajax({
            url: url,
            type: "GET",
            cache: false,
            dataType: "json",
            beforeSend: function () {
                $('#table_expenses tbody').html(`
                    <tr>
                        <td colspan="9" class="text-center py-4">
                            <div class="spinner"></div>
                            <p>Loading expenses...</p>
                        </td>
                    </tr>
                `);
            },
            success: function (data) {
                console.log("✅ Data received from API:", data.length, "records");
                
                allExpenseData = data;

                // Apply client-side filters
                let filteredData = filterDataClientSide(data, filters);
                console.log("🔍 After client-side filtering:", filteredData.length, "records");
                
                renderTable(filteredData);
            },
            error: function (xhr) {
                console.error("❌ Error fetching data:", xhr);
                $('#table_expenses tbody').html(`
                    <tr>
                        <td colspan="9" class="text-center py-4 text-danger">
                            <i class="bi bi-exclamation-triangle" style="font-size: 24px;"></i>
                            <p>Error loading expenses. Please try again.</p>
                        </td>
                    </tr>
                `);
            }
        });
    }

    function filterDataClientSide(data, filters) {
        let filtered = data;

        // Filter by status
        if (filters.status) {
            filtered = filtered.filter(expense =>
                expense.status === filters.status
            );
        }

        // Filter by quick search
        if (filters.quick_search) {
            const searchLower = filters.quick_search.toLowerCase();
            filtered = filtered.filter(expense =>
                (expense.vendor && expense.vendor.toLowerCase().includes(searchLower)) ||
                (expense.description && expense.description.toLowerCase().includes(searchLower))
            );
        }

        return filtered;
    }

    function loadCategories() {
        $.ajax({
            url: '/api-get-expense-categories/',
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (categories) {
                let select = $("#category_filter");
                categories.forEach(cat => {
                    select.append(`<option value="${cat}">${cat}</option>`);
                });
            },
            error: function (xhr) {
                console.error("Error loading categories:", xhr);
            }
        });
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
            category: $("#category_filter").val(),
            status: $("#status_filter").val()
        };

        console.log("🔍 Searching with filters:", filters);
        fetchExpenses(filters);
    });

    // Clear Filters
    $("#btn_clear_filters").on("click", function () {
        $("#date_from").val('');
        $("#date_to").val('');
        $("#category_filter").val('');
        $("#status_filter").val('');
        $("#quick_search").val('');
        
        console.log("🔄 Clearing all filters - fetching ALL records");
        
        // Fetch all records without any filter
        fetchExpenses({
            date_from: null,
            date_to: null,
            category: '',
            status: ''
        });
        
        // Hide filters panel
        $("#filters_panel").addClass("hidden");
    });

    // Refresh Data
    $("#btn_refresh").on("click", function () {
        let filters = {
            date_from: $("#date_from").val(),
            date_to: $("#date_to").val(),
            category: $("#category_filter").val()
        };
        fetchExpenses(filters);
    });

    // Quick Search (Client-side)
    let quickSearchTimeout;
    $("#quick_search").on("keyup", function () {
        clearTimeout(quickSearchTimeout);
        quickSearchTimeout = setTimeout(function () {
            let filters = {
                date_from: $("#date_from").val(),
                date_to: $("#date_to").val(),
                category: $("#category_filter").val(),
                status: $("#status_filter").val(),
                quick_search: $("#quick_search").val()
            };

            let filteredData = filterDataClientSide(allExpenseData, filters);
            renderTable(filteredData);
        }, 300);
    });

    // Print to PDF
    $("#btn_print_pdf").on("click", function () {
        const originalTable = document.getElementById("table_expenses");
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
                <h2 style="margin: 0; text-align: center;">Expense Report</h2>
                <p style="margin: 5px 0; text-align: center; color: #666; font-size: 12px;">As of ${today}</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; font-size: 11px;">
                <div style="text-align: center; padding: 10px; border: 1px solid #ccc;">
                    <strong>Total Expenses</strong>
                    <p>${$('#total_expenses').text()}</p>
                </div>
                <div style="text-align: center; padding: 10px; border: 1px solid #ccc;">
                    <strong>Approved</strong>
                    <p>${$('#approved_count').text()}</p>
                </div>
                <div style="text-align: center; padding: 10px; border: 1px solid #ccc;">
                    <strong>Pending</strong>
                    <p>${$('#pending_count').text()}</p>
                </div>
                <div style="text-align: center; padding: 10px; border: 1px solid #ccc;">
                    <strong>Total Records</strong>
                    <p>${$('#total_records').text()}</p>
                </div>
            </div>
        `;

        const printWindow = window.open("", "", "width=1000,height=800");
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Expense Report</title>
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
        const table = document.getElementById('table_expenses');
        const workbook = XLSX.utils.table_to_book(table, { sheet: "Expense Report" });
        XLSX.writeFile(workbook, `Expense_Report_${new Date().getTime()}.xlsx`);
    });

    // Set default date range (last 30 days)
    function setDefaultDateRange() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };

        $('#date_from').val(formatDate(thirtyDaysAgo));
        $('#date_to').val(formatDate(today));
    }

    // Initial Setup
    setDefaultDateRange();
    loadCategories();
    fetchExpenses({
        date_from: null,
        date_to: null
    });
});
