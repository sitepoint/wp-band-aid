"use strict";

var SeriesWidget = (function() {
  function addInstaFilter(){
    // Make series input into an insta-filter
    var seriesInput = $("#newseries");
    var seriesChecklist = $("#serieschecklist").find('li');
    if ($(seriesInput).length) {
      // series input was found
      $(seriesInput).keyup(function (e) {
        var text = $(seriesInput).val();
        if (text == "") {
          $("#serieschecklist li").removeClass("hidden");
        }
        $.each(seriesChecklist, function (index, listItem) {
          var seriesName = $(listItem).text().toLowerCase();
          if (seriesName.indexOf(text.toLowerCase()) > -1) {
            $(listItem).removeClass('hidden');
          } else {
            $(listItem).addClass('hidden');
          }
        });
      });
    }
  }

  function init(){
    addInstaFilter();
  }

  return {
    init: init
  };
})();

