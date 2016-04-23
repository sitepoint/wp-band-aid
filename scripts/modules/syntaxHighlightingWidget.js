"use strict";

var SyntaxHighlightingWidget = (function() {
  function defaultToPrimaryCategory(){
    // Make the syntax highlighting default to the primary category, if available
    $("#primary_category").change(function (e) {
      var optionText = $(this).find("option:selected").text();
      var syntaxSelector = $('select[name="base_syntax"]');

      var syntaxOptionValue = $(syntaxSelector).find('option').filter(function () {
        return $(this).text().toLowerCase() == optionText.toLowerCase();
      }).val();

      if (syntaxOptionValue !== undefined) {
        $(syntaxSelector).val(syntaxOptionValue);
      }
    });
  }

  function init(){
    defaultToPrimaryCategory();
  }

  return {
    init: init
  };
})();
