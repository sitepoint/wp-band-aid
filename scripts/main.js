// Responds to context menu options
//
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text) {
    switch (msg.text) {
      case "getTitle":
        sendResponse($('title').text());
        break;
      case "getDesc":
        sendResponse($('meta[name="description"]').attr("content"));
        break;
      default:
        sendResponse("");
    }
  }
});

if (window.location.href.indexOf('/wp-admin/') === -1) {

  var tileTrafficTpl;
  var links = [];

  $('.HomeCard, .HomePanel').each(function (index, element) {
    var $element = $(element);
    if ($element.attr('href').indexOf('/premium/') === -1) {
      $element.wrap('<div class="traffictile-parent"></div>');
      links.push($element.attr('href'));
    }
  });


  getTemplate("tiletraffic.hbs")
    .then(function (data) {
      tileTrafficTpl = Handlebars.compile(data);

      $.get("https://sparsely.bitfalls.com", {
        mode: "postInfo",
        "urls[]": links
      })
        .done(function (data) {
          if (data.status == "success") {

            var linkResult, html;

            $('.traffictile-parent').each(function (index, element) {
              var $element = $(element);
              var link = $element
                .find('a')
                .attr('href');
              var sublink = link.replace('https://www.sitepoint.com/', '')
                .replace(/\/$/, "");

              linkResult = data.payload[link];

              if (linkResult.error !== undefined) {
                html = tileTrafficTpl(linkResult);
              } else {
                linkResult.payload['parselyurl'] = 'https://dash.parsely.com/sitepoint.com/search/?q=' + sublink;
                html = tileTrafficTpl(linkResult.payload);
              }

              $element.prepend(html);
            });
          } else {
            console.error(data.message);
          }
        });

    });
}
