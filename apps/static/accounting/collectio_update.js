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
