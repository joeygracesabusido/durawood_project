$(document).ready(function() {
    $('#sign_up_form').on('submit', function(e) {
        e.preventDefault();

        // Retrieve password values
        var password = $('#password').val();
        var password2 = $('#password2').val();

        // Check if passwords match
        if (password !== password2) {
            $('#message').html('<div class="alert alert-danger">Passwords do not match.</div>');
            return; // Stop the form submission
        }

        // Proceed if passwords match
        var formData = {
            fullname: $('#full_name').val(),
            password: $('#password').val(),
            email_add: $('#email_add').val(),
            role: $('#role').val(),
            date_created: new Date().toISOString() // current datetime in ISO format
        };

        $.ajax({
            url: '/api-sign-up',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                $('#message').html('<div class="alert alert-success">' + response.message + '</div>');
                $('#sign_up_form')[0].reset();

                window.location.assign("/")
            },
            error: function(xhr, status, error) {
                $('#message').html('<div class="alert alert-danger">Error: ' + xhr.responseText + '</div>');
            }
        });
    });
});
