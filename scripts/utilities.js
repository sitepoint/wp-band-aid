// Miscellaneous functions without a specific context

/**
 * Returns an array of all matches in a regex global search
 *
 * @param myRe RegExp
 * @param str String to search
 * @returns {Array}
 */
function getAllMatches(myRe, str) {
    var returnData = [];
    var myArray;
    while ((myArray = myRe.exec(str)) !== null) {
        returnData.push(myArray[1]);
    }
    return returnData;
}

/**
 * Checks if the URL starts with a protocol, i.e. if it's absolute
 *
 * @param url
 * @returns {boolean}
 */
function linkOk(url) {
    var r = new RegExp('^(?:[a-z]+:)?//', 'i');
    return r.test(url);
}

/**
 * Copies passed in text to clipboard
 *
 * @param text
 */
function copyTextToClipboard(text) {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
}