import $ from 'jquery';

/**
 * Helper class with HTML manipulation features
 *
 * @author Dylan Millikin <dylan.millikin@gmail.com>
 */
class Html {
    /**
     * HTML encode a string for security purposes. Should prevent XSS attacks
     *
     * @param  {String} string the string to encode
     * @return {String} the encoded string
     */
    static htmlEncode(string) {
        return $('<div/>').text(string).html();
    }

    /**
     * Json highlighter
     *
     * @param  {String|JSON} json the json string or element to highlight
     * @return {String}      and html string of the json with enabled css highlighting functionality.
     */
    static jsonSyntaxHighlight(json) {
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
}

export default Html;
