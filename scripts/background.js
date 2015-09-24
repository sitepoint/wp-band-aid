var settings = new Store("settings", {
    "sample_setting": "This is how you use Store.js to remember values"
});

chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        chrome.pageAction.show(sender.tab.id);
        sendResponse(settings.toObject());
    }
);

chrome.contextMenus.create({
    'title': "Copy description",
    'contexts': ['page'],
    'onclick': function (info, tab) {
        chrome.tabs.sendMessage(tab.id, {text: "getDesc"}, function (desc) {
            copyTextToClipboard(desc);
        });
    }
});

chrome.contextMenus.create({
    'title': "Copy title",
    'contexts': ['page'],
    'onclick': function (info, tab) {
        chrome.tabs.sendMessage(tab.id, {text: "getTitle"}, function (title) {
            copyTextToClipboard(title);
        });
    }
});

chrome.contextMenus.create({
    'title': "Copy target description",
    'contexts': ['link'],
    'onclick': function (info, tab) {
        $.get(info.linkUrl, function(data){
            var desc = $(data).filter("meta[name='description']").attr('content');
            copyTextToClipboard(desc);
        });
    }
});

chrome.contextMenus.create({
    'title': "Copy target title",
    'contexts': ['link'],
    'onclick': function (info, tab) {
        $.get(info.linkUrl, function(data){
            var title = $(data).filter("title").text();
            copyTextToClipboard(title);
        });
    }
});