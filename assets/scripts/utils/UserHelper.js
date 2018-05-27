const TAG = "UserHelper.js";
const g_ada = cc.g_ada;

var UserHelper = function(data){
    this.userData = data;
}

module.exports = UserHelper;
var helper = UserHelper.prototype;

helper.setCurScene = function(scene){
    this.userData.inScene = scene;
}

helper.guestAuth = function () {
    var account = g_ada.args["account"];
    if (account == null) {
        account = cc.sys.localStorage.getItem("account");
    }
    if (account == null) {
        account = Date.now();
        cc.sys.localStorage.setItem("account", account);
    }
    console.log(TAG, " guestAuth account = ", account);
    g_ada.http.request("/guest", {account: account}, this.onAuth);
}

helper.onAuth = function (ret) {
    var userData = this.userData;
    if (ret.errcode !== 0) {
        console.log(TAG, " onAuth wxapi " + ret.errcode);
    }else {
        userData.account = ret.account;
        userData.sign = ret.sign;
        g_ada.http.url = "http://" + cc.g_ada.gameCommonMgr.hallUrl;
        console.log(TAG, "wxapi onAuth, url = " + cc.g_ada.http.url);
        this.login();
    }
}

helper.login = function () {
    var userData = this.userData;
    var onLogin = function (ret) {
        if (ret.errcode !== 0) {
            console.log("wxapi login ret.errmsg = " + ret.errmsg);
            g_ada.wc.hide();
        }else {
            if (!ret.userId) {
                //jump to register user info.
                console.log("wxapi jump to register user info");
                cc.director.loadScene("createrole");
            }else {
                console.log(TAG, "登录成功返回数据:", ret);
                userData.account = ret.account;
                userData.userId = ret.userId;
                userData.userName = ret.name;
                userData.userIcon = ret.userIcon;
                userData.sex = ret.sex;
                userData.lv = ret.lv;
                userData.exp = ret.exp;
                userData.coins = ret.coins;
                userData.gems = ret.gems;
                userData.roomId = ret.roomId;
                userData.gamePlay = ret.gamePlay;
                userData.ip = ret.ip;
                userData.in_pw = ret.in_pw;
                cc.director.loadScene("hall");
                console.log(TAG, "wxapi jump to hall end");
            }
        }
    };
    console.log(TAG, "wxapi send login request");
    g_ada.wc.show("正在登录游戏");
    g_ada.http.request("/login", {account: this.userData.account,
                                    sign: this.userData.sign}, onLogin);
}

helper.getSexName = function () {
    return g_ada.gameCommonMgr.getSexName(this.sex);
}

helper.create = function (name, sex) {
    var self = this;
    var onCreate = function (ret) {
        if (ret.errcode !== 0) {
            console.log(TAG, "onCreate errcode", ret.errcode);
        }else {
            self.login();
        }
    };
    var data = {
        account: this.userData.account,
        sign: this.userData.sign,
        name: name,
        sex: sex
    };
    g_ada.http.request("/create_user", data, onCreate);
}

helper.enterRoom = function (roomId, callback) {
    var self = this;
    var onEnter = function (ret) {
        console.log(TAG, "enter_private_room =" + ret.errcode);
        if (ret.errcode !== 0) {
            if (ret.errcode == -1) {
                setTimeout(function () {
                    self.enterRoom(roomId, callback);
                }, 5000);
            }else {
                g_ada.wc.hide();
                if (callback != null) {
                    callback(ret);
                }
            }
        }else {
            if (callback != null) {
                callback(ret);
            }
            g_ada.gameNetMgr.connectGameServer(ret);
        }
    };
    var data = {
        account: this.userData.account,
        sign: this.userData.sign,
        roomid: roomId
    };
    g_ada.wc.show("正在进入房间 " + roomId);
    g_ada.http.request("/enter_private_room", data, onEnter);
}

helper.getHistoryList = function (type, callback) {
    var self = this;
    var onGet = function (ret) {
        if (ret.errcode !== 0) {
            console.log(TAG, "getHistoryList errcode: ", ret.errcode);
        }else {
            console.log(TAG, ret.history);
            if (callback != null) {
                callback(ret.history);
            }
        }
    };
    var data = {
        account: this.userData.account,
        sign: this.userData.sign,
        type: type
    };
    g_ada.http.request("/get_history_list", data, onGet);
}

helper.getGamesOfRoom = function (uuid, callback) {
    var self = this;
    var onGet = function (ret) {
        if (ret.errcode !== 0) {
            console.log(TAG, "getGamesRoom errcode: ", ret.errcode);
        } else {
            console.log(TAG, ret.data);
            callback(ret.data);
        }
    };
    var data = {
        account: this.userData.account,
        sign: this.userData.sign,
        uuid: uuid,
    };
    g_ada.http.request("/get_games_of_room", data, onGet);
}

helper.getDetailOfGame = function (uuid, index, callback) {
    var self = this;
    var onGet = function (ret) {
        if (ret.errcode !== 0) {
            console.log(TAG, "getDetailOfGame errcode: ", ret.errcode);
        }
        else {
            console.log(TAG, ret.data);
            callback(ret.data);
        }
    };
    var data = {
        account: this.userData.account,
        sign: this.userData.sign,
        uuid: uuid,
        index: index + 1
    };
    g_ada.http.request("/get_detail_of_game", data, onGet);
}

helper.setEvenetHandler = function (eventHandler) {
    this.dataEventHandler = eventHandler;
}

helper.clearEvenetHandler = function () {
    this.dataEventHandler = null;
}

helper.dispatchEvent = function (event, data) {
    if (this.dataEventHandler) {
        this.dataEventHandler.emit(event, data);
    }
}

helper.iapOK = function () {
    var self = this;
    var data = {
        account: this.userData.account,
        sign: this.userData.sign,
        game: g_ada.config.GameName,
        version: g_ada.config.Version,
        platform: g_ada.gameCommonMgr.getPlatform(),
    };
    g_ada.http.request('/iap_ok', data, function (ret) {
        self.dispatchEvent('refresh_user_gems', ret);
    }, g_ada.http.account_url);
}

helper.get_prize_count = function (callback) {
    var self = this;
    var onGet = function (ret) {
        if (ret.errcode !== 0) {
            console.log(TAG, "get_prize_count errcode: ", ret.errmsg);
        }else {
            console.log(TAG, ret.count);
            if (callback != null) {
                callback(ret.count);
            }
        }
    };
    var data = {
        account: this.userData.account,
        sign: this.userData.sign,
        userId: this.userData.userId
    };
    g_ada.http.request("/get_prize_count", data, onGet);
}

helper.share_prize = function () {
    var self = this;
    var onGet = function (ret) {
        if (ret.errcode !== 0) {
            console.log(TAG, "share_prize errcode: ", ret.errmsg);
        }
    };
    var data = {
        account: this.userData.account,
        sign: this.userData.sign,
        userId: this.userData.userId
    };
    g_ada.http.request("/share_prize", data, onGet);
}

helper.start_prize = function (callback) {
    var self = this;
    var onGet = function (ret) {
        if (ret.errcode !== 0) {
            g_ada.alert.show(ret.errcode);
        }else {
            callback(ret.prize_type);
            self.dispatchEvent('get_user_gems', ret);
        }
    };
    var data = {
        account: this.userData.account,
        sign: this.userData.sign,
        userId: this.userData.userId,
        userName: this.userData.userName,
    };
    g_ada.http.request("/start_prize", data, onGet);
}

helper.get_prize_record = function (callback) {
    var self = this;
    var onGet = function (ret) {
        if (ret.errcode !== 0) {
            console.log(TAG, "get_prize_record errcode: ", ret.errmsg);
        }else {
            console.log(ret.count);
            if (callback != null) {
                callback(ret.count);
            }
        }
    };
    var data = {
        account: this.userData.account,
        sign: this.userData.sign
    };
    g_ada.http.request("/get_prize_record", data, onGet);
}
