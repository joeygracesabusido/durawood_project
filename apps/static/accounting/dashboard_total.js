$(document).ready(function() {
    // Function to fetch sales data
    function fetchSales(filter) {
        $.ajax({
            url: `/api-get-sum-sales/?filter=${filter}`,
            type: 'GET',
            success: function(response) {
								console.log(response)
                // Update the amount in the h6 tag
                $('#sales-amount').text(response.toLocaleString('en-US', { style: 'currency', currency: 'PHP' }));

                // Update the label
                let labelText = filter === 'today' ? 'Today' :
                                filter === 'month' ? 'This Month' :
                                'This Year';

                $('#sales-filter-label').text(`| ${labelText}`);
            },
            error: function() {
                $('#sales-amount').text('Error loading data');
            }
        });
    }

    // Initial load (fetch today's sales by default)
    fetchSales('today');

    // Handle filter click
    $('.dropdown-item').on('click', function() {
        const filter = $(this).data('filter');
        fetchSales(filter);
    });
});

