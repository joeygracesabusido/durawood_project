jQuery(document).ready(function($) {
    function initCustomerAutocomplete() {
        if ($("#customer").data("ui-autocomplete")) {
            return;
        }
        
        $("#customer").autocomplete({
            appendTo: ".autocomplete-wrapper",
            source: function(request, response) {
                $.ajax({
                    url: "/api-autocomplete-customer-invoices/", 
                    data: { term: request.term }, 
                    dataType: "json",               
                    success: function(data) {             
                        console.log("Autocomplete data:", data);
                        var suggestions = data.map(function(item) {
                            var balance = parseFloat(item.balance) || 0;
                            return {
                                label: (item.customer || 'Unknown') + " - " + (item.invoice_no || 'N/A') + " - ₱" + balance.toLocaleString('en-US', {minimumFractionDigits: 2}),
                                value: item.customer,
                                customer_id: item.customer_id,
                                invoice_no: item.invoice_no,
                                balance: balance
                            };
                        });
                        response(suggestions);
                    },
                    error: function(err) {
                        console.error("Error fetching autocomplete data:", err);
                    }
                });
            },
            minLength: 2,
            autoFocus: true,
            position: { my: "left top", at: "left bottom", collision: "none" },
            open: function() {
                $(this).autocomplete("widget").css({
                    "width": ($(this).parent().width()) + "px",
                    "z-index": 100000
                });
            },
            select: function(event, ui) {
                $("#customer").val(ui.item.value);
                $("#customer_id").val(ui.item.customer_id);
                $("#invoice_no").val(ui.item.invoice_no);
                $("#balance").val(ui.item.balance.toLocaleString('en-US', {minimumFractionDigits: 2}));
                
                // Get customer summary balance
                if (typeof window.getCustomerBalance === 'function') {
                    window.getCustomerBalance();
                }
                return false;
            }
        });
    }

    // Initialize once
    initCustomerAutocomplete();

    // Trigger search if user clicks on field
    $("#customer").on("focus", function() {
        if ($(this).val().length >= 2) {
            $(this).autocomplete("search", $(this).val());
        }
    });

    function formatNumber(value) {
      return parseFloat(value.replace(/,/g, '') || 0)
        .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    $("#balance").on("input", function () {
      let rawValue = $(this).val();
      let formattedValue = formatNumber(rawValue);
      $(this).val(formattedValue);
    });

    $("#balance").on("blur", function () {
      let rawValue = $(this).val();
      $(this).val(formatNumber(rawValue));
    });

    $("#btn_save_payment").click(function (e) {
        e.preventDefault();
        
        let balance = parseFloat($("#balance").val()) || 0;
        let cashAmount = parseFloat($("#cash_amount").val()) || 0;
        let amount2307 = parseFloat($("#amount_2307").val()) || 0;

        let AmountSAve = balance - (cashAmount + amount2307);

        if (Math.abs(AmountSAve >= 0)) {
            let paymentData = {
                date: $("#trans_date").val(),
                customer: $("#customer").val(),
                customer_id: $("#customer_id").val(),
                cr_no: $("#collection_receipt").val(),
                invoice_no: $("#invoice_no").val(),
                cash_amount: cashAmount,
                amount_2307: amount2307,
                remarks: $("#remarks").val(),
                payment_method: $("#payment_method").val(),
            };

            console.log(paymentData);

            $.ajax({
                url: "/api-insert-payment/",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(paymentData),
                success: function (response) {
                    alert("✅ " + response.message);
                    getCustomerBalance();
                },
                error: function (xhr) {
                    alert("❌ Error: " + (xhr.responseJSON?.detail || "Unknown error"));
                }
            });
        } else {
            alert("❌ Payment is greater than  Balance");
        }
    });

    window.getCustomerBalance = async function() {
        let customerName = $('#customer').val() || '';

        try {
            const response = await fetch(`/api-get-per-customer-balance-with-params/?customer=${encodeURIComponent(customerName)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const custBalance = await response.json();
                console.log(custBalance);
                if (custBalance.length > 0) {
                    $('#summary-balance').text(
                        custBalance[0].total_balance.toLocaleString('en-US', { 
                            style: 'currency', 
                            currency: 'PHP'
                        })
                    );
                } else {
                    $('#summary-balance').text('0.00');
                }
            } else {
                console.error("Failed to fetch customer balance:", response.statusText);
                $('#summary-balance').text('Error');
            }
        } catch (error) {
            console.error("An error occurred:", error);
            $('#summary-balance').text('Error');
        }
    };

    // Set today's date
    let today = new Date().toISOString().split('T')[0];
    document.getElementById('trans_date').value = today;
});
