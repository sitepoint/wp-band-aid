"use strict";

var EditorPane = (function() {
  var checkFor = {
    "strings": ["[author_more]"],
    "patterns": []
  };
  var rx = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/ig;

  // Check editor text for strings and patterns
  var editorField = $(".wp-editor-area");

  function init(){
    // Add information row
    var row = document.createElement('tr');
    var cell = document.createElement('td');
    $(cell).attr('colspan', 2);
    row.className = "proofreader-main-row";
    row.appendChild(cell);

    var table = $("#post-status-info");
    $(table).find('tbody').prepend(row);

    // ----------------------------------------------------

    // Add secondary information row above text area
    var tableClone = document.createElement('table');
    tableClone.className = "post-info-table upper";
    $(tableClone).append('<tbody></tbody>');
    $(tableClone).find('tbody').prepend($(row).clone());
    //$(tableClone).insertBefore("#wp-content-editor-container");
    $("#ed_toolbar").append(tableClone);


    // Check if editor expand toggle is on

    var toggle = $('#editor-expand-toggle');
    $(toggle).change(function (e) {
      if ($(toggle).is(':checked')) {
        $("table.post-info-table.upper").show();
      } else {
        $("table.post-info-table.upper").hide();
      }
    });
    $(toggle).change();


    // ----------------------------------------------------

    var checker = setInterval(function () {
      var errorMessages = [];
      var content = $(editorField).val();

      checkFor.strings.forEach(function (a) {
        if (content.indexOf(a) === -1) {
          errorMessages.push("Missing " + a + "!");
        }
      });

      var matches = getAllMatches(rx, content);
      $.each(matches, function (i, el) {
        if (!linkOk(el[1])) {
          errorMessages.push("Relative link found: " + el[1]);
        }
      });

      if (errorMessages.length && content != "") {
        $(editorField).addClass('error');
        $(".proofreader-main-row").addClass("error");
        var cellText = "";
        $.each(errorMessages, function (i, msg) {
          cellText += msg + "<br>";
        });
        $(".proofreader-main-row td").html(cellText)
      } else {
        $(editorField).removeClass('error');
        $(".proofreader-main-row").removeClass("error");
        $(".proofreader-main-row td").text("All good");
      }
    }, 2000);
  }

  return {
    init: init
  };
})();
