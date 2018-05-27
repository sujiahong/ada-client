const TAG = "AnysdkMgr.js";
cc.Class({
    extends: cc.Component,
    properties: {
        _isCapturing:false,
        isSharing:false,
    },

    // use this for initialization
    onLoad: function () {
    },
    
    init:function(){
        console.log(TAG, "anySDK init !!!");
        this.ANDROID_API = "cn/zhangyuhudong/mahjong/wxapi/WXAPI";
        this.IOS_API = "AppController";
    },
    
    login:function(){
        if(cc.sys.os == cc.sys.OS_ANDROID){ 
            jsb.reflection.callStaticMethod(this.ANDROID_API, "Login", "()V");
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this.IOS_API, "login");
        }
        else{
            console.log("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },
    
    share:function(title,desc, roomId){
        //https://a.mlinks.cc/AK6b
        if(cc.sys.os == cc.sys.OS_ANDROID){
            if(roomId != null){
                jsb.reflection.callStaticMethod(this.ANDROID_API, "Share",
                    "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V","https://a.mlinks.cc/AK6b?roomid="+roomId,title,desc);
            }else{
                jsb.reflection.callStaticMethod(this.ANDROID_API, "Share",
                    "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",cc.vv.gameCommonMgr.downloadUrl,title,desc);
            }
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            if(roomId != null){
                jsb.reflection.callStaticMethod(this.IOS_API, "share:shareTitle:shareDesc:",
                    "https://a.mlinks.cc/AK6b?roomid="+roomId, title, desc);
            }else{
                jsb.reflection.callStaticMethod(this.IOS_API, "share:shareTitle:shareDesc:",cc.vv.gameCommonMgr.downloadUrl,title,desc);
            }
        }
        else{
            console.log("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },

    generateShareImg:function(){
        if(this._isCapturing){
            return;
        }
        var self = this;
        this._isCapturing = true;
        var size = cc.director.getWinSize();
        var currentDate = new Date();
        var fileName = "result_share.jpg";
        var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        if(jsb.fileUtils.isFileExist(fullPath)){
            jsb.fileUtils.removeFile(fullPath);
        }
        var texture = new cc.RenderTexture(Math.floor(size.width), 
            Math.floor(size.height),
            cc.TEXTURE2D_PIXEL_FORMAT_RGBA8888, 
            0x88F0);
        texture.setPosition(cc.p(size.width/2, size.height/2));
        texture.begin();
        cc.director.getRunningScene().visit();
        texture.end();
        texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);
        self._isCapturing = false;
    },
    
    shareResult:function(){
        var fileName = "result_share.jpg";
        var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        var size = cc.director.getWinSize();
        if(jsb.fileUtils.isFileExist(fullPath)){
            console.log("wxapi fullPath exist"); 
            var height = 100;
            var scale = height/size.height;
            var width = Math.floor(size.width * scale);
            
            if(cc.sys.os == cc.sys.OS_ANDROID){
                console.log("wxapi fullPath:" + fullPath + " width=" + width + " height=" + height); 
                console.log("wxapi self.ANDROID_API:" + this.ANDROID_API);
                jsb.reflection.callStaticMethod(this.ANDROID_API, "ShareIMG", "(II)V",width,height);
                // jsb.reflection.callStaticMethod(this.ANDROID_API, "ShareIMG", "(Ljava/lang/String;II)V",width,height);
                console.log("wxapi callStaticMethod end");
            } else if(cc.sys.os == cc.sys.OS_IOS){
                jsb.reflection.callStaticMethod(this.IOS_API, "shareIMG:width:height:",fullPath,width,height);
            } else{
                console.log("wxapi platform:" + cc.sys.os + " dosn't implement share.");
            }
        } else {
            console.log("wxapi fullPath not exist");
        }
    },
    
    shareTimeLine:function(){
        if(cc.sys.os == cc.sys.OS_ANDROID){
            console.log("wxapi self.ANDROID_API:" + this.ANDROID_API);
            jsb.reflection.callStaticMethod(this.ANDROID_API, "ShareTimeLine", "()V");
            console.log("wxapi callStaticMethod end");
        } else if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this.IOS_API, "shareTimeLine");
        } else{
            console.log("wxapi platform:" + cc.sys.os + " dosn't implement share.");
        }
    },

    doIAP:function(productId){
        if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this.IOS_API, "doIAP:",productId);
        }
        else{
            console.log("platform:" + cc.sys.os + " dosn't implement share.");
        }

    },

    getRoomId:function(){
        if(cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS){
            var roomId = jsb.reflection.callStaticMethod(this.IOS_API, "getRoomId");
            cc.error('getRoomId: roomId '+ roomId);
            return roomId
        }else if(cc.sys.isNative &&  cc.sys.os == cc.sys.OS_ANDROID){
            cc.error('getRoomId: fuck you');
            var roomId = jsb.reflection.callStaticMethod(this.ANDROID_API, "getRoomId", "()Ljava/lang/String;");
            cc.error('getRoomId: roomId '+ roomId);
            return roomId
        }else{
            return null;
        }

    },
    
    onLoginResp:function(code){
        cc.error('onLoginResp');
        cc.vv.wc.hide();
        var fn = function(ret){
            console.log("wxapi ret.errcode = " + ret.errcode);
            if(ret.errcode == 0){
                console.log("wxapi wx_account = " + ret.account);
                console.log("wxapi ret.sign = " + ret.sign);
                cc.sys.localStorage.setItem(cc.g_ada.config.WX_ACCOUNT_KEY, ret.account);
                cc.sys.localStorage.setItem(cc.g_ada.config.WX_SIGN_KEY,ret.sign);
            }
            cc.vv.userMgr.onAuth(ret);
        }
        console.log("wxapi send weixin auth");
        cc.vv.http.sendRequest("/wechat_auth",{code:code,os:cc.sys.os},fn, cc.g_ada.config.ACCOUNT_URL);
    },

    // 支付结果
    onIAPResp:function(isOK){
        cc.error('onIAPResp');
        cc.vv.wc.hide();
        if( isOK){
            cc.vv.userMgr.iapOK();
            cc.vv.alert.show('提示', '购买成功');
        }else{
            cc.vv.alert.show('提示', '购买失败');
        }
    },

    // 魔窗一键入局
    onWXDirectEntry:function(roomId){
        cc.error('onWXDirectEntry '+roomId);
        cc.vv.userMgr.oldRoomId = roomId;
        cc.error('onWXDirectEntry end');

        //cc.vv.alert.show('f ..room Id '+roomId);

        //jsb.reflection.callStaticMethod(this.ANDROID_API, "test", "(Ljava/lang/String;)V",roomId);
    }
});
