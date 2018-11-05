const rule = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostEquals: 'home-c12.incontact.com'
      },
    })
  ],
  actions: [new chrome.declarativeContent.ShowPageAction()]
}

chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  chrome.declarativeContent.onPageChanged.addRules([rule]);
});
