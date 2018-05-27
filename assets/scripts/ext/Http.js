const TAG = "Http.js";

var Http = function(mtd){
    this.method = mtd || "GET";
}

Http.prototype.request = function (path, data, callback) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.timeout = 5000;
    var requestURL = this.getRequestURL(path, data);
    console.log(TAG, "RequestURL:" + requestURL);
    xhr.open(this.method, requestURL, true);
    if (cc.sys.isNative) {
        xhr.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8");
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
            console.log(TAG, "http res length(" + xhr.responseText.length + "):" + xhr.responseText);
            try {
                var ret = JSON.parse(xhr.responseText);
                if (callback !== null) {
                    callback(ret);
                }
            } catch (e) {
                console.error(TAG, "error: ", e);
                //callback(null);
            }
        }
    };
    xhr.send();
    return xhr;
}

Http.prototype.getRequestURL = function(path, data){
    var str = "?";
    for (var k in data) {
        if (str != "?") {
            str += "&";
        }
        str += k + "=" + data[k];
    }
    var addr = cc.g_ada.config.SceneAddr["LoadingScene"];
    var requestURL = addr + path + encodeURI(str);
    return requestURL;
}

module.exports = Http;