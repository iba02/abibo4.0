(function() {
  console.log("Content script loaded");

  // Function to fill in the login form
  function fillLoginForm(username, password) {
    // Find the username and password input fields in the main document
    let usernameField = document.getElementById('username');
    let passwordField = document.getElementById('password');
    let loginButton = document.getElementById('Login');

    // If not found, check for an iframe (Salesforce often uses iframes)
    if (!usernameField || !passwordField || !loginButton) {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        usernameField = iframeDoc.getElementById('username');
        passwordField = iframeDoc.getElementById('password');
        loginButton = iframeDoc.getElementById('Login');
      }
    }

    // Check if the fields exist
    if (usernameField && passwordField && loginButton) {
      // Fill in the username and password
      usernameField.value = username;
      passwordField.value = password;

      // Click the login button
      loginButton.click();
    } else {
      console.error("Login fields not found.");
    }
  }

  // Function to retry filling the form until the fields are available
  function tryFillLoginForm(username, password, retries = 5) {
    const interval = setInterval(() => {
      const usernameField = document.getElementById('username');
      const passwordField = document.getElementById('password');
      const loginButton = document.getElementById('Login');

      // If fields are found, fill them in
      if (usernameField && passwordField && loginButton) {
        clearInterval(interval);
        fillLoginForm(username, password);
      } else if (retries <= 0) {
        clearInterval(interval);
        console.error("Login fields still not found after multiple retries.");
      }

      retries--;
    }, 1000); // Retry every 1 second
  }

  // Listen for messages from the background script (popup)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fillLoginForm") {
      console.log("Filling login form with:", request.username, request.password);
      tryFillLoginForm(request.username, request.password);
      sendResponse({ status: "success" });
    }
  });
})();
