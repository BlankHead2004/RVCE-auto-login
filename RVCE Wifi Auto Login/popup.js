document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const refreshIntervalInput = document.getElementById('refreshInterval');
  const intervalValue = document.getElementById('intervalValue');
  const refreshToggle = document.getElementById('refreshToggle');
  const message = document.getElementById('message');
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Load stored settings
  chrome.storage.sync.get(['username', 'password', 'refreshInterval', 'refreshToggle', 'mode'], (items) => {
    if (items.username) usernameInput.value = items.username;
    if (items.password) passwordInput.value = items.password;
    if (items.refreshInterval) {
      refreshIntervalInput.value = items.refreshInterval;
      intervalValue.textContent = items.refreshInterval;
      updateSliderValue(refreshIntervalInput.value);
    } else {
      refreshIntervalInput.value = 5;
      intervalValue.textContent = 5;
      updateSliderValue(5);
    }
    refreshToggle.checked = items.refreshToggle !== undefined ? items.refreshToggle : true;
    if (items.mode === 'dark') {
      document.body.classList.add('dark-mode');
      darkModeToggle.checked = true;
    } else {
      document.body.classList.remove('dark-mode');
      darkModeToggle.checked = false;
    }
  });

  // Update interval value display and slider fill
  refreshIntervalInput.addEventListener('input', () => {
    intervalValue.textContent = refreshIntervalInput.value;
    updateSliderValue(refreshIntervalInput.value);
  });

  // Save settings
  document.getElementById('save').addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const refreshInterval = refreshIntervalInput.value;
    const refreshEnabled = refreshToggle.checked;

    if (!username || !password) {
      message.textContent = 'Inputs cannot be empty!';
      message.classList.add('error');
      return;
    }

    chrome.storage.sync.set({ username, password, refreshInterval, refreshToggle: refreshEnabled }, () => {
      message.textContent = 'Credentials saved!';
      message.classList.remove('error');
      setTimeout(() => {
        window.close(); // Close the popup
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          let tabId = tabs[0].id;
          chrome.tabs.reload(tabId); // Reload the current tab
          chrome.runtime.sendMessage({
            tab: tabs,
            minutes: refreshInterval,
            seconds: 0,
            setReload: true,
            refreshEnabled: refreshEnabled
          });
        });
      }, 1000); // Display the message for 1 second before closing
    });
  });

  // Dark mode toggle
  darkModeToggle.addEventListener('change', function () {
    if (darkModeToggle.checked) {
      document.body.classList.add('dark-mode');
      chrome.storage.sync.set({ mode: 'dark' });
    } else {
      document.body.classList.remove('dark-mode');
      chrome.storage.sync.set({ mode: 'light' });
    }
  });

  // Update slider value for custom styles
  function updateSliderValue(value) {
    const max = refreshIntervalInput.max;
    const percentage = (value / max) * 100;
    refreshIntervalInput.style.setProperty('--slider-value', `${percentage}%`);
  }
});
