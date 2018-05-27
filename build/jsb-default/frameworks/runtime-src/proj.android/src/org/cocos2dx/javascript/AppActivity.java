/****************************************************************************
Copyright (c) 2008-2010 Ricardo Quesada
Copyright (c) 2010-2012 cocos2d-x.org
Copyright (c) 2011      Zynga Inc.
Copyright (c) 2013-2014 Chukong Technologies Inc.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 ****************************************************************************/
package org.cocos2dx.javascript;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import android.net.Uri;
// For JS and JAVA reflection test, you can delete it if it's your own project
import android.os.Bundle;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.util.Log;
// -------------------------------------
//import org.cocos2dx.javascript.//SDKWrapper;

import android.widget.Toast;
import cn.zhangyuhudong.mahjong.wxapi.WXAPI;

//import com.anysdk.framework.PluginWrapper;
//import com.anysdk.framework.java.AnySDK;
import com.zxinsight.MLink;
import com.zxinsight.MWConfiguration;
import com.zxinsight.MagicWindowSDK;
import com.zxinsight.Session;
import com.zxinsight.mlink.MLinkCallback;

import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;

import java.util.Date;
import java.text.SimpleDateFormat;

public class AppActivity extends Cocos2dxActivity {

	private static AppActivity app = null;
	String appKey = "48CBDBF9-B043-780E-288D-3F5DA799BA1D";
	String appSecret = "1cbd0dccc965aa33f1312acd4e37260b";
	String privateKey = "834CC380F0594110E1B7448DD8D64EE9";
	String oauthLoginServer = "http://oauth.anysdk.com/api/OauthLoginDemo/Login.php";
	
	public static String roomId = "";

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		app = this;
		// SDKWrapper.getInstance().init(this);
		WXAPI.Init(this);

		initMW();
        registerForMLinkCallback();
        Uri mLink = getIntent().getData();
        MLink.getInstance(AppActivity.this).deferredRouter();

        if (mLink != null) {
            MLink.getInstance(this).router(mLink);
        } else {
            MLink.getInstance(this).checkYYB();
        }
       
		Log.e("wx", "create again");
//		if (getIntent().getData()!=null) {
////	        MLink.getInstance(this).router(this, getIntent().getData());
////			String dataString = getIntent().getDataString();
////			Log.e("wx", "roomId dataString = " + dataString);
////			String queryStr = getIntent().getData().getQuery();
////			Log.e("wx", "roomId queryStr = " + queryStr);
////			roomId = getIntent().getData().getQueryParameter("roomid");
////			Log.e("wx", "roomId roomid = " + roomId);
////			WXAPI.setRoomId(roomId);
//			Toast.makeText(this, "getIntent().getData() not null", Toast.LENGTH_LONG).show();
//	    } else {
//	    		Toast.makeText(this, "getIntent().getData()=================null", Toast.LENGTH_LONG).show();
//	    }
	}
	
	private void initMW() {
        MWConfiguration config = new MWConfiguration(this);
        config.setDebugModel(true)
                .setPageTrackWithFragment(true)
                .setWebViewBroadcastOpen(true)
                .setSharePlatform(MWConfiguration.ORIGINAL);
        MagicWindowSDK.initSDK(config);
    }
	
	
	private static void registerForMLinkCallback() {
        MLink mLink = MagicWindowSDK.getMLink();
        mLink.registerDefault(new MLinkCallback() {
            @Override
            public void execute(Map<String, String> paramMap, Uri uri, Context context) {
                //todo: 获取动态参数,用来处理
            		String roomId = "";
		        if (paramMap != null) {
		        		roomId = paramMap.get("roomid");
		        } else if(uri!=null) {
		        		roomId = uri.getQueryParameter("roomid");
		        }
				Log.e("wx", "roomId roomid = " + roomId);
				WXAPI.setRoomId(roomId);
            }
	    });
	}
	
	@Override
	public void onNewIntent(Intent intent) {
	    super.onNewIntent(intent);
	    Uri mLink = intent.getData();
	    setIntent(intent);
	    if (mLink != null) {
	        MagicWindowSDK.getMLink().router(mLink);
	    } else {
	        MLink.getInstance(this).checkYYB();
	    }
	}
	    

	@Override
	public Cocos2dxGLSurfaceView onCreateView() {
		Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
		// TestCpp should create stencil buffer
		glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

		// SDKWrapper.getInstance().setGLSurfaceView(glSurfaceView);

		return glSurfaceView;
	}

	// For JS and JAVA reflection test, you can delete it if it's your own
	// project
	public static void showAlertDialog(final String title, final String message) {
		// Here be sure to use runOnUiThread
		app.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				AlertDialog alertDialog = new AlertDialog.Builder(app).create();
				alertDialog.setTitle(title);
				alertDialog.setMessage(message);
				alertDialog.show();
			}
		});
	}

	@Override
	protected void onResume() {
		//PluginWrapper.onResume();
		super.onResume();
	}

	@Override
	protected void onPause() {
		super.onPause();
		// SDKWrapper.getInstance().onPause();
		//PluginWrapper.onPause();
		Session.onPause(this);
	}

	@Override
	protected void onDestroy() {
		super.onDestroy();
		// SDKWrapper.getInstance().onDestroy();
		//PluginWrapper.onDestroy();
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		// SDKWrapper.getInstance().onActivityResult(requestCode, resultCode,
		// data);
		//PluginWrapper.onActivityResult(requestCode, resultCode, data);
	}


	@Override
	protected void onRestart() {
		super.onRestart();
		//PluginWrapper.onRestart();
	}

	@Override
	protected void onStop() {
		super.onStop();
		//PluginWrapper.onStop();
	}

	@Override
	public void onBackPressed() {
		super.onBackPressed();
	}

	@Override
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
	}

	@Override
	protected void onRestoreInstanceState(Bundle savedInstanceState) {
		super.onRestoreInstanceState(savedInstanceState);
		//PluginWrapper.onRestoreInstanceState(savedInstanceState);
	}

	@Override
	protected void onSaveInstanceState(Bundle outState) {
		super.onSaveInstanceState(outState);
		//PluginWrapper.onSaveInstanceState(outState);
	}

	@Override
	protected void onStart() {
		super.onStart();
		//PluginWrapper.onStart();
	}

	public static void exitGame() {
		app.finish();
		Session.onKillProcess();
	}
}
