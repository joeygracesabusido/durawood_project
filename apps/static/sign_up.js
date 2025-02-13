$(document).ready(function() {
    $('#sign-up-form').on('submit', function(e) {
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
            full_name: $('#fullname').val(),
            username: $('#username').val(),
            hashed_password: $('#password').val(),
            email_add: $('#email_add').val(),
            role: $('#role').val(),
            is_active: $('#is_activate').val(),
            date_created: new Date().toISOString() // current datetime in ISO format
        };

        $.ajax({
            url: '/sign-up',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                $('#message').html('<div class="alert alert-success">' + response.message + '</div>');
                $('#sign-up-form')[0].reset();

                window.location.assign("/")
            },
            error: function(xhr, status, error) {
                $('#message').html('<div class="alert alert-danger">Error: ' + xhr.responseText + '</div>');
            }
        });
    });
});
