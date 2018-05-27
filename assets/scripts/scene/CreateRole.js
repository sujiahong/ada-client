cc.Class({
    extends: cc.Component,

    properties: {
        inputName:cc.EditBox,
        avatarAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },

        _avatarName:null,
        _sex:null,
        avatarSprite:cc.Sprite,
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },
    
    onRandomBtnClicked:function(){
        var names = [
            "上官",
            "欧阳",
            "东方",
            "端木",
            "独孤",
            "司马",
            "南宫",
            "夏侯",
            "诸葛",
            "皇甫",
            "长孙",
            "宇文",
            "轩辕",
            "东郭",
            "子车",
            "东阳",
            "子言",
        ];
        
        var names2 = [
            "雀圣",
            "赌侠",
            "赌圣",
            "稳赢",
            "不输",
            "好运",
            "自摸",
            "有钱",
            "土豪",
        ];
        var idx = Math.floor(Math.random() * (names.length - 1));
        var idx2 = Math.floor(Math.random() * (names2.length - 1));
        this.inputName.string = names[idx] + names2[idx2];
    },

    // use this for initialization
    onLoad: function () {
        if(!cc.sys.isNative && cc.sys.isMobile){
            var cvs = this.node.getComponent(cc.Canvas);
            cvs.fitHeight = true;
            cvs.fitWidth = true;
        }
        if(!cc.vv){
            cc.director.loadScene("loading");
            return;
        }
        this.onRandomBtnClicked();
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
        this._sex = cc.MJConfig.Sex.Female;
        this.setAvatar();
    },

    onBtnConfirmClicked:function(){
        cc.vv.audioMgr.playClickSFX();
        var name = this.inputName.string;
        if(name == ""){
            console.log("invalid name.");
            return;
        }
        console.log(name);
        cc.vv.userMgr.create(name, this._sex);
    },

    onBtnFemale:function(){
        cc.vv.audioMgr.playClickSFX();
        this._sex = cc.MJConfig.Sex.Female;
        this.setAvatar();
    },

    onBtnMale:function(){
        cc.vv.audioMgr.playClickSFX();
        this._sex = cc.MJConfig.Sex.Male;
        this.setAvatar();
    },


    setAvatar:function(){
        if( this._sex == cc.MJConfig.Sex.Female) {
            this._avatarName = "female1";

        }else{
            this._avatarName = "male1";
        }
        this.avatarSprite.spriteFrame = this.avatarAtlas.getSpriteFrame(this._avatarName);
        console.log(this.avatarSprite.spriteFrame);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
