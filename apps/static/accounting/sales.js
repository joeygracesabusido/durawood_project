
// Use jQuery in noConflict mode
jQuery.noConflict();

jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "branch_name"
    $(document).on('focus', '#customer', function() {
        $("#customer").autocomplete({
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
                $("#customer").val(ui.item.value);
                // Set the related field based on the selected item
                $("#customer_id").val(ui.item.customer_vendor_id);

                return false; // Prevent the default select action
            }
        });
    });
});

$(document).ready(function() {
    $("#terms").on("change", function() {
        var transDate = $("#trans_date").val(); // Get the transaction date
        var terms = $(this).val(); // Get the selected term

        if (transDate) {
            var daysToAdd = parseInt(terms) || 0; // Convert terms to number, default to 0 if COD

            var transDateObj = new Date(transDate); // Convert to Date object
            transDateObj.setDate(transDateObj.getDate() + daysToAdd); // Add days

            // Format the date to YYYY-MM-DD
            var dueDateFormatted = transDateObj.toISOString().split("T")[0];

            $("#due_date").val(dueDateFormatted); // Set the due date in input field
        } else {
            alert("Please select a Transaction Date first.");
            $("#terms").val(""); // Reset the select field if no trans_date is selected
        }
    });
});

//this function is for inserting Data and isUpdating
//

getSales();
let isUpdating = false;
let sales_list = {};
let selectedCustomer = null;
let clickTimer = null;
let trans_date ="";
let customer = "";
let customer_id = "";
let invoice_no = "";
let terms = "";
let due_date = "";
let tax_type = "Vatable";
let amount = "";
let table_sales_list = $("#table_sales_list");

const trans_date_el = $("#trans_date");
const customer_el = $("#customer");
const customer_id_el = $("customer_id");
const invoice_no_el = $("#invoice_no");
const terms_el = $("#terms");
const due_date_el = $("#due_date");
const tax_type_el = $("#tax_type");
const amount_el = $("#amount");



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
      table_sales_list.empty(); // Clear the table before appending rows
      let i = 0;
      sales_list.forEach((element) => {
        console.log(element);
        table_sales_list.append(makeBranchRow(i++, element));
      });
    } else {
      const error = await response.json();
      alert(`Error: ${error.detail}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    alert("An error occurred while fetching the customers.");
  }
}

function makeBranchRow(index, data) {
  return `<tr id1='${"customer_row_" + index}' onClick="openToEdit(${index},'${
    "customer_row_" + index
  }')">
  <td>${data.id}</td>
  <td>${data.trans_date}</td>
  <td>${data.customer}</td>
  <td>${data.custome_id}</td>
  <td>${data.invoice_no}</td>
  <td>${data.terms}</td>
  <td>${data.due_date}</td>
  <td>${data.tax_type}</td>
  <td>${data.amount}</td>
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
    $("#table_sales_list tr").removeClass("table-primary");
    //console.log(`#${customer_row_id}`);
    // Load selected branch data into form fields
    let data = sales_list[index];

    trans_date_el.val(data.trans_date);
    customer_el.val(data.customer);
    name_of_tax_payer_el.val(data.name_of_tax_payer);
    tin_el.val(data.tin);
    rdo_el.val(data.rdo);
    address_el.val(data.address);
    tax_type_el.val(data.tax_type);
    description_el.val(data.description);
    selectedCustomer = data;
    
    $(`#${customer_row_id}`).addClass("table-primary");
  }
}

async function saveOrUpdateCustomer() {
  // const branchName = $("#branchName").val();
  // const branchAddress = $("#branchAddress").val();
  const customer_vendor_id = customer_vendor_id_el.val();
  const bussiness_name= bussiness_name_el.val();
  const name_of_tax_payer= name_of_tax_payer_el.val();
  const tin= tin_el.val(); // Replace with actual user if needed
  const  rdo=rdo_el.val();
  const address=address_el.val();
  const tax_type=tax_type_el.val();
  const description=description_el.val();

  console.log(customer_vendor_id,bussiness_name,name_of_tax_payer,
                tin,rdo,address,tax_type,description)
  // Validate inputs
  if (!bussiness_name || !name_of_tax_payer||!tin || !rdo||!address || !tax_type||!description || !customer_vendor_id) {
    alert("Please fill in all fields.");
    return;
  }

  // Create data object to send to the API
  const customerData = {
    customer_vendor_id: customer_vendor_id,
    bussiness_name: bussiness_name,
    name_of_tax_payer: name_of_tax_payer,
    tin: tin, // Replace with actual user if needed
    rdo:rdo,
    address:address,
    tax_type:tax_type,
    description:description,
  };

  if (!isUpdating) {
    // Add new branch (POST)
    $.ajax({
      url: "/api-insert-customer_profile/",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(customerData),
      success: function (response) {
        alert(response?.message|| "Customer save Succesfully");
        window.location.href = "/customer_profile/";
       
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
      url: `/api-update-customer-profile/?profile_id=${customerData.id}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(customerData),
      success: function (response) {
        alert(response.message);
        window.location.href = "/customer_profile/";
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
