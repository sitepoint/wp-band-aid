"use strict";

var TagsWidget = (function() {
  function addCopyTagsButton(){
    var tagsFrame = $("#tagsdiv-post_tag");
    var tagsContainer = $(tagsFrame).find(".tagchecklist");
    if ($(tagsContainer).length) {

      // container of tags found
      var tagsButton = document.createElement('button');
      tagsButton.innerText = "Copy tags";
      tagsButton.className = "wp-core-ui button";

      $(tagsButton).click(function (e) {

        var tags = $(tagsContainer).find("span");
        if ($(tags).length) {
          // tags exist
          var tagString = "";
          $.each(tags, function (index, tagSpan) {
            var text = $(tagSpan).text();
            text = text.replace(text.substr(0, 2), "");
            if (tagString == "") {
              tagString = text;
            } else {
              tagString += ", " + text;
            }
          });
          copyTextToClipboard(tagString);
        }
        return false;
      });

      $(tagsFrame).find(".ajaxtag").append(tagsButton);
    }
  }

  function init(){
    addCopyTagsButton();
  }

  return {
    init: init
  };
})();
