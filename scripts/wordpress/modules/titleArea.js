"use strict";

var TitleArea = (function() {
  function addSubHeadingsButton(titleWrap, editorfield) {
    var subBtn = document.createElement('button');
    subBtn.innerText = "Capitalize Subheadings";
    subBtn.className = "wp-core-ui button bandaid-button-title";
    subBtn.id ="bandaid-capitalize-subheadings";
    var rx = /<(h[2-6]).+>(.+)<\/\1>/ig;

    $(subBtn).click(function (e) {
      e.preventDefault();
      var content = $(editorfield).val();
      var matches = getAllMatches(rx, content);
      var fixable = [];
      var processed = [];
      $.each(matches, function (i, match) {
        var orig = match[2];
        var capped = capitalize(orig);
        if (processed.indexOf(capped) > -1) {
          return true;
        }
        processed.push(capped);
        if (orig !== capped) {
          // Heading can be capitalized
          fixable.push({original: orig, fixed: capped});
        }
      });

      // Build list of capitalizable headings
      var list = document.createElement('p');
      $(list).text("Nothing to optimize, all subheadings look good!");

      var actionButton;
      if (fixable.length) {
        list = document.createElement('ul');
        $.each(fixable, function (i, obj) {

          var li = document.createElement('li');
          li.className = "bandaid-cappable-heading";

          var label = document.createElement('label');
          $(label).text('Fix: "' + obj.original + '" => "' + obj.fixed + '"');

          var checkbox = document.createElement('input');
          checkbox.type = "checkbox";
          checkbox.name = "cappable[]";
          checkbox.value = obj.original;
          $(checkbox).prop('checked', true);
          $(checkbox).change(function() {
            if (!$(this).is(":checked")) {
              $(".check-all").prop("checked", false);
            }
          });

          $(label).prepend(checkbox);
          $(li).append(label);
          $(list).append(li);

          actionButton = document.createElement("button");
          actionButton.className = "wp-core-ui button button-primary";
          actionButton.id = "bandaid-fix-selected";
          actionButton.innerText = "Fix selected";
          $(actionButton).click(function() {
            var checkboxes = $(".bandaid-cappable-heading input:checked");
            $.each(checkboxes, function (i, obj) {
              var value = $(obj).val();
              content = content.replace(value, capitalize(value));
            });
            $(editorfield).val(content);
            hideModal();
          });
        });

        var li = document.createElement('li');
        li.className = "check-all-li";
        var label = document.createElement('label');
        $(label).text('Check all');

        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.className = "check-all";
        $(checkbox).prop('checked', true);

        function checkAll() {
          var $checkboxes = $(".bandaid-cappable-heading input");
          if ($(this).is(":checked")) {
            $checkboxes.prop('checked', true);
            $(".check-all").prop('checked', true);
          } else {
            $checkboxes.prop('checked', false);
            $(".check-all").prop('checked', false);
          }
        }

        var len = fixable.length;
        if (len > 1) {
          $(label).prepend(checkbox);
          $(li).append(label);
          $(list).prepend(li);
          $(checkbox).change(checkAll);
        }

        if (len > 10) {
          var l1 = $(li).clone();
          $(list).append(l1);
          $(l1).find('input').change(checkAll);
        }
      }

      showModal('Fixable subheadings', list, actionButton);
    });

    $(titleWrap).append(subBtn);
  }

  function addRebuildSlugButton() {
    var subBtn = document.createElement('a');
    subBtn.innerText = "Rebuild Link";
    subBtn.className = "button button-small";
    subBtn.id = "bandaid-rebuild-link";

    $(subBtn).click(function(e) {
      e.preventDefault();
      $("button.edit-slug").click();
      var title = $("input[name='post_title']").val();
      $("#new-post-slug").val(title);
      $("button.save").click();
    });

    $('#edit-slug-box').parent().append(subBtn);
  }

  function addCopyPermalinkButton() {
    var a = document.createElement('a');
    a.className = 'button button-small bandaid-copy-link';
    a.innerText = "Copy Link";
    $(a).click(function(){
      copyTextToClipboard("https://www.sitepoint.com/"+$("#editable-post-name-full").text());
    });
    $('#edit-slug-box').parent().append(a);
  }

  function getHeadlineAnalysis(headline){
    return $.get("https://cos-headlines.herokuapp.com/?headline=" + headline);
  }

  function buildResults(data, compiledTemplate){
    function getSentiment(sentiment){
      return (sentiment === "positive")? "positive" : "negative";
    }

    function isPositive(val){
      return getSentiment(val) === "positive";
    }

    function getVal(obj, key){
      try {
        return obj[key];
      } catch(e) {
        return undefined;
      }
    }

    function exists(val){
      return val !== undefined;
    }

    var html = compiledTemplate({
      score: data.score.total,

      charCountSentiment: getSentiment(data.char_count.summary),
      charCountGood: isPositive(data.char_count.summary),
      charCountLength: data.char_count.length,
      charCountScore: data.char_count.score,
      hasCharCountSuggestions: exists(data.suggestions.char_length),
      charCountMessage: getVal(data.suggestions.char_length, "message"),
      charCountSuggestion: getVal(data.suggestions.char_length, "suggestion"),

      wordCountSentiment: getSentiment(data.word_count.summary),
      wordCountGood: isPositive(data.word_count.summary),
      wordCountLength: data.word_count.length,
      wordCountScore: data.word_count.score,
      hasWordCountSuggestions: exists(data.suggestions.word_count),
      wordCountMessage: getVal(data.suggestions.word_count, "message"),
      wordCountSuggestion: getVal(data.suggestions.word_count, "suggestion"),

      sentimentSummary: getSentiment(data.sentiment.summary),
      sentimentGood: data.sentiment.summary !== "neutral",

      wordBalanceSentiment: getSentiment(data.word_balance.summary),
      wordBalanceGood: isPositive(data.word_balance.summary),
      commonWordsInHeadline: exists(data.suggestions.common_words),
      wordBalanceMessage: getVal(data.suggestions.common_words, "message"),
      wordBalanceSuggestion:getVal(data.suggestions.common_words, "suggestion"),
      wordBalancePercentage: data.word_balance.common.percentage,
      wordBalanceUncommonPercentage: data.word_balance.uncommon.percentage,
      wordBalanceEmotionalPercentage: data.word_balance.emotional.percentage,
      wordBalancePowerPercentage: data.word_balance.power.percentage,

      hasTypeSuggestions: exists(data.suggestions.type),
      typeMessage: getVal(data.suggestions.type, "message"),
      typeSuggestion: getVal(data.suggestions.type, "suggestion"),
    });

    return html;
  }

  function init(){
    var titleWrap = $("#titlewrap");
    var titleInput = $("#title");
    var editorField = $(".wp-editor-area");

    // Get and compile headline analyzer template
    var headLineTemplateURL = chrome.runtime.getURL("/fragments/headline-analyzer.hbs");
    var headlineAnalyzerTemplate;
    $.get(headLineTemplateURL, function(data) {
      headlineAnalyzerTemplate = Handlebars.compile(data);
    });

    // Add the headline analysis score bar and capitalizer
    var scoreFrame = document.createElement('div');
    scoreFrame.className = 'headalyze';
    var scoreBar = document.createElement('div');
    scoreBar.className = 'headalyze-bar';
    var scoreInfo = document.createElement('div');
    scoreInfo.className = 'headalyze-info';
    var scorePointer = document.createElement('div');
    scorePointer.className = 'pointer';
    $(scoreBar).append(scorePointer);
    $(scoreFrame).append(scoreBar);
    $(scoreFrame).append(scoreInfo);
    $(scoreFrame).click(function() {
      $(scoreInfo).toggle();
    });

    var titleCapBtn = document.createElement('button');
    titleCapBtn.innerText = "Capitalize and Check";
    titleCapBtn.className = "wp-core-ui button bandaid-capitalize-and-check";
    titleCapBtn.id ="bandaid-capitalize-and-check";

    $(titleCapBtn).on("click", function(e){
      e.preventDefault();
      $(titleInput).val(capitalize($(titleInput).val()));

      getHeadlineAnalysis($(titleInput).val())
      .done(function(data){
        $(scorePointer).css("left", data.score.total + "%");
        var html = buildResults(data, headlineAnalyzerTemplate);
        $(scoreInfo).html(html);
      })
      .fail(function(){
        window.alert("Could not contact API");
      });
    });

    $(titleWrap).append(scoreFrame);
    $(titleWrap).append(titleCapBtn);

    addSubHeadingsButton(titleWrap, editorField);
    addRebuildSlugButton(titleWrap);
    addCopyPermalinkButton();
  }

  return {
    init: init
  };
})();
