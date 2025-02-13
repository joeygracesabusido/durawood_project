$(document).ready(function() {
    // Search button click handler
    $("#btn_search").click(function() {
        // Get the values from the input fields
        const dateFrom = $("#date_from").val();
        const dateTo = $("#date_to").val();
        const company = $("#company").val();

        // Make AJAX call to the API
        $.ajax({
            url: '/salary-data/',  // API endpoint
            type: 'GET',
            data: {
                start_date: dateFrom,
                end_date: dateTo,
                company: company
            },
            success: function(response) {
                // Clear existing table rows
                $('#table_payroll_list').empty();

                // Loop through the response and add rows to the table
                response.forEach(function(item) {
                    const row = `<tr>
                        <td>${item.date}</td>
                        <td>${item.company}</td>
                        <td>${item.employee_id}</td>
                        <td>${item.last_name}</td>
                        <td>${item.first_name}</td>
                        <td>${formatNumberWithSeparator(item.gross_pay)}</td>
                        <td>${formatNumberWithSeparator(item.total_mandatory)}</td>
                        <td>${formatNumberWithSeparator(item.total_deminis)}</td>
                        <td>${formatNumberWithSeparator(item.with_holding_tax)}</td>
                        <td>${formatNumberWithSeparator(item.net_pay)}</td>
                    </tr>`;
                    $('#table_payroll_list').append(row);
                });

                //Initialize DataTable if it's not already initialized
                if (!$.fn.DataTable.isDataTable('#table_payroll')) {
                    $('#table_payroll').DataTable();
                }
                // initializeDataTable()
            },
            error: function(error) {
                alert('Error fetching data: ' + error.statusText);
            }
        });
    });
});

const initializeDataTable = () => {
    
    new DataTable('#table_payroll', {
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



$(document).ready(function() {
    // Set up autocomplete for the company input field
    $('#company').autocomplete({
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
                    // Extract company names from the GraphQL response
                    const companyNames = data.data.companyAutocomplete.map(company => {
                        return {
                            label: company.CompanyName,  // Displayed in the autocomplete dropdown
                            value: company.CompanyName   // Value to be filled in the input field
                        };
                    });
                    response(companyNames); // Provide the suggestions to the autocomplete
                },
                error: function(error) {
                    console.log("Error fetching company data: ", error);
                }
            });
        },
        minLength: 2,  // Minimum characters before triggering autocomplete
        select: function(event, ui) {
            // You can handle the selection event here (e.g., auto-filling other fields)
            console.log("Selected Company: ", ui.item.value);
        }
    });
});

