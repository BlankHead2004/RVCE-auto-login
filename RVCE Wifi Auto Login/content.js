// content.js

// Wait for the DOM to fully load
window.addEventListener('load', function() {
  chrome.storage.sync.get(['username', 'password'], (items) => {
    if (items.username && items.password) {
      // Fill in the username and password fields
      document.querySelector('#ft_un').value = items.username;
      document.querySelector('#ft_pd').value = items.password;

      // Submit the form
      document.querySelector('.primary[type="submit"]').click();
    }
  });
}, false);
