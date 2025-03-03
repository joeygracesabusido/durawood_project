getCustomer();
let isUpdating = false;
let customer_list = {};
let selectedCustomer = null;
let clickTimer = null;
let customer_vendor_id ="";
let bussiness_name = "";
let contact_no = "";
let contact_person = "";
let address = "";
let category = "";
let tax_type = "Vatable";
let description = "Customer";
let table_customer_list = $("#table_customer_list");

const customer_vendor_id_el = $("#customer_vendor_id");
const bussiness_name_el = $("#bussiness_name");
const contact_no_el = $("#contact_no");
const contact_person_el = $("#contact_person");
const category_el = $("#category");
const address_el = $("#address");
const tax_type_el = $("#tax_type");
const description_el = $("#description");



async function getCustomer() {
  try {
    const response = await fetch(`/api-get-customer-profiles/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    

    if (response.ok) {
      customer_list = await response.json();
      table_customer_list.empty(); // Clear the table before appending rows
      let i = 0;
      customer_list.forEach((element) => {
        console.log(element);
        table_customer_list.append(makeBranchRow(i++, element));
      });
    } else {
      const error = await response.json();
      alert(`Error: ${error.detail}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    
  }
}

function makeBranchRow(index, data) {
  return `<tr id1='${"customer_row_" + index}' onClick="openToEdit(${index},'${
    "customer_row_" + index
  }')">
   
  <td>${data.bussiness_name}</td>
  <td>${data.category}</td>
  <td>${data.tax_type}</td>
  <td>${data.description}</td>
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
    $("#table_customer_list tr").removeClass("table-primary");
    //console.log(`#${customer_row_id}`);
    // Load selected branch data into form fields
    let data = customer_list[index];

    customer_vendor_id_el.val(data.customer_vendor_id);
    bussiness_name_el.val(data.bussiness_name);
    contact_no_el.val(data.contact_no);
    contact_person_el.val(data.contact_person);
    category_el.val(data.category);
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
  const contact_no= contact_no_el.val();
  const contact_person= contact_person_el.val(); 
  const category=category_el.val();
  const address=address_el.val();
  const tax_type=tax_type_el.val();
  const description=description_el.val();

  console.log(customer_vendor_id,bussiness_name,contact_no,
                contact_person,category,address,tax_type,description)
  // Validate inputs
  if (!bussiness_name || !contact_no||!contact_person || !category||!address || !tax_type||!description || !customer_vendor_id) {
    alert("Please fill in all fields.");
    return;
  }

  // Create data object to send to the API
  const customerData = {
    customer_vendor_id: customer_vendor_id,
    bussiness_name: bussiness_name,
    contact_no: contact_no,
    contact_person: contact_person, 
    category:category,
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
       
        getCustomer();  // Refresh branch list

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
        getCustomer();  // Refresh branch list
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
  getCustomer();

  // // Handle save (add or update) button click
  $("#btn_save_branch").click(saveOrUpdateCustomer);

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






