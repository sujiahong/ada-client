var Net = require("Net");
var Global = require("Global");

cc.Class({
    extends: cc.Component,

    properties: {
        lblName:cc.Label,
        lblMoney:cc.Label,
        lblGems:cc.Label,
        lblID:cc.Label,
        lblNotice:cc.Label,
        joinGameWin:cc.Node,
        createRoomWin:cc.Node,
        settingsWin:cc.Node,
        helpWin:cc.Node,
        xiaoxiWin:cc.Node,
        shopWin:cc.Node,
        activityWin:cc.Node,
        shareWin:cc.Node,
        btnCreateGame:cc.Node,
        btnJoinGame:cc.Node,
        btnAward:cc.Node,
        sprHeadImg:cc.Sprite,
        popupAddGems:cc.Node,
        denglongLeft:cc.Node,
        denglongRight:cc.Node
    },
    
    initNetHandlers:function(){
        var self = this;
    },

    // use this for initialization
    onLoad: function () {
        console.log("Hall 111111");
        if(!cc.vv){
            cc.director.loadScene("loading");
            return;
        }
        
        var cvs = this.node.getComponent(cc.Canvas);
        console.log("Hall 22222");
        cc.vv.gameCommonMgr.adjustUI(cvs, this);
        console.log("Hall 22222-111111");
        this.initLabels();
        
        if(cc.vv.gameMgr !=null && cc.vv.gameMgr.roomId != null){
            this.btnCreateGame.active = false;
        }
        else{
            this.btnCreateGame.active = true;
        }
        console.log("Hall 3333");
        if( cc.vv.gameCommonMgr.switchConfig.has_prize || cc.vv.userMgr.in_pw){
            this.btnAward.active = true;
        }else{
            this.btnAward.active = false;
        }
        console.log("Hall 4444");
        //var params = cc.vv.args;
        var roomId = cc.vv.userMgr.oldRoomId;
        if(roomId == null){
            roomId = cc.vv.anysdkMgr.getRoomId();
            cc.error('roomId:'+roomId);
        }
        if( roomId != null  && roomId != ""){
            cc.vv.userMgr.oldRoomId = null;
            cc.error('enter room roomId:'+roomId);
            cc.vv.userMgr.enterRoom(roomId);
        }

        console.log("Hall 5555");
        var imgLoader = this.sprHeadImg.node.getComponent("ImageLoader");
        imgLoader.setUserID(cc.vv.userMgr.userId);
        cc.vv.utils.addClickEvent(this.sprHeadImg.node,this.node,"Hall","onBtnClicked");

        console.log("Hall 66666");
        this.addComponent("UserInfoShow");
        
        this.initButtonHandler("Canvas/bottom/btn_shezhi");
        this.initButtonHandler("Canvas/bottom/btn_help");
        this.initButtonHandler("Canvas/bottom/btn_xiaoxi");
        this.initButtonHandler("Canvas/bottom/btn_share");
        this.initButtonHandler("Canvas/award");

        console.log("Hall 77777");
        this.helpWin.addComponent("OnBack");
        //this.xiaoxiWin.addComponent("OnBack");
        this.shopWin.addComponent("OnBack");

        this.shopWin.active = false;
        this.settingsWin.active = false;
        this.createRoomWin.active = false;
        this.popupAddGems.active = false;
        this.shareWin.active = false;
        this.activityWin.active = false;


        if( cc.vv.gameCommonMgr.isShowMessage()){
            this.xiaoxiWin.active = true;
        }else{
            this.xiaoxiWin.active = false;
        }

        if(!cc.vv.userMgr.notice){
            cc.vv.userMgr.notice = {
                version:null,
                msg:"数据请求中..."
            }
        }

        if(!cc.vv.userMgr.gemstip){
            cc.vv.userMgr.gemstip = {
                version:null,
                msg:"数据请求中..."
            }
        }

        this.lblNotice.string = cc.vv.userMgr.notice.msg;
        
        this.refreshInfo();     //请求用户的状态信息

        // 这个地方的设计有问题
        this.refreshNotice();   // get_message type=notice
        this.refreshGemsTip();  // get_mesage type=fkgm

        cc.vv.audioMgr.playBGM("bgMain.mp3");

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                if (keyCode === cc.KEY.back || keyCode === cc.KEY.backspace) {
                    cc.director.loadScene("login");
                }
            },
            onKeyReleased: function(keyCode, event){
            }
        }, this.node);

        this.initEventHandlers();

        cc.vv.userMgr.setEvenetHandler(this.node);

        cc.game.on(cc.game.EVENT_HIDE, function () {
            // do nothing
        }, this.node);

        this.resumeCallback = function () {
            console.log("try to enter room");
            setTimeout(function(){
                var roomId = cc.vv.anysdkMgr.getRoomId();
                //cc.vv.alert.show('room Id '+roomId);
                if( roomId != null && roomId != ""){
                    cc.vv.userMgr.oldRoomId = null;
                    cc.vv.userMgr.enterRoom(roomId);
                }
            },1000);
        };

        cc.game.on(cc.game.EVENT_SHOW, this.resumeCallback, this.node);

        cc.vv.gameCommonMgr.denglongAction(this.denglongLeft, this.denglongRight);

        cc.vv.gameCommonMgr.setInHall();
    },



    initEventHandlers:function() {
        //初始化事件监听器
        var self = this;

        this.node.on('refresh_user_gems', function (data) {
            var gems = data.detail.gems;
            if(gems != null ) {
                cc.vv.userMgr.gems = gems;
                self.lblGems.string = gems;
            }
        });

        this.node.on('get_user_gems', function () {
            self.refreshInfo();
        });

    },


    refreshInfo:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                if(ret.gems != null){
                    this.lblGems.string = ret.gems;    // gems 房卡
                }
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign
        };
        cc.vv.http.sendRequest("/get_user_status",data,onGet.bind(this));
    },
    
    refreshGemsTip:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.vv.userMgr.gemstip.version = ret.version;
                cc.vv.userMgr.gemstip.msg = ret.msg.replace("<newline>","\n");
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:"fkgm",
            version:cc.vv.userMgr.gemstip.version
        };
        cc.vv.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    refreshNotice:function(){
        var self = this;
        var onGet = function(ret){
            if(ret.errcode !== 0){
                console.log(ret.errmsg);
            }
            else{
                cc.vv.userMgr.notice.version = ret.version;
                cc.vv.userMgr.notice.msg = ret.msg;
                this.lblNotice.string = ret.msg;
            }
        };
        
        var data = {
            account:cc.vv.userMgr.account,
            sign:cc.vv.userMgr.sign,
            type:"notice",
            version:cc.vv.userMgr.notice.version
        };
        cc.vv.http.sendRequest("/get_message",data,onGet.bind(this));
    },
    
    initButtonHandler:function(btnPath){
        var btn = cc.find(btnPath);
        cc.vv.utils.addClickEvent(btn,this.node,"Hall","onBtnClicked");        
    },
    
    
    
    initLabels:function(){
        this.lblName.string = cc.vv.userMgr.userName;
        this.lblGems.string = cc.vv.userMgr.gems;
        this.lblID.string = cc.vv.userMgr.userId;
    },
    
    onBtnClicked:function(event){
        cc.vv.audioMgr.playClickSFX();
        if(event.target.name == "btn_shezhi"){
            this.settingsWin.active = true;
        }   
        else if(event.target.name == "btn_help"){
            this.helpWin.active = true;
        }
        else if(event.target.name == "btn_xiaoxi"){
            this.xiaoxiWin.active = true;
        }else if(event.target.name == "btn_share"){
            cc.vv.anysdkMgr.share(cc.MJConfig.Share.Title,  cc.MJConfig.Share.Content);
            // var self = this;
            // cc.vv.anysdkMgr.generateShareImg();
            // this.scheduleOnce(function(){self.shareWin.active = true;}, 1);
        }
        else if(event.target.name == "head"){
            cc.vv.userinfoShow.show(cc.vv.userMgr.userName,cc.vv.userMgr.userId,this.sprHeadImg,cc.vv.userMgr.sex,cc.vv.userMgr.ip);
        }
    },
    
    onJoinGameClicked:function(){
        cc.vv.audioMgr.playClickSFX();
        this.joinGameWin.active = true;
    },
    
    onReturnGameClicked:function(){
        var sceneName = cc.vv.gameNetMgr.getGameSceneName();
        cc.director.loadScene(sceneName);
    },
    
    onBtnAddGemsClicked:function(){
        cc.vv.audioMgr.playClickSFX();
        if( cc.vv.gameCommonMgr.switchConfig.support_pay){
            this.shopWin.active = true;
            this.popupAddGems.active = false;
        }else{
            this.shopWin.active = false;
            this.popupAddGems.active = true;
        }
    },
    
    onCreateRoomClicked:function(){
        cc.vv.audioMgr.playClickSFX();
        if(cc.vv.gameMgr != null && cc.vv.gameMgr.roomId != null){
            cc.vv.alert.show("房间已经创建!\n必须解散当前房间才能创建新的房间");
            return;
        }
        console.log("onCreateRoomClicked");
        this.createRoomWin.active = true;   
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var x = this.lblNotice.node.x;
        x -= dt*100;
        if(x + this.lblNotice.node.width < -1000){
            x = 500;
        }
        this.lblNotice.node.x = x;

        // 登陆成功之后，会设置roomData, 这个地方会走一次
        if(cc.vv && cc.vv.userMgr.roomData != null){
            cc.vv.userMgr.enterRoom(cc.vv.userMgr.roomData);
            cc.vv.userMgr.roomData = null;
        }
    },

    onDestroy: function(){
        cc.game.off(cc.game.EVENT_SHOW, this.resumeCallback, this.node);
        if(cc.vv && cc.vv.userMgr) {
            cc.vv.userMgr.clearEvenetHandler();
        }
    }
});
