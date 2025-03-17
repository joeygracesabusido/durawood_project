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



// $(document).ready(function () {
//     $("#btn_save_payment").click(function (e) {
//         e.preventDefault(); // Prevent form submission
//
//         let balance = $("#balance").val() || 0;
//         let cashAmount = parseFloat($("#cash_amount").val()) || 0;
//         let amount2307 = parseFloat($("#amount_2307").val()) || 0;
//
//         let AmountSAve = 0;
//
//         AmountSAve = balance - (cashAmount + amount2307)
//
//
//         if (AmountSAve == 0) {
//
//            // Collect form data
//         let paymentData = {
//             date: $("#trans_date").val(),
//             customer: $("#customer").val(),
//             customer_id: $("#customer_id").val(),
//             cr_no: $("#collection_receipt").val(),
//             invoice_no: $("#invoice_no").val(),
//             cash_amount: parseFloat($("#cash_amount").val()) || 0, // Ensure it's a number
//             amount_2307: parseFloat($("#amount_2307").val()) || 0,
//             remarks: $("#remarks").val(),
//             payment_method: $("#payment_method").val(),
//         };
//
//         console.log(paymentData)
//
//         // $.ajax({
//         //     url: "/api-insert-payment/",
//         //     type: "POST",
//         //     contentType: "application/json",
//         //     data: JSON.stringify(paymentData),
//         //     success: function (response) {
//         //         alert("✅ " + response.message); // Show success message
//         //        // $("#paymentForm")[0].reset(); // Clear the form
//         //         window.location.href = "/payment/";
//         //     },
//         //     error: function (xhr) {
//         //         alert("❌ Error: " + xhr.responseJSON.detail); // Show error message
//         //     }
//         // });
//         //
//
//
//             }
//       alert("Payment is greaterthan or lessthan Balance")
//
//     });
// });
//


 $(document).ready(function () {
    function formatNumber(value) {
      return parseFloat(value.replace(/,/g, '') || 0)
        .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    $("#balance").on("input", function () {
      let rawValue = $(this).val();
      let formattedValue = formatNumber(rawValue);
      $(this).val(formattedValue);
    });

    // Ensure formatting on focus out
    $("#balance").on("blur", function () {
      let rawValue = $(this).val();
      $(this).val(formatNumber(rawValue));
    });
  });

$(document).ready(function () {
    $("#btn_save_payment").click(function (e) {
        e.preventDefault(); // Prevent form submission
        
        let balance = parseFloat($("#balance").val()) || 0;
        let cashAmount = parseFloat($("#cash_amount").val()) || 0;
        let amount2307 = parseFloat($("#amount_2307").val()) || 0;

        let AmountSAve = balance - (cashAmount + amount2307);

        if (Math.abs(AmountSAve => 0)) {
            // Collect form data
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

            // console.log(paymentData);

            $.ajax({
                url: "/api-insert-payment/",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(paymentData),
                success: function (response) {
                    alert("✅ " + response.message); // Show success message
                    // $("#paymentForm")[0].reset(); // Clear the form
                    window.location.href = "/collection-list/";
                },
                error: function (xhr) {
                    alert("❌ Error: " + (xhr.responseJSON?.detail || "Unknown error")); // Show error message
                }
            });
        } else {
            alert("❌ Payment is greater than  Balance");
        }
    });
});

