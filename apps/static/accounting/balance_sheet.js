// $(document).ready(function() {
//     $('#btn_search').on('click', function() {
//         // Get the selected dates
//         const dateFrom = $('#date_from').val();
//         const dateTo = $('#date_to').val();

//         // Define the GraphQL query
//         const query = `
//             query GetBalanceSheetDetails2($datefrom: String, $dateto: String) {
//                 getBalanceSheetDetails(datefrom: $datefrom, dateto: $dateto) {
//                     chartOfAccount
//                     amount
//                     accountType
//                 }
//             }
//         `;

//         // Set up the request
//         const requestData = JSON.stringify({
//             query: query,
//             variables: {
//                 datefrom: dateFrom,
//                 dateto: dateTo
//             }
//         });

//         // Make the AJAX request to the GraphQL endpoint
//         $.ajax({
//             url: '/graphql', // Replace with your actual GraphQL endpoint URL
//             method: 'POST',
//             contentType: 'application/json',
//             data: requestData,
//             success: function(response) {
//                 const data = response.data.getBalanceSheetDetails;

//                 // Clear the table body
//                 $('#table_balance_sheet_report_list').empty();

//                 if (data && data.length > 0) {
//                     // Populate the table with the fetched data
//                     data.forEach(item => {
//                         const row = `
//                             <tr>
//                                 <td>${item.accountType}</td>
//                                 <td>${item.chartOfAccount}</td>
//                                 <td>${item.amount.toFixed(2)}</td>
//                             </tr>
//                         `;
//                         $('#table_balance_sheet_report_list').append(row);
//                     });
//                 } else {
//                     // If no data is returned, add a row indicating no results
//                     $('#table_balance_sheet_report_list').append(`
//                         <tr>
//                             <td colspan="3">No data available for the selected date range.</td>
//                         </tr>
//                     `);
//                 }
//             },
//             error: function(error) {
//                 console.error('Error fetching data:', error);
//                 // Handle error
//                 $('#table_balance_sheet_report_list').html(`
//                     <tr>
//                         <td colspan="3">An error occurred while fetching data.</td>
//                     </tr>
//                 `);
//             }
//         });
//     });
// });


// $(document).ready(function() {
//     $('#btn_search').on('click', function() {
//         const datefrom = $('#date_from').val();
//         const dateto = $('#date_to').val();

//         $.ajax({
//             url: '/graphql', // Replace with your actual GraphQL endpoint URL
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({
//                 query: `
//                 query {
//                     getBalanceSheetDetails2(datefrom: "${datefrom}", dateto: "${dateto}") {
//                         accountType
//                         chartOfAccount
//                         amount
//                     }
//                 }`
//             }),
//             success: function(response) {
//                 const data = response.data.getBalanceSheetDetails2;

//                 if (!data || data.length === 0) {
//                     $('#balanceSheetContainer').html('<p>No data found for the selected date range.</p>');
//                     return;
//                 }

//                 // Group data by account type
//                 const groupedData = {};
//                 data.forEach(item => {
//                     if (!groupedData[item.accountType]) {
//                         groupedData[item.accountType] = [];
//                     }
//                     groupedData[item.accountType].push(item);
//                 });

//                 // Generate HTML content
//                 let html = '';
//                 $.each(groupedData, function(accountType, details) {
//                     html += `<h3>${accountType}</h3>`;
//                     html += '<table class="balance-sheet-table" border="1" cellspacing="0" cellpadding="5">';
//                     html += '<tr><th>Chart of Account</th><th>Amount</th></tr>';
//                     details.forEach(detail => {
//                         html += `
//                             <tr>
//                                 <td>${detail.chartOfAccount}</td>
//                                 <td>${detail.amount.toFixed(2)}</td>
//                             </tr>`;
//                     });
//                     html += '</table><br>';
//                 });

//                 // Display the generated content
//                 $('#balanceSheetContainer').html(html);
//             },
//             error: function(error) {
//                 console.error('Error fetching data:', error);
//                 $('#balanceSheetContainer').html('<p>An error occurred while fetching data.</p>');
//             }
//         });
//     });
// });

// $(document).ready(function() {
//     $('#btn_search').on('click', function() {
//         const datefrom = $('#date_from').val();
//         const dateto = $('#date_to').val();

//         $.ajax({
//             url: '/graphql', // Replace this with your actual GraphQL endpoint
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({
//                 query: `
//                 query {
//                     getBalanceSheetDetails3(datefrom: "${datefrom}", dateto: "${dateto}") {
//                         accountType
//                         chartOfAccount
//                         amount
//                     }
//                 }`
//             }),
//             success: function(response) {
//                 const data = response.data.getBalanceSheetDetails3;
//                 console.log('EHLOOOOOO', data)
//                 // Clear any previous data
//                 $('#table_balance_sheet_report_list').empty();

//                 if (!data || data.length === 0) {
//                     $('#table_balance_sheet_report_list').html('<tr><td colspan="3">No data found for the selected date range.</td></tr>');
//                     return;
//                 }

//                 const totals = {};

//                 // First pass to calculate totals
//                 data.forEach(item => {
//                     if (!totals[item.accountType]) {
//                         totals[item.accountType] = 0;
//                     }
//                     totals[item.accountType] += item.amount;
//                 });

//                 // Second pass to display the data
//                 const displayedAccountTypes = [];

//                 data.forEach(item => {
//                     const showAccountType = !displayedAccountTypes.includes(item.accountType);

//                     // Display account type and increment the displayed list
//                     if (showAccountType) {
//                         displayedAccountTypes.push(item.accountType);
//                     }

//                     $('#table_balance_sheet_report_list').append(`
//                         <tr>
//                             <td>${showAccountType ? item.accountType : ''}</td>
//                             <td>${item.chartOfAccount}</td>
//                             <td>${item.amount.toFixed(2)}</td>
//                         </tr>
//                     `);
//                 });

//                 // Append total rows for each account type
//                 for (const accountType in totals) {
//                     $('#table_balance_sheet_report_list').append(`
//                         <tr>
//                             <td><strong>Total ${accountType}</strong></td>
//                             <td></td>
//                             <td><strong>${totals[accountType].toFixed(2)}</strong></td>
//                         </tr>
//                     `);
//                 }

//             },
//             error: function(error) {
//                 console.error('Error fetching data:', error);
//                 $('#table_balance_sheet_report_list').html('<tr><td colspan="3">An error occurred while fetching data.</td></tr>');
//             }
//         });
//     });

//     function groupDataByAccountType(data) {
//         return data.reduce((acc, item) => {
//             if (!acc[item.accountType]) {
//                 acc[item.accountType] = [];
//             }
//             acc[item.accountType].push(item);
//             return acc;
//         }, {});
//     }
// });


// $(document).ready(function() {
//     $('#btn_search').on('click', function() {
//         const datefrom = $('#date_from').val();
//         const dateto = $('#date_to').val();

//         $.ajax({
//             url: '/graphql', // Replace this with your actual GraphQL endpoint
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({
//                 query: `
//                 query {
//                     getBalanceSheetDetails3(datefrom: "${datefrom}", dateto: "${dateto}") {
//                         accountType
//                         details {
//                             chartOfAccount
//                             amount
//                         }
//                     }
//                 }`
//             }),
//             success: function(response) {
//                 const data = response.data.getBalanceSheetDetails3;
//                 $('#table_balance_sheet_report_list').empty();

//                 if (!data || data.length === 0) {
//                     $('#table_balance_sheet_report_list').html('<tr><td colspan="3">No data found for the selected date range.</td></tr>');
//                     return;
//                 }

//                 const totals = {};

//                 // Loop through each account type and its details
//                 data.forEach(item => {
//                     if (!totals[item.accountType]) {
//                         totals[item.accountType] = 0;
//                     }

//                     // Display each detail for the account type
//                     item.details.forEach(detail => {
//                         totals[item.accountType] += detail.amount;

//                         $('#table_balance_sheet_report_list').append(`
//                             <tr>
//                                 <td>${item.accountType}</td>
//                                 <td>${detail.chartOfAccount}</td>
//                                 <td>${detail.amount.toFixed(2)}</td>
//                             </tr>
//                         `);
//                     });
//                 });

//                 // Append total rows for each account type
//                 for (const accountType in totals) {
//                     $('#table_balance_sheet_report_list').append(`
//                         <tr>
//                             <td><strong>Total ${accountType}</strong></td>
//                             <td></td>
//                             <td><strong>${totals[accountType].toFixed(2)}</strong></td>
//                         </tr>
//                     `);
//                 }
//             },
//             error: function(error) {
//                 console.error('Error fetching data:', error);
//                 $('#table_balance_sheet_report_list').html('<tr><td colspan="3">An error occurred while fetching data.</td></tr>');
//             }
//         });
//     });

//     function groupDataByAccountType(data) {
//         return data.reduce((acc, item) => {
//             if (!acc[item.accountType]) {
//                 acc[item.accountType] = [];
//             }
//             acc[item.accountType].push(item);
//             return acc;
//         }, {});
//     }
// });


// 


// Function to format number with thousand separator
function formatNumberWithSeparator(value) {
    return parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// $(document).ready(function() {
//     $('#btn_search').on('click', function() {
//         const datefrom = $('#date_from').val();
//         const dateto = $('#date_to').val();
//         const endpoint = '/graphql';

//         const query = `
//             query {
//                 getBalanceSheetDetails3(datefrom: "${datefrom}", dateto: "${dateto}") {
//                     accountType
//                     details {
//                         chartOfAccount
//                         amount
//                     }
//                 }
//             }
//         `;

//         $.ajax({
//             url: endpoint,
//             method: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ query }),
//             success: function(response) {
//                 const data = response.data.getBalanceSheetDetails3;

//                 let reportTable = `<table class="table table-striped table-bordered">
//                                       <thead>
//                                           <tr>
//                                               <th>BALANCE SHEET</th>
//                                               <th>Amount</th>
//                                           </tr>
//                                       </thead>
//                                       <tbody>`;

//                 data.forEach(account => {
//                     const accountType = account.accountType;
//                     let totalAmount = 0;

//                     reportTable += `<tr>
//                                         <td colspan="2" ><strong>${accountType}</strong></td>
//                                     </tr>`;

//                     account.details.forEach(detail => {
//                         const amount = detail.amount;
//                         totalAmount += amount;
//                         reportTable += `<tr>
//                                             <td>${detail.chartOfAccount}</td>
//                                             <td class="text-end">
//                                                 ${formatNumberWithSeparator(amount)}
//                                             </td>
//                                         </tr>`;
//                     });

//                     // Add a row for the total amount of the account type
//                     reportTable += `<tr>
//                                         <td><strong>Total  ${accountType}</strong></td>
//                                         <td class="text-end"><strong>
//                                             ${formatNumberWithSeparator(totalAmount)}
//                                         </strong></td>
//                                     </tr>`;
//                 });

//                 reportTable += '</tbody></table>';

//                 $('#balanceSheetReport').html(reportTable);
//             },
//             error: function(error) {
//                 console.error('Error fetching data:', error);
//                 $('#balanceSheetReport').html('<p class="text-danger">Failed to load the report. Please try again later.</p>');
//             }
//         });
//     });
// });

// 
$(document).ready(function() {
    $('#btn_search').on('click', function() {
        const datefrom = $('#date_from').val();
        const dateto = $('#date_to').val();
        const endpoint = '/graphql';

        const query = `
            query {
                getBalanceSheetDetails3(datefrom: "${datefrom}", dateto: "${dateto}") {
                    accountType
                    details {
                        chartOfAccount
                        amount
                    }
                }
            }
        `;

        $.ajax({
            url: endpoint,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ query }),
            success: function(response) {
                const data = response.data.getBalanceSheetDetails3;
                console.log(data)
                let totalAsset = 0;
                let totalLiability = 0;
                let totalLiability2 = 0;
                let sales = 0;
                let costOfSales = 0;
                let generalAdmin = 0;

               
                let totalCapital = 0; // Initialize total capital
                let reportTable = `<table class="table table-striped table-bordered">
                                      <thead>
                                          <tr>
                                              <th>BALANCE SHEET</th>
                                              <th>Amount</th>
                                          </tr>
                                      </thead>
                                      <tbody>`;

                const assetTypes = ["CURRENT ASSETS", "NON-CURRENT ASSETS","PROPERTY PLANT AND EQUIPMENT"];
                const liabilityTypes = ["CURRENT LIABILITIES", "NON-CURRENT LIABILITIES","LIABILITIES"];
                const excludeTypes = ["SALES", "COST OF SALES", "GENERAL AND ADMINISTRATIVE EXPENSE"];
                


                let withinAssets = false;
                let withinLiabilities = false;
                let withincapital = false;

                let stockHolderEquityAmount = 0;
                data.forEach((account, index) => {
                    const accountType = account.accountType;
                    let totalAmount = 0;

                    if (excludeTypes.includes(accountType)) {
                        account.details.forEach(detail => {
                            if (accountType === "INCOME") {
                                sales += detail.amount;
                            } else if (accountType === "COST OF SALES") {
                                costOfSales += detail.amount;
                            } else if (accountType === "GENERAL AND ADMINISTRATIVE EXPENSE") {
                                generalAdmin += detail.amount;
                            }
                        });
                        return; // Skip further processing for excluded account types
                    }

                    reportTable += `<tr>
                                        <td colspan="2"><strong>${accountType}</strong></td>
                                    </tr>`;

                    account.details.forEach(detail => {
                        const amount = detail.amount;
                        totalAmount += amount;

                        reportTable += `<tr>
                                            <td>${detail.chartOfAccount}</td>
                                            <td class="text-end">
                                                ${formatNumberWithSeparator(amount)}
                                            </td>
                                        </tr>`;
                    });

                    reportTable += `<tr>
                                        <td><strong>Total ${accountType}</strong></td>
                                        <td class="text-end"><strong>${formatNumberWithSeparator(totalAmount)}</strong></td>
                                    </tr>`;

                    // Accumulate totals for assets and liabilities
                    if (assetTypes.includes(accountType)) {
                        totalAsset += totalAmount;
                        withinAssets = true;
                        withinLiabilities = false;
                        withincapital = false;
                    } else if (liabilityTypes.includes(accountType)) {
                        totalLiability += totalAmount;
                        withinAssets = false;
                        withinLiabilities = true;
                        withincapital = false;
                    } else {
                        withinAssets = false;
                        withinLiabilities = false;
                        withincapital = true;
                    }

                    if (withinAssets && (index === data.length - 1 || !assetTypes.includes(data[index + 1].accountType))) {
                        reportTable += `<tr class="table-active">
                                            <td><strong>Total Asset</strong></td>
                                            <td class="text-end"><strong>${formatNumberWithSeparator(totalAsset)}</strong></td>
                                        </tr>`;
                    }

                    if (withinLiabilities && (index === data.length - 1 || !liabilityTypes.includes(data[index + 1].accountType))) {
                        reportTable += `<tr class="table-active">
                                            <td><strong>Total Liability</strong></td>
                                            <td class="text-end"><strong>${formatNumberWithSeparator(totalLiability)}</strong></td>
                                        </tr>`;
                    }

                    // Accumulate totals for assets, liabilities, and capital
                    if (accountType === "EQUITY") {
                        // Extract the amount for Stock Holder's Equity
                        stockHolderEquityAmount = totalAmount; // Assuming totalAmount represents the Stock Holder's Equity
                        console.log("Stock Holder's Equity Amount:", stockHolderEquityAmount);
                    }
                });

                // Calculate retained earnings
                const retainedEarnings = sales + generalAdmin + costOfSales;
                const total_liability_capital = totalLiability + retainedEarnings + stockHolderEquityAmount
                // Add retained earnings after liabilities
                reportTable += `<tr class="table-active">
                                    <td><strong>Retained Earnings</strong></td>
                                    <td class="text-end"><strong>${formatNumberWithSeparator(retainedEarnings)}</strong></td>
                                </tr>`;

                // Add retained earnings after liabilities
                reportTable += `<tr class="table-active">
                                    <td><strong>Total Liabilities & Capital</strong></td>
                                    <td class="text-end"><strong>${formatNumberWithSeparator(total_liability_capital)}</strong></td>
                                </tr>`;

                reportTable += '</tbody></table>';

                $('#balanceSheetReport').html(reportTable);
            },
            error: function(error) {
                console.error('Error fetching data:', error);
                $('#balanceSheetReport').html('<p class="text-danger">Failed to load the report. Please try again later.</p>');
            }
        });
    });
});


 // Print functionality
  $("#btn_print").on("click", function () {
    // Ensure the report is rendered before printing
    setTimeout(function () {
      const content = document.getElementById(
        "balanceSheetReport"
      ).innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = content;
      window.print();
      document.body.innerHTML = originalContent;
    }, 500); // Adjust delay if necessary
  });

// this function is to implement exporting to excel
  $(document).ready(function() {
   
    $('#btn_export_excel').on('click', function() {
        // Extract data from the report table
        const reportTable = document.getElementById('balanceSheetReport');
        const workbook = XLSX.utils.table_to_book(reportTable, {sheet: "Balance Sheet"});
        XLSX.writeFile(workbook, 'Balance_Sheet_Report.xlsx');
    });
});

