const TAG = "AudioMgr.js";
cc.Class({
    extends: cc.Component,

    properties: {
        bgmVolume: 1.0,
        sfxVolume: 1.0,
        bgmAudioID: -1
    },

    // use this for initialization
    init: function () {
        console.log(TAG, "audioMgr init !!!");
        var t = cc.sys.localStorage.getItem("bgmVolume");
        if (t != null) {
            this.bgmVolume = parseFloat(t);
        }

        var t = cc.sys.localStorage.getItem("sfxVolume");
        if (t != null) {
            this.sfxVolume = parseFloat(t);
        }

        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    getUrl: function (url) {
        return cc.url.raw("resources/sounds/" + url);
    },

    playBGM: function (url) {
        if (cc.g_ada.config.HAS_MUSIC) {
            var audioUrl = this.getUrl(url);
            console.log(audioUrl);
            if (this.bgmAudioID >= 0) {
                cc.audioEngine.stop(this.bgmAudioID);
            }
            this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
        }
    },

    playSFX: function (url) {
        var audioUrl = this.getUrl(url);
        if (this.sfxVolume > 0) {
            var audioId = cc.audioEngine.play(audioUrl, false, this.sfxVolume);
        }
    },

    playSexPlay: function (index, sex) {
        sex = sex || cc.vv.userMgr.sex;
        var audioUrl = null;
        if (sex == cc.g_ada.config.Sex.Female) {
            audioUrl = this.getUrl('play/f' + index + '.mp3');
        } else {
            audioUrl = this.getUrl('play/n' + index + '.mp3');
        }
        console.log('audioUrl %s', audioUrl);
        if (this.sfxVolume > 0) {
            var audioId = cc.audioEngine.play(audioUrl, false, this.sfxVolume);
        }
    },

    playSexSFX: function (url, sex) {
        var sexName = "female";
        if (sex == null && cc.vv != null && cc.vv.userMgr != null) {
            sexName = cc.vv.userMgr.getSexName();
        } else if (cc.vv != null && cc.vv.gameCommonMgr != null) {
            sexName = cc.vv.gameCommonMgr.getSexName(sex);
        }
        var audioUrl = this.getUrl(sexName + "/" + url);
        console.log('audioUrl %s', audioUrl);
        if (this.sfxVolume > 0) {
            var audioId = cc.audioEngine.play(audioUrl, false, this.sfxVolume);
        }
    },


    playClickSFX: function () {
        var clickUrl = this.getUrl('ui_click.mp3');
        if (this.sfxVolume > 0) {
            var audioId = cc.audioEngine.play(clickUrl, false, this.sfxVolume);
        }
    },

    setSFXVolume: function (v) {
        if (this.sfxVolume != v) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            this.sfxVolume = v;
        }
    },

    setBGMVolume: function (v, force) {
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            }
            else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
            //cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
        }
        if (this.bgmVolume != v || force) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
    },

    pauseAll: function () {
        cc.audioEngine.pauseAll();
    },

    resumeAll: function () {
        cc.audioEngine.resumeAll();
    }
});
