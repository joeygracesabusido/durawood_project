// $(document).ready(function() {
//     // Function to fetch and display journal entries
    
    
//     function loadJournalEntries() {
//         $.ajax({
//             url: '/api-get-sales-report/',
//             method: 'GET',
//             success: function(data) {
//                 let rows = '';

//                 // Loop through the data and create table rows
//                 data.forEach(function(entry) {
//                     rows += `
//                         <tr>
//                             <td>${entry.date}</td>
//                             <td>${entry.branch}</td>
//                             <td>${entry.customer}</td>
//                             <td>${entry.tin}</td>
//                             <td>${entry.tax_type}</td>
// 							<td>${entry.chart_of_account}</td>

//                             <td>${entry.debit_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//                             <td>${entry.credit_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>

                            
       
//                         </tr>
//                     `;
//                 });

//                 // Append rows to the table body
//                 $('#table_sales_report_list').html(rows);
//                 initializeDataTable()
//             },
            
//             error: function(xhr, status, error) {
//                 console.error('Error fetching journal entries:', error);
//             }
//         });
//     }

//     // Load journal entries when the page is loaded
//     loadJournalEntries();
// });

// // this is for DataTable
// const initializeDataTable = () => {

//     new DataTable('#table_sales_report', {
//         layout: {
//             topStart: 'buttons'
//         },
//         buttons: [{
//             extend: 'copy',
//             text: 'Copy to Clipboard', // Button label
//             title: 'Trial Balance Report', // Title for the copied data
//             filename: 'Trial_Balance_Report', // Custom filename
//             exportOptions: {
//                 columns: ':visible' // Export only visible columns
//             }
//         },
//         {
//             extend: 'csv',
//             text: 'Export to CSV', // Button label
//             title: 'Trial Balance Report', // Title in CSV file
//             filename: 'Trial_Balance_Report', // Custom filename without file extension
//             exportOptions: {
//                 columns: ':visible' // Export only visible columns
//             }
//         }]
//     });


//     };




// <td>${entry.debit.toLocaleString()}</td>
// <td>${entry.credit.toLocaleString()}



$(document).ready(function() {
    $('#btn_search').click(function() {
        // Get values from the input fields
        var dateFrom = $('#date_from').val();
        var dateTo = $('#date_to').val();
        var customer = $('#customer_search').val();
        var branch = $('#branch_search').val();
        var chart_of_account = $('#chart_of_account').val();

        // console.log(dateFrom,dateTo)
        // Build the URL with query parameters
        var url = '/api-get-purchase-report/?';
        if (dateFrom) url += 'datefrom=' + encodeURIComponent(dateFrom) + '&';
        if (dateTo) url += 'dateto=' + encodeURIComponent(dateTo) + '&';
        if (chart_of_account) url += 'chart_of_account=' + encodeURIComponent(chart_of_account) + '&';
        if (customer) url += 'customer=' + encodeURIComponent(customer) + '&';
        if (branch) url += 'branch=' + encodeURIComponent(branch) + '&';
        
        // Remove trailing '&'
        url = url.slice(0, -1);

        // Make the GET request
        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                // Clear existing table rows
                $('#table_purchase_report_list').empty();

                // Populate table with the data
                console.log(data)
                data.forEach(function(entry) {
                    $('#table_purchase_report_list').append(
                        '<tr>' +
                            '<td>' + entry.date + '</td>' +
                            '<td>' + entry.branch + '</td>' +
                            '<td>' + entry.customer + '</td>' +
                            '<td>' + entry.tin + '</td>' +
                            '<td>' + entry.tax_type + '</td>' +
                            '<td>' + entry.reference + '</td>' +
                            '<td>' + entry.chart_of_account + '</td>' +
                            '<td>' + entry.description + '</td>' +
                            '<td>' + entry.debit_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</td>' +
                            '<td>' + entry.credit_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</td>' +
                        '</tr>'
                    );

                });

                // Initialize DataTables for the table (optional, if you want to use DataTables)
                // $('#table_sales_report').DataTable();
                initializeDataTable2()
            },
            error: function(xhr, status, error) {
                console.error('Error fetching data:', error);
            }
        });
    });
});






// this is for DataTable
const initializeDataTable2 = () => {

    new DataTable('#table_purchase_report', {
        layout: {
            topStart: 'buttons'
        },
        buttons: [{
            extend: 'copy',
            text: 'Copy to Clipboard', // Button label
            title: 'Purchase Report', // Title for the copied data
            filename: 'Purchase Report', // Custom filename
            exportOptions: {
                columns: ':visible' // Export only visible columns
            }
        },
        {
            extend: 'csv',
            text: 'Export to CSV', // Button label
            title: 'Purchase Report', // Title in CSV file
            filename: 'Purchase Report', // Custom filename without file extension
            exportOptions: {
                columns: ':visible' // Export only visible columns
            }
        }],
        responsive: true,  // Makes the table responsive within the card
        autoWidth: false,  // Disables automatic column width adjustment for better fit
    });


    };


// Use jQuery in noConflict mode
jQuery.noConflict();
jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "branch_name"
    $(document).on('focus', '#branch_search', function() {
        $("#branch_search").autocomplete({
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
                $("#branch_search").val(ui.item.value);
              

                return false; // Prevent the default select action
            }
        });
    });
});


// Use jQuery in noConflict mode
jQuery.noConflict();
jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "branch_name"
    $(document).on('focus', '#chart_of_account', function() {
        $("#chart_of_account").autocomplete({
            source: function(request, response) {
                // AJAX call to fetch data for the autocomplete suggestions
                $.ajax({
                    url: "/api-autocomplete-chart-of-account/",  // Your endpoint for fetching data
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
                $("#chart_of_account").val(ui.item.value);
              

                return false; // Prevent the default select action
            }
        });
    });
});


// Use jQuery in noConflict mode
jQuery.noConflict();
jQuery(document).ready(function($) {
    // Initialize autocomplete on the element with ID "branch_name"
    $(document).on('focus', '#customer_search', function() {
        $("#customer_search").autocomplete({
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
                $("#customer_search").val(ui.item.value);
              

                return false; // Prevent the default select action
            }
        });
    });
});





