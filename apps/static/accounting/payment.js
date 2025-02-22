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


                return false; // Prevent the default select action
            }
        });
    });
});



$(document).ready(function () {
    $("#btn_save_payment").click(function (e) {
        e.preventDefault(); // Prevent form submission

        // Collect form data
        let paymentData = {
            date: $("#trans_date").val(),
            customer: $("#customer").val(),
            customer_id: $("#customer_id").val(),
            invoice_no: $("#invoice_no").val(),
            cash_amount: parseFloat($("#cash_amount").val()) || 0, // Ensure it's a number
            amount_2307: parseFloat($("#amount_2307").val()) || 0,
            remarks: $("#remarks").val(),
        };

        $.ajax({
            url: "/api-insert-payment/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(paymentData),
            success: function (response) {
                alert("✅ " + response.message); // Show success message
               // $("#paymentForm")[0].reset(); // Clear the form
                window.location.href = "/payment/";
            },
            error: function (xhr) {
                alert("❌ Error: " + xhr.responseJSON.detail); // Show error message
            }
        });
    });
});




