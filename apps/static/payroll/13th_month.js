$(document).ready(function () {
    // Initialize autocomplete for the "name" field
    $("#name").autocomplete({
      source: async function (request, response) {
        try {
          const result = await $.ajax({
            url: "/graphql", // Replace with your actual GraphQL endpoint
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              query: `
                query($searchTerm: String!) {
                  employeeAutocomplete(searchTerm: $searchTerm) {
                    Id
                    Company
                    EmployeeID
                    LastName
                    FirstName
                   
                  }
                }
              `,
              variables: { searchTerm: request.term }
            }),
          });

          // Process the result to format the data for jQuery UI Autocomplete
          const employees = result.data.employeeAutocomplete.map((employee) => ({
            label: `${employee.FirstName} ${employee.LastName}`,
            value: employee.FirstName + " " + employee.LastName,
            data: employee
          }));

          response(employees);
        } catch (error) {
          console.error("Error fetching autocomplete data:", error);
        }
      },
      select: function (event, ui) {
        // Fill other form fields with the selected employee's data
        const employee = ui.item.data;
        $("#company").val(employee.Company);
        $("#employee_id").val(employee.EmployeeID);
        $("#last_name").val(employee.LastName);
        $("#first_name").val(employee.FirstName);
       
     
      },
      minLength: 0 // Minimum characters to start search
    });
    
  });



  let isUpdating = false;
  let table_13th_month_list = $("#table_branch_list");
  let month13th_data = [];
  let selectedRecord = null;
  
  // Fetch and display 13th month data
  async function get13thMonthList() {
    try {
      const response = await fetch("/api-list-13thmonth/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        month13th_data = await response.json();
        render13thMonthList();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An error occurred while fetching the 13th month data.");
    }
  }
  
  // Render 13th month data in the table
  function render13thMonthList() {

    const tbody = $("#table_branch_list");
    tbody.empty(); // Clear the table body before appending rows

    table_13th_month_list.empty(); // Clear the table before appending rows
    month13th_data.forEach((data, index) => {
      table_13th_month_list.append(make13thMonthRow(index, data));
    });

            // Initialize DataTable on the table (after rows are appended)
        if ($.fn.DataTable.isDataTable("#table_branch")) {
            $("#table_branch").DataTable().clear().destroy();
        }

        $("#table_branch").DataTable({
            paging: true,
            searching: true,
            ordering: true,
            responsive: true,
            dom: "Bfrtip", // For buttons (copy, csv, excel, pdf)
            buttons: ["copy", "csv", "excel", "pdf"],
            pageLength: 10, // Default number of records per page
            lengthMenu: [10, 25, 50, 100], // Options for number of items per page
        });
  }
  
  // Create a table row for 13th month data
  function make13thMonthRow(index, data) {
    return `
      <tr id="row_${index}" onclick="openToEdit(${index}, 'row_${index}')">
        <td>${index + 1}</td>
        <td>${data.date}</td>
        <td>${data.employee_id}</td>
        <td>${data.last_name}</td>
        <td>${data.first_name}</td>
        <td>${data.amount}</td>
      </tr>`;
  }
  
  // Open a record for editing
  function openToEdit(index, rowId) {
    if (isDoubleClick()) {
      isUpdating = true;
      $("#btn_save_13month").text("Update");
      $("#btn_update_13thmonth").show();
      $("#table_branch_list tr").removeClass("table-primary");
  
      selectedRecord = month13th_data[index];
  
      // Populate form fields with selected record data
      $("#id").val(selectedRecord.id);
      $("#date").val(selectedRecord.date);
      $("#company").val(selectedRecord.company);
      $("#employee_id").val(selectedRecord.employee_id);
      $("#last_name").val(selectedRecord.last_name);
      $("#first_name").val(selectedRecord.first_name);
      $("#amount").val(selectedRecord.amount);
  
      $(`#${rowId}`).addClass("table-primary");
    }
  }
  
  // Handle save or update operation
  async function saveOrUpdate13thMonth() {
    console.log("Save/Update button clicked!");
    const dateInput = $('#date').val();
    const isoDate = new Date(dateInput).toISOString();
    const formData = {

      date: isoDate,
      company: $("#company").val(),
      employee_id: $("#employee_id").val(),
      last_name: $("#last_name").val(),
      first_name: $("#first_name").val(),
      amount: $("#amount").val(),
    };
  
    // Validate form data
    if (Object.values(formData).some((value) => !value)) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      if (isUpdating) {
        id = $("#id").val(); // Include ID for update
        const response = await fetch(`/api-update-13thmonth/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          alert("Record updated successfully.");
          resetForm();
          get13thMonthList();
        } else {
          const error = await response.json();
          alert(`Error: ${error.detail}`);
        }
      } else {
        const response = await fetch("/api-insert-13thmonth/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          alert("Record added successfully.");
          resetForm();
          get13thMonthList();
        } else {
          const error = await response.json();
          alert(`Error: ${error.detail}`);
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An error occurred while saving the record.");
    }
  }
  
  // Reset the form and state
  function resetForm() {
    $("#btn_save_13month").text("Add");
    $("#btn_update_13thmonth").hide();
    $("#id").val("");
    $("#date").val("");
    $("#company").val("");
    $("#employee_id").val("");
    $("#last_name").val("");
    $("#first_name").val("");
    $("#amount").val("");
    isUpdating = false;
    $("#table_branch_list tr").removeClass("table-primary");
  }
  
  // Utility to detect double-click
  let clickTimer = null;
  function isDoubleClick() {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      return true;
    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null;
      }, 250); // Delay for detecting double-click
      return false;
    }
  }
  
  $(document).ready(function () {
    // Initial data fetch
    get13thMonthList();
  
    // Save or update button click handler
    $("#btn_save_13month").click(saveOrUpdate13thMonth);
  
    // Reset button click handler
    $("#btn_update_13thmonth").click(resetForm);
  });



//   $("#table_branch_list").DataTable({
//     paging: true,
//     lengthMenu: [5, 10, 25], // Set page length options
//     searching: true,
//     ordering: true,
//     order: [[1, "asc"]], // Default sorting (by the second column)
//     responsive: true,
//     dom: "Bfrtip",
//     buttons: ["copy", "excel", "csv", "print"],
//   });
  
  