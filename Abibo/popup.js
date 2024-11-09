document.addEventListener('DOMContentLoaded', () => {
  displayCredentials();

  // Add event listener for the "Add Credential" button
  document.getElementById('addCredentialButton').addEventListener('click', addCredential);

  // Delegate event listeners for login and delete buttons
  document.getElementById('credentialsList').addEventListener('click', function(event) {
    if (event.target.classList.contains('login-button')) {
      const index = event.target.getAttribute('data-index');
      login(index);
    } else if (event.target.classList.contains('delete-button')) {
      const index = event.target.getAttribute('data-index');
      deleteCredential(index);
    }
  });
});

function addCredential() {
  const username = prompt("Enter Username:");
  const password = prompt("Enter Password:");
  const environment = prompt("Enter Environment (production/sandbox):");

  if (username && password && (environment === 'production' || environment === 'sandbox')) {
    const credential = { username, password, environment };

    chrome.storage.sync.get({ credentialsList: [] }, function(data) {
      const credentialsList = data.credentialsList;
      credentialsList.push(credential);
      chrome.storage.sync.set({ credentialsList }, () => {
        console.log('Credential added');
        displayCredentials();
      });
    });
  } else {
    alert("Please provide valid inputs.");
  }
}

function displayCredentials() {
  chrome.storage.sync.get({ credentialsList: [] }, function(data) {
    const credentialsList = data.credentialsList;
    const credentialsListDiv = document.getElementById('credentialsList');
    credentialsListDiv.innerHTML = '';

    credentialsList.forEach((cred, index) => {
      const credDiv = document.createElement('div');
      credDiv.className = 'credential';
      credDiv.innerHTML = `
        <div>
          <p><strong>Username:</strong> ${cred.username}</p>
          <p><strong>Environment:</strong> ${cred.environment}</p>
        </div>
        <div>
          <button class="login-button" data-index="${index}">Login</button>
          <button class="delete-button" data-index="${index}">Delete</button>
        </div>
      `;
      credentialsListDiv.appendChild(credDiv);
    });
  });
}

function login(index) {
  chrome.storage.sync.get({ credentialsList: [] }, function(data) {
    const credentialsList = data.credentialsList;
    const cred = credentialsList[index];

    // Open the Salesforce login page in a new tab
    const url = cred.environment === 'production' ? 'https://login.salesforce.com' : 'https://test.salesforce.com';
    chrome.tabs.create({ url: url }, function(tab) {
      // Wait for the tab to load, then send credentials after a brief delay
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, {
          action: "fillLoginForm",
          username: cred.username,
          password: cred.password
        }, function(response) {
          if (response && response.status === "success") {
            console.log("Login credentials filled successfully.");
          } else {
            console.error("Failed to fill login form.");
          }
        });
      }, 5000); // Adjust this timeout if necessary
    });
  });
}

function deleteCredential(index) {
  chrome.storage.sync.get({ credentialsList: [] }, function(data) {
    const credentialsList = data.credentialsList;
    credentialsList.splice(index, 1);
    chrome.storage.sync.set({ credentialsList }, displayCredentials);
  });
}
