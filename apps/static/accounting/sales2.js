
// Use jQuery in noConflict mode
jQuery.noConflict();

jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "branch_name"
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
                        // Optionally, provide user feedback about the error
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

// Use jQuery in noConflict mode
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

//this function is for inserting Data and isUpdating


getSales();
let isUpdating = false;
let sales_list = {};
let selectedCustomer = null;
let clickTimer = null;
let delivery_date = ""
let invoice_date ="";
let invoice_no = "";
let po_no = "";
let load_no = "";
let dr_no = "";
let customer = "";
let customer_id = "";
let category = "";
let items = "";
let terms = "";
let due_date = "";
let tax_type = "Vatable";
let amount = "";
let table_sales_list = $("#table_sales tbody");

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





async function getSales() {
  try {
    const response = await fetch(`/api-get-sales/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    

    if (response.ok) {
      sales_list = await response.json();

			sales_list.sort((a, b) => new Date(b.date_updated) - new Date(a.date_updated));



      table_sales_list.empty(); // Clear the table before appending rows
      let i = 0;
      sales_list.forEach((element) => {
        console.log(element);
        table_sales_list.append(makeBranchRow(i++, element));
      });

			initializeDataTable()
    } else {
      const error = await response.json();

      alert(`Error: ${error.detail}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    
  }
}


 function formatDate(value) {



		const date = new Date(value);

				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits
				const day = String(date.getDate()).padStart(2, '0'); // Ensure 2 digits
				
				// Format time to HH:MM AM/PM
				// const time = date.toLocaleTimeString('en-US', {
				// 		hour: '2-digit',
				// 		minute: '2-digit',
				// 		hour12: false,
				// });
        

        let hour = date.getHours();
        const minute = String(date.getMinutes() + 1).padStart(2, '0');
        const period = hour >= 12 ? 'PM' : 'AM';

        hour = hour % 12 || 12;

				return `${year}-${month}-${day} ${hour}:${minute}`;

};




function makeBranchRow(index, data) {
  return `<tr id1='${"customer_row_" + index}' onClick="openToEdit(${index},'${
    "customer_row_" + index
  }')">
  
  <td>${data.delivery_date.split("T")[0]}</td>
  <td>${data.invoice_date}</td>
  <td>${data.invoice_no}</td>
  <td>${data.dr_no}</td>
  <td>${data.load_no}</td>
  <td>${data.po_no}</td>
  <td>${data.customer}</td>
  <td>${data.category}</td>
  <td>${data.items}</td>
  <td>${data.terms}</td>
  <td>${data.due_date}</td>
  <td>${data.tax_type}</td>
  <td>${data.amount}</td>
 <td>${formatDate(data.date_created)}</td>
 <td>${formatDate(data.date_updated)}</td>
 <td>${data.user}</td>

</tr>`;
    
}

function isDoubleClick() {
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    return true;
  } else {
    clickTimer = setTimeout(() => {
      clickTimer = null;
    }, 250); // Delay to detect double-click
    return false;
  }
}


function openToEdit(index, customer_row_id) {
  if (isDoubleClick() === true) {
    isUpdating = true;
    $("#btn_save_branch").text("Update");
    $("#table_sales tr").removeClass("table-primary");
    //console.log(`#${customer_row_id}`);
    // Load selected branch data into form fields
    let data = sales_list[index];

    delivery_date_el.val(data.delivery_date);
    invoice_date_el.val(data.invoice_date);
    invoice_no_el.val(data.invoice_no);
    po_no_el.val(data.po_no);
    load_no_el.val(data.load_no);
    dr_no_el.val(data.dr_no)
    customer_el.val(data.customer);
    customer_id_el.val(data.customer_id);
    category_el.val(data.category);
    items_el.val(data.items);
    invoice_no_el.val(data.invoice_no);
    terms_el.val(data.terms);
    due_date_el.val(data.due_date);
    tax_type_el.val(data.tax_type);
    amount_el.val(data.amount);
    selectedCustomer = data;
    
    $(`#${customer_row_id}`).addClass("table-primary");
  }
}

async function saveOrUpdateCustomer() {
  // const branchName = $("#branchName").val();
  // const branchAddress = $("#branchAddress").val();
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

  // console.log(delivery_date,invoice_date,customer,customer_id,
  //               invoice_no,due_date,tax_type,amount,po_no,load_no,dr_no)
  // // Validate inputs
  if (!delivery_date ||!invoice_date || !customer||!customer_id || !invoice_no||!terms || !due_date||!tax_type || !amount ||!po_no ||!load_no ||!dr_no ||!category) {
    alert("Please fill in all fields.");
    return;
  }

  // Create data object to send to the API
  const customerData = {
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
    terms: terms, // Replace with actual user if needed
    due_date: due_date,
    tax_type:tax_type,
    amount:amount,
  };

  if (!isUpdating) {
    // Add new branch (POST)
    $.ajax({
      url: "/api-insert-sales/",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(customerData),
      success: function (response) {
        alert(response?.message|| "Sales Transaction save Succesfully");

				getCustomerBalance();
        // window.location.href = "/sales/";
       
        getSales();  // Refresh branch list

      },
      error: function (xhr) {
        const errorDetail = xhr.responseJSON?.detail || "An error occurred";
        alert(`Error: ${errorDetail}`);
      },
    });
  } else {
    // Update existing branch (PUT)
    customerData.id = selectedCustomer.id;  // Get the ID of the branch being updated
    
    $.ajax({
      url: `/api-update-sales/?profile_id=${customerData.id}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(customerData),
      success: function (response) {
alert(response.message);

        window.location.href = "/sales/";
        isUpdating = false;
        $("#btn_save_branch").text('Add');
        getSales();  // Refresh branch list
      },
      error: function (xhr) {
        const errorDetail = xhr.responseJSON?.detail || "An error occurred";
        alert(`Error: ${errorDetail}`);
      },
    });
  }
}

$(document).ready(function () {
  // Initial fetch of branch data
  getSales();

  // // Handle save (add or update) button click
  $("#btn_save_branch").click(saveOrUpdateCustomer);

});



// this is for DataTable
const initializeDataTable = () => {

    new DataTable('#table_sales', {
        layout: {
            topStart: 'buttons'
        },
        buttons: ['copy',  {
            extend: 'csv',
            filename: 'Sales Transasction', // Cust wom name for the exported CSV file
            title: 'Sales Transaction' // Optional: Title for the CSV file's content
        }],
        perPage: 10,
        searchable: true,
        sortable: true,

        responsive: true,
        scrollX: true,          // Enable horizontal scrolling if needed
        autoWidth: false,       // Disable fixed width
        scrollY: '450px',       // Set a specific height
        scrollCollapse: true,
        destroy: true // Destroy any existing DataTable instance


    });

    };


$(document).ready(function() {
    $('#tax_type, #amount').on('input change', function() {
        calculateNetofVat();
    });

    calculateNetofVat();  // Calculate right away on load if fields have values
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
