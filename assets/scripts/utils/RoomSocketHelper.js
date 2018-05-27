const TAG = "RoomSocketHelper.js";
cc.Class({
    extends: cc.Component,

    connectSocket: function (data) {
        var g_ada = cc.g_ada;
        //cc.vv.net = null;
        //cc.vv.net = require("Net");
        //this.dissoveData = null;
        //cc.vv.net.ip = data.ip + ":" + data.port;
        var addr = data.ip + ":" + data.port;
        g_ada.wc.show("正在进入房间");
        console.log(TAG, "connectSocket.......", addr);
        g_ada.sioClient.init(addr, function(ecode){
            if (ecode == g_ada.errcode.SUCCESS){
                var msg = {
                    route: "login",
                    token: data.token,
                    roomId: data.roomId,
                    time: data.time,
                    sign: data.sign
                };
                var playService = g_ada.constant.gameplayService;
                g_ada.sioClient.request(playService[data.gamePlay], msg, loginHandler);
            }else{
                console.log(TAG, "failed. errcode: ", ecode);
                g_ada.wc.hide();
            }
        });
    },

    closeSocket: function (data) {
        console.log(TAG, 'closeSocket!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        cc.g_ada.sioClient.close();
    }
});

var loginHandler = function(loginData){
    var g_ada = cc.g_ada;
    if (loginData.errcode !== g_ada.errcode.SUCCESS) {
        return console.log(TAG, "登录失败！！errcode: ", loginData.errcode);
    }
    self.conf = loginData.conf;
    var type = self.conf.type;
    var roomManager = null;
    if (type == g_ada.contant.gamePlay.niu) {
        roomManager = require("../room/niuRoom/NiuRoomMgr");
    }
    if (roomManager) {
        cc.sys.localStorage.setItem(g_ada.config.LastEnterRoomKey, type);
        cc.g_ada.roomLogicMgr = new roomManager();
        cc.g_ada.roomLogicMgr.init(loginData);
        var sceneName = self.getGameSceneName();
        cc.director.loadScene(sceneName);
    } else {
        console.log(TAG, "游戏管理器为空！！！");
    }
}