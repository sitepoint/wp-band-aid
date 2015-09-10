chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading

            var checkFor = {
                "strings": ["[author_more]"],
                "patterns": []
            };

            var editorField = $(".wp-editor-area");
            if ($(editorField).length) {
                // Editor field found
                var row = document.createElement('tr');
                var cell = document.createElement('td');
                $(cell).attr('colspan', 2);
                row.className = "proofreader-main-row";
                row.appendChild(cell);

                $("#post-status-info tbody").prepend(row);

                var checker = setInterval(function () {

                    var content = $(editorField).val();

                    checkFor.strings.forEach(function (a) {
                        if (content.indexOf(a) > -1) {
                            $(editorField).removeClass('missing-value');
                            $(row).removeClass("error");
                            $(cell).text("All good!");
                        } else {
                            $(editorField).addClass('missing-value');
                            $(row).addClass("error");
                            $(cell).text("Missing " + a + "!");
                        }
                    });

                }, 2000);

            }

            var titleWrap = $("#titlewrap");
            var titleInput = $("#title");
            if ($(titleWrap).length) {
                // Title field found
                var titleCapBtn = document.createElement('button');
                titleCapBtn.innerText = "Capitalize";
                titleCapBtn.className = "wp-core-ui button";
                $(titleCapBtn).click(function (e) {
                    $(titleInput).val(capitalize($(titleInput).val()));
                    return false;
                });
                $(titleWrap).append(titleCapBtn);
            }

            var tagsFrame = $("#tagsdiv-post_tag");
            var tagsContainer = $(tagsFrame).find(".tagchecklist");
            if ($(tagsContainer).length) {
                // container of tags found

                var tagsButton = document.createElement('button');
                tagsButton.innerText = "Copy tags";
                tagsButton.className = "wp-core-ui button";


                $(tagsButton).click(function (e) {

                    var tags = $(tagsContainer).find("span");
                    if ($(tags).length) {
                        // tags exist
                        var tagString = "";
                        $.each(tags, function (index, tagSpan) {
                            var text = $(tagSpan).text();
                            text = text.replace(text.substr(0, 2), "");
                            if (tagString == "") {
                                tagString = text;
                            } else {
                                tagString += ", " + text;
                            }
                        });
                        copyTextToClipboard(tagString);
                    }
                    return false;
                });

                $(tagsFrame).find(".ajaxtag").append(tagsButton);
            }

            // ----------------------------------------------------------

        }
    }, 10);
});

function copyTextToClipboard(text) {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
}

var prepositions = [
    'a',
    'abaft',
    'aboard',
    'about',
    'above',
    'absent',
    'across',
    'afore',
    'after',
    'against',
    'along',
    'alongside',
    'amid',
    'amidst',
    'among',
    'amongst',
    'an',
    'apropos',
    'apud',
    'around',
    'as',
    'aside',
    'astride',
    'at',
    'athwart',
    'atop',
    'barring',
    'before',
    'behind',
    'below',
    'beneath',
    'beside',
    'besides',
    'between',
    'beyond',
    'but',
    'by',
    'circa',
    'concerning',
    'despite',
    'down',
    'during',
    'except',
    'excluding',
    'failing',
    'following',
    'for',
    'from',
    'given',
    'in',
    'including',
    'inside',
    'into',
    'lest',
    'like',
    'mid',
    'midst',
    'minus',
    'modulo',
    'near',
    'next',
    'notwithstanding',
    'of',
    'off',
    'on',
    'onto',
    'opposite',
    'out',
    'outside',
    'over',
    'pace',
    'past',
    'per',
    'plus',
    'pro',
    'qua',
    'regarding',
    'round',
    'sans',
    'since',
    'than',
    'through',
    'thru',
    'throughout',
    'thruout',
    'till',
    'times',
    'to',
    'toward',
    'towards',
    'under',
    'underneath',
    'unlike',
    'until',
    'unto',
    'up',
    'upon',
    'versus',
    'vs\.',
    'vs',
    'v\.',
    'v',
    'via',
    'vice',
    'with',
    'within',
    'without',
    'worth'
];
var articles = [
    'a',
    'an',
    'the'
];
var conjunctions = [
    'and',
    'but',
    'for',
    'so',
    'nor',
    'or',
    'yet'
];
var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";

var all_lower_case = '(' + (prepositions.concat(articles).concat(conjunctions)).join('|') + ')';

var capitalize = function (title) {
    var parts = [], split = /[:.;?!] |(?: |^)["Ò]/g, index = 0;

    title = title.replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"');

    while (true) {
        var m = split.exec(title);

        parts.push(title.substring(index, m ? m.index : title.length)
            .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function (all) {
                return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
            })
            .replace(RegExp("\\b" + all_lower_case + "\\b", "ig"), lower)
            .replace(RegExp("^" + punct + all_lower_case + "\\b", "ig"), function (all, punct, word) {
                return punct + upper(word);
            })
            .replace(RegExp("\\b" + all_lower_case + punct + "$", "ig"), upper));

        index = split.lastIndex;

        if (m) parts.push(m[0]);
        else break;
    }

    return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
        .replace(/(['Õ])S\b/ig, "$1s")
        .replace(/\b(AT&T|Q&A)\b/ig, function (all) {
            return all.toUpperCase();
        });
};

function lower(word) {
    return word.toLowerCase();
}

function upper(word) {
    return word.substr(0, 1).toUpperCase() + word.substr(1);
}