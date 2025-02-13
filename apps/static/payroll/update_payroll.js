$(document).ready(function() {
    $('#Btn_save').on('click', function() {
        // Collect form data
        const id = $('#trans_id').val(); // Replace with the actual ID you want to update
        
        const employeeData = {
            Company: $('#Company').val(),
            EmployeeID: $('#EmployeeID').val(),
            LastName: $('#LastName').val(),
            FirstName: $('#FirstName').val(),
            MiddleName: $('#MiddleName').val(),
            Gender: $('#Gender').val(),
            Position: $('#Position').val(),
            Salaryrate: $('#Salaryrate').val() || 0,
            TaxCode: $('#TaxCode').val(),
            TIN: $('#TIN').val(),
            SSSN: $('#SSSN').val(),
            PHICN: $('#PHICN').val(),
            HDMFN: $('#HDMFN').val(),
            Tax: $('#Tax').val(),
            SSS: $('#SSS').val(),
            PHIC: $('#PHIC').val(),
            Allowance: $('#Allowance').val() || 0,
            Date_hired: $('#Date_hired').val(),
        };
        // console.log(employeeData)
        // Send AJAX request
        $.ajax({
            url: `/api-update-employee/${id}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(employeeData),
            success: function(response) {
                alert('Data has been updated successfully.');
                window.location.href = "/api-payroll-temp/"; // Redirect to the inventory list page
                // Optionally, you can redirect or clear the form here
            },
            error: function(xhr, status, error) {
                alert('An error occurred: ' + xhr.responseText);
            }
        });
    });
});