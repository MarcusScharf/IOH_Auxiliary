var GM_SuperValue = new function() {

    var JSON_MarkerStr = 'json_val: ';
    var FunctionMarker = 'function_code: ';

    function ReportError(msg) {
        if (console && console.error)
            console.error(msg);
        else
            throw new Error(msg);
    }

    if (typeof(GM_setValue) != "function")
        ReportError('This library requires Greasemonkey! GM_setValue is missing.');
    if (typeof(GM_getValue) != "function")
        ReportError('This library requires Greasemonkey! GM_getValue is missing.');

    this.set = function(varName, varValue) {

        if (typeof varName != "string") {
            ReportError('Illegal varName sent to GM_SuperValue.set(). Name: ' + varName + ' Value: ' + varValue);
            return;
        }
        if (/[^\w _-]/.test(varName)) {
            ReportError('Suspect, probably illegal, varName sent to GM_SuperValue.set().  Name: ' + varName + ' Value: ' + varValue);
        }

        switch (typeof varValue) {
        case 'undefined':
            ReportError('Illegal varValue sent to GM_SuperValue.set().  Name: ' + varName + ' Value: ' + varValue);
            break;
        case 'boolean':
        case 'string':
            GM_setValue(varName, varValue);
            break;
        case 'number':
            if (varValue === parseInt(varValue) && Math.abs(varValue) < 2147483647) {
                GM_setValue(varName, varValue);
            } else {
                ReportError('Illegal varValue sent to GM_SuperValue.set().  Name: ' + varName + ' Value: ' + varValue)
            }
            break;
        case 'object':
            var jsonSafeStr = JSON_MarkerStr + JSON.stringify(varValue);
            GM_setValue(varName, jsonSafeStr);
            break;
        case 'function':
            var fnSafeStr = FunctionMarker + varValue.toString();
            GM_setValue(varName, fnSafeStr);
            break;

        default:
            ReportError('Unknown type in GM_SuperValue.set()! Name: ' + varName + ' DefaultValue: ' + varValue);
            break;
        }
    };

    this.get = function(varName, defaultValue) {

        if (typeof varName != "string") {
            ReportError('Illegal varName sent to GM_SuperValue.get(). Name: ' + varName + ' DefaultValue: ' + defaultValue);
            return;
        }
        if (/[^\w _-]/.test(varName)) {
            ReportError('Suspect, probably illegal, varName sent to GM_SuperValue.get(). Name: ' + varName + ' DefaultValue: ' + defaultValue);
        }

        var varValue = GM_getValue(varName);
        
        if (typeof varValue == "undefined")
            return defaultValue;

        if (typeof varValue == "string") {
            var regxp = new RegExp('^' + JSON_MarkerStr + '(.+)$');
            var m = varValue.match(regxp);
            if (m && m.length > 1) {
                varValue = JSON.parse(m[1]);
                return varValue;
            }

            regxp = new RegExp('^' + FunctionMarker + '((?:.|\n|\r)+)$');
            m = varValue.match(regxp);
            if (m && m.length > 1) {
                varValue = eval('(' + m[1] + ')');
                return varValue;
            }
        }

        return varValue;
    };
};