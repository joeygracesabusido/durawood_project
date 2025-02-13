getCustomer();
let isUpdating = false;
let customer_list = {};
let selectedCustomer = null;
let clickTimer = null;
let bussiness_name = "";
let name_of_tax_payer = "";
let tin = "";
let rdo = "";
let address = "";
let tax_type = "Vatable";
let description = "Customer";
let table_customer_list = $("#table_customer_list");

const bussiness_name_el = $("#bussiness_name");
const name_of_tax_payer_el = $("#name_of_tax_payer");
const tin_el = $("#tin");
const rdo_el = $("#rdo");
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
    alert("An error occurred while fetching the customers.");
  }
}

function makeBranchRow(index, data) {
  return `<tr id='${"customer_row_" + index}' onClick="openToEdit(${index},'${
    "customer_row_" + index
  }')">
  <td>${data.id}</td>
  <td>${data.bussiness_name}</td>
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
    console.log(`#${customer_row_id}`);
    // Load selected branch data into form fields
    let data = customer_list[index];
    bussiness_name_el.val(data.bussiness_name);
    name_of_tax_payer_el.val(data.name_of_tax_payer);
    tin_el.val(data.tin);
    rdo_el.val(data.rdo);
    address_el.val(data.address);
    tax_type_el.val(data.tax_type);
    description_el.val(data.description);
    selectedCustomer = data;
    console.log(selectedCustomer.id);
    $(`#${customer_row_id}`).addClass("table-primary");
  }
}

async function saveOrUpdateCustomer() {
  // const branchName = $("#branchName").val();
  // const branchAddress = $("#branchAddress").val();
  const bussiness_name= bussiness_name_el.val();
  const name_of_tax_payer= name_of_tax_payer_el.val();
  const tin= tin_el.val(); // Replace with actual user if needed
  const  rdo=rdo_el.val();
  const address=address_el.val();
  const tax_type=tax_type_el.val();
  const description=description_el.val();
  // Validate inputs
  if (!bussiness_name || !name_of_tax_payer||!tin || !rdo||!address || !tax_type||!description ) {
    alert("Please fill in all fields.");
    return;
  }

  // Create data object to send to the API
  const customerData = {
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
        alert(response.message);
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
