var tabData = {};

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.tab) {
    let tab = request.tab[0];
    let tabId = tab.id;
    let minutes = request.minutes;
    let seconds = request.seconds;
    let refreshEnabled = request.refreshEnabled;

    if (request.setReload === true) {
      // If there's an active interval for this tab, stop it first
      if (tabData[tab.id] && tabData[tab.id].is_active === true) {
        stopInterval(tabId);
      }

      if (refreshEnabled) {
        let timer = parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
        let countdown = timer;
        tabData[tab.id] = {
          is_active: true,
          timeInterval: setInterval(function () {
            countdown--;
            if (countdown < 0) {
              countdown = timer;
              refresh(tabId);
            }
            var badge = ("0" + Math.floor(countdown / 60)).slice(-2) + ":" + ("0" + (countdown % 60)).slice(-2);
            chrome.action.setBadgeText({ text: badge, tabId: tabId });
          }, 1000),
          minutes,
          seconds,
        };
        sendResponse(tabData);
      }
    }
  } else if (request.tabData == true) {
    sendResponse(tabData);
  }
});

// Stop Interval for a specific tab
function stopInterval(tabId) {
  if (tabData[tabId] && tabData[tabId].is_active) {
    clearInterval(tabData[tabId].timeInterval);
    chrome.action.setBadgeText({ text: "", tabId: tabId });
    tabData[tabId].is_active = false;
  }
}

// Refresh Script
function refresh(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => { window.location.reload(); },
  });
}
