chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
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


                // Add MD to HTML button
                var $convertButton = $("<input />", {
                  type: "button",
                  value: "MD",
                  class: "ed_button button button-small",
                  title: "Convert MD to HTMLs",
                  click: function(){
                      var md = $("#content").val();
                      var html = converter.makeHtml(md);
                      $("#content").val(html);
                  }
                });
                $("#ed_toolbar").append($convertButton);
                var converter = new showdown.Converter();


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
                titleCapBtn.innerText = "Capitalize and check";
                titleCapBtn.className = "wp-core-ui button";
                $(titleCapBtn).click(function (e) {
                    $(titleInput).val(capitalize($(titleInput).val()));

                    $.get("https://cos-headlines.herokuapp.com/?headline=" + $(titleInput).val(), function (data) {
                        $(scorePointer).css("left", data.score.total + "%");

                        var html = "<h3>Headline Analysis Score: " + data.score.total + "</h3>";

                        if (data.char_count.summary == 'positive') {
                            html += "<span class='positive'>&#10004; The headline's character count seems fine. You're at " + data.char_count.length + ", scoring " + data.char_count.score + " / 100.</span><br>";
                        } else {
                            html += "<span class='negative'>&bigotimes; Character length could be better. Aim for 55 or so characters. You're now at " + data.char_count.length + ", scoring " + data.char_count.score + " / 100.</span><br>";
                            if (data.suggestions.char_length !== undefined) {
                                html += "<span class='negative'>" + data.suggestions.char_length.message + " " + data.suggestions.char_length.suggestion + "</span><br>";
                            }
                        }

                        if (data.word_count.summary == 'positive') {
                            html += "<span class='positive'>&#10004; The headline's word count seems fine. You're at " + data.word_count.length + " words, scoring " + data.char_count.score + " / 100.</span><br>";
                        } else {
                            html += "<span class='negative'>&bigotimes; Word count could be better. Aim for 6 words for best results. You're now at " + data.word_count.length + ", scoring " + data.word_count.score + " / 100.</span><br>";
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
                            html += "<ul><li><span class='bold score'>" + data.word_balance.common.percentage + "%</span> of your words are common. Common words make up the basic structure of readable headlines. Great headlines are usually made up of 20-30% common words. <span class='bold'>Common words are words like: a, about, after, and, her, how, this, why, these, what, your, things...</span></li>";
                            html += "<li><span class='bold score'>" + data.word_balance.uncommon.percentage + "%</span> of your words are uncommon. Uncommon words occur less frequently than common words, but give your headline substance. Great headlines are usually made up of 10-20% uncommon words. <span class='bold'>Examples: actually, awesome, baby, beautiful, heart, here, more, right, see, social, world, year...</span></li>";
                            html += "<li><span class='bold score'>" + data.word_balance.emotional.percentage + "%</span> of your words are emotional. Emotional words frequently stir an emotional response in the reader. They have been proven to drive clicks and shares. Great headlines are usually made up of 10-15% emotional words. <span class='bold'>Examples: absolutely, attractive, blissful, bravery, confessions, danger, dollar, spotlight, valuable, worry, wonderful, zinger...</span></li>";
                            html += "<li><span class='bold score'>" + data.word_balance.power.percentage + "%</span> of your words are power words. Power words or phrases indicate intense trigger words that frequently command a readers attention and action. Great headlines contain at least 1 power phrase or word. <span class='bold'>Examples of power phrases: for the first time, in the world, make you, no questions asked, pay zero, thing I've ever seen, what this, will make you, you see what, you need to know, you see, what happened to...</span></li></ul>";
                        }

                        var otherAdviceMessages = [];
                        var otherAdviceMessageKeys = ['type'];
                        $.each(otherAdviceMessageKeys, function (i, key) {
                            if (data.suggestions[key] !== undefined) {
                                otherAdviceMessages.push(data.suggestions[key].message + " " + data.suggestions[key].suggestion);
                            }
                        });

                        if (otherAdviceMessages.length) {
                            html += "<h4>Other advice</h4>"
                            html += "<ul>";
                            $.each(otherAdviceMessages, function (i, msg) {
                                html += "<li>" + msg + "</li>";
                            });
                            html += "</ul>";
                        }

                        $(scoreInfo).html(html);
                    });

                    return false;
                });
                $(titleWrap).append(scoreFrame);
                $(titleWrap).append(titleCapBtn);

                addSubHeadingsButton(titleWrap, editorField);
                addRebuildSlugButton(titleWrap);
                addCopyPermalinkButton();
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
                        var seriesName = $(listItem).text().toLowerCase();
                        if (seriesName.indexOf(text.toLowerCase()) > -1) {
                            $(listItem).removeClass('hidden');
                        } else {
                            $(listItem).addClass('hidden');
                        }
                    });
                });
            }

            // Add new tab to categories frame
            //$("#category-tabs").append('<li><a id="catPopLink" href="javascript:void(0);">Pop out</a></li>');
            // @todo
            var catlist = $("#categorychecklist");
            $("#catPopLink").click(function (e) {

                var innerHtml = "<input name='category_selections' type='hidden'>";

                $.each($(catlist).children('li'), function (i, child) {

                    var cLabel = $(child).children('label');
                    var cInput = $(cLabel).children('input');
                    var cName = $(cLabel).text();
                    var cValue = $(cInput).val();

                    innerHtml += "<input type='button' class='catbutton button button-primary' value='" + cName + "' />";

                });

                showModal("Categories - Rich Selection", innerHtml);
            });

            // Add datepicker

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

            // -----------------------------------

            hideUnnecessaryElements();

        }
    }, 10);
});

function hideUnnecessaryElements() {
    $("#edge-mode").remove();
    $(".timestamp-wrap").hide();
    $(".CosheduleButtonContainer").remove();
    $(".misc-pub-section input[name='publish_to_discourse']").parent().parent().parent().remove();
}

function addSubHeadingsButton(titleWrap, editorfield) {
    var subBtn = document.createElement('button');
    subBtn.innerText = "Capitalize subheadings";
    subBtn.className = "wp-core-ui button bandaid-button-title";

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

    $(subBtn).click(function(e) {
        e.preventDefault();
        $("#editable-post-name").click();

        var int1 = setInterval(function(){
            var slugInput = $('#new-post-slug');
            if (slugInput.length) {
                slugInput.val("");
                clearInterval(int1);

                var int2 = setInterval(function(){
                    var saveButton = $("#edit-slug-buttons a.save.button.button-small");
                    if (saveButton.length) {
                        saveButton[0].click();
                    }
                    clearInterval(int2);
                }, 100);
            }
        }, 100);
    });

    $('#edit-slug-box').parent().append(subBtn);
}

function addCopyPermalinkButton() {
    var a = document.createElement('a');
    a.className = 'button button-small bandaid-copy-link';
    a.innerText = "Copy Link";
    $(a).click(function(e){
        copyTextToClipboard("http://sitepoint.com/"+$("#editable-post-name-full").text());
    });
    $('#edit-slug-box').parent().append(a);
}

function lol() {
    alert("lol");
}
