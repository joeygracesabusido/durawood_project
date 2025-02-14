document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM fully loaded and parsed");

  const login = async () => {
    const username = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    if (!username || !password) {
      document.querySelector('#alert').innerHTML = 'Please fill out all fields.';
      return;
    }

    const search_url = `/api-login/?username1=${username}&password1=${password}`;
    console.log(`Fetching from URL: ${search_url}`);

    try {
      const response = await fetch(search_url);
      const data = await response.json();

      console.log(data);

      if (response.ok) {
        console.log("Login successful:", data.user);
        // Uncomment the following lines for actual login redirection
        // localStorage.setItem('user', JSON.stringify(data.user));
        // window.location.assign("/dashboard/");
      } else if (response.status === 400) {
        document.querySelector('#alert').innerHTML = 'Password & Username did not match';
      } else if (response.status === 401) {
        document.querySelector('#alert').innerHTML = 'Username is not registered';
      } else if (response.status === 500) {
        document.querySelector('#alert').innerHTML = 'Server error. Please try again later.';
      } else {
        document.querySelector('#alert').innerHTML = 'Error: ' + response.statusText;
      }
    } catch (error) {
      console.error('Error:', error);
      document.querySelector('#alert').innerHTML = 'Network or Fetch Error';
    }
  };

  const loginForm = document.querySelector('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();  // Prevent the form from submitting
      console.log("Login form submitted");
      login();
    });
  } else {
    console.error("Form with id 'loginForm' not found.");
  }
});

