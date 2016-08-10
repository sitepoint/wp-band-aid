"use strict";

var EditorToolbar = (function() {

  // MARKDOWN to HTML

  function getShowdownConverter(){
    var converter = new showdown.Converter();

    // Don't convert underscores in URLs
    // https://github.com/showdownjs/showdown/issues/96
    converter.setOption('literalMidWordUnderscores', true);
    converter.setOption('tables', true);
    return converter;
  }

  function convertToMarkdown(converter, md){
    var html = converter.makeHtml(md);

    html = html.replace(/<code class="js language-js">/g, '<code class="javascript language-javascript">');
    html = html.replace(/<code class="coffee language-coffee">/g, '<code class="coffeecript language-coffeescript">');
    html = html.replace(/<code class="json language-json">/g, '<code class="javascript language-javascript">');
    html = html.replace(/<code class="html language-html">/g, '<code class="markup language-markup">');
    html = html.replace(/<code class="sh language-sh">/g, '<code class="bash language-bash">');

    return html;
  }

  function addMDButton($editorToolbar, $mainTextArea){
    var converter = getShowdownConverter();
    var $convertButton = $("<input />", {
      type: "button",
      value: "MD",
      class: "ed_button button button-small",
      id: "bandaid-md",
      title: "Convert MD to HTML",
      click: function(){
        var md = $mainTextArea.val();
        var html = convertToMarkdown(converter, md);
        $mainTextArea.val(html);
      }
    });
    $editorToolbar.append($convertButton);
  }

  // BEAUTIFY HTML

  function getBeautifier(){
    var options = {
      "preserve_newlines": true,
      "wrap_line_length": 0
    };
    return {
      beautify: function(html) {
        console.log(options);
        return html_beautify(html, options);
      }
    }
  }

  function addBeautyButton($editorToolbar, $mainTextArea) {
    var beautifier = getBeautifier();
    var $beautifyButton = $("<input />", {
      type: "button",
      value: "Beauty",
      class: "ed_button button button-small",
      id: "bandaid-beautify",
      title: "Beautify HTML",
      click: function(){
        var html = $mainTextArea.val();
        var beautifulHtml = beautifier.beautify(html);
        $mainTextArea.val(beautifulHtml);
      }
    });
    $editorToolbar.append($beautifyButton);
  }

  // INIT

  function init(){
    var $editorToolbar = $("#ed_toolbar");
    var $mainTextArea = $("#content");

    addMDButton($editorToolbar, $mainTextArea);
    addBeautyButton($editorToolbar, $mainTextArea);
  }

  return {
    init: init
  };
})();
