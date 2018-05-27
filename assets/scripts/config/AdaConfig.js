var config = {};

config.ENV = "local";

if(config.ENV == "local") {
    config.ACCOUNT_URL = "http://192.168.1.3:9000";
    config.HAS_MUSIC = false;
    config.NET_TIMEOUT = 100000;
}else if(config.ENV == "test") {
    config.HAS_MUSIC = true;
    config.ACCOUNT_URL = "http://test.niren.org:9000";
    config.NET_TIMEOUT = 45000;
    config.MSG_URL = 'http://test-hotupdate.niren.org/msg/msg.png';
}else if(config.ENV == "release") {
    config.HAS_MUSIC = true;
    config.ACCOUNT_URL = "http://mj.niren.org:9000";
    config.NET_TIMEOUT = 45000;
    config.MSG_URL = 'http://hotupdate.niren.org/msg/msg.png';

}else{
    // 填一个域名
    config.HAS_MUSIC = false;
    config.ACCOUNT_URL = "http://127.0.0.1:9000";
    config.NET_TIMEOUT = 100000;
    config.MSG_URL = 'http://test-hotupdate.niren.org/msg/msg.png';
}

config.Version = "v1.1.32";
config.ProductId = 'cn.zhangyuhudong.mahjong.iap.fangka.tire5';

config.SceneAddr = {
    LoadingScene: config.ACCOUNT_URL,
    LoginScene: config.ACCOUNT_URL,
    HallScene: ""
};

config.PaiTakedColor = {
    r: 233,
    g:227,
    b:37
};

config.GangType = {
    angang:'angang',
    diangang: 'diangang', // 已经有3张了,在吃一个
    wangang: 'wangang' // 已经碰了在摸一张
};

config.Action = {
    Null: -1,
    Guo:0,
    ChuPai:1,
    MoPai:2,
    Peng:3,
    Gang:4,
    Hu:5,
    ZiMo:6,
    Chi:7  // 吃
};

config.PaiType = {
    Null: -1,
    Tong: 0, // 筒
    Tiao: 1, // 条
    Wan: 2, // 万
    Feng: 3, // 风
    Hua: 4, // 花
    Tuo:5   // 坨
};

config.PaiBeginIndex ={
    Tong:0,
    Tiao:9,
    Wan:18,
    Feng:27,
    Hua:34,
    Tuo:42
};

config.GameType = {
    kouzhang : 'kouzhang',
    erwuba : 'erwuba',      // 二五八麻将
    xlch : 'xlch'
};

config.GameTypes = {
    'kouzhang':'扣张',
    'erwuba':'二五八',
    'hongzhong':'一五九',
    'tuidaohu':'推倒胡'
};

config.Sex = {
    Female :2,
    Male:1,
    Unkown:0
};

config.Share = {
    Title: '龙门张家口麻将',
    Content: '龙门张家口麻将，包含了扣张,二五八,红中等多种流行麻将玩法。'
};

config.MJClickOffsetY = 25;
config.PaiWidth = 75;
config.BottomPaiWidth = 52;
config.MusicBarWidth = 254;
config.ChuPaiSFXInterval = 200;

config.HongZhongHun = 33;

config.GameName = 'ada-game';
config.WX_ACCOUNT_KEY = "wx_account";
config.WX_SIGN_KEY = "wx_sign";

config.HasChuPaiTip = '已出牌,网络较慢等待服务器消息';

config.HasKouPaiTip = '已扣牌,网络较慢等待服务器消息';

// config.RoomTypes = ['kouzhang', 'erwuba','tuidaohu', 'hongzhong', 'niuniu', 'lord'];
config.RoomTypes = ['shishoulaizi', 'shishouaihuang', 'kouzhang', 'erwuba','tuidaohu', 'hongzhong', 'niuniu', 'lord'];

config.LastEnterRoomKey = 'ler';

module.exports = config;
