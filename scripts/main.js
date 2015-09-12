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
            var rx = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/ig;

            var titleWrap = $("#titlewrap");
            var titleInput = $("#title");

            // Check editor text for strings and patterns
            var editorField = $(".wp-editor-area");
            if ($(editorField).length) {
                // Editor field found

                // Add information row
                var row = document.createElement('tr');
                var cell = document.createElement('td');
                $(cell).attr('colspan', 2);
                row.className = "proofreader-main-row";
                row.appendChild(cell);
                $("#post-status-info tbody").prepend(row);

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
                        if (!linkOk(el)) {
                            errorMessages.push("Relative link found: " + el);
                        }
                    });

                    if (errorMessages.length) {
                        $(editorField).addClass('error');
                        $(row).addClass("error");
                        var cellText = "";
                        $.each(errorMessages, function (i, msg) {
                            cellText += msg + "<br>";
                        });
                        $(cell).html(cellText)
                    } else {
                        $(editorField).removeClass('error');
                        $(row).removeClass("error");
                        $(cell).text("All good");
                    }

                }, 2000);

            }

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
                    console.log("Toggle");
                    $(scoreInfo).toggle()
                });

                var titleCapBtn = document.createElement('button');
                titleCapBtn.innerText = "Capitalize and check";
                titleCapBtn.className = "wp-core-ui button";
                $(titleCapBtn).click(function (e) {
                    $(titleInput).val(capitalize($(titleInput).val()));

                    $.get("https://cos-headlines.herokuapp.com/?headline=" + $(titleInput).val(), function (data) {
                        $(scorePointer).css("left", data.score.total + "%");

                        var html = "<h3>Headline Analysis Score: " + data.score.total + "</h3>";

                        if (data.char_count.summary == 'positive') {
                            html += "<span class='positive'>&#10004; The headline's character count seems fine.</span><br>";
                        } else {
                            html += "<span class='negative'>&bigotimes; Character length could be better. Aim for 55 or so characters.</span><br>";
                            if (data.suggestions.char_length !== undefined) {
                                html += "<span class='negative'>" + data.suggestions.char_length.message + " " + data.suggestions.char_length.suggestion + "</span><br>";
                            }
                        }

                        if (data.word_count.summary == 'positive') {
                            html += "<span class='positive'>&#10004; The headline's word count seems fine.</span><br>";
                        } else {
                            html += "<span class='negative'>&bigotimes; Word count could be better. Aim for 6 words for best results.</span><br>";
                            if (data.suggestions.word_length !== undefined) {
                                html += "<span class='negative'>" + data.suggestions.word_length.message + " " + data.suggestions.word_length.suggestion + "</span><br>";
                            }
                        }

                        if (data.sentiment.summary == 'neutral') {
                            html += "<span class='negative'>&bigotimes; Your sentiment is neutral. Good clickbait is either strongly positive or negative.</span><br>";
                        } else {
                            html += "<span class='positive'>&#10004; The sentiment looks good!</span><br>";
                        }

                        if (data.word_balance.summary == 'positive') {
                            html += "<span class='positive'>&#10004; The word balance seems fine:</span><br>";
                        } else {
                            html += "<span class='negative'>&bigotimes; Your word balance is off:</span><br>";
                            if (data.suggestions.common_words !== undefined) {
                                html += "<span class='negative'>" + data.suggestions.common_words.message + " " + data.suggestions.common_words.suggestion + "</span><br>";
                            }
                            html += "<ul><li>" + data.word_balance.common.percentage + "% of your words are common. Common words make up the basic structure of readable headlines. Great headlines are usually made up of 20-30% common words.</li>";
                            html += "<li>" + data.word_balance.uncommon.percentage + "% of your words are uncommon. Uncommon words occur less frequently than common words, but give your headline substance. Great headlines are usually made up of 10-20% uncommon words..</li>";
                            html += "<li>" + data.word_balance.emotional.percentage + "% of your words are emotional. Emotional words frequently stir an emotional response in the reader. They have been proven to drive clicks and shares. Great headlines are usually made up of 10-15% emotional words.</li>";
                            html += "<li>" + data.word_balance.power.percentage + "% of your words are power words. Power words or phrases indicate intense trigger words that frequently command a readers attention and action. Great headlines contain at least 1 power phrase or word.</li></ul>";
                        }

                        $(scoreInfo).html(html);
                    });

                    return false;
                });
                $(titleWrap).append(scoreFrame);
                $(titleWrap).append(titleCapBtn);
            }

            // Add copy tags button
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
                        var seriesName = $(listItem).text();
                        if (seriesName.indexOf(text) > -1) {
                            $(listItem).removeClass('hidden');
                        } else {
                            $(listItem).addClass('hidden');
                        }
                    });
                });
            }

            var cacheBanner = $("#edge-mode");
            if ($(cacheBanner).length) {
                $(cacheBanner).remove();
            }

        }
    }, 10);
});

function getAllMatches(myRe, str) {
    var returnData = [];
    var myArray;
    while ((myArray = myRe.exec(str)) !== null) {
        returnData.push(myArray[1]);
    }
    return returnData;
}

function linkOk(url) {
    var r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(url);
}

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