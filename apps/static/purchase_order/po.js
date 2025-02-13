$(document).ready(function() {
    $('#btn_save_purchase_order').on('click', function() {
        // Collect form data
        let data = {
            date: $('#date').val(),
            company: $('#company').val(),
            supplier: $('#supplier').val(),
            quantity: $('#quantity').val(),
            description: $('#description').val(),
            user: $('#user').val()
        };

        // Send AJAX request to FastAPI
        $.ajax({
            url: '/api-insert-purchase-orber/', // Your FastAPI endpoint
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                // Handle success response
                alert(response.message || 'Purchase order saved successfully!');
                window.location.href = "/api-purchase-order-temp/"; // Redirect to the inventory list page
                // $('#insert_invt_items_modal').modal('hide'); // Hide the modal after success
            },
            error: function(xhr, status, error) {
                // Handle error response
                alert('Error: ' + (xhr.responseJSON ? xhr.responseJSON.detail : error));
            }
        });
    });
});


// this function is to display for table the Purchase Order Data
$(document).ready(function() {
    // Function to fetch and display purchase orders
    function fetchAndDisplayPurchaseOrders() {
        $.ajax({
            url: '/api-get-purchase-orders/',  // API endpoint
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                var tableBody = $('#table_purchase_order_list');
                tableBody.empty();  // Clear existing table rows

                // Iterate over each item in the data
                data.forEach(function(item) {
                    // Create a new row
                    var newRow = $('<tr></tr>');

                    // Append cells to the row
                    newRow.append('<td>' + (item.date ? new Date(item.date).toLocaleDateString() : '') + '</td>');
                    newRow.append('<td>' + (item.company || '') + '</td>');
                    newRow.append('<td>' + (item.po_no || '') + '</td>');
                    newRow.append('<td>' + (item.supplier || '') + '</td>');
                    newRow.append('<td>' + item.quantity + '</td>');
                    newRow.append('<td>' + (item.description || '') + '</td>');
                    newRow.append('<td>' + (item.user || '') + '</td>');

                    newRow.append('<td><a href="/job-order/' + item.id + '"> \
                        <button type="button" class="btn btn-primary"> \
                        <i class="fas fa-database"></i> Edit</button></a></td>');

                    

                    // Append the new row to the table body
                    tableBody.append(newRow);
                });

                // Initialize DataTable after adding rows
                initializeDataTable();
            },
            error: function(xhr, status, error) {
                console.error('Error fetching purchase orders:', error);
                alert('Error fetching purchase orders. Please try again later.');
            }
        });
    }

    // Fetch purchase orders on page load
    fetchAndDisplayPurchaseOrders();

    // Initialize DataTable
    const initializeDataTable = () => {
        $('#table_purchase_order').DataTable();
    };

    
});


// this is to print Purchase Order

const generatePDF = async ()  => {
    try {
        const poNoElement = document.getElementById('print_po_number');
        const poNo =  poNoElement.value;
        const response = await fetch(`/api-get-purchase-orders-by-po-number/?po_no=${poNo}`);
        const data = await response.json();

        console.log(poNo)
        console.log(data.company)

        let company_name;

        if (data.company ==='AGUA FUENTE'){
            company_name = 'AGUA FUENTE MANAGEMENT, INC.';
        }
        else if(data.company === 'DRDC'){
            company_name = 'DURAVILLE REALTY AND DEVELOPMENT CORP.';
        }
        else if(data.company === 'LCSDC'){
            company_name = 'LAND CRIS SOMERSET DEVELOPMENT CORP.';
        }

        // console.log(company_name)
        const docDefinition = {
            pageSize: { width: 595.28, height: 396.85 },
            pageOrientation: 'landscape', // Set landscape orientation
            pageMargins: [20, 30, 20, 30],
            content: [
                
                
                // Two columns layout
                {
                    columns: [
                        {
                            width: '*', // Adjust width as needed
                            stack: [
                                { text: `Company: ${company_name}`, style: 'body' },
                                { text: `${data.po_no}`, style: 'subheader' },
                                
                                { text: `Date: ${data.date}`, style: 'body' },
                                { text: `Supplier: ${data.supplier}`, style: 'body' },
                                { text: `PURCHASE ORDER`, style: 'header2' },
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: ['25%', '75%'], // Each column takes half of the page width
                                        heights: function (rowIndex) { 
                                            return rowIndex === 0 ? 10 : 85; // Set different heights for header and other rows
                                        },
                                        body: [
                                            [
                                                { text: 'Quantity', style: 'tableHeader' }, // Table header with style
                                                { text: 'Description', style: 'tableHeader' } // Table header with style
                                            ],
                                            
                                            [
                                                { text: `${data.quantity}`, style: 'tableBody' }, // Table content with style
                                                { text: `${data.description}`, style: 'tableBody' } // Table content with style
                                            ]
                                        ]
                                    },
                                    // layout: 'lightHorizontalLines' // Adds horizontal lines to the table
                                    layout: {
                                        fillColor: function (rowIndex, node, columnIndex) {
                                            return (rowIndex === 0) ? '#CCCCCC' : null; // Optional: Add background color to the header row
                                        },
                                        hLineWidth: function (i, node) {
                                            return 1; // Horizontal line width
                                        },
                                        vLineWidth: function (i, node) {
                                            return 1; // Vertical line width
                                        },
                                        hLineColor: function (i, node) {
                                            return '#000000'; // Horizontal line color
                                        },
                                        vLineColor: function (i, node) {
                                            return '#000000'; // Vertical line color
                                        }
                                    },
                                
                                
                                
                                },

                                
                                
                                {
                                    margin: [0, 20, 0, 0],
                                    stack: [
                                        {
                                            columns: [
                                                {
                                                    width: '*',
                                                    stack: [
                                                        { text: 'Prepared By:  ___________________________', style: 'signaturies' },
                                                        { text: 'Milyn Makiramdam', style: 'body3' },
                                                        { text: 'Jr. Admin Supervisor', style: 'body3' }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            margin: [0, 20, 0, 0], // Add some space between the two sections
                                            stack: [
                                                { text: 'Approved By:  ___________________________', style: 'signaturies', alignment: 'center' },
                                                { text: 'Jeffrey S. Bongat', style: 'body3' },
                                                { text: 'CFO', style: 'body3' }
                                            ]
                                        }
                                    ]
                                }
                               
                            ]
                        },
                        {
                            width: '*', // Adjust width as needed
                            stack: [
                                { text: `Company: ${company_name}`, style: 'body' },
                                { text: `${data.po_no}`, style: 'subheader' },
                                
                                { text: `Date: ${data.date}`, style: 'body' },
                                { text: `Supplier: ${data.supplier}`, style: 'body' },
                                { text: `PURCHASE ORDER`, style: 'header2' },
                                {
                                    table: {
                                        headerRows: 1,
                                        widths: ['25%', '75%'], // Each column takes half of the page width
                                        heights: function (rowIndex) { 
                                            return rowIndex === 0 ? 10 : 85; // Set different heights for header and other rows
                                        },
                                        body: [
                                            
                                            [
                                                { text: 'Quantity', style: 'tableHeader' }, // Table header with style
                                                { text: 'Description', style: 'tableHeader' } // Table header with style
                                            ],
                                            [
                                                { text: `${data.quantity}`, style: 'tableBody' }, // Table content with style
                                                { text: `${data.description}`, style: 'tableBody' } // Table content with style
                                            ]
                                        ]
                                    },
                                    // layout: 'lightHorizontalLines' // Adds horizontal lines to the table
                                    layout: {
                                        fillColor: function (rowIndex, node, columnIndex) {
                                            return (rowIndex === 0) ? '#CCCCCC' : null; // Optional: Add background color to the header row
                                        },
                                        hLineWidth: function (i, node) {
                                            return 1; // Horizontal line width
                                        },
                                        vLineWidth: function (i, node) {
                                            return 1; // Vertical line width
                                        },
                                        hLineColor: function (i, node) {
                                            return '#000000'; // Horizontal line color
                                        },
                                        vLineColor: function (i, node) {
                                            return '#000000'; // Vertical line color
                                        }
                                    },
                                
                                
                                },
                                // this line is for Signatories
                                {
                                    margin: [0, 20, 0, 0],
                                    stack: [
                                        {
                                            columns: [
                                                {
                                                    width: '*',
                                                    stack: [
                                                        { text: 'Prepared By:   ___________________________', style: 'signaturies' },
                                                        { text: 'Milyn Makiramdam', style: 'body3' },
                                                        { text: 'Jr. Admin Supervisor', style: 'body3' }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            margin: [0, 20, 0, 0], // Add some space between the two sections
                                            stack: [
                                                { text: 'Approved By:   ___________________________', style: 'signaturies', alignment: 'center' },
                                                { text: 'Jeffrey S. Bongat', style: 'body3', },
                                                { text: 'CFO', style: 'body3'}
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            styles: {
                header: { fontSize: 9, bold: true },
                header2: { fontSize: 10, bold: true, alignment: 'center' }, // Centered text for header2
                subheader: { fontSize: 9, margin: [0, 10, 0, 5] },
                body: { fontSize: 8, margin: [0, 5, 0, 5] },
                body3: { fontSize: 8, margin: [115, 5, 0, 5] },
                body2: { fontSize: 8, margin: [0, 5, 0, 5],alignment: 'center' },
                signaturies: { fontSize: 8, alignment: 'center' },
                tableHeader: { fontSize: 10, bold: true, fillColor: '#f0f0f0' },
                tableBody: { fontSize: 10, margin: [0, 5, 0, 5] } // Style for table body content
            }  
        };

        pdfMake.createPdf(docDefinition).download('Purchase_Order.pdf');
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};

// Attach the event listener to the button
var Btn_print = document.querySelector('#btn_print_purchase_order');
Btn_print.addEventListener("click", generatePDF);