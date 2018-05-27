const TAG = "LoadingScene.js";

cc.Class({
    extends: cc.Component,

    properties: {
        tipLabel: cc.Label,
        loadingBar: cc.ProgressBar,
        versionLabel: cc.Label,
        denglongLeft: cc.Node,
        denglongRight: cc.Node,
        se: cc.Sprite,
        _stateStr: '',
        _progress: 0.0,
        _splash: null,
        _isLoading: false,
        _isUpdate: false,

        _hotUpdate: null
    },

    // use this for initialization
    onLoad: function () {
        if (!cc.sys.isNative && cc.sys.isMobile) {
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        cc.g_ada.userHelper.setCurScene("LoadingScene");
        //this.tipLabel.string = this._stateStr;
        this.loadingBar.progress = 0;
        this._hotUpdate = this.node.getComponent('HotUpdate');

        this.versionLabel.string = cc.g_ada.config.Version + '(' + cc.g_ada.config.ENV + ')';

        cc.g_ada.gameCommonMgr.denglongAction(this.denglongLeft, this.denglongRight);
    },



    start: function () {
        this.checkVersion();
    },

    checkVersion: function () {
        var self = this;
        var onGetVersion = function (ret) {
            if (ret.basic_config == null) {
                console.log("error.");
            } else {
                cc.g_ada.gameCommonMgr.initServerInfo(ret);
                console.log(ret);

                if (cc.g_ada.gameCommonMgr.isStopServer()) {
                    cc.g_ada.alert.show("正在停服维护,请耐心等待!", function () {

                    });
                    return
                }

                // 走强更
                if (cc.g_ada.gameCommonMgr.needForceUpdate()) {

                    cc.g_ada.alert.show("有新的内容需要更新", function () {
                        cc.sys.openURL(cc.g_ada.gameCommonMgr.downloadUrl);
                    });
                }else {
                    var needHotUpdate = cc.g_ada.gameCommonMgr.needHotUpdate();
                    if (cc.sys.isNative && needHotUpdate) {
                        console.log('checkupdate......');
                        self._hotUpdate.checkUpdate();
                        self._stateStr = '检查更新';
                        self._isUpdate = true;
                    } else {
                        self.startPreloading();
                    }
                }
            }
        };

        var xhr = null;
        var complete = false;
        var fnRequest = function () {
            self._stateStr = "正在连接服务器";
            var data = {
                game: cc.g_ada.config.GameName,
                version: cc.g_ada.config.Version,
                platform: cc.g_ada.gameCommonMgr.getPlatform(),
                sign: cc.g_ada.userHelper.userData.sign
            };

            cc.log("data:", JSON.stringify(data));
            //cc.cc.g_ada.LOG(1, data);

            xhr = cc.g_ada.http.request("/get_serverinfo", data, function (ret) {
                xhr = null;
                complete = true;
                console.log("ret:" + JSON.stringify(ret));
                onGetVersion(ret);
            });
            setTimeout(fn, 5000);
        }

        var fn = function () {
            if (!complete) {
                if (xhr) {
                    xhr.abort();
                    self._stateStr = "连接失败，即将重试";
                    setTimeout(function () {
                        fnRequest();
                    }, 5000);
                }
                else {
                    fnRequest();
                }
            }
        };
        fn();
    },

    startPreloading: function () {
        this._stateStr = "正在加载资源，请稍候";
        this._isLoading = true;
        var self = this;
        console.log('startPreLoading fuck');
        cc.loader.onProgress = function (completedCount, totalCount, item) {
            console.log("completedCount:" + completedCount + ",totalCount:" + totalCount + " this._isLoading:" + self._isLoading);
            if (self._isLoading) {
                self._progress = completedCount / totalCount;
                console.log("_progress:" + self._progress * 100);
            }
        };

        cc.loader.loadResAll("textures", function (err, assets) {
            self.onLoadComplete();
        });
    },

    onLoadComplete: function () {
        this._isLoading = false;
        this._stateStr = "准备登陆";
        cc.director.loadScene("login");
        cc.loader.onComplete = null;
    },


    setStateStr: function (str) {
        cc.error('setState Str ' + str);
        this._stateStr = str;
    },


    setProgress: function (progress) {
        this.loadingBar.progress = progress;
        this.se.node.x = -250 + progress * 500;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        //console.log('update fuck');
        if (this._stateStr.length == 0) {
            console.log('update length == 0');
            return;
        }

        this.tipLabel.string = this._stateStr + ' ';
        //cc.log('this.loadingBar '+ this.loadingBar.progress);
        if (this._isLoading) {
            this.tipLabel.string += Math.floor(this._progress * 100) + "%";
            this.loadingBar.progress = this._progress;
            //this.se.node.x = -764/2+this._progress*764;
        }
        else {
            var t = Math.floor(Date.now() / 1000) % 4;
            for (var i = 0; i < t; ++i) {
                this.tipLabel.string += '.';
            }
        }
    },

    endHotUpdate() {
        console.log("fuck endHotUpdate");
        this._isUpdate = false;
        this.startPreloading();
        //this.scheduleUpdate();
    }
});