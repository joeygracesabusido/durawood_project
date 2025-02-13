$(document).ready(function() {
    $("#name").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: "/api-autocomplete-employee/",
                data: { term: request.term },
                dataType: "json",
                success: function(data) {
                    response(data);
                },
                error: function(err) {
                    console.error("Error fetching autocomplete data:", err);
                    // Optionally, provide user feedback about the error
                }
            });
        },
        minLength: 0,  // Minimum length of the input before triggering autocomplete
        select: function(event, ui) {
            $("#name").val(ui.item.value); 
            $("#employee_no").val(ui.item.employee_no);
            $("#company").val(ui.item.company);
            $("#salary_status").val(ui.item.salary_status);
            $("#rate").val(Number(ui.item.rate).toFixed(2));
            $("#salary").val((Number(ui.item.rate) * 6).toFixed(2));
            // $("#hdmf_loan").val(Number(ui.item.total_hdmf_loan_deduction).toFixed(2));
            // $("#general_loan").val(Number(ui.item.total_cash_advance).toFixed(2));

            // calculatetotalGross()
            // calculateAbsentAmount()
            calculatetotalGross()
            return false;
        }
    });

  
});



// ================================This is for computation for Holiday OT====================================
$(document).ready(function() {
    // Event listener for input changes
    $('#holiday_ot_number, #rate').on('input', function() {
        // Check the state of the checkboxes and call the appropriate function
        if ($('#spl_ot_checkbox').is(':checked')) {
            calculateSpl();
        } else if ($('#lgl2_checkbox').is(':checked')) {
            calculateLgl2();
        }
    });
});




// =================================This is for computation for Gross Salary======================
$(document).ready(function() {
    $('#salary, #absent_amount, \
    #late_amount,#under_time_amount,#normal_working_day_ot_amount, \
    #spl_30_amount,#legal_holiday_amount,#holiday_ot_amount, \
    #basic_pay_adjustment').on('input', function() {
        calculatetotalGross();
    });
    });

    function calculatetotalGross() {
    
    let salary;
    let absent_amount;
    let late_amount;
    let under_time_amount;
    let normal_working_day_ot_amount;
    let spl_30_amount;
    let legal_holiday_amount;
    let holiday_ot_amount;
    let basic_pay_adjustment


    salary = $('#salary').val() || 0;
    absent_amount = $('#absent_amount').val() || 0;
    late_amount = $('#late_amount').val() || 0;
    under_time_amount = $('#under_time_amount').val() || 0;
    normal_working_day_ot_amount = $('#normal_working_day_ot_amount').val() || 0;
    spl_30_amount = $('#spl_30_amount').val() || 0;
    legal_holiday_amount = $('#legal_holiday_amount').val() || 0;
    holiday_ot_amount = $('#holiday_ot_amount').val() || 0;
    basic_pay_adjustment = $('#basic_pay_adjustment').val() || 0;
    
    let product;
    let product2
    product = (parseFloat(salary) + parseFloat(absent_amount)
                    + parseFloat(late_amount) + parseFloat(under_time_amount)
                    + parseFloat(normal_working_day_ot_amount) + parseFloat(spl_30_amount)
                    + parseFloat(legal_holiday_amount) + parseFloat(holiday_ot_amount)
                    + parseFloat(basic_pay_adjustment));

    product2 = product.toFixed(2);
    const stringNumber = product.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    $('#gross_pay').val(stringNumber);
    $('#gross_pay').val(product2);
    }
