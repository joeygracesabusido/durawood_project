// getBranch();
// let isUpdating = false;
// let table_branch_list = $("#table_branch_list");
// let branch_list = {};
// let selectedBranch = null;

// async function getBranch() {
//   try {
//     // Send PUT request to update the company profile
//     const response = await fetch(`/api-get-branches-list/`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (response.ok) {
//       branch_list = await response.json();
//       i = 0;
//       branch_list.forEach((element) => {
//         console.log(element);

//         table_branch_list.append(makeBranchRow(i++, element));
//       });
//     } else {
//       const error = await response.json();
//       alert(`Error: ${error.detail}`); // Show error message
//     }
//   } catch (error) {
//     console.error("An error occurred:", error);
//     alert("An error occurred while updating the profile.");
//   }
// }

// function openToEdit(index, branch_row_id) {
//   if (isDoubleClick() === true) {
//     isUpdating = true;
//     $("#btn_save_branch").text('Update')
//     $("#table_branch tr").removeClass("table-primary");
//     $(`#btn_update_branch`).css('display', 'inline-block');
//     console.log(`#${branch_row_id}`);
//     // console.log(branch_list[index])
//     data = branch_list[index];
//     $("#branchName").val(data.branch_name);
//     $("#branchAddress").val(data.address);
//     $("#id").val(data.id);
//     $(`#${branch_row_id}`).addClass("table-primary");
//   }
// }

// function makeBranchRow(index, data) {
//   return `<tr id='${"branch_row_" + index}' onClick="openToEdit(${index},'${
//     "branch_row_" + index
//   }')">
//             <td>${data.id}</td>
//             <td>${data.branch_name}</td>
//             <td>${data.address}</td>
//           </tr>`;
// }

// let clickTimer = null;
// function isDoubleClick() {
//   if (clickTimer) {
//     clearTimeout(clickTimer);
//     clickTimer = null;
//     return true;
//   } else {
//     clickTimer = setTimeout(() => {
//       clickTimer = null;
//     }, 250); // Delay to detect double-click
//     return false;
//   }
// }

// async function updateBranch(data){
//   branch = {

//   };
//   const response = await fetch(`/api-update-company_profile/?profile_id=${profile_id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(branch),
//   });
// }

// $(document).ready(function () {
//   $("#btn_update_branch").click(function () {
//     $("#btn_update_branch").css('display', 'none');
//     $("#btn_save_branch").text('Add')
//     $("#table_branch tr").removeClass("table-primary");
//     $("#branchName").val('');
//     $("#branchAddress").val('');
//     isUpdating=false;
//   })
//   // Attach click event to the Add button
//   $("#btn_save_branch").click(function () {
//     // Get values from input fields
//     const branchName = $("#branchName").val();
//     const branchAddress = $("#branchAddress").val();

//     // Validate inputs
//     if (!branchName || !branchAddress) {
//       alert("Please fill in all fields.");
//       return;
//     }

//     // Create data object to send to the API
//     const branchData = {
//       branch_name: branchName,
//       address: branchAddress,
//       user: "current_user", // Replace with the actual user if needed
//     };

//     if ((isUpdating = false)) {
//       // Send AJAX request to insert branch data
//       $.ajax({
//         url: "/api-insert-branches/", // Adjust the URL if necessary
//         type: "POST",
//         contentType: "application/json",
//         data: JSON.stringify(branchData),
//         success: function (response) {
//           // Handle success response
//           alert(response.message);
//           // Optionally, reset the form fields
//           $("#branchForm")[0].reset();
//         },
//         error: function (xhr) {
//           // Handle error response
//           const errorDetail = xhr.responseJSON?.detail || "An error occurred";
//           alert(`Error: ${errorDetail}`);
//         },
//       });
//     }else{

//     }
//   });
// });

let isUpdating = false;
let table_branch_list = $("#table_branch_list");
let branch_list = {};
let selectedBranch = null;

async function getBranch() {
  try {
    const response = await fetch(`/api-get-branches-list/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      branch_list = await response.json();
      table_branch_list.empty();  // Clear the table before appending rows
      let i = 0;
      branch_list.forEach((element) => {
        console.log(element);
        table_branch_list.append(makeBranchRow(i++, element));
      });
    } else {
      const error = await response.json();
      alert(`Error: ${error.detail}`);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    alert("An error occurred while fetching the branches.");
  }
}

function openToEdit(index, branch_row_id) {
  if (isDoubleClick() === true) {
    isUpdating = true;
    $("#btn_save_branch").text('Update');
    $("#table_branch_list tr").removeClass("table-primary");
    console.log(`#${branch_row_id}`);
    
    // Load selected branch data into form fields
    let data = branch_list[index];
    $("#branchName").val(data.branch_name);
    $("#branchAddress").val(data.address);
    $("#id").val(data.id);
    $(`#${branch_row_id}`).addClass("table-primary");
    
  }
}

function makeBranchRow(index, data) {
  return `<tr id='${"branch_row_" + index}' onClick="openToEdit(${index},'${
    "branch_row_" + index
  }')">
            <td>${data.id}</td>
            <td>${data.branch_name}</td>
            <td>${data.address}</td>
          </tr>`;
}

let clickTimer = null;
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

async function saveOrUpdateBranch() {
  const branchName = $("#branchName").val();
  const branchAddress = $("#branchAddress").val();
  
  // Validate inputs
  if (!branchName || !branchAddress) {
    alert("Please fill in all fields.");
    return;
  }

  // Create data object to send to the API
  const branchData = {
    branch_name: branchName,
    address: branchAddress,
    user: "current_user", // Replace with actual user if needed
  };

  if (!isUpdating) {
    // Add new branch (POST)
    $.ajax({
      url: "/api-insert-branches/",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(branchData),
      success: function (response) {
        alert(response.message);
        window.location.href = "/branch/";
        $("#branchForm")[0].reset(); // Reset the form fields
       
        getBranch();  // Refresh branch list

      },
      error: function (xhr) {
        const errorDetail = xhr.responseJSON?.detail || "An error occurred";
        alert(`Error: ${errorDetail}`);
      },
    });
  } else {
    // Update existing branch (PUT)
    branchData.id = $("#id").val();  // Get the ID of the branch being updated
    $.ajax({
      url: `/api-update-branch/${branchData.id}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(branchData),
      success: function (response) {
        alert(response.message);
        window.location.href = "/branch/";
        $("#branchForm")[0].reset(); // Reset the form fields
        isUpdating = false;
        $("#btn_save_branch").text('Add');
        getBranch();  // Refresh branch list
      },
      error: function (xhr) {
        const errorDetail = xhr.responseJSON?.detail || "An error occurred";
        alert(`Error: ${errorDetail}`);
      },
    });
  }
}

function resetForm() {
  $("#btn_save_branch").text('Add');
  $("#branchName").val('');
  $("#branchAddress").val('');
  $("#id").val('');
  isUpdating = false;
  $("#table_branch_list tr").removeClass("table-primary");
}

$(document).ready(function () {
  // Initial fetch of branch data
  getBranch();

  // Handle save (add or update) button click
  $("#btn_save_branch").click(saveOrUpdateBranch);

  // Handle reset button click (to cancel update and reset form)
  $("#btn_update_branch").click(resetForm);
});

