$(document).ready(function() {
    // Function to fetch and display journal entries
    
    
    function loadJournalEntries() {
        $.ajax({
            url: '/api-get-journal-entry-list/',
            method: 'GET',
            success: function(data) {
                let rows = '';

                // Loop through the data and create table rows
                data.forEach(function(entry) {
                    rows += `
                        <tr>
                            <td>${entry.transdate}</td>
                            <td>${entry.journal_type}</td>
                            <td>${entry.reference}</td>
                            <td>${entry.description}</td>
                            <td>${entry.chart_of_account}</td>
                            <td>${entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td>${entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>

                            
                            <td>
                                <!-- Add action buttons here if needed -->
                                <!--<button class="btn btn-primary btn-sm">Edit</button>-->

                                <a href="/api-update-journal-entry-temp/${entry.reference}"> \
                                <button type="button" class="btn btn-primary btn-sm"> \
                                 Edit</button></a>

                                <!--<button class="btn btn-danger btn-sm">Delete</button> -->
                            </td>
                        </tr>
                    `;
                });

                // Append rows to the table body
                $('#table_journal_entry_list').html(rows);
                initializeDataTable()
            },
            
            error: function(xhr, status, error) {
                console.error('Error fetching journal entries:', error);
            }
        });
    }

    // Load journal entries when the page is loaded
    loadJournalEntries();
});

// this is for DataTable
const initializeDataTable = () => {

    new DataTable('#table_journal_entry', {
        layout: {
            topStart: 'buttons'
        },
        buttons: [{
            extend: 'copy',
            text: 'Copy to Clipboard', // Button label
            title: 'Trial Balance Report', // Title for the copied data
            filename: 'Trial_Balance_Report', // Custom filename
            exportOptions: {
                columns: ':visible' // Export only visible columns
            }
        },
        {
            extend: 'csv',
            text: 'Export to CSV', // Button label
            title: 'Trial Balance Report', // Title in CSV file
            filename: 'Trial_Balance_Report', // Custom filename without file extension
            exportOptions: {
                columns: ':visible' // Export only visible columns
            }
        }]
    });


    };




// <td>${entry.debit.toLocaleString()}</td>
// <td>${entry.credit.toLocaleString()}



