// $(document).ready(function () {
//     var maxField = 10; // Input fields increment limitation
//     var addButton = $('#add_button'); // Add button selector
//     var wrapper = $('#addrow'); // Input field wrapper
//     var x = 0; // Initial field counter

//     // Function to format number with thousand separator
//     function formatNumberWithSeparator(value) {
//         return parseFloat(value).toLocaleString('en-US', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });
//     }

//     // Function to remove thousand separators and convert back to a number
//     function parseFormattedNumber(value) {
//         return value.replace(/,/g, '');
//     }

//     // Once add button is clicked
//     $(addButton).click(function () {
//         // Check maximum number of input fields
//         x++; // Increment field counter
//         var fieldHTML = `
//             <tr>

                

//                 <td style="padding: 0; margin: 0;">
//                     <input type="text" 
//                     name="account_code${x}" 
//                     id="account_code${x}"
//                     class="account_code"
//                     step="0.01"
//                      />
//                 </td>
//                 <td style="padding: 0; margin: 0;">
//                     <input
//                         type="text"
//                         name="accountTitle${x}"
//                         id="accountTitle${x}"
//                         onchange="myFunction2()"
//                     />
//                 </td>
//                 <td style="padding: 0; margin: 0;">
//                     <input
//                         type="text"
//                         name="amount${x}"
//                         id="amount${x}"
//                         class="amount"
//                         step="0.01"
//                     />
//                 </td>
//                 <td style="padding: 0; margin: 0;">
//                     <input
//                         type="text"
//                         name="credit_amount${x}"
//                         id="credit_amount${x}"
//                         class="credit_amount"
//                         step="0.01"
//                     />
//                 </td>

//                  <td style="padding: 0; margin: 0;">
//                     <input
//                         type="text"
//                         name="chart_of_account_id${x}"
//                         id="chart_of_account_id${x}"
//                         class="chart_of_account_id"
//                         step="0.01"

//                         hidden
//                     />
//                 </td>
                
                
//                 <td style="padding: 0; margin: 0;">
//                     <button type="button" id="remove_button" class="btn btn-danger">
//                         <i class="fas fa-database"></i> Remove
//                     </button>
//                 </td>

               

                

                
//             </tr>`; // New input field HTML

//         $(wrapper).append(fieldHTML); // Add field HTML
//     });

//     // Event delegation for input blur to handle formatting
//     $(document).on('blur', 'input[name^="amount"], input[name^="credit_amount"]', function () {
//         let input = $(this);
//         let inputValue = input.val().trim();
//         if (inputValue !== '' && !isNaN(inputValue)) {
//             input.val(formatNumberWithSeparator(parseFormattedNumber(inputValue)));
//         }
//         myFunction2();
//     });

//     // Event delegation for input focus to handle formatting
//     $(document).on('focus', 'input[name^="amount"], input[name^="credit_amount"]', function () {
//         let input = $(this);
//         let inputValue = input.val().trim();
//         input.val(parseFormattedNumber(inputValue)); // Remove formatting for editing
//         myFunction2();
//     });

//     // Once remove button is clicked
//     $(wrapper).on('click', '#remove_button', function (e) {
//         e.preventDefault();
//         $(this).closest('tr').remove(); // Remove field HTML 
//         myFunction2();
//         x--; // Decrement field counter
//     });

//     // Autocomplete for accountTitle

    

    


// });
// // this function is to check that debit and credit balance balance is equal 

// function myFunction2() {
//     document.querySelector("#submiBTN").disabled = true;
    
//     var total = 0.0;
//     let debitsum = 0;
//     let creditsum = 0;

//     // Process amount fields
//     let debitList = document.getElementsByClassName('amount');
//     for (let i of debitList) {
//         let debitValue = parseFloat(parseFormattedNumber(i.value));
//         if (!isNaN(debitValue)) {
//             debitsum += debitValue;
//         }
//     }
//     let debitsum2 = parseFloat(debitsum).toFixed(2);
    
//     // Process credit_amount fields
//     let creditList = document.getElementsByClassName('credit_amount');
//     for (let i of creditList) {
//         let creditValue = parseFloat(parseFormattedNumber(i.value));
//         if (!isNaN(creditValue)) {
//             creditsum += creditValue;
//         }
//     }
//     let creditsum2 = parseFloat(creditsum).toFixed(2);

//     // Calculate total
//     total = parseFloat(debitsum2) - parseFloat(creditsum2);

//     // Enable or disable the submit button based on the total
//     if (total === 0) {
//         document.getElementById("submiBTN").disabled = false;
//     } else {
//         document.getElementById("submiBTN").disabled = true;
//     }
// }


// // Function to format number with thousand separator
// function formatNumberWithSeparator(value) {
//     return parseFloat(value).toLocaleString('en-US', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     });
// }

// // Function to remove thousand separators and convert back to a number
// function parseFormattedNumber(value) {
//     var parsedValue = value.replace(/,/g, '');
//     // Ensure two decimal places for precision
//     return (Math.round(parseFloat(parsedValue) * 100) / 100).toFixed(2);
// }


$(document).ready(function () {
    var maxField = 10; // Limit for input fields
    var addButton = $('#add_button'); // Add button selector
    var wrapper = $('#addrow'); // Input field wrapper
    var x = 0; // Initial field counter

    // Function to format a number with a thousand separator
    function formatNumberWithSeparator(value) {
        return parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Function to remove thousand separators and convert back to a number
    function parseFormattedNumber(value) {
        var parsedValue = value.replace(/,/g, '').trim();
        return isNaN(parsedValue) || parsedValue === '' ? '0.00' : (Math.round(parseFloat(parsedValue) * 100) / 100).toFixed(2);
    }

    // Add row on button click
    $(addButton).click(function () {
        x++; // Increment field counter
        var fieldHTML = `
            <tr>
                <td style="padding: 0; margin: 0;">
                    <input type="text" name="account_code${x}" id="account_code${x}" class="account_code" />
                </td>
                <td style="padding: 0; margin: 0;">
                    <input type="text" name="accountTitle${x}" id="accountTitle${x}" onchange="myFunction2()" />
                </td>
                <td style="padding: 0; margin: 0;">
                    <input type="text" name="amount${x}" id="amount${x}" class="amount" />
                </td>
                <td style="padding: 0; margin: 0;">
                    <input type="text" name="credit_amount${x}" id="credit_amount${x}" class="credit_amount" />
                </td>
                <td style="padding: 0; margin: 0;">
                    <input type="text" name="chart_of_account_id${x}" id="chart_of_account_id${x}" hidden />
                </td>
                <td style="padding: 0; margin: 0;">
                    <button type="button" id="remove_button" class="btn btn-danger">
                        <i class="fas fa-database"></i> Remove
                    </button>
                </td>
            </tr>`;
        $(wrapper).append(fieldHTML); // Append new row
    });

    // Remove row on button click
    $(wrapper).on('click', '#remove_button', function (e) {
        e.preventDefault();
        $(this).closest('tr').remove(); // Remove the row
        myFunction2(); // Recalculate totals
        x--; // Decrement field counter
    });

    // Blur event for formatting amounts
    $(document).on('blur', 'input[name^="amount"], input[name^="credit_amount"]', function () {
        let input = $(this);
        let inputValue = input.val();
        input.val(formatNumberWithSeparator(parseFormattedNumber(inputValue))); // Format value
        myFunction2(); // Recalculate totals
    });

    // Focus event to remove formatting for editing
    $(document).on('focus', 'input[name^="amount"], input[name^="credit_amount"]', function () {
        let input = $(this);
        let inputValue = input.val();
        input.val(parseFormattedNumber(inputValue)); // Remove formatting
    });

    // Function to ensure debit and credit amounts balance
    function myFunction2() {
        document.querySelector("#submiBTN").disabled = true;

        var debitsum = 0;
        var creditsum = 0;

        // Calculate debit sum
        $('.amount').each(function () {
            let debitValue = parseFloat(parseFormattedNumber($(this).val()));
            if (!isNaN(debitValue)) debitsum += debitValue;
        });

        // Calculate credit sum
        $('.credit_amount').each(function () {
            let creditValue = parseFloat(parseFormattedNumber($(this).val()));
            if (!isNaN(creditValue)) creditsum += creditValue;
        });

        // Enable submit button if balanced
        if (debitsum.toFixed(2) === creditsum.toFixed(2)) {
            document.querySelector("#submiBTN").disabled = false;
        }
    }
});




jQuery.noConflict();
jQuery(document).ready(function($) {
    $(document).on('focus', '[id^="accountTitle"]', function() {
        $(this).autocomplete({
            source: function(request, response) {
                $.ajax({
                    url: "/api-autocomplete-chart-of-account/", // Replace with your actual endpoint
                    data: { term: request.term },
                    dataType: "json",
                    success: function(data) {
                        response(data);
                    },
                    error: function(err) {
                        console.error("Error fetching autocomplete data:", err);
                    }
                });
            },
            minLength: 0,
            select: function(event, ui) {
                $(this).val(ui.item.value);
                // Ensure you set the correct account_no field related to the focused accountTitle
                $(this).closest('tr').find('[id^="account_code"]').val(ui.item.chart_of_account_code);
                $(this).closest('tr').find('[id^="chart_of_account_id"]').val(ui.item.id);
                return false;
            }
        });
    });
});



//this function is for autocomplete of branch
jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "branch_name"
    $(document).on('focus', '#branch_name', function() {
        $("#branch_name").autocomplete({
            source: function(request, response) {
                // AJAX call to fetch data for the autocomplete suggestions
                $.ajax({
                    url: "/api-autocomplete-branch/",  // Your endpoint for fetching data
                    data: { term: request.term },     // Send the user's input term to the server
                    dataType: "json",                 // Expect a JSON response from the server
                    success: function(data) {
                        response(data);               // Pass the data to autocomplete
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
                $("#branch_name").val(ui.item.value);
                // Set the related field based on the selected item
                $("#branch_id").val(ui.item.id);

                return false; // Prevent the default select action
            }
        });
    });
});

