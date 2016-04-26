"use strict";

var Backend = (function() {
  function hideUnnecessaryElements(){
    // W3-Total Cache banner
    $("#edge-mode").remove();
  }

  function init(){
    hideUnnecessaryElements();
  }

  return {
    init: init
  };
})();
