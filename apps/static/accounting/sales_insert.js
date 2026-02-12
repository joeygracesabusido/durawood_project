jQuery.noConflict();

jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "customer"
    $(document).on('focus', '#customer', function() {
        $("#customer").autocomplete({
            source: function(request, response) {
                // AJAX call to fetch data for the autocomplete suggestions
                $.ajax({
                    url: "/api-autocomplete-vendor-customer/", 
                    data: { term: request.term }, 
                    dataType: "json",               
                    success: function(data) {
                        response(data);             
                    },
                    error: function(err) {
                        console.error("Error fetching autocomplete data:", err);  // Log errors
                    }
                });
            },
            minLength: 0,  // Minimum input length before triggering autocomplete
            select: function(event, ui) {
                // Set the selected value in the input field
                $("#customer").val(ui.item.value);
                // Set the related field based on the selected item
                $("#customer_id").val(ui.item.customer_vendor_id);
                $("#category").val(ui.item.category)
                $("#tax_type").val(ui.item.tax_type)


                return false; // Prevent the default select action
            }
        });
    });
});



//this function is for autocomplete of category
jQuery.noConflict();

jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "branch_name"
    $(document).on('focus', '#category', function() {
        $("#category").autocomplete({
            source: function(request, response) {
                // AJAX call to fetch data for the autocomplete suggestions
                $.ajax({
                    url: "/api-autocomplete-category/", 
                    data: { term: request.term }, 
                    dataType: "json",               
                    success: function(data) {
                        var suggestions = [];
                        if (data && Array.isArray(data.suggestions)) {
                            suggestions = data.suggestions.map(function(item) {
                                return {
                                    label: item,
                                    value: item
                                };
                            });
                        }
                        response(suggestions);             
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
                $("#category").val(ui.item.value);
              
                return false; // Prevent the default select action
            }
        });
    });
});




$(document).ready(function() {
    $("#terms").on("change", function() {
        var transDate = $("#invoice_date").val(); // Get the transaction date
        var terms = $(this).val(); // Get the selected term

        if (transDate) {
            var daysToAdd = parseInt(terms) || 0; // Convert terms to number, default to 0 if COD

            var transDateObj = new Date(transDate); // Convert to Date object
            transDateObj.setDate(transDateObj.getDate() + daysToAdd); 

            // Format the date to YYYY-MM-DD
            var dueDateFormatted = transDateObj.toISOString().split("T")[0];

            $("#due_date").val(dueDateFormatted); 
        } else {
            alert("Please select a Transaction Date first.");
            $("#terms").val(""); 
        }
    });
});


const delivery_date_el = $("#delivery_date");
const invoice_date_el = $("#invoice_date");
const invoice_no_el = $("#invoice_no");

const po_no_el = $("#po_no")
const load_no_el = $("#load_no");
const dr_no_el = $("#dr_no");


const customer_el = $("#customer");
const customer_id_el = $("#customer_id");
const category_el = $("#category");
const items_el = $("#items");
const terms_el = $("#terms");
const due_date_el = $("#due_date");
const tax_type_el = $("#tax_type");
const amount_el = $("#amount");




async function getCustomerBalance() {
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
            // Check if data is returned and update input field
            if (custBalance.length > 0) {
                $('#summary-balance').text(
                    custBalance[0].total_balance.toLocaleString('en-US', { 
                        style: 'currency', 
                        currency: 'PHP'
                    })
                );
            } else {
                $('#summary-balance').text('0.00'); // Set to zero if no data
            }
        } else {
            console.error("Failed to fetch customer balance:", response.statusText);
            $('#summary-balance').text('Error');
        }
    } catch (error) {
        console.error("An error occurred:", error);
        $('#summary-balance').text('Error');
    }
}


async function saveNewSale() {

  const delivery_date = delivery_date_el.val();
  const invoice_date = invoice_date_el.val();
  const invoice_no = invoice_no_el.val();
  const po_no = po_no_el.val();
  const load_no = load_no_el.val();
  const dr_no = dr_no_el.val();
  const customer= customer_el.val();
  const customer_id= customer_id_el.val();
  const category = category_el.val();
  const items = items_el.val()
  const terms=terms_el.val();
  const due_date=due_date_el.val();
  const tax_type=tax_type_el.val();
  const amount=amount_el.val();

  if (!delivery_date ||!invoice_date || !customer||!customer_id || !invoice_no||!terms || !due_date||!tax_type || !amount ||!po_no ||!load_no ||!dr_no ||!category) {
    alert("Please fill in all fields.");
    return;
  }

  // Create data object to send to the API
  const saleData = {
    delivery_date: delivery_date,
    invoice_date: invoice_date,
    po_no: po_no,
    load_no: load_no,
    dr_no: dr_no,
    customer: customer ,
    customer_id: customer_id,
    category: category,
    items: items,
    invoice_no: invoice_no,
    terms: terms, 
    due_date: due_date,
    tax_type:tax_type,
    amount:amount,
  };

    // Add new branch (POST)
    $.ajax({
      url: "/api-insert-sales/",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(saleData),
      success: function (response) {
        alert(response?.message|| "Sales Transaction save Succesfully");
        getCustomerBalance();
        // Optionally clear the form
        // $('form#myForm')[0].reset();
        // document.getElementById('delivery_date').value = new Date().toISOString().split('T')[0];
        // document.getElementById('invoice_date').value = new Date().toISOString().split('T')[0];
      },
      error: function (xhr) {
        const errorDetail = xhr.responseJSON?.detail || "An error occurred";
        alert(`Error: ${errorDetail}`);
      },
    });
}

$(document).ready(function () {
  $("#btn_save_branch").click(saveNewSale);
});


$(document).ready(function() {
    $('#tax_type, #amount').on('input change', function() {
        calculateNetofVat();
    });

    calculateNetofVat();
});

function calculateNetofVat() {
    let tax_type = $('#tax_type').val();
    let amount = parseFloat($('#amount').val().replace(/,/g, '')) || 0;

    let net_of_vat = 0;
    let vat = 0;
    const tax_rate = 0.12;
		

console.log(tax_type)
		
if (tax_type === 'Vatable') {
        net_of_vat = amount / 1.12;
        vat = net_of_vat * tax_rate;
}else{
	net_of_vat = amount
  vat = vat
}


    const stringNumberNetOfVat = net_of_vat.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    const stringNumberVat = vat.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

    $('#net_of_vat').val(stringNumberNetOfVat);
    $('#vat').val(stringNumberVat);
}


 document.addEventListener("DOMContentLoaded", function () {
    // Get today's date in YYYY-MM-DD format
    let today = new Date().toISOString().split('T')[0];
    
    // Set the value of the date inputs to today's date
    document.getElementById('delivery_date').value = today;
    document.getElementById('invoice_date').value = today;
});
