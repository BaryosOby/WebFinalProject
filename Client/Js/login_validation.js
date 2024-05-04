document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector('form');
    const submitButton = form.querySelector('input[type="submit"]');

    form.addEventListener('submit', async function(event) {
      event.preventDefault(); // Prevent the default form submission

      // Reset previous error messages
      clearErrorMessages();

      // Validation checks
      const email = form.querySelector('input[name="email"]').value;
      const password = form.querySelector('input[name="password"]').value;

      if (!email || !password) {
        displayErrorMessage('All fields are required.');
      } else {
        const formData = {
          email,
          password
        };

        try {
          const response = await fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData) // Send data as JSON
          });

          if (!response.ok) {
            const data = await response.json();
            displayErrorMessage(data.message);
          } else {
            // Login successful, redirect to todos page
            window.location.href = `/todos?email=${email}`;
          }
        } catch (error) {
          console.error('Login logger - Error logging in:', error);
          displayErrorMessage('An error occurred while logging in. Please try again later.');
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
  });
