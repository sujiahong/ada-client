String.prototype.format = function(args) { 
    if (arguments.length>0) { 
        var result = this; 
        if (arguments.length == 1 && typeof (args) == "object") { 
            for (var key in args) { 
                var reg=new RegExp ("({"+key+"})","g"); 
                result = result.replace(reg, args[key]); 
            } 
        } 
        else { 
            for (var i = 0; i < arguments.length; i++) { 
                if(arguments[i]==undefined) { 
                    return ""; 
                } 
                else { 
                    var reg=new RegExp ("({["+i+"]})","g"); 
                    result = result.replace(reg, arguments[i]); 
                } 
            } 
        } 
        return result; 
    } 
    else { 
        return this; 
    } 
};

const TAG = "LoginScene.js";
const g_ada = cc.g_ada;
 
cc.Class({
    extends: cc.Component,

    properties: {
        agreement:cc.Node,
        agreementMask:cc.Node,
        alert:cc.Node,
        agree_node:cc.Node,
        weixnBtn:cc.Node,
        guestBtn:cc.Node,
        denglongLeft:cc.Node,
        denglongRight:cc.Node,
        _mima:null,
        _mimaIndex:0
    },

    // use this for initialization
    onLoad: function () {
        console.log("onlogin1111")
        var self = this;
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        g_ada.userHelper.setCurScene("LoginScene");
        if(!cc.g_ada){
            cc.director.loadScene("loading");
            cc.g_ada = {};
            //return;
        }
        //cc.vv.http.url = cc.vv.http.account_url;
        // cc.vv.net.addHandler('push_need_create_role',function(){
        //     console.log("onLoad:push_need_create_role");
        //     cc.director.loadScene("createrole");
        // });
        
        //cc.vv.audioMgr.playBGM("bgMain.mp3");
        
        this._mima = ["A","A","B","B","A","B","A","B","A","A","A","B","B","B"];
        
        if(!cc.sys.isNative || cc.sys.os == cc.sys.OS_WINDOWS){
            this.guestBtn.active = true;
        }

        // if( cc.sys.os == cc.sys.OS_IOS ){
        //     this.agree_node.active = false;
        // }

        this.agreement.active = false;
        this.agreementMask.active = true;
        console.log("onlogin222")
        // if( cc.vv.gameCommonMgr.switchConfig.weixin_login){
        //     this.weixnBtn.active = true;
        // }else{
        //     this.weixnBtn.active = false;
        // }

        // if( cc.vv.gameCommonMgr.switchConfig.guest_login){
        //     this.guestBtn.active = true;
        // }else{
        //     this.guestBtn.active = false;
        // }


        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                if (keyCode === cc.KEY.back || keyCode === cc.KEY.backspace) {
                    cc.find("Canvas/exitConfirm").active = true;
                }
            },
            onKeyReleased: function(keyCode, event){
            }
        }, self.node);
        console.log("onlogin3333")
        //cc.vv.gameCommonMgr.denglongAction(this.denglongLeft, this.denglongRight);
        console.log("onlogin3333")
    },
    
    start:function(){
        var account =  cc.sys.localStorage.getItem(cc.MJConfig.WX_ACCOUNT_KEY);
        var sign = cc.sys.localStorage.getItem(cc.MJConfig.WX_SIGN_KEY);
        if(account != null && sign != null){
            var ret = {
                errcode:0,
                account:account,
                sign:sign
            }
            console.log('onAuth ');
            console.log(ret);
            cc.vv.userMgr.onAuth(ret);
        }   
    },

    onBtnAgreementClicked:function(){
        //cc.vv.audioMgr.playClickSFX();
        this.agreement.active = true;
    },

    onBtnAgreementMaskClicked:function(){
        console.log('onBtnAgreementMaskClicked '+ this.agreementMask.active);
        this.agreementMask.active = !this.agreementMask.active;
    },

    onBtnAgreementClose:function(){
        this.agreement.active = false;
    },

    // onBtnConfirmClose:function(){
    //     this.alert.active = false;
    // },

    onBtnQuickStartClicked:function(){
        cc.vv.audioMgr.playClickSFX();
        var active = this.agreementMask.active;
        if(active == false){
            cc.vv.alert.show('请同意用户协议');
            return ;
        }

        cc.vv.userMgr.guestAuth();
        // cc.vv.anysdkMgr.share();
    },
    
    onBtnWeichatClicked:function(){
        cc.vv.audioMgr.playClickSFX();
        var active = this.agreementMask.active;
        if(active == false){
            cc.vv.alert.show('请同意用户协议');
            return ;
        }
        cc.vv.wc.show('正在登陆微信');
        cc.vv.anysdkMgr.login();
    },
});
