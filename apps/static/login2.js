document.addEventListener('DOMContentLoaded', function() {
    
    console.log("DOM fully loaded and parsed");

    const login = async () => {
        var username = document.querySelector('#username').value;
        var password = document.querySelector('#password').value;

        const search_url = `/api-login/?username1=${username}&password1=${password}`;

        try {
            const response = await fetch(search_url);
            const data = await response.json();

            console.log(data);

            if (response.ok) {
                // console.log(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.assign("/dashboard/");
            } else if (response.status === 400) {
                // Incorrect password or username
                document.querySelector('#alert').innerHTML = 'Password & Username did not match';
            } else if (response.status === 401) {
                // Username not registered
                document.querySelector('#alert').innerHTML = 'Username is not registered';
            } else if (response.status === 500) {
                // Server error
                document.querySelector('#alert').innerHTML = 'Server error. Please try again later.';
            } else {
                // Other errors
                document.querySelector('#alert').innerHTML = 'Error: ' + response.statusText;
            }
        } catch (error) {
            // Network or fetch error
            console.error('Error:', error);
            document.querySelector('#alert').innerHTML = 'Network or Fetch Error';
        }
    };

    var loginCredential = document.querySelector('#BtnLogin');
    loginCredential.addEventListener("click", function () {
        console.log("Login button clicked");
        login();
    });

    document.querySelector('#password').addEventListener("keydown", function(event) {
        console.log("Key pressed: " + event.key);
        if (event.key === "Enter") {
            console.log("Enter key pressed");
            login();
        }
    });
});
