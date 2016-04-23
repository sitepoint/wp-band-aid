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
      // This part of the script triggers when page is done loading

      // Generic changes applied to whole page
      // Hides unnecessary elements
      Page.init();

      // Editor bar
      // Add button to convert MD -> HTML
      EditorToolbar.init();


      // Title area
      // Editor pane
      // Tags widget
      // Series Widget
      // Publish widget
      // Syntax highlight widget

      // This is defined in all.js
      init();
    }
  }, 10);
});

