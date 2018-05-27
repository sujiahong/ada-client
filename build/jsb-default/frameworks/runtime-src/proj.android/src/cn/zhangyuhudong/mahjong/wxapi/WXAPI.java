package cn.zhangyuhudong.mahjong.wxapi;

import java.io.File;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;
import android.view.WindowManager;
import android.widget.Toast;

import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.SendAuth;
import com.tencent.mm.sdk.openapi.SendMessageToWX;
import com.tencent.mm.sdk.openapi.WXAPIFactory;
import com.tencent.mm.sdk.openapi.WXImageObject;
import com.tencent.mm.sdk.openapi.WXMediaMessage;
import com.tencent.mm.sdk.openapi.WXWebpageObject;
import com.vivigames.scmj.Constants;
import com.vivigames.scmj.Util;
import cn.zhangyuhudong.mahjong.R;

public class WXAPI {
	public static IWXAPI api;
	public static Activity instance;
	public static boolean isLogin = false;
	public static String s_roomId = null;
	public static void Init(final Activity context){
		WXAPI.instance = context;
		api = WXAPIFactory.createWXAPI(context, Constants.APP_ID, true);
        api.registerApp(Constants.APP_ID);
        context.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
		
	}
	
	private static String buildTransaction(final String type) {
	    return (type == null) ? String.valueOf(System.currentTimeMillis()) : type + System.currentTimeMillis();
	}
	
	public static void Login(){
		isLogin = true;
		instance.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				final SendAuth.Req req = new SendAuth.Req();
				req.scope = "snsapi_userinfo";
				req.state = "carjob_wx_login";
				api.sendReq(req);
			}
			
		});
		
		//instance.finish();
	}
	
	public static void Share(String url,String title,String desc){
		try{
			isLogin = false;
			WXWebpageObject webpage = new WXWebpageObject();
			webpage.webpageUrl = url;
			WXMediaMessage msg = new WXMediaMessage(webpage);
			msg.title = title;
			msg.description = desc;
			//msg.thumbData = Util.bmpToByteArray(thumbBmp, true);
			
			SendMessageToWX.Req req = new SendMessageToWX.Req();
			req.transaction = buildTransaction("webpage");
			req.message = msg;
			req.scene = /*isTimelineCb.isChecked() ? SendMessageToWX.Req.WXSceneTimeline : */SendMessageToWX.Req.WXSceneSession;
			api.sendReq(req);
			//instance.finish();
		}
		catch(Exception e){
			e.printStackTrace();
		}
	}
	
	public static void setRoomId(String roomId){
		s_roomId = roomId;
	}
	
	public static String getRoomId(){
		//return null;

		if(s_roomId != null){
			String roomId = s_roomId;
			s_roomId = null;
			return roomId;
		}else{
			return "";
		}
	}
	
	public static void test(String roomId){
//		Log.e("wx", "testFunc currentThreadName = " + Thread.currentThread().getName());
//		WXAPI.roomId = roomId;
//		instance.runOnUiThread(new Runnable() {
//			
//			@Override
//			public void run() {
//				// TODO Auto-generated method stub
//				Toast.makeText(instance, "testFun roomId = " + WXAPI.roomId, Toast.LENGTH_LONG).show();
//			}
//		});
	}
	
	public static void ShareIMG(/*String path,*/ int width, int height){
		Log.e("wx", "currentThreadName = " + Thread.currentThread().getName());
		try{
			String path = "/data/data/cn.zhangyuhudong.mahjong/files/result_share.jpg";
			File file = new File(path);
			if (!file.exists()) {
				Log.e("wx", "wxapi !file.exists");
				return;
			}
			Bitmap bmp = BitmapFactory.decodeFile(path);
			
			WXImageObject imgObj = new WXImageObject(bmp);
			//imgObj.setImagePath(path);
			
			WXMediaMessage msg = new WXMediaMessage();
			msg.mediaObject = imgObj;
			
			
			Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp, width, height, true);
			bmp.recycle();
			msg.thumbData = Util.bmpToByteArray(thumbBmp, true);
			
			SendMessageToWX.Req req = new SendMessageToWX.Req();
			req.transaction = buildTransaction("img");
			req.message = msg;
			req.scene = SendMessageToWX.Req.WXSceneSession;
			api.sendReq(req);
			Log.e("wx", "wxapi ShareIMG end");
		}
		catch(Exception e){
			Log.e("wx", "wxapi ShareIMG Exception = " + e.toString());
			e.printStackTrace();
		}
		
	}
	
	
	public static void ShareTimeLine(){
		Log.e("wx", "currentThreadName = " + Thread.currentThread().getName());
		try{
			Log.e("wx", "wxapi ShareIMG end flag == 1");
			WXWebpageObject webpage = new WXWebpageObject();
			webpage.webpageUrl = "http://dealer.niren.org/share/index.html";
			
			WXMediaMessage msg = new WXMediaMessage(webpage);
			msg.title = "龙门张家口麻将,咱张家口本地人的麻将，欢迎加入！";
			msg.description = "";
			Bitmap thumb = BitmapFactory.decodeResource(instance.getResources(), R.drawable.icon);
			msg.thumbData = Util.bmpToByteArray(thumb, true);
			
			SendMessageToWX.Req req = new SendMessageToWX.Req();
			req.transaction = buildTransaction("webpage");
			req.message = msg;
			req.scene = SendMessageToWX.Req.WXSceneTimeline;
			
			api.sendReq(req);
		
	
			Log.e("wx", "wxapi ShareTimeLine end");
		}
		catch(Exception e){
			Log.e("wx", "wxapi ShareTimeLine Exception = " + e.toString());
			e.printStackTrace();
		}
		
	}

}
