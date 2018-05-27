var mahjongSprites = [];

cc.Class({
    extends: cc.Component,

    properties: {
        leftAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        rightAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        bottomAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        bottomFoldAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        pengPrefabSelf:{
            default:null,
            type:cc.Prefab
        },

        paiPrefab:{
            default:null,
            type:cc.Prefab
        },
        
        pengPrefabLeft:{
            default:null,
            type:cc.Prefab
        },
        
        emptyAtlas:{
            default:null,
            type:cc.SpriteAtlas
        },
        
        holdsEmpty:{
            default:[],
            type:[cc.SpriteFrame]
        },
        
        _sides:null,
        _pres:null,
        _foldPres:null
    },
    
    onLoad:function(){
        if(cc.vv == null){
            return;
        }
        this._sides = ["myself","right","up","left"];
        this._pres = ["M_","R_","B_","L_"];
        this._foldPres = ["B_","R_","B_","L_"];
        cc.vv.mahjongmgr = this; 
        //筒
        for(var i = 1; i < 10; ++i){
            mahjongSprites.push("dot_" + i);        
        }
        
        //条
        for(var i = 1; i < 10; ++i){
            mahjongSprites.push("bamboo_" + i);
        }
        
        //万
        for(var i = 1; i < 10; ++i){
            mahjongSprites.push("character_" + i);
        }

        //东西南北风
        mahjongSprites.push("wind_east");
        mahjongSprites.push("wind_south");
        mahjongSprites.push("wind_west");
        mahjongSprites.push("wind_north");

        //中、发、白
        mahjongSprites.push("red");
        mahjongSprites.push("green");
        mahjongSprites.push("white");

        // 春夏秋冬，梅兰菊竹
        mahjongSprites.push("spring");
        mahjongSprites.push("summer");
        mahjongSprites.push("autumn");
        mahjongSprites.push("winter");
        mahjongSprites.push("plum");
        mahjongSprites.push("orchid");
        mahjongSprites.push("chrysanthemum");
        mahjongSprites.push("bamboo");

        // 坨
        mahjongSprites.push("tuo");

        // empty
        mahjongSprites.push("empty");
    },
    
    getMahjongSpriteByID:function(id){
        if(id == -1){
            return mahjongSprites[43];
        }
        return mahjongSprites[id];
    },

    getMahjongType:function(id){
        if(id >= 0 && id < 9){
            return cc.MJConfig.PaiType.Tong;
        }
        else if(id >= 9 && id < 18){
            return cc.MJConfig.PaiType.Tiao;
        }
        else if(id >= 18 && id < 27){
            return cc.MJConfig.PaiType.Wan;
        }
        else if(id >= 27 && id < 34){
            //风
            return cc.MJConfig.PaiType.Feng;
        }
        else if(id >= 34 && id < 42){
            //花    梅、兰、竹、菊、春、夏、秋、冬
            return cc.MJConfig.PaiType.Hua;
        }else if(id == 42){
            // 坨
            return cc.MJConfig.PaiType.Tuo;
        }else{
            return cc.MJConfig.PaiType.Null;
        }
    },
    
    getSpriteFrameByMJID:function(pre,mjid){
        var spriteFrameName = this.getMahjongSpriteByID(mjid);
        spriteFrameName = pre + spriteFrameName;
        if(pre == "M_"){
            return this.bottomAtlas.getSpriteFrame(spriteFrameName);            
        }
        else if(pre == "B_"){
            return this.bottomFoldAtlas.getSpriteFrame(spriteFrameName);
        }
        else if(pre == "L_"){
            return this.leftAtlas.getSpriteFrame(spriteFrameName);
        }
        else if(pre == "R_"){
            return this.rightAtlas.getSpriteFrame(spriteFrameName);
        }
    },
    
    getAudioURLByMJID:function(id){
        if(cc.MJConfig.PaiBeginIndex.Tong <= id && id < cc.MJConfig.PaiBeginIndex.Tong+9){
            return 'c'+(1+id-cc.MJConfig.PaiBeginIndex.Tong)+'b.mp3';
        }else if(cc.MJConfig.PaiBeginIndex.Tiao <= id && id < cc.MJConfig.PaiBeginIndex.Tiao+9){
            return 'c'+(1+id-cc.MJConfig.PaiBeginIndex.Tiao)+'t.mp3';
        }else if(cc.MJConfig.PaiBeginIndex.Wan <= id && id < cc.MJConfig.PaiBeginIndex.Wan+9){
            return 'c'+(1+id-cc.MJConfig.PaiBeginIndex.Wan)+'w.mp3';
        }else if(cc.MJConfig.PaiBeginIndex.Feng <= id && id < cc.MJConfig.PaiBeginIndex.Feng+7){
            return 'c'+(1+id-cc.MJConfig.PaiBeginIndex.Feng)+'f.mp3';
        }
    },
    
    getEmptySpriteFrame:function(side){
        if(side == "up"){
            return this.emptyAtlas.getSpriteFrame("e_mj_b_up");
        }   
        else if(side == "myself"){
            return this.emptyAtlas.getSpriteFrame("e_mj_b_bottom");
        }
        else if(side == "left"){
            return this.emptyAtlas.getSpriteFrame("e_mj_b_left");
        }
        else if(side == "right"){
            return this.emptyAtlas.getSpriteFrame("e_mj_b_right");
        }
    },
    
    getHoldsEmptySpriteFrame:function(side){
        if(side == "up"){
            return this.emptyAtlas.getSpriteFrame("e_mj_up");
        }   
        else if(side == "myself"){
            return null;
        }
        else if(side == "left"){
            return this.emptyAtlas.getSpriteFrame("e_mj_left");
        }
        else if(side == "right"){
            return this.emptyAtlas.getSpriteFrame("e_mj_right");
        }
    },
    
    sortMJ:function(mahjongs,dingque){
        var self = this;
        mahjongs.sort(function(a,b){
            return a - b;
        });
    },
    
    getSide:function(localIndex){
        return this._sides[localIndex];
    },
    
    getPre:function(localIndex){
        return this._pres[localIndex];
    },
    
    getFoldPre:function(localIndex){
        return this._foldPres[localIndex];
    }
});
