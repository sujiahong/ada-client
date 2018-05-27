const TAG = "AdaSIOClient.js";

var client = function () {
    this.opts = {
        'reconnection': true,
        "reconnectionAttempts": 3,
        'force new connection': true,
        'transports': ['websocket', 'polling'],
        "timeout": 5000
    };
    this.socketio = null;
    this.handler = {};
    this.disconnectHandler = null;
}

client.prototype.init = function(addr, next){
    var self = this;
    var sio = window.io.connect(addr, this.opts);
    sio.on("connect", function(){
        console.log(TAG, "connected: ", socketio.connected, socketio.id);
        self.socketio = sio;
        next(0);
    });
    sio.on("connect_error", function(error){
        console.log(TAG, "connect_error: ", error);
        next(1);
    });
    sio.on("connect_timeout", function(error){
        console.log(TAG, "connect_timeout: ", error);
        next(2);
    });

    sio.on("reconnect", function(num){
        console.log(TAG, "reconnect: ", num);
    });
    sio.on("reconnect_attempt", function(num){
        console.log(TAG, "reconnect_attempt: ", num);
    });
    sio.on("reconnect_failed", function(){
        console.log(TAG, "reconnect_failed: ");
        next(3);
    });
    sio.on("reconnect_error", function(error){
        console.log(TAG, "reconnect_error: ", error);
    });

    sio.on("disconnect", function(reason){
        console.log(TAG, "disconnect: ", reason);
        self.socketio = null;
        if (self.disconnectHandler){
            self.disconnectHandler();
        }
    });

    sio.on("error", function(error){
        console.log(TAG, "error: ", error);
    });
}

client.prototype.request = function(service, data, next){
    if(this.socketio){
        this.socketio.emit(service, data, next);
    }else{
        console.log(TAG, "socket is null !!!");
    }
}

client.prototype.on = function(event, next){
    if(this.socketio){
        this.socketio.on(event, next);
    }else{
        console.log(TAG, "socket is null !!!");
    }
}

client.prototype.close = function(){
    if (this.socketio){
        this.socketio.disconnect();
        this.socketio = null;
        
    }
}

module.exports = client;