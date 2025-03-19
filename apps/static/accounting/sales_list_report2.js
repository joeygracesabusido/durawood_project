$(document).ready(function () {
    function fetchSalesReport() {

        let dateFrom = $("#date_from").val();
        let dateTo = $("#date_to").val();
        $.ajax({
            url: `/api-get-sales-report-with-params/?date_from=${dateFrom}&date_to=${dateTo}`,
            type: "GET",
            cache: false,
            success: function (data) {
                console.log("Sales Report Data:", data); // Debugging output

               // Destroy existing DataTable instance
                if ($.fn.DataTable.isDataTable("#table_sales")) {
                    $('#table_sales').DataTable().clear().destroy();
                } 




                $("#table_sales tbody").empty(); // Clear table before adding new rows

                $.each(data, function (index, sale) {
                    
                   let statusColor = sale.status > 1 ? "style='color: orange;											 font-weight: ;'" : ""; 
												let row = `
                        <tr>
                            <td class="text-xs">${sale.invoice_date ? sale.invoice_date.split("T")[0] : "NA"}</td>
                           
                            <td class="text-xs">${sale.customer}</td>
                            <td class="text-xs">${sale.category}</td>
                            <td class="text-xs">${sale.dr_no}</td>
                            <td class="text-xs">${sale.invoice_no}</td>
                            <td class="text-xs">${sale.terms}</td>
                            <td class="text-xs">${sale.due_date ? sale.due_date.split("T")[0] : "NA"}</td>

                           <td ${statusColor} style="${sale.status !== null && sale.balance <= 0 ? 'color: green;'  : ''}" class="text-xs">
                                ${sale.status !== null 
                                    ? (sale.balance > 0 ? Math.floor(sale.status) + " days overdue" : "Paid") 
                                    : "N/A"}
                           </td>

                            <td class="text-xs">${sale.tax_type}</td>
                            <td class="text-xs">${formatCurrency(sale.amount)}</td>
                            <td class="text-xs">${formatCurrency(sale.balance)}</td>
                        </tr>
                    `;
                    $("#table_sales tbody").append(row);
                      
                });
              initializeDataTable()
            },
            error: function (xhr, status, error) {
                console.error("Error fetching sales report:", error);
                alert("Failed to load sales data.");
            }
        });
    }

    function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US',
      { minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }

     
  $("#search_data").on("click", function () {

    fetchSalesReport(); // Call function when page loads

    });
});


$("#printPDF").on("click", function () {
    const content = document.getElementById("table_sales").outerHTML; // Get table content only
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
        <html>
        <head>
            <title>Sales List</title>
            <style>
                table { width: 100%; border-collapse: collapse; }
                table, th, td { border: 1px solid black; }
                th, td { padding: 8px; text-align: center; font-size: 10px; }
                th { background-color: #f0f0f0; }
                @media print {
                    body { margin: 20px; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <h2 style="text-align:center">Sales List as of ${today}</h2>
            ${content}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
});




// this is for DataTable
const initializeDataTable = () => {

    new DataTable('#table_sales', {
        layout: {
            topStart: 'buttons'
        },
        buttons: ['copy',  {
            extend: 'csv',
            filename: 'Sales Transasction', // Cust wom name for the exported CSV file
            title: 'Sales Transaction' // Optional: Title for the CSV file's content
        }],
        perPage: 10,
        searchable: true,
        sortable: true,

        responsive: true,
        scrollX: true,          // Enable horizontal scrolling if needed
        autoWidth: false,       // Disable fixed width
        scrollY: true,       // Set a specific height
        scrollCollapse: true,
        destroy: true // Destroy any existing DataTable instance


    });

    };



