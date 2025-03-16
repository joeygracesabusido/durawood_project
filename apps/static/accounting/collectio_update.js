// Use jQuery in noConflict mode
jQuery.noConflict();

jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "branch_name"
    $(document).on('focus', '#customer', function() {
        $("#customer").autocomplete({
            source: function(request, response) {
                // AJAX call to fetch data for the autocomplete suggestions
                $.ajax({
                    url: "/api-autocomplete-customer-payment/", 
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
                $("#customer").val(ui.item.customer);
                // Set the related field based on the selected item
                $("#customer_id").val(ui.item.customer_id);
                $("#invoice_no").val(ui.item.invoice_no);
                $("#balance").val(ui.item.balance)

                // Format balance with thousand separator
                //let formattedBalance = formatNumber(ui.item.balance.toString()); 
                //$("#balance").val(formattedBalance); 



                return false; // Prevent the default select action
            }
        });
    });
});


$(document).ready(function() {

    // Get the payment ID from URL or hidden input if needed
    let paymentId = $("#payment_id").val();  // You can pass this from your template

    // When button is clicked
    $("#btn_save_payment").click(function() {
        updatePayment(paymentId);
    });

    function updatePayment(paymentId) {
        // Collect the data from the form inputs
        let data = {
            date: $("#trans_date").val(),
            customer: $("#customer").val(),
            customer_id: $("#customer_id").val(),
            cr_no: $("#collection_receipt").val(),
            invoice_no: $("#invoice_no").val(),
            cash_amount: parseFloat($("#cash_amount").val()) || 0,
            amount_2307: parseFloat($("#amount_2307").val()) || 0,
            remarks: $("#remarks").val(),
            date_updated: new Date().toISOString().slice(0, 10), // Auto set date update
            payment_method: $("#payment_method").val(),
        };

        // Call API
        $.ajax({
            url: `/api-update-payment/${paymentId}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')  // Assuming token is stored in localStorage
            },
            success: function(response) {
                alert("Payment data has been updated successfully!");
                // Optionally, redirect or reload the page
                window.location.href = "/payment/";  // Adjust as necessary
            },
            error: function(xhr) {
                alert("Failed to update payment: " + xhr.responseJSON.detail);
            }
        });
    }

});
