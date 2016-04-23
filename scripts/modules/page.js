"use strict";

var Page = (function() {
  function hideUnnecessaryElements(){
    // W3-Total Cahe banner
    $("#edge-mode").remove();

    // WP own date input
    $(".timestamp-wrap").remove();

    // Is this a good headline?
    $(".CosheduleButtonContainer").remove();

    // Publish to Discourse option
    $("input[name='publish_to_discourse']").closest("div").remove();
  }

  function init(){
    hideUnnecessaryElements();
  }

  return {
    init: init
  };
})();
