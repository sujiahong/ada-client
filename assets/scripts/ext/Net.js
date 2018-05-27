if(window.io == null){
    window.io = require("socket-io");
}
 
var Global = cc.Class({
    extends: cc.Component,
    statics: {
        ip:"",
        sio:null,
        isPinging:false,
        fnDisconnect:null,
        handlers:{},
        addHandler:function(event,fn){
            if(event == 'disconnect'){
                console.log('get fun Disconnect !!!!!');
                this.fnDisconnect = fn;
                return ;
            }
            if(this.handlers[event]){
                // 由于我们存在多个游戏切换,所以,会出现反复注册的情况,一定要把以前的移除掉
                // 否则这里会出现很多诡异的问题 c++会报错
                // console.log("event:" + event + "' handler has been registered.");
                // var oldHandler = this.handlers[event];
                // if(this.sio){
                //     console.log("remove function " + event);
                //     this.sio.removeEventListener(event,oldHandler);
                // }
                // this.handlers[event] =  null;

                return ;
            }

            var handler = function(data){
                console.log(event + "(" + typeof(data) + "):" + (data? data.toString():"null"));
                if(event != "disconnect" && typeof(data) == "string"){
                    data = JSON.parse(data);
                }
                fn(data);
            };
            
            this.handlers[event] = handler; 
            if(this.sio){
                console.log("register:function " + event);
                this.sio.on(event,handler);
            }
        },
        connect:function(fnConnect,fnError) {
            var self = this;
            
            var opts = {
                'reconnection':false,
                'force new connection': true,
                'transports':['websocket', 'polling']
            }
            this.sio = window.io.connect(this.ip,opts);
            this.sio.on('reconnect',function(){
                console.log('reconnection');
            });
            this.sio.on('connect',function(data){
                self.sio.connected = true;
                fnConnect(data);
            });
            
            this.sio.on('disconnect',function(data){
                console.log("disconnect!!!!!");
                console.log('disconnect!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                self.sio.connected = false;
                if(self.fnDisconnect){
                    self.fnDisconnect();
                    self.fnDisconnect = null;
                }
            });
            
            this.sio.on('connect_failed',function (){
                console.log('connect_failed');
            });
            
            for(var key in this.handlers){
                var value = this.handlers[key];
                if(typeof(value) == "function"){
                    if(key == 'disconnect'){
                        this.fnDisconnect = value;
                    }
                    else{
                        console.log("register:function " + key);
                        this.sio.on(key,value);                        
                    }
                }
            }
            
            this.startHearbeat();
        },
        
        startHearbeat:function(){
            this.sio.on('game_pong',function(){
                console.log('game_pong');
                self.lastRecieveTime = Date.now(); 
            });
            this.lastRecieveTime = Date.now();
            var self = this;
            console.log(1);
            if(!self.isPinging){
                console.log(1);
                self.isPinging = true;
                setInterval(function(){
                    console.log(3);
                    if(self.sio){
                        console.log(4);
                        if(Date.now() - self.lastRecieveTime > cc.g_ada.config.NET_TIMEOUT){
                            self.close();
                        }
                        else{
                            self.ping();
                        }                        
                    }
                },5000);
            }   
        },
        send:function(event,data){
            console.log("send event [%s]: data %s", event, JSON.stringify(data));
            console.log(data);
            if(this.sio.connected){
                if(data != null && (typeof(data) == "object")){
                    data = JSON.stringify(data);
                }
                this.sio.emit(event,data);                
            }
        },
        
        ping:function(){
            this.send('game_ping');
        },
        
        close:function(){
            console.log('close!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

            if(this.sio != null  && this.sio.connected) {
                this.sio.disconnect();
            }
            if(this.fnDisconnect){
                this.fnDisconnect();
                this.fnDisconnect = null;
            }
            this.sio = null;
            this.isPinging = false;
            this.fnDisconnect = null;
            this.handlers = {};
        },
        
        test:function(fnResult){
            var xhr = null;
            var fn = function(ret){
                fnResult(ret.isonline);
                xhr = null;
            }
            
            var arr = this.ip.split(':');
            var data = {
                account:cc.vv.userMgr.account,
                sign:cc.vv.userMgr.sign,
                ip:arr[0],
                port:arr[1]
            }
            xhr = cc.vv.http.sendRequest("/is_server_online",data,fn);
            setTimeout(function(){
                if(xhr){
                    xhr.abort();
                    fnResult(false);                    
                }
            },1500);
            /*
            var opts = {
                'reconnection':false,
                'force new connection': true,
                'transports':['websocket', 'polling']
            }
            var self = this;
            this.testsio = window.io.connect(this.ip,opts);
            this.testsio.on('connect',function(){
                console.log('connect');
                self.testsio.close();
                self.testsio = null;
                fnResult(true);
            });
            this.testsio.on('connect_error',function(){
                console.log('connect_failed');
                self.testsio = null;
                fnResult(false);
            });
            */
        }
    }
});