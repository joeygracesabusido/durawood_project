$(document).ready(function() {
    // Function to fetch and display journal entries
    
    
    function loadChartofAccounts() {
        $.ajax({
            url: '/api-get-chart-of-accounts2/',
            method: 'GET',
            success: function(data) {
                let rows = '';

                // Loop through the data and create table rows
                data.forEach(function(entry) {
                    rows += `
                        <tr>
                            <td>${entry.chart_of_account_code}</td>
                            <td>${entry.account_type}</td>
                            
                            <td>${entry.chart_of_account}</td>  
                            <td>${entry.id}</td>                        
                         
                   </tr>
                    `;
                });

                // Append rows to the table body
                $('#table_chart_of_account_list').html(rows);
                initializeDataTable()
            },
            
            error: function(xhr, status, error) {
                console.error('Error fetching journal entries:', error);
            }
        });
    }

    // Load journal entries when the page is loaded
    loadChartofAccounts();
});

// this is for DataTable
const initializeDataTable = () => {

    new DataTable('#table_chart_of_account', {
        layout: {
            topStart: 'buttons'
        },
        buttons: ['copy',  {
            extend: 'csv',
            filename: 'Chart of Account', // Cust wom name for the exported CSV file
            title: 'Chart of Account' // Optional: Title for the CSV file's content
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




    jQuery.noConflict();
    jQuery(document).ready(function($) {
        // Autocomplete for the account type input
        $("#accoun_type").autocomplete({
            source: function(request, response) {
                $.ajax({
                    url: "/api-autocomplete-account-type/",  // Replace with your FastAPI endpoint
                    dataType: "json",
                    data: {
                        term: request.term // Pass the term as a query parameter
                    },
                    success: function(data) {
                        console.log("Autocomplete data:", data); // Debugging line to see data in console
                        // Map the response data to the format expected by jQuery UI autocomplete
                        response(data.map(function(item) {
                            return {
                                label: item.value, // Ensure the correct label is set
                                value: item.value, // Ensure the correct value is set
                                id: item.id
                            };
                        }));
                    },
                    error: function(err) {
                        console.error("Error fetching autocomplete data:", err);
                    }
                });
            },
            minLength: 0, // Minimum length of input before triggering autocomplete
            select: function(event, ui) {
                // Set the selected item values in the appropriate fields
                $("#accoun_type").val(ui.item.value); // Set the display value
                $("#account_type_id").val(ui.item.id); // Set the hidden value
                return false; // Prevent the default action
            }
        });
    });


    jQuery.noConflict();
    jQuery(document).ready(function($) {
        // Handle the click event for the "Save changes" button
        $('#btn_save_chart_of_account').on('click', function() {
            // Gather form data
            const data = {
                chart_of_account_code: $('#chart_of_account_code').val(),
                chart_of_account: $('#chart_of_account').val(),
                account_type: $('#accoun_type').val(),
                accoun_type_id: $('#account_type_id').val(),
                description: $('#description').val()
            };

            console.log(data)

            // Send the data to the FastAPI endpoint
            $.ajax({
                url: '/api-insert-chart-of-account/', // FastAPI endpoint
                type: 'POST',
                contentType: 'application/json', // Specify JSON content type
                data: JSON.stringify(data), // Convert data to JSON
                success: function(response) {
                    // Display success message or perform further actions
                    alert(response.message);
                    $('#insert_chart_of_account').modal('hide'); // Hide the modal
                    location.reload(); // Reload the page or update the UI as needed
                },
                error: function(xhr, status, error) {
                    // Handle any errors that occurred during the request
                    alert('Error: ' + xhr.responseText);
                    console.error('Error details:', xhr);
                }
            });
        });
    });


    jQuery.noConflict();
    jQuery(document).ready(function($) {
        // Handle the click event for the "Save changes" button
        $('#btn_save_type_of_account').on('click', function() {
            // Gather form data
            const data = {
                account_type: $('#account_type_ins').val(),
                
            };

            // Send the data to the FastAPI endpoint
            $.ajax({
                url: '/api-insert-account-type/', // FastAPI endpoint
                type: 'POST',
                contentType: 'application/json', // Specify JSON content type
                data: JSON.stringify(data), // Convert data to JSON
                success: function(response) {
                    // Display success message or perform further actions
                    alert(response.message);
                    $('#insert_account_type').modal('hide'); // Hide the modal
                    location.reload(); // Reload the page or update the UI as needed
                },
                error: function(xhr, status, error) {
                    // Handle any errors that occurred during the request
                    alert('Error: ' + xhr.responseText);
                    console.error('Error details:', xhr);
                }
            });
        });
    });
  


    // $(document).ready(function () {
    //     // File upload handling
    //     $('#btn_upload_file').on('click', function () {
    //         const fileInput = $('#file_upload')[0].files[0]; // Get the file
    
    //         if (!fileInput) {
    //             alert("Please select a file first.");
    //             return;
    //         }
    
    //         const reader = new FileReader();
    
    //         // Process the file once it is read
    //         reader.onload = function (e) {
    //             const data = new Uint8Array(e.target.result);
    //             const workbook = XLSX.read(data, { type: 'array' });
    
    //             // Get the first sheet
    //             const firstSheetName = workbook.SheetNames[0];
    //             const worksheet = workbook.Sheets[firstSheetName];
    
    //             // Convert the sheet data to JSON (array format)
    //             const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
             
    //             // Display the parsed data in the modal
    //             let htmlContent = "<table class='table table-bordered'>";
    //             jsonData.forEach(row => {
    //                 htmlContent += "<tr>";
    //                 row.forEach(cell => {
    //                     htmlContent += `<td>${cell}</td>`;
    //                 });
    //                 htmlContent += "</tr>";
    //             });
    //             htmlContent += "</table>";
    
    //             // Update the modal content
    //             $('#parsed_data').html(htmlContent);
    //         };
    
    //         reader.onerror = function (error) {
    //             console.error("Error reading file:", error);
    //             alert("Failed to read the file. Please try again.");
    //         };
    
    //         // Read the file as a binary string
    //         reader.readAsArrayBuffer(fileInput);
    //     });
    // });


    // $(document).ready(function () {
    //     // File upload and data insertion
    //     $('#btn_upload_file').on('click', function () {
    //         const fileInput = $('#file_upload')[0].files[0]; // Get the file
    
    //         if (!fileInput) {
    //             alert("Please select a file first.");
    //             return;
    //         }
    
    //         const reader = new FileReader();
    
    //         // Process the file once it is read
    //         reader.onload = function (e) {
    //             const data = new Uint8Array(e.target.result);
    //             const workbook = XLSX.read(data, { type: 'array' });
    
    //             // Get the first sheet
    //             const firstSheetName = workbook.SheetNames[0];
    //             const worksheet = workbook.Sheets[firstSheetName];
    
    //             // Convert the sheet data to JSON (array format)
    //             const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    //             // Display the parsed data in the modal (Optional)
    //             let htmlContent = "<table class='table table-bordered'>";
    //             jsonData.forEach(row => {
    //                 htmlContent += "<tr>";
    //                 row.forEach(cell => {
    //                     htmlContent += `<td>${cell}</td>`;
    //                 });
    //                 htmlContent += "</tr>";
    //             });
    //             htmlContent += "</table>";
    //             $('#parsed_data').html(htmlContent);
    
    //             // Insert the data into the database
    //             const apiUrl = '/api-insert-chart-of-account/';
    //             jsonData.forEach((row, index) => {
    //                 // Skip the header row
    //                 if (index === 0) return;
    
    //                 // Map the row to match your BaseModel fields
    //                 const payload = {
    //                     accoun_type_id: row[0],
    //                     chart_of_account_code: String(row[1]), // Assuming column 1 is the code
    //                     chart_of_account: row[2],     // Assuming column 2 is the name
                             
    //                     description: String(row[3])         // Assuming column 4 is the description
    //                     // user: row[4],                 // Assuming column 5 is the user
    //                     // date_updated: new Date().toISOString(), // Add the current date
    //                     // date_created: new Date().toISOString()  // Add the current date
    //                 };
    
    //                 // Make an AJAX POST request
    //                 $.ajax({
    //                     url: apiUrl,
    //                     type: 'POST',
    //                     contentType: 'application/json',
    //                     data: JSON.stringify(payload),
    //                     success: function (response) {
    //                         console.log(`Row ${index} inserted successfully:`, response.message);
    //                     },
    //                     error: function (xhr) {
    //                         console.error(`Error inserting row ${index}:`, xhr.responseText);
    //                     }
    //                 });
    //             });
    
    //             alert("Data upload started. Check the console for progress.");
    //         };
    
    //         reader.onerror = function (error) {
    //             console.error("Error reading file:", error);
    //             alert("Failed to read the file. Please try again.");
    //         };
    
    //         // Read the file as a binary string
    //         reader.readAsArrayBuffer(fileInput);
    //     });
    // });




    // this function is for importing from csv file to insert into database

    $(document).ready(function () {
        $('#btn_upload_file').on('click', function () {
            const fileInput = $('#file_upload')[0].files[0]; // Get the file
    
            if (!fileInput) {
                alert("Please select a file first.");
                return;
            }
    
            const reader = new FileReader();
    
            reader.onload = function (e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
    
                // Get the first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
    
                // Convert the sheet data to JSON (array format)
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
                // Get the total rows for progress calculation
                const totalRows = jsonData.length - 1; // Exclude header row
                if (totalRows <= 0) {
                    alert("No data found in the file.");
                    return;
                }
    
                let completedRows = 0;
    
                // Insert the data into the database
                const apiUrl = '/api-insert-chart-of-account/';
    
                jsonData.forEach((row, index) => {
                    // Skip the header row
                    if (index === 0) return;
    
                    // Map the row to match your BaseModel fields
                    const payload = {
                        accoun_type_id: row[0],
                        chart_of_account_code: String(row[1]), // Assuming column 1 is the code
                        chart_of_account: row[2],              // Assuming column 2 is the name
                        description: String(row[3])            // Assuming column 4 is the description
                    };
    
                    // Make an AJAX POST request
                    $.ajax({
                        url: apiUrl,
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(payload),
                        success: function () {
                            completedRows++;
                            updateProgress(completedRows, totalRows);
    
                            if (completedRows === totalRows) {
                                alert("All data inserted successfully!");
                            }
                        },
                        error: function (xhr) {
                            console.error(`Error inserting row ${index}:`, xhr.responseText);
                            completedRows++;
                            updateProgress(completedRows, totalRows);
                        }
                    });
                });
            };
    
            reader.onerror = function (error) {
                console.error("Error reading file:", error);
                alert("Failed to read the file. Please try again.");
            };
    
            // Read the file as a binary string
            reader.readAsArrayBuffer(fileInput);
    
            // Function to update progress
            function updateProgress(completed, total) {
                const percentage = ((completed / total) * 100).toFixed(2);
                $('#progress_status').text(`Progress: ${percentage}% (${completed}/${total} rows)`);
            }
        });
    });
    
    

    
    