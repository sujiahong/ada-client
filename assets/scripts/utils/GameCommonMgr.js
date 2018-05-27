cc.Class({
    extends: cc.Component,

    properties: {
        version: "",
        hallUrl: "",
        downloadUrl: "",
        switchConfig: null,
        inHall: false,
    },

    reset: function () {

    },

    clear: function () {

    },

    getPlatform() {
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
            return 'android';
        } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
            return 'ios';
        } else {
            return 'other';
        }
    },




    needForceUpdate() {
        if (this.version != cc.g_ada.config.Version && this.switchConfig.force_update) {
            return true;
        } else {
            return false;
        }
    },

    initServerInfo(serverInfo) {
        this.version = serverInfo.basic_config.version;
        this.stop_server_config = serverInfo.basic_config.stop_server;
        this.hallUrl = serverInfo.hall;
        this.downloadUrl = serverInfo.basic_config.download_url;
        this.switchConfig = serverInfo.switch_config;
        this.prizeConfig = serverInfo.switch_config.prize;

        if (this.switchConfig == null) {
            // 获取信息失败,返回
        }
    },

    isStopServer() {
        var stop_server_config = this.stop_server_config
        var now_time_stamp = Date.parse(new Date());
        now_time_stamp = now_time_stamp / 1000;

        var start_time_stamp = Date.parse(new Date(stop_server_config.start_time));
        start_time_stamp = start_time_stamp / 1000;

        var end_time_stamp = Date.parse(new Date(stop_server_config.end_time));
        end_time_stamp = end_time_stamp / 1000;
        console.log('now=%d, start %d, end %d', now_time_stamp, start_time_stamp, end_time_stamp);
        if (start_time_stamp <= now_time_stamp && now_time_stamp < end_time_stamp) {
            return true;
        }

        return false;
    },

    getPrizeConfig: function () {
        return this.prizeConfig
    },

    needHotUpdate: function () {
        return this.switchConfig.need_hot_update;
    },


    hasInHall() {
        return this.inHall;
    },

    setInHall() {
        this.inHall = true;
    },

    isShowMessage() {
        return this.inHall == false && this.switchConfig.has_message
    },



    getSexName: function (sex) {
        if (sex == cc.g_ada.config.Sex.Female) {
            return "female";
        } else {
            return "male";
        }
    },

    adjustUI: function (canvas, comp) {
        if (!cc.sys.isNative && cc.sys.isMobile) {
            canvas.fitHeight = true;
            canvas.fitWidth = true;
        }
        if (cc.sys.isNative) {
            var cvs = comp.node.getComponent(cc.Canvas);
            if (cc.sys.platform == cc.sys.IPAD) {
                cvs.fitWidth = true;
            } else {
                cvs.fitHeight = true;
                cvs.fitWidth = true;
            }
        }
    },

    denglongAction: function (left, right) {

        var leftPosX = left.x;
        var leftPoxY = left.y;
        var leftEndX = 117;
        var leftEndY = 335;
        var leftMoveDT = 20;

        var r = 50;

        var bezier = [cc.p(leftPosX + Math.floor(Math.random() * r) - 2 / r, leftPoxY + Math.floor(Math.random() * r) - 2 / r),
        cc.p(leftPosX + Math.floor(Math.random() * (leftEndX - leftPosX)),
            leftPoxY + Math.floor(Math.random() * (leftEndY - leftPoxY))),
        cc.p(leftEndX + Math.floor(Math.random() * r) - 2 / r, leftEndY + Math.floor(Math.random() * r) - 2 / r)];
        left.runAction(cc.sequence(
            cc.fadeIn(0),
            cc.moveTo(0.0, cc.p(leftPosX, leftPoxY)),
            cc.bezierTo(leftMoveDT, bezier),
            cc.spawn(
                cc.moveBy(1, 15, 15),
                cc.fadeOut(1)
            )
        ).repeatForever());


        var rightPosX = right.x;
        var rightPoxY = right.y;
        var rightEndX = 100;
        var rightEndY = 335;
        var rightMoveDT = 25;


        var bezier = [cc.p(rightPosX + Math.floor(Math.random() * r) - 2 / r, rightPoxY + Math.floor(Math.random() * r) - 2 / r),
        cc.p(rightPosX + Math.floor(Math.random() * (rightEndX - rightPosX)),
            rightPoxY + Math.floor(Math.random() * (rightEndY - rightPoxY))),
        cc.p(rightEndX + Math.floor(Math.random() * r) - 2 / r, rightEndX + Math.floor(Math.random() * r) - 2 / r)];
        right.runAction(cc.sequence(
            cc.scaleTo(0, 0.6),
            cc.fadeIn(0),
            cc.moveTo(0.0, cc.p(rightPosX, rightPoxY)),
            cc.spawn(
                cc.bezierTo(rightMoveDT, bezier),
                cc.scaleTo(rightMoveDT, 0.08)
            ),
            cc.spawn(
                cc.moveBy(0.2, -10, 10),
                cc.fadeOut(0.2)
            )
        ).repeatForever());
    },

    getType: function (type) {
        try {
            return cc.g_ada.config.GameTypes[type];
        } catch (e) {
            return "";
        }
    },


    LOG: function (type, content) {

        if (type == 1) {
            cc.log("石首麻将：", content);
        }

    }
});
