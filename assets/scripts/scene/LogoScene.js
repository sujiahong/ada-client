const TAG = "LogoScene.js";
var cls = {};
cls.extends = cc.Component;

cls.properties = {};

// use this for initialization
cls.onLoad = function () {
    console.log(TAG, "onLoad");
    GLobleIAP.init();
    this.init();
    setTimeout(function () {
        cc.director.loadScene("loading");
    }, 2000);
    // cc.loader.loadResAll("textures", function (err, assets) {
    //     console.log(TAG, err, assets);
    //     //cc.director.loadScene("loading");
    // });
}

cls.init = function () {
    var g_ada = {};
    cc.g_ada = g_ada;

    g_ada.config = require("AdaConfig");
    g_ada.constant = require("Constant");
    g_ada.errcode = require("ErrorCode");

    var Http = require("Http");
    g_ada.http = new Http();

    var socketClient = require("AdaSIOClient");
    g_ada.sioClient = new socketClient();

    var UserHelper = require("UserHelper");
    g_ada.userHelper = new UserHelper(require("UserData"));

    var socketHelper = require("RoomSocketHelper");
    g_ada.socketHelper = new socketHelper();

    var ReplayMgr = require("ReplayMgr");
    g_ada.replayMgr = new ReplayMgr();


    g_ada.global = require("Global");

    var GameCommonMgr = require("GameCommonMgr");
    g_ada.gameCommonMgr = new GameCommonMgr();



    var AnysdkMgr = require("AnysdkMgr");
    g_ada.anysdkMgr = new AnysdkMgr();
    g_ada.anysdkMgr.init();

    var VoiceMgr = require("VoiceMgr");
    g_ada.voiceMgr = new VoiceMgr();
    g_ada.voiceMgr.init();

    var AudioMgr = require("AudioMgr");
    g_ada.audioMgr = new AudioMgr();
    g_ada.audioMgr.init();

    var Utils = require("Utils");
    g_ada.utils = new Utils();

    g_ada.args = urlParse();
}

var urlParse = function () {
    console.log(TAG, window.io);
    var params = {};
    if (window.location == null) {
        return params;
    }
    var name, value;
    var str = window.location.href; //取得整个地址栏

    var num = str.indexOf("?");
    str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]

    var arr = str.split("&"); //各个参数放到数组里
    for (var i = 0; i < arr.length; i++) {
        num = arr[i].indexOf("=");
        if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            params[name] = value;
        }
    }
    return params;
}

cc.Class(cls);