$(document).ready(function () {
    // Disable the save button by default
    // $('#save_payment').prop('disabled', true);

    // Set payment date to today
    var today = new Date().toISOString().split('T')[0];
    $('#payment_date').val(today);

    // Function to populate the 'Deposit to' dropdown
    // function populateDepositTo() {
    //     $.ajax({
    //         url: "/api-get-chart-of-accounts2/",
    //         success: function (data) {
    //             let depositToSelect = $('#deposit_to');
    //             depositToSelect.empty(); // Clear existing options
    //             depositToSelect.append('<option selected>Select Deposit Account...</option>');

    //             // Filter for cash and bank accounts
    //             data.forEach(function (account) {
    //                 if (account.account_type === 'Cash' || account.account_type === 'Bank') {
    //                     depositToSelect.append(`<option value="${account.chart_of_account}">${account.chart_of_account}</option>`);
    //                 }
    //             });

    //             // Enable the save button after the dropdown is populated
    //             $('#save_payment').prop('disabled', false);
    //         },
    //         error: function (xhr) {
    //             console.error("Error fetching chart of accounts: ", xhr.responseText);
    //             // Keep the save button disabled if there is an error
    //         }
    //     });
    // }

    // Populate the 'Deposit to' dropdown on page load
    // populateDepositTo();

    // Autocomplete for customer name
    $("#customer_name").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "/api-get-per-customer-balance",
                data: {
                    balance_filter: 'positive', // Only show customers with balance
                    term: request.term
                },
                success: function (data) {
                    response($.map(data, function (item) {
                        return {
                            label: item.customer + " - " + item.customer_id + " - " + formatNumber(item.total_balance),
                            value: item.customer,
                            id: item.customer_id, // Use customer_id
                            balance: item.total_balance
                        };
                    }));
                },
                error: function(xhr) {
                    console.error("Error fetching customer balance: ", xhr.responseText);
                }
            });
        },
        minLength: 1,
        select: function (event, ui) {
            $("#customer_id").val(ui.item.id);
            $("#full_amount").val(formatNumber(ui.item.balance));
            fetchInvoices(ui.item.value);
        }
    });

    function fetchInvoices(customerName) {
        $.ajax({
            url: "/api-get-transaction-history",
            data: { customer: customerName, balance_only: 'true' },
            success: function (data) {
                console.log(data);
                const transactions = Array.isArray(data) ? data : (data.transactions || []);
                let rows = '';
                if (transactions.length > 0) {
                    transactions.forEach(function(txn) {
                        if (txn.type === 'Sales') {
                            // Ensure invoice_no is present and use it as the checkbox value
                            const invoiceNo = typeof txn.invoice_no !== 'undefined' ? String(txn.invoice_no) : '';
                            rows += `
                                <tr data-invoice-no="${invoiceNo}">
                                    <td><input type="checkbox" class="invoice-checkbox" value="${invoiceNo}"></td>
                                    <td>${new Date(txn.date).toLocaleDateString()}</td>
                                    <td>${invoiceNo}</td>
                                    <td>${formatNumber(txn.sales_amount)}</td>
                                    <td>${formatNumber(txn.balance)}</td>
                                    <td><input type="text" class="form-control payment-amount" disabled></td>
                                </tr>
                            `;
                        }
                    });
                } else {
                    rows = '<tr><td colspan="6" class="text-center">No outstanding invoices</td></tr>';
                }
                $("#invoices_table tbody").html(rows);
                $('#select_all_invoices').prop('checked', false);
                $('#amount_received').text('₱0.00');
            },
            error: function(xhr) {
                console.error("Error fetching invoices: ", xhr.responseText);
                alert("Failed to fetch invoices.");
            }
        });
    }

    $('#receive_full_amount').on('click', function(e) {
        e.preventDefault();
        let fullAmount = $('#full_amount').val();
        $('#payment_received').val(fullAmount);

        let allCheckboxes = $('.invoice-checkbox');
        if (allCheckboxes.length === 0) {
            updateAmountReceived();
            return;
        }

        if (allCheckboxes.filter(':checked').length === 0) {
            allCheckboxes.prop('checked', true);
            $('.payment-amount').prop('disabled', false);
        }

        // Distribute the amount among checked invoices
        let totalPayment = parseFloat(fullAmount.replace(/,/g, ''));
        if(isNaN(totalPayment)) return;

        let checkedRows = $('.invoice-checkbox:checked').closest('tr');
        checkedRows.each(function() {
            let row = $(this);
            let amountDueText = row.find('td:eq(4)').text();
            let amountDue = parseFloat(amountDueText.replace(/,/g, ''));
            
            if(totalPayment > 0) {
                let payment = Math.min(totalPayment, amountDue);
                row.find('.payment-amount').val(formatNumber(payment));
                totalPayment -= payment;
            } else {
                row.find('.payment-amount').val('');
            }
        });
        updateAmountReceived();
    });

    $('#add_pdc').on('click', function() {
        var newRow = `
            <tr>
                <td><input type="text" class="form-control"></td>
                <td><input type="text" class="form-control"></td>
                <td><input type="date" class="form-control"></td>
                <td><input type="text" class="form-control"></td>
                <td><button type="button" class="btn btn-danger btn-sm remove-pdc">X</button></td>
            </tr>
        `;
        $('#pdc_table tbody').append(newRow);
    });

    $('#pdc_table').on('click', '.remove-pdc', function() {
        $(this).closest('tr').remove();
    });

    $('#invoices_table').on('input', '.payment-amount', function() {
        updateAmountReceived();
    });
    
    $('#select_all_invoices').on('change', function() {
        let isChecked = $(this).prop('checked');
        $('.invoice-checkbox').prop('checked', isChecked);
        $('.payment-amount').prop('disabled', !isChecked);
        if (!isChecked) {
            $('.payment-amount').val('');
        }
        updateAmountReceived();
    });

    $('#invoices_table').on('change', '.invoice-checkbox', function() {
        let row = $(this).closest('tr');
        row.find('.payment-amount').prop('disabled', !$(this).prop('checked'));
        if(!$(this).prop('checked')) {
            row.find('.payment-amount').val('');
        }
        updateAmountReceived();
    });

    function updateAmountReceived() {
        let total = 0;
        $('.payment-amount').each(function() {
            let value = parseFloat($(this).val().replace(/,/g, ''));
            if (!isNaN(value)) {
                total += value;
            }
        });
        $('#amount_received').text('₱' + formatNumber(total));
    }

    function formatNumber(value) {
        if (typeof value !== 'number') {
            value = parseFloat(value);
        }
        if (isNaN(value)) {
            return '0.00';
        }
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Function to clear the form
    function clearForm() {
        $('#payment-form')[0].reset();
        $('#invoices_table tbody').empty();
        $('#pdc_table tbody').empty();
        $('#amount_received').text('₱0.00');
        $('#customer_id').val('');
    }

    // Function to save payments
    function savePayments() {
    let paymentDate = $('#payment_date').val();
    let customerName = $('#customer_name').val();
    // cr_no should be a reference number for the payment received (ensure it's a string)
    let crNo = String($('#collection_receipt').val() || '');
        let payment_method = $('#payment_method').val();
        

        console.log("paymentDate:", paymentDate);
        console.log("customerName:", customerName);
        console.log("crNo:", crNo);
        

        if (!paymentDate || !customerName ) {
            alert('Please fill all required fields: Payment Date, Customer Name, Payment Received #, and Deposit to.');
            return;
        }

        let customerId = $('#customer_id').val();
        let remarks = $('#reference').val();

        let paymentsToSave = [];
        $('#invoices_table tbody tr').each(function() {
            let row = $(this);
            let checkbox = row.find('.invoice-checkbox');
            let isChecked = checkbox.is(':checked');
            let paymentAmountText = row.find('.payment-amount').val() || '';
            let paymentAmount = parseFloat(paymentAmountText.replace(/,/g, ''));

            if (isChecked && !isNaN(paymentAmount) && paymentAmount > 0) {
                // Prefer the checkbox value if provided (e.g., numeric id like '3'), otherwise fall back to data attribute
                let invoiceNo = checkbox.val() || row.data('invoice-no') || '';

                let paymentData = {
                    date: paymentDate,
                    customer: customerName,
                    customer_id: customerId,
                    invoice_no: String(invoiceNo), // Ensure invoice_no is a string
                    // Ensure cr_no exists; backend requires this field per Pydantic model
                    cr_no: String(crNo || ''),
                    cash_amount: paymentAmount,
                    amount_2307: 0, // Assuming 0 for now
                    remarks: remarks,
                    payment_method: payment_method
                };
                paymentsToSave.push(paymentData);
            }
        });

        if (paymentsToSave.length === 0) {
            alert('No payments to save. Please check at least one invoice and enter a payment amount.');
            return;
        }

        // Send payments as a single batch POST to reduce multiple requests
        $.ajax({
            url: '/api-insert-payment-batch/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(paymentsToSave),
            success: function(resp) {
                alert((resp && resp.message) ? resp.message : 'Payments saved successfully!');
                clearForm();
            },
            error: function(xhr) {
                console.error('Error saving payments batch', xhr.responseText);
                alert('Failed to save payments batch. Check the console for details.');
            }
        });
    }

    // Attach the save function to the save button
    $('#save_payment').on('click', function() {
        savePayments();
    });
});
