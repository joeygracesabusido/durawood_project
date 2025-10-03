$(document).ready(function () {
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
                            label: item.customer + " - " + formatNumber(item.total_balance),
                            value: item.customer,
                            id: item.customer, // Assuming customer name is unique
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
                            rows += `
                                <tr data-invoice-no="${txn.invoice_no}">
                                    <td><input type="checkbox" class="invoice-checkbox"></td>
                                    <td>${new Date(txn.date).toLocaleDateString()}</td>
                                    <td>${txn.invoice_no}</td>
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

    $('#save_payment').on('click', function() {
        let paymentDate = $('#payment_date').val();
        let customerName = $('#customer_name').val();
        let customerId = $('#customer_id').val();
        let crNo = $('#payment_received').val();
        let depositTo = $('#deposit_to').val();
        let remarks = $('#reference').val();

        if (!paymentDate || !customerName || !crNo || depositTo === 'Select Deposit Account...') {
            alert('Please fill all required fields: Payment Date, Customer Name, Payment Received #, and Deposit to.');
            return;
        }

        let paymentsToSave = [];
        $('#invoices_table tbody tr').each(function() {
            let row = $(this);
            let isChecked = row.find('.invoice-checkbox').is(':checked');
            let paymentAmount = parseFloat(row.find('.payment-amount').val().replace(/,/g, ''));

            if (isChecked && paymentAmount > 0) {
                let invoiceNo = row.data('invoice-no');

                let paymentData = {
                    date: paymentDate,
                    customer: customerName,
                    customer_id: customerId,
                    invoice_no: invoiceNo,
                    cr_no: crNo,
                    cash_amount: paymentAmount,
                    amount_2307: 0, // Assuming 0 for now
                    remarks: remarks,
                    payment_method: depositTo
                };
                paymentsToSave.push(paymentData);
            }
        });

        if (paymentsToSave.length === 0) {
            alert('No payments to save. Please check at least one invoice and enter a payment amount.');
            return;
        }

        let savePromises = paymentsToSave.map(function(paymentData) {
            return $.ajax({
                url: '/api-insert-payment/',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(paymentData)
            });
        });

        Promise.all(savePromises)
            .then(function() {
                alert('All payments saved successfully!');
                // Optionally, clear the form or redirect
                location.reload();
            })
            .catch(function(xhr) {
                console.error('Error saving payments', xhr.responseText);
                alert('Failed to save one or more payments. Check the console for details.');
            });
    });
});
