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





$(document).ready(function () {
    // Search button click handler
    $("#btn_search").click(function () {
        // Get the values from the input fields
        const dateFrom = $("#date_from").val();
        const dateTo = $("#date_to").val();
        const company = $("#company").val();

        // Make AJAX call to the API
        $.ajax({
            url: "/api-query-employee-summary/",
            type: "GET",
            data: {
                date_from: dateFrom,
                date_to: dateTo,
                company: company,
            },
            success: function (response) {
                if (response.data && response.data.length > 0) {
                    // Clear existing table rows
                    $("#table_payroll_list").empty();

                    // Loop through the response and add rows to the table
                    response.data.forEach(function (item) {
                        const grossTaxable = parseFloat(item.grossPaySum)+parseFloat(item.thirteenMonthSum);
                        const empCount = item.employeeCount;
                        let taxDue = 0;
                        let taxPayable = 0;
                        let OtherForms = 0;
                        let month13th = item.thirteenMonthSum;

                        if (month13th <= 30000) {
                            month13th = month13th
                        }else {
                            month13th = 30000
                        }

                        OtherForms = ((90000/12) * empCount) - month13th
                        const totalDeductible = parseFloat(item.totalmandatory) + parseFloat(item.totalDeminimisSum)+ parseFloat(OtherForms) + parseFloat(month13th);
                    
                        const netTaxable = grossTaxable - totalDeductible


                        const brackets = [
                            { min: 0, max: 250000, rate: 0, baseTax: 0 },
                            { min: 250000.01, max: 400000, rate: 0.15, baseTax: 0 },
                            { min: 400000.01, max: 800000, rate: 0.20, baseTax: 22500 },
                            { min: 800000.01, max: 2000000, rate: 0.25, baseTax: 102500 },
                            { min: 2000000.01, max: 8000000, rate: 0.30, baseTax: 402500 },
                          ];
                      
                          // Calculate tax based on brackets
                          for (const bracket of brackets) {
                            // console.log(`Checking bracket: ${bracket.min} to ${bracket.max}`);
                            if (netTaxable > bracket.min && netTaxable <= bracket.max) {
                                taxDue = parseFloat(
                                ((netTaxable - bracket.min) * bracket.rate + bracket.baseTax).toFixed(2)
                              );
                              // console.log(`Tax calculated: ${tax}`);
                              break; // Stop checking once the applicable bracket is found
                            }
                          }

                          taxPayable = taxDue - parseFloat(item.withHoldingTaxSum)
                        
                        const row = `<tr>
                            <td>${item.employee_id}</td>
                            <td>${item.last_name}</td>
                            <td>${item.first_name}</td>
                            <td>${formatNumberWithSeparator(item.grossPaySum)}</td>
                            <td>${formatNumberWithSeparator(item.thirteenMonthSum)}</td>
                             <td>${formatNumberWithSeparator(grossTaxable)}</td>
                            <td>${formatNumberWithSeparator(item.totalmandatory)}</td>
                            <td>${formatNumberWithSeparator(item.totalDeminimisSum)}</td>
                            <td>${formatNumberWithSeparator(OtherForms)}</td>
                            <td>${formatNumberWithSeparator(netTaxable)}</td>
                            <td>${formatNumberWithSeparator(item.withHoldingTaxSum)}</td>
                           
                            <td>${formatNumberWithSeparator(taxDue)}</td>
                            <td>${formatNumberWithSeparator(taxPayable)}</td>
                            <td>${item.employeeCount}</td>
                           
                        </tr>`;
                        $("#table_payroll_list").append(row);
                    });

                    // Reinitialize DataTable
                    if ($.fn.DataTable.isDataTable("#table_payroll")) {
                        $("#table_payroll").DataTable().clear().destroy();
                    }
                    initializeDataTable();
                } else {
                    alert("No data found for the given filters.");
                }
            },
            error: function (error) {
                alert("Error fetching data: " + error.statusText);
            },
        });
    });
});

const initializeDataTable = () => {
    $("#table_payroll").DataTable({
        perPage: 10,
        searchable: true,
        sortable: true,
        responsive: true,
        scrollX: true,          // Enable horizontal scrolling if needed
        autoWidth: false,       // Disable fixed width
        scrollY: "450px",       // Set a specific height
        scrollCollapse: true,
        destroy: true,          // Allow reinitialization
    });
};


// Function to format number with thousand separator
function formatNumberWithSeparator(value) {
    return parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}