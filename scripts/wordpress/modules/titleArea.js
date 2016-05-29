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
          $(checkbox).change(function (e) {
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
          $(actionButton).click(function (e) {
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

        function checkAll(e) {
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

  function addRebuildSlugButton(titleWrap) {
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
    $(a).click(function(e){
      copyTextToClipboard("https://www.sitepoint.com/"+$("#editable-post-name-full").text());
    });
    $('#edit-slug-box').parent().append(a);
  }

  function getHeadlineAnalysis(headline){
    return $.get("https://cos-headlines.herokuapp.com/?headline=" + headline);
  }

  function buildResults(data){
    /*
      Score
      Character count
      Word count
      Sentiment
      Word balance
      Advice
    */

    function getSentiment(sentiment){
      return (sentiment === "positive")? "positive" : "negative";
    }

    function getValueIfExists(obj, key){
      try {
        return obj[key];
      } catch(e) {
        return undefined;
      }
    }

    function getTemplate(){
      return `
        <h3>Headline Analysis Score: {{score}} </h3>

        <div class='{{charCountSentiment}}'>
          {{#if charCountGood}}
            &#10004; The headline's character count seems fine.
            You're at {{charCountLength}}, scoring {{charCountScore}} / 100.
          {{else}}
            &bigotimes; Character length could be better. Aim for 55 or so characters.
            You're now at {{charCountLength}}, scoring {{charCountScore}} / 100.
          {{/if}}
        </div>
        {{#if hasCharCountSuggestions}}
          <div class='{{charCountSentiment}}'>
            {{charCountMessage}} {{charCountSuggestion}}
          </div>
        {{/if}}

        <div class='{{wordCountSentiment}}'>
          {{#if wordCountGood}}
            &#10004; The headline's word count count seems fine.
            You're at {{wordCountLength}}, scoring {{wordCountScore}} / 100.
          {{else}}
            &bigotimes; Word count could be better. Aim for 6 words for best results.
            You're now at {{wordCountLength}}, scoring {{wordCountScore}} / 100.<br>
          {{/if}}
        </div>
        {{#if hasWordCountSuggestions}}
          <div class='{{wordCountSentiment}}'>
            {{wordCountMessage}} {{wordCountSuggestion}}
          </div>
        {{/if}}

        <div class='{{sentimentSummary}}'>
          {{#if sentimentGood}}
             &#10004; The sentiment looks good!
          {{else}}
            &bigotimes; Your sentiment is neutral.
            Good clickbait is either strongly positive or negative.
          {{/if}}
        </div>

        <div class='{{wordBalanceSentiment}}'>
          {{#if wordBalanceGood}}
             &#10004; The word balance seems fine.
          {{else}}
            &bigotimes; Your word balance is off.
          {{/if}}
        </div>
        {{#unless wordBalanceGood}}
          {{#if commonWordsInHeadline}}
            <div class='{{wordBalanceSentiment}}'>
              {{wordBalanceMessage}} {{wordBalanceSuggestion}}
            </div>
          {{/if}}
          <ul>
            <li>
              <span class='bold score'>{{wordBalancePercentage}} %</span> of your words are common.
              Common words make up the basic structure of readable headlines.
              Great headlines are usually made up of 20-30% common words.
              <span class='bold'>Common words are words like: a, about, after, and, her, how, this, why, these, what, your, things...</span>
            </li>
            <li>
              <span class='bold score'>{{wordBalanceUncommonPercentage}} %</span> of your words are uncommon.
              Uncommon words occur less frequently than common words, but give your headline substance.
              Great headlines are usually made up of 10-20% uncommon words.
              <span class='bold'>Examples: actually, awesome, baby, beautiful, heart, here, more, right, see, social, world, year...</span>
            </li>
            <li>
              <span class='bold score'>{{wordBalanceEmotionalPercentage}} %</span> of your words are emotional.
              Emotional words frequently stir an emotional response in the reader. They have been proven to drive clicks and shares.
              Great headlines are usually made up of 10-15% emotional words.
              <span class='bold'>Examples: absolutely, attractive, blissful, bravery, confessions, danger, dollar,
              spotlight, valuable, worry, wonderful, zinger...</span>
            </li>
            <li>
              <span class='bold score'>{{wordBalancePowerPercentage}} %</span> of your words are power words.
              Power words or phrases indicate intense trigger words that frequently command a readers attention and action.
              Great headlines contain at least 1 power phrase or word.
              <span class='bold'>Examples of power phrases: for the first time, in the world, make you, no questions asked,
              pay zero, thing I've ever seen, what this, will make you, you see what, you need to know, you see, what happened to...</span>
            </li>
          </ul>
        {{/unless}}

        {{#if hasTypeSuggestions}}
          <h4>Other Advice</h4>
          <ul>
            <li>{{typeMessage}} {{typeSuggestion}}</li>
          </ul>
        {{/if}}
      `;
    }

    var compiledTemplate = Handlebars.compile(getTemplate());
    var html = compiledTemplate({
      score: data.score.total,

      charCountSentiment: getSentiment(data.char_count.summary),
      charCountGood: getSentiment(data.char_count.summary) === "positive",
      charCountLength: data.char_count.length,
      charCountScore: data.char_count.score,
      hasCharCountSuggestions: data.suggestions.char_length !== undefined,
      charCountMessage: getValueIfExists(data.suggestions.char_length, "message"),
      charCountSuggestion: getValueIfExists(data.suggestions.char_length, "suggestion"),

      wordCountSentiment: getSentiment(data.word_count.summary),
      wordCountGood: getSentiment(data.word_count.summary) === "positive",
      wordCountLength: data.word_count.length,
      wordCountScore: data.word_count.score,
      hasWordCountSuggestions: data.suggestions.word_count !== undefined,
      wordCountMessage: getValueIfExists(data.suggestions.word_count, "message"),
      wordCountSuggestion: getValueIfExists(data.suggestions.word_count, "suggestion"),

      sentimentSummary: getSentiment(data.sentiment.summary),
      sentimentGood: data.sentiment.summary !== "neutral",

      wordBalanceSentiment: getSentiment(data.word_balance.summary),
      wordBalanceGood: getSentiment(data.word_balance.summary) === "positive",
      commonWordsInHeadline: data.suggestions.common_words !== undefined,
      wordBalanceMessage: getValueIfExists(data.suggestions.common_words, "message"),
      wordBalanceSuggestion:getValueIfExists(data.suggestions.common_words, "suggestion"),
      wordBalancePercentage: data.word_balance.common.percentage,
      wordBalanceUncommonPercentage: data.word_balance.uncommon.percentage,
      wordBalanceEmotionalPercentage: data.word_balance.emotional.percentage,
      wordBalancePowerPercentage: data.word_balance.power.percentage,

      hasTypeSuggestions: data.suggestions.type !== undefined,
      typeMessage: getValueIfExists(data.suggestions.type, "message"),
      typeSuggestion: getValueIfExists(data.suggestions.type, "suggestion"),
    });

    return html;
  }

  function init(){
    var titleWrap = $("#titlewrap");
    var titleInput = $("#title");
    var editorField = $(".wp-editor-area");

    // Add the headline analysis score bar and capitalizer
    if ($(titleWrap).length) {
      // Title field found

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
      $(scoreFrame).click(function (e) {
        $(scoreInfo).toggle()
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
          var html = buildResults(data);
          $(scoreInfo).html(html);
        })
        .fail(function(){
          alert("Could not contact API");
        });
      });

      $(titleWrap).append(scoreFrame);
      $(titleWrap).append(titleCapBtn);

      addSubHeadingsButton(titleWrap, editorField);
      addRebuildSlugButton(titleWrap);
      addCopyPermalinkButton();
    }
  }

  return {
    init: init
  };
})();
