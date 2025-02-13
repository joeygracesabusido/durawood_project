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



// / this function is to insert data to salary_computation mongdb
// $(document).ready(function () {
//   // Function to handle form submission or data sending
//   $('#btn_search').on('click', function (e) {
//       e.preventDefault();
//       fetchCompensationSummary();
      
//   });
// });
// function fetchCompensationSummary() {
//     const dateFrom =  $("#date_from").val();
//     const dateTo = $("#date_to").val();
//     const company = $("#company").val();

//     $.ajax({
//         url: '/api-query-1601c/',
//         type: 'GET',
//         data: {
//             date_from: dateFrom,
//             date_to: dateTo,
//             company: company
//         },
//         success: function (response) {
//             if (response.data && response.data.length > 0) {
//                 const grossPaySum = response.data[0].grossPaySum || 0;
//                 $('#total_amount_compensation').val(grossPaySum.toLocaleString('en-US', { minimumFractionDigits: 2 }));
//             } else {
//                 $('#total_amount_compensation').val('No Data Found');
//             }
//         },
//         error: function (error) {
//             console.error('Error fetching compensation summary:', error);
//             $('#total_amount_compensation').val('Error');
//         }
//     });
// }


// $(document).ready(function () {

//   $("btn_search").click(function () {

//   const dateFrom = $("#date_from").val();
//         const dateTo = $("#date_to").val();
//         const company = $("#company").val();

//         // Make AJAX call to the API
//         $.ajax({
//             url: "/api-query-employee-summary/",
//             type: "GET",
//             data: {
//                 date_from: dateFrom,
//                 date_to: dateTo,
//                 company: company,
//             },
//             success: function (response) {
//                 if (response.data && response.data.length > 0) {
//                     // Clear existing table rows
//                     consol.log(response.data)

//                } 
          
//         })

//     });

//   })
