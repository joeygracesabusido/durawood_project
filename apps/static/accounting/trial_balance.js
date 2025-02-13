// $(document).ready(function () {
//     // Fetch and display data when the search button is clicked
//     $('#btn_search').click(function () {
//         const dateFrom = $('#datefrom').val();
//         const dateTo = $('#dateto').val();

//         // Make an AJAX GET request to the FastAPI endpoint
//         $.ajax({
//             url: '/trial-balance-report/',
//             type: 'GET',
//             data: {
//                 datefrom: dateFrom,
//                 dateto: dateTo
//             },
//             success: function (response) {
//                 initializeDataTable(); // Initialize or reset DataTable

//                 const table = $('#table_trial_balance').DataTable();
//                 table.clear(); // Clear existing rows

//                 // Loop through the response data and append it to the table
//                 response.data.forEach(function (item) {
//                     table.row.add([
//                         item.chart_of_account,
//                         item.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
//                         item.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
//                     ]);
//                 });
//                 table.draw(); // Redraw the table
//             },
//             error: function (xhr, status, error) {
//                 alert('An error occurred: ' + error);
//             }
//         });
//     });
// });


// //this function is for data table in jquery
// const initializeDataTable = () => {
//     if ($.fn.DataTable.isDataTable('#table_trial_balance')) {
//         $('#table_trial_balance').DataTable().destroy(); // Destroy existing DataTable instance
//     }

//     $('#table_trial_balance').DataTable({
//         layout: {
//             topStart: 'buttons'
//         },
//         buttons: ['copy', {
//             extend: 'csv',
//             filename: 'Trial Balance', // Custom name for the exported CSV file
//             title: 'Trial Balance' // Optional: Title for the CSV file's content
//         }]
//     });
// };


$(document).ready(function () {
    // Fetch and display data when the search button is clicked
    $('#btn_search').click(function () {
        const dateFrom = $('#datefrom').val();
        const dateTo = $('#dateto').val();

        // Make an AJAX GET request to the FastAPI endpoint
        $.ajax({
            url: '/trial-balance-report/',
            type: 'GET',
            data: {
                datefrom: dateFrom,
                dateto: dateTo
            },
            success: function (response) {
                // Clear the table body before appending new data
                // initializeDataTable()
                // const table = $('#table_trial_balance').DataTable();
                // table.clear(); // Clear existing rows

                
                $('#table_trialbalance_list').empty();

                // Loop through the response data and append it to the table
                response.data.forEach(function (item) {
                    console.log(item);
                    const row = document.createElement('tr');
                    let cell1 = document.createElement('td');
                    cell1.textContent = item.chart_of_account;
                    let cell2 = document.createElement('td');
                    cell2.textContent = item.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    let cell3 = document.createElement('td');
                    cell3.textContent = item.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    row.append(cell1);
                    row.append(cell2);
                    row.append(cell3);
                    // const row = `
                    //     <tr>
                    //         <td>${item.chart_of_account}</td>
                    //         <td>${item.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    //         <td>${item.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    //     </tr>
                    // `;

                    $('#table_trialbalance_list').append(row);
                    
                });
                const button = document.getElementById('pdf_btn');
            
                // Show the button by changing its display style
                button.style.display = 'block';
                initializeDataTable()
            },
            error: function (xhr, status, error) {
                alert('An error occurred: ' + error);
            }
        });
    });
});

// this is for DataTable
const initializeDataTable = () => {
    //     if ($.fn.DataTable.isDataTable('#table_trial_balance')) {
    //     $('#table_trial_balance').DataTable().destroy(); // Destroy existing DataTable instance
    // }

    new DataTable('#table_trial_balance', {
        "order": [],
        "columnDefs": [
        { "orderable": false, "targets": [0, 1] } // Disable sorting for specific columns
    ],
        layout: {
            topStart: 'buttons'
        },
        buttons: ['copy',  {
            extend: 'csv',
            filename: 'Chart of Account', // Custom name for the exported CSV file
            title: 'Chart of Account' // Optional: Title for the CSV file's content
        }]
    });
}
