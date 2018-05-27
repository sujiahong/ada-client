package cn.zhangyuhudong.mahjong.wxapi;


import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.tencent.mm.sdk.openapi.BaseReq;
import com.tencent.mm.sdk.openapi.BaseResp;
import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.sdk.openapi.SendAuth;
import com.tencent.mm.sdk.openapi.WXAPIFactory;
import com.vivigames.scmj.Constants;
import com.zxinsight.share.activity.MWWXHandlerActivity;


public class WXEntryActivity extends Activity implements IWXAPIEventHandler{
	
    private IWXAPI _api;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //setContentView(R.layout.plugin_entry);
    	_api = WXAPIFactory.createWXAPI(this, Constants.APP_ID, false);  
        _api.handleIntent(getIntent(), this);
    }

	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		
		setIntent(intent);
        _api.handleIntent(intent, this);
	}

	@Override
	public void onReq(BaseReq req) {
		/*
		switch (req.getType()) {
		case ConstantsAPI.COMMAND_GETMESSAGE_FROM_WX:
			//goToGetMsg();		
			break;
		case ConstantsAPI.COMMAND_SHOWMESSAGE_FROM_WX:
			//goToShowMsg((ShowMessageFromWX.Req) req);
			break;
		default:
			break;
		}
		*/
		this.finish();
	}

	@Override
	public void onResp(BaseResp resp) {
		int result = 0;
		Log.i("wx", "wxapi resp.errCode = " + resp.errCode);
		switch (resp.errCode) {
		case BaseResp.ErrCode.ERR_OK:
			Log.i("wx", "wxapi ErrCode.ERR_OK");
			if(WXAPI.isLogin){
				Log.i("wx", "wxapi isLogin = true");
				final SendAuth.Resp authResp = (SendAuth.Resp)resp;
				if(authResp != null && authResp.token != null){
					Log.i("wx", "wxapi authResp != null && authResp.token != null");
					Log.i("wx", "wxapi onLoginResp = " + authResp.token);
					//Cocos2dxJavascriptJavaBridge.evalString("cc.vv.anysdkMgr.onLoginResp('"+ authResp.token +"')");
					Cocos2dxGLSurfaceView.getInstance().queueEvent(new Runnable() {
					    @Override
					    public void run() {
					    		Cocos2dxJavascriptJavaBridge.evalString("cc.vv.anysdkMgr.onLoginResp('"+ authResp.token +"')");
					    }                                
					});
					
				} else {
					Log.i("wx", "wxapi authResp != null || authResp.token != null");
				}
			} else {
				Log.i("wx", "wxapi isLogin = false");
			}
			break;
		case BaseResp.ErrCode.ERR_USER_CANCEL:
			Log.i("wx", "wxapi ErrCode.ERR_USER_CANCEL");
			result = 2;//R.string.errcode_cancel;
			break;
		case BaseResp.ErrCode.ERR_AUTH_DENIED:
			Log.i("wx", "wxapi ErrCode.ERR_AUTH_DENIED");
			result = 3;//R.string.errcode_deny;
			break;
		default:
			Log.i("wx", "wxapi default");
			result = 4;//R.string.errcode_unknown;
			break;
		}
		this.finish();
		
		//Toast.makeText(this, result, Toast.LENGTH_LONG).show();
	}
}