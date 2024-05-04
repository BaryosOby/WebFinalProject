document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector('form');
    const submitButton = form.querySelector('input[type="submit"]');

    form.addEventListener('submit', async function(event) {
      event.preventDefault(); // Prevent the default form submission

      // Reset previous error messages
      clearErrorMessages();

      // Validation checks
      const firstName = form.querySelector('input[name="firstName"]').value;
      const email = form.querySelector('input[name="email"]').value;
      const password = form.querySelector('input[name="password"]').value;
      const repeatPassword = form.querySelector('input[name="repeatPassword"]').value;

      if (!firstName || !email || !password || !repeatPassword) {
        displayErrorMessage('All fields are required.');
      } else if (password !== repeatPassword) {
        displayErrorMessage('Passwords do not match.');
      } else if (password.length < 8) {
        displayErrorMessage('Password must be at least 8 characters long.');
      } else if (!isValidEmail(email)) {
        displayErrorMessage('Invalid email format.');
      } else {
        const formData = {
          firstName,
          email,
          password
        };

        try {
          const response = await fetch('/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });

          if (!response.ok) {
            const data = await response.json();
            displayErrorMessage(data.message);
          } else {
            // Registration successful, redirect to login page
            window.location.href = "/login";
          }
        } catch (error) {
          console.error('An error occurred during registration:', error);
          displayErrorMessage('An error occurred while registering. Please try again later.');
        }
      }
    });

    function displayErrorMessage(message) {
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('error-message');
      errorMessage.textContent = message;
      form.appendChild(errorMessage);
    }

    function clearErrorMessages() {
      const errorMessages = document.querySelectorAll('.error-message');
      errorMessages.forEach(msg => msg.remove());
    }

    function isValidEmail(email) {
      // Basic email format validation using regular expression
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

  });
