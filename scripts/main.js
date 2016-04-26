// Responds to context menu options
//
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.text) {
    switch (msg.text) {
      case "getTitle":
        sendResponse($('title').text());
        break;
      case "getDesc":
        sendResponse($('meta[name="description"]').attr("content"));
        break;
      default:
        sendResponse("");
    }
  }
});

chrome.extension.sendMessage({}, function (response) {
  var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      // Generic changes applied to backend
      // Hides W3-Total Cache banner
      Backend.init();
    }
  }, 10);
});
