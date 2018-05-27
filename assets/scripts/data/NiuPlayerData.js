
var playerData = Object.create(require("UserData"));
playerData.online = 1;
playerData.seatIdx = 0;
playerData.readyStat = 0;
playerData.flopStat = 0;
playerData.multiple = -1;
playerData.cardInHand = [];

module.exports = playerData
