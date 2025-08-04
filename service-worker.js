chrome.action.onClicked.addListener((tab) => {
  // Set the side panel options for this tab only
  chrome.sidePanel.setOptions(
    {
      tabId: tab.id,
      path: 'interface/interface.html',
      enabled: true,
    },
    () => {
      // Open the side panel only in the current tab
      chrome.sidePanel.open({ tabId: tab.id });
    }
  );
});
