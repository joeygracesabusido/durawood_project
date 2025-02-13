// Function to format number with thousand separator
function formatNumberWithSeparator(value) {
    return parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


$(document).ready(function() {
    $('#btn_search').on('click', function() {
        const datefrom = $('#date_from').val();
        const dateto = $('#date_to').val();
        const endpoint = '/graphql';

        const query = `
            query MyQuery {
                getIncomeStatementReport(datefrom: "${datefrom}", dateto: "${dateto}") {
                    accountType
                    entries {
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
                const data = response.data.getIncomeStatementReport;
                console.log(data);
                let totalSales = 0;
                let totalCostOfSales = 0;
                let totalAdminExpenses = 0;
                let reportTable = `<table class="table table-striped table-bordered">
                                      <thead>
                                          <tr>
                                              <th>Account Type</th>
                                              <th>Chart of Account</th>
                                              <th>Amount</th>
                                          </tr>
                                      </thead>
                                      <tbody>`;

                // Iterate through each account type and its entries
                data.forEach(account => {
                    const accountType = account.accountType;

                    // Add a row for the account type
                    reportTable += `<tr>
                                        <td colspan="3"><strong>${accountType}</strong></td>
                                    </tr>`;

                    // Iterate through entries for the current account type
                    account.entries.forEach(entry => {
                        const amount = entry.amount;

                        // Update totals based on account type
                        if (accountType === "Sales") {
                            totalSales += amount;
                        } else if (accountType === "Cost of Sales/Service") {
                            totalCostOfSales += amount;
                        } else if (accountType === "General and Administrative Expense") {
                            totalAdminExpenses += amount;
                        }

                        // Add a row for each entry
                        reportTable += `<tr>
                                            <td></td>
                                            <td>${entry.chartOfAccount}</td>
                                            <td class="text-end">${formatNumberWithSeparator(amount)}</td>
                                        </tr>`;
                    });
                });

                // Add total rows for Sales, Cost of Sales, and General Admin Expenses
                reportTable += `<tr class="table-active">
                                    <td><strong>Total Sales</strong></td>
                                    <td></td>
                                    <td class="text-end"><strong>${formatNumberWithSeparator(totalSales)}</strong></td>
                                </tr>`;
                reportTable += `<tr class="table-active">
                                    <td><strong>Total Cost of Sales</strong></td>
                                    <td></td>
                                    <td class="text-end"><strong>${formatNumberWithSeparator(totalCostOfSales)}</strong></td>
                                </tr>`;
                reportTable += `<tr class="table-active">
                                    <td><strong>Total General & Admin Expenses</strong></td>
                                    <td></td>
                                    <td class="text-end"><strong>${formatNumberWithSeparator(totalAdminExpenses)}</strong></td>
                                </tr>`;

                // Calculate Net Income/Loss
                const netIncomeLoss = totalSales + totalCostOfSales + totalAdminExpenses;

                // Add Net Income/Loss row with red font
                reportTable += `<tr class="table-active">
                                    <td><strong style="color: red;">Net Income/(Loss)</strong></td>
                                    <td></td>
                                    <td class="text-end"><strong style="color: red;">${formatNumberWithSeparator(netIncomeLoss)}</strong></td>
                                </tr>`;

                reportTable += '</tbody></table>';
                $('#incomeStatementReport').html(reportTable); // Update the report in the HTML
            },
            error: function(error) {
                console.error('Error fetching data:', error);
                $('#incomeStatementReport').html('<p class="text-danger">Failed to load the report. Please try again later.</p>');
            }
        });
    });

  // Print functionality
  $("#btn_print").on("click", function () {
    // Ensure the report is rendered before printing
    setTimeout(function () {
      const content = document.getElementById(
        "incomeStatementReport"
      ).innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = content;
      window.print();
      document.body.innerHTML = originalContent;
    }, 500); // Adjust delay if necessary
  });
});



// this function is to implement exporting to excel
  $(document).ready(function() {
   
    $('#btn_export_excel').on('click', function() {
        // Extract data from the report table
        const reportTable = document.getElementById('incomeStatementReport');
        const workbook = XLSX.utils.table_to_book(reportTable, {sheet: "Income Statement"});
        XLSX.writeFile(workbook, 'Income_Stament_Report.xlsx');
    });
});

