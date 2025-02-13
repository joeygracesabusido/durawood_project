// this function is to identify for debit or credit amount
function isDebit(account_title) {
    // Ensure account_title is not undefined or null before proceeding
    if (account_title.toLowerCase().includes('input') 
        || (account_title.toLowerCase().includes('purch') ))
     {
      return true;
    } 
  
   else {
      return false;
    }
  }

 function calculateAR(account_title,invoice_amount,ewt){
   

    if  (
        // account_title.toLowerCase().includes('purchase') || 
        // account_title.toLowerCase().includes('exp') 
        account_title.toLowerCase().includes('input')
        //  && account_title.toLowerCase().includes('expanded')
      ) 
     {
       
        input_tax = invoice_amount / 1.12 * .12;
        product = parseFloat(input_tax);
    
        return product.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    
   } else if (account_title.toLowerCase().includes('purchases')){
        purchase_amount = invoice_amount / 1.12 ;
        product = parseFloat(purchase_amount);

        return product.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
    });

   } else if (account_title.toLowerCase().includes('payable')
             || (account_title.toLowerCase().includes('cash'))){
               
                // with_holdingTax = parseFloat(invoice_amount) / 1.12 * parseFloat(ewt/100);
                console.log(parseFloat(ewt))
                with_holdingTax = parseFloat(invoice_amount) / 1.12 * parseFloat(ewt/100);
                console.log(with_holdingTax)
                purchase_amount = parseFloat(invoice_amount) - parseFloat(with_holdingTax) ;
                product = parseFloat(purchase_amount);

    return product.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    } 
    else if (account_title.toLowerCase().includes('expanded')){
        purchase_amount = parseFloat(invoice_amount / 1.12) * parseFloat(ewt/100);
        product = parseFloat(purchase_amount);
    
        return product.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
    });
    
    }
  
   
}

       
       
 



$(document).ready(function () {
    var maxField = 10; // Input fields increment limitation
    var addButton = $('#add_button'); // Add button selector
    var wrapper = $('#addrow'); // Input field wrapper
    var amount = $('#invoice_amount'); // Input field wrapper
    var x = 0; // Initial field counter

    // Function to format number with thousand separator
    function formatNumberWithSeparator(value) {
        return parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Function to remove thousand separators and convert back to a number
    function parseFormattedNumber(value) {
        return value.replace(/,/g, '');
    }

    // Once add button is clicked
    $(addButton).click(function () {
        // Check maximum number of input fields
        x++; // Increment field counter
        var fieldHTML = `
            <tr>

                

                <td style="padding: 0; margin: 0;">
                    <input type="text" 
                    name="account_code${x}" 
                    id="account_code${x}"
                    class="account_code"
                    
                    step="0.01"
                    style="width: 100px;" 
                     />
                </td>
                <td style="padding: 0; margin: 0;">
                    <input
                        type="text"
                        name="accountTitle${x}"
                        id="accountTitle${x}"
                        
                         style="width: 350px;" 
                    />
                </td>

                <td style="padding: 0; margin: 0;">
                    <input
                        type="text"
                        name="ewt${x}"
                        id="ewt${x}"
                        max="100"
                        style="width: 120px;" 
                    />
                </td>

                <td style="padding: 0; margin: 0;">
                    <input
                        type="text"
                        name="amount${x}"
                        id="amount${x}"
                        class="amount"
                        step="0.01"
                        onchange="myFunction2()"
                        style="width: 150px; text-align: right;""
                    />
                </td>
                <td style="padding: 0; margin: 0;">
                    <input
                        type="text"
                        name="credit_amount${x}"
                        id="credit_amount${x}"
                        class="credit_amount"
                        step="0.01"
                        onchange="myFunction2()"
                        style="width: 150px; text-align: right;"" 
                    />
                </td>

                 <td style="padding: 0; margin: 0;">
                    <input
                        type="text"
                        name="chart_of_account_id${x}"
                        id="chart_of_account_id${x}"
                        class="chart_of_account_id"
                        step="0.01"

                        hidden
                    />
                </td>
                
                
                <td style="padding: 0; margin: 0;">
                    <button type="button" id="remove_button" class="btn btn-danger">
                        <i class="fas fa-database"></i> Remove
                    </button>
                </td>

               

                

                
            </tr>`; // New input field HTML

        $(wrapper).append(fieldHTML); // Add field HTML

        var inputFieldForAccountTitle = $(`#accountTitle${x}`); //account code field
        var inputFieldForCredit = $(`#credit_amount${x}`); //credit field
        var inputFieldForDebit = $(`#amount${x}`); // debit field
        var witholding = $(`#ewt${x}`); // debit field

        //here is the on change detector for witholding tax field
        witholding.on('input', function() {
            populateDebitOrCreditField($(this).val());
        });
        //here is the onchange detector for change of sales amount
        amount.on('input',function(){
            populateDebitOrCreditField($(this).val());
        });

        function populateDebitOrCreditField() {
            // console.log('Withholding value changed to:', witholding.val());
            // console.log(inputFieldForAccountTitle.val());
            // console.log (isDebit(inputFieldForAccountTitle.val()))
            // Check if the account title is for debit
            if (isDebit(inputFieldForAccountTitle.val())) {
                // Set the debit field value (replace with your formula as needed)
                inputFieldForDebit.val(calculateAR(inputFieldForAccountTitle.val(),
                amount.val(),witholding.val()));
            } else {
                // Set the credit field value (replace with your formula as needed)
                inputFieldForCredit.val(calculateAR(inputFieldForAccountTitle.val(),
                amount.val(),witholding.val()));
            }
        }
        
    });



 



    // Event delegation for input blur to handle formatting
    $(document).on('blur', 'input[name^="amount"], input[name^="credit_amount"]', function () {
        let input = $(this);
        let inputValue = input.val().trim();
        if (inputValue !== '' && !isNaN(inputValue)) {
            input.val(formatNumberWithSeparator(parseFormattedNumber(inputValue)));
        }
        myFunction2();
    });

    // Event delegation for input focus to handle formatting
    $(document).on('focus', 'input[name^="amount"], input[name^="credit_amount"]', function () {
        let input = $(this);
        let inputValue = input.val().trim();
        input.val(parseFormattedNumber(inputValue)); // Remove formatting for editing
        myFunction2();
    });

    // Once remove button is clicked
    $(wrapper).on('click', '#remove_button', function (e) {
        e.preventDefault();
        $(this).closest('tr').remove(); // Remove field HTML 
        myFunction2();
        x--; // Decrement field counter
    });

    // Autocomplete for accountTitle

    

    


});
// this function is to check that debit and credit balance balance is equal 

function myFunction2() {
    document.querySelector("#submiBTN").disabled = true;
    
    var total = 0.0;
    let debitsum = 0;
    let creditsum = 0;

    // Process amount fields
    let debitList = document.getElementsByClassName('amount');
    for (let i of debitList) {
        let debitValue = parseFloat(parseFormattedNumber(i.value));
        if (!isNaN(debitValue)) {
            debitsum += debitValue;
        }
    }
    let debitsum2 = parseFloat(debitsum).toFixed(2);
    
    // Process credit_amount fields
    let creditList = document.getElementsByClassName('credit_amount');
    for (let i of creditList) {
        let creditValue = parseFloat(parseFormattedNumber(i.value));
        if (!isNaN(creditValue)) {
            creditsum += creditValue;
        }
    }
    let creditsum2 = parseFloat(creditsum).toFixed(2);

    // Calculate total
    total = parseFloat(debitsum2) - parseFloat(creditsum2);

    // Enable or disable the submit button based on the total
    if (total === 0) {
        document.getElementById("submiBTN").disabled = false;
    } else {
        document.getElementById("submiBTN").disabled = true;
    }
}


// Function to format number with thousand separator
function formatNumberWithSeparator(value) {
    return parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Function to remove thousand separators and convert back to a number
function parseFormattedNumber(value) {
    return value.replace(/,/g, '');
}




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




// Use jQuery in noConflict mode
jQuery.noConflict();

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
                $("#id").val(ui.item.id);

                return false; // Prevent the default select action
            }
        });
    });
});



// Use jQuery in noConflict mode
jQuery.noConflict();

jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "branch_name"
    $(document).on('focus', '#supplier', function() {
        $("#supplier").autocomplete({
            source: function(request, response) {
                // AJAX call to fetch data for the autocomplete suggestions
                $.ajax({
                    url: "/api-autocomplete-vendor-customer/",  // Your endpoint for fetching data
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
                $("#supplier").val(ui.item.value);
                // Set the related field based on the selected item
                $("#supplier_id").val(ui.item.id);

                return false; // Prevent the default select action
            }
        });
    });
});


//====================================This is for  ==================================== -->
                                    
// $(document).ready(function() {
//     // Use event delegation to handle 'input' events for dynamically added fields
//     // $(document).on('input', 'input[name^="ewt"]','input[name^="accountTitle"]', function()
//     $(document).on('input', 'input[name^="ewt"]','input[name^="accountTitle"]', function() {
//         console.log($(this)); // Log the current element
//         // calculatelgl1();
//         // Get the value of the related 'accountTitle' input field in the same row
//         var chart_of_account = $(this).closest('tr').find('input[name^="accountTitle"]').val();

//         if (chart_of_account === 'Account Receivable' ||chart_of_account === 'Cash in Bank' ) 
//             {
//                 calculatelgl1();
//         } else if (chart_of_account === 'Creditable With Holding Tax') {
//             calculateCWT()
//         } else {
//             $('input[name^="amount"]').val(0);
//         }
//     });
// });

