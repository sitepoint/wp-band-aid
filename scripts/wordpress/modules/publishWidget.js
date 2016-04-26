"use strict";

var PublishWidget = (function() {
  function slugIsInvalid(){
    var slugVal = $("#editable-post-name-full").text();
    return typeof slugVal === "undefined" ||
         !slugVal.match(/^\w+-\w+.*?$/) ||
         /^\d*$/.test(slugVal.replace(/-/, ''));
  }

  function addDatePicker(){
    var datepicker = document.createElement('input');
    datepicker.type = 'text';
    datepicker.placeholder = 'Date and time';
    $(datepicker).datetimepicker();
    $(datepicker).change(function (e) {

      // WP default datetime field IDs
      // mm = month / 01 - 12
      // jj = day
      // aa = year 4 digit
      // hh = hour
      // mn = min

      var dtSplit = $(this).val().split(' ');
      var dateSplit = dtSplit[0].split('/');
      var timeSplit = dtSplit[1].split(':');

      $("#mm").val(dateSplit[1]);
      $("#jj").val(dateSplit[2]);
      $("#aa").val(dateSplit[0]);

      $("#hh").val(timeSplit[0]);
      $("#mn").val(timeSplit[1]);

    });
    $("#timestampdiv").prepend(datepicker);
  }

  function init(){
    // Add event listener to 'Save Draft' and 'Publish' buttons
    // to prevent article being saved/scheduled with invalid slug
    var $publishButton = $("#publish");
    var $saveDraftButton = $("#save-post");
    var $scheduleButtons = $publishButton.add($saveDraftButton);

    if ($scheduleButtons.length) {
      $scheduleButtons.on("click", function(e){
        if(slugIsInvalid()){
          return confirm("URL looks dodgy! Are you sure?");
        }
      });
    }

    addDatePicker();
  }

  return {
    init: init
  };
})();
