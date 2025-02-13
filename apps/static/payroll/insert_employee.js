// this function is for inserting 

$(document).ready(function() {
    // Handle the "Save changes" button click
    $('#btn_save_employee').click(function() {
        // Collect data from the form
        var data = {
            Company: $("#Company").val(),
            EmployeeID: $("#EmployeeID").val(),
            LastName: $("#LastName").val(),
            FirstName: $("#FirstName").val(),
            MiddleName: $("#MiddleName").val(),
            Position: $("#Position").val(),
            Gender: $("#Gender").val(),
            Salaryrate: $("#Salaryrate").val(),
            TaxCode: $("#TaxCode").val(),
            TIN: $("#TIN").val(),
            SSSN: $("#SSSN").val(),
            PHICN: $("#PHICN").val(),
            HDMFN: $("#HDMFN").val(),   
            Tax: parseFloat($("#Tax").val()) || null,
            SSS: parseFloat($("#SSS").val()) || null,
            PHIC: parseFloat($("#PHIC").val()) || null,
            HDMF: parseFloat($("#HDMF").val()) || null,
            SSSemp: parseFloat($("#SSSemp").val()) || null,
            PHICemp: parseFloat($("#PHICemp").val()) || null,
            HDMFemp: parseFloat($("#HDMFemp").val()) || null,
            Allowance: parseFloat($("#Allowance").val()) || null,
            Date_hired: $("#Date_hired").val() || null,
            id: parseInt($("#id").val()) || null,
        };
        console.log(data.Company)

        // Send the data to the FastAPI endpoint
        $.ajax({
            url: '/api-insert-employee-details/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                alert('Employee saved successfully');
                window.location.href = "/api-payroll-computation/"; // Redirect to the inventory list page
                // Optionally, close the modal
                // $('#insert_employee_modal').modal('hide');
            },
            error: function(xhr, status, error) {
                alert('Failed to save employee: ' + xhr.responseText);
            }
        });
    });
});

// this function is for displaying data from Employee


// $(document).ready(function() {
//     // Fetch data from the API when the document is ready
//     $.ajax({
//         url: '/api-get-employee-list',
//         type: 'GET',
//         success: function(response) {
//             // Clear existing table rows
//             $('#table_employee_list').empty();

//             // Populate table with new data
//             response.forEach(function(item) {
//                 $('#table_employee_list').append(
//                     `<tr>
//                         <td>${item.company}</td>
//                         <td>${item.department}</td>
//                         <td>${item.employee_no}</td>
//                         <td>${item.first_name}</td>
//                         <td>${item.last_name}</td>
//                         <td>${item.designation}</td>
//                         <td>${item.salary_status}</td>
//                         <td>${item.rate}</td>
//                         <td>${item.employee_status}</td>
//                     </tr>`
//                 );
//             });
//         },
//         error: function(xhr, status, error) {
//             console.error('Failed to fetch employee list:', error);
//         }
//     });
// });


$(document).ready(function() {
    // Function to fetch and display job orders

    // var table = $('#table_job_order').DataTable();
    function fetchAndDisplayEmployeeList() {
        $.ajax({
            url: '/employee-list/',  // API endpoint
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                var tableBody = $('#table_employee_list');
                tableBody.empty();  // Clear existing table rows
                
                // Iterate over each item in the data
                data.forEach(function(item) {
                    // Create a new row
                    var newRow = $('<tr></tr>');

                    // Append cells to the row
                    newRow.append('<td>' + item.Company + '</td>');
                    newRow.append('<td>' + item.EmployeeID + '</td>');
                    newRow.append('<td>' + item.LastName + '</td>');
                    newRow.append('<td>' + item.FirstName + '</td>');
                    newRow.append('<td>' + item.Gender + '</td>');
                    newRow.append('<td>' + formatNumberWithSeparator(item.Salaryrate) + '</td>');
                    newRow.append('<td>' + item.TaxCode + '</td>');
                    newRow.append('<td><a href="/api-update-employee-temp/' + item.id + '"> \
                        <button type="button" class="btn btn-primary"> \
                        <i class="fas fa-database"></i> Edit</button></a></td>');

                    // Append the new row to the table body
                    tableBody.append(newRow);
                    
                    // Apply red color if jo_turn_overtime is empty
                    // if (!item.company) {
                    //     newRow.css('background-color', 'green');
                    // }

                   
                });
                initializeDataTable()
            },
            error: function(xhr, status, error) {
                console.error('Error fetching job orders:', error);
                alert('Error  Please try again later.');
            }
        });
    }

    // Fetch employee list on page load
    fetchAndDisplayEmployeeList();
});


const initializeDataTable = () => {
    // $('#table_employeeList').DataTable();
    new DataTable('#table_employeeList', {
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


// Function to format number with thousand separator
function formatNumberWithSeparator(value) {
    return parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}



// jQuery.noConflict();
// jQuery(document).ready(function() {
//     // Set up autocomplete for the company input field
//     $('#Company').autocomplete({
//         source: function(request, response) {
//             $.ajax({
//                 url: '/graphql',  
//                 type: 'POST',
//                 contentType: 'application/json',
//                 data: JSON.stringify({
//                     query: `
//                         query {
//                             companyAutocomplete(searchTerm: "${request.term}") {
//                                 CompanyName
//                                 Address
//                             }
//                         }
//                     `
//                 }),
//                 success: function(data) {
//                     // Extract company names from the GraphQL response
//                     const companyNames = data.data.companyAutocomplete.map(company => {
//                         return {
//                             label: company.CompanyName,  // Displayed in the autocomplete dropdown
//                             value: company.CompanyName   // Value to be filled in the input field
//                         };
//                     });
//                     response(companyNames); // Provide the suggestions to the autocomplete
//                 },
//                 error: function(error) {
//                     console.log("Error fetching company data: ", error);
//                 }
//             });
//         },
//         minLength: 0,  // Minimum characters before triggering autocomplete
//         select: function(event, ui) {
//             // You can handle the selection event here (e.g., auto-filling other fields)
//             console.log("Selected Company: ", ui.item.value);
//         }
//     });
// });


jQuery.noConflict();
jQuery(document).ready(function($) {
    $('#Company').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/graphql',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    query: `
                        query {
                            companyAutocomplete(searchTerm: "${request.term}") {
                                CompanyName
                                Address
                            }
                        }
                    `
                }),
                success: function(data) {
                    const companyNames = data.data.companyAutocomplete.map(company => ({
                        label: company.CompanyName,
                        value: company.CompanyName
                    }));
                    response(companyNames);
                },
                error: function(error) {
                    console.error("Error fetching company data: ", error);
                }
            });
        },
        minLength: 0,
        select: function(event, ui) {
            console.log("Selected Company: ", ui.item.value);
        }
    });
});





