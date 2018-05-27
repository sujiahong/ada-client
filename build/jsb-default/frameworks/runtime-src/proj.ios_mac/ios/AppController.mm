/****************************************************************************
 Copyright (c) 2010-2013 cocos2d-x.org
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

#import <UIKit/UIKit.h>
#import "cocos2d.h"

#import "AppController.h"
#import "AppDelegate.h"
#import "RootViewController.h"
#import "platform/ios/CCEAGLView-ios.h"
#import "VoiceSDK.h"
#import "ECPurchase.h"
#import "TalkingDataGA.h"
#import "MWApi.h"

@implementation AppController

#pragma mark -
#pragma mark Application lifecycle

// cocos2d application instance
static AppDelegate s_sharedApplication;
static bool __isWxLogin = false;
static NSString* s_roomId = nil;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{

    // Override point for customization after application launch.

    // Add the view controller's view to the window and display.
    window = [[UIWindow alloc] initWithFrame: [[UIScreen mainScreen] bounds]];
    CCEAGLView *eaglView = [CCEAGLView viewWithFrame: [window bounds]
                                     pixelFormat: kEAGLColorFormatRGBA8
                                     depthFormat: GL_DEPTH24_STENCIL8_OES
                              preserveBackbuffer: NO
                                      sharegroup: nil
                                   multiSampling: NO
                                 numberOfSamples: 0 ];

    [eaglView setMultipleTouchEnabled:YES];
    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
    // Use RootViewController manage CCEAGLView
    viewController = [[RootViewController alloc] initWithNibName:nil bundle:nil];
    viewController.wantsFullScreenLayout = YES;
    viewController.view = eaglView;

    // Set RootViewController to window
    if ( [[UIDevice currentDevice].systemVersion floatValue] < 6.0)
    {
        // warning: addSubView doesn't work on iOS6
        [window addSubview: viewController.view];
    }
    else
    {
        // use this method on ios6
        [window setRootViewController:viewController];
    }
    
    [window makeKeyAndVisible];

    [[UIApplication sharedApplication] setStatusBarHidden: YES];

    // IMPORTANT: Setting the GLView should be done after creating the RootViewController
    cocos2d::GLView *glview = cocos2d::GLViewImpl::createWithEAGLView(eaglView);
    cocos2d::Director::getInstance()->setOpenGLView(glview);

    cocos2d::Application::getInstance()->run();
    
    //向微信注册
    [WXApi registerApp:@"wx2737122211b26e2d" withDescription:@"scmj"];
    [TalkingDataGA onStart:@"903D461E4F3046FF95E72BF5320C2DA9" withChannelId:@"appstore"];
    
    //如果您创建应用时使用storyBoard可以省略此步骤
//    self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
//    self.window.rootViewController = viewController;
//    [self.window makeKeyAndVisible];
//    
//    //初始化SDK，必写
    [MWApi registerApp:@"XFPE70ZI9ON171SQ9DC4XA75AULY1FJR"];
    [MWApi registerMLinkHandlerWithKey:@"entryroom" handler:^(NSURL *url, NSDictionary *params) {
        //跳转到app展示页，示例如下：

        s_roomId = params[@"roomid"];
        NSLog(@"%@",s_roomId);
    }];
    //s_roomId = @"232312";
    //ScriptingCore::getInstance()->evalString("cc.vv.anysdkMgr.onWXDirectEntry('233124')");
    return YES;
}

+(NSString *) getRoomId{
    // 只用一次
    if(s_roomId != nil){
        NSString *tmpId = [[NSString alloc] initWithString:s_roomId];
        s_roomId = nil;
        return tmpId;
    }else{
        return nil;
    }
    
}

- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url{

    return [WXApi handleOpenURL:url delegate:self];

}

-(BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation{

    [MWApi routeMLink:url];
    return [WXApi handleOpenURL:url delegate:self];
 
}

- (void)applicationWillResignActive:(UIApplication *)application {
    /*
     Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
     Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
     */
    cocos2d::Director::getInstance()->pause();
}

+(void) share:(NSString*)url shareTitle:(NSString*)title shareDesc:(NSString*)desc
{
    WXMediaMessage *message = [WXMediaMessage message];
    message.title = title;
    message.description = desc;
    [message setThumbImage:[UIImage imageNamed:@"Icon-29.png"]];
    
    WXWebpageObject *ext = [WXWebpageObject object];
    ext.webpageUrl = url;
    
    message.mediaObject = ext;
    
    GetMessageFromWXResp* resp = [[[GetMessageFromWXResp alloc] init] autorelease];
    resp.message = message;
    resp.bText = NO;
    
    __isWxLogin = false;
    [WXApi sendResp:resp];
}

+(void) shareIMG:(NSString*)filePath width:(int)width height:(int)height
{
    WXMediaMessage *message = [WXMediaMessage message];
    //[message setThumbImage:[UIImage imageNamed:@"Icon-29.png"]];
    
    WXImageObject *ext = [WXImageObject object];
    ext.imageData = [NSData dataWithContentsOfFile:filePath];
    message.mediaObject = ext;
    
    SendMessageToWXReq* req = [[SendMessageToWXReq alloc] init];
    req.message = message;
    req.bText = NO;
    
    __isWxLogin = false;
    [WXApi sendReq:req];
}



+(void) shareTimeLine
{
    WXMediaMessage *message = [WXMediaMessage message];

    SendMessageToWXReq* req = [[SendMessageToWXReq alloc] init];

        req.scene = WXSceneTimeline;
        message.title = @"龙门张家口麻将,咱张家口本地人的麻将，欢迎加入！";
        message.description = @"";
        [message setThumbImage:[UIImage imageNamed:@"Icon-29.png"]];
        WXWebpageObject *ext = [WXWebpageObject object];
        ext.webpageUrl = @"http://dealer.niren.org/share/index.html";
        message.mediaObject = ext;
        message.mediaTagName = @"TEXASPOKER_TAG_JUMP_APP";
 
    
    req.message = message;

    req.bText = NO;
    
    __isWxLogin = false;
    [WXApi sendReq:req];
}


+(void) doIAP:(NSString*)productId
{
    [[ECPurchase shared] requestProductData: productId ];
}


+(void)login
{
    __isWxLogin = true;
    //构造SendAuthReq结构体
    SendAuthReq* req =[[[SendAuthReq alloc ] init ] autorelease ];
    req.scope = @"snsapi_userinfo" ;
    req.state = @"123" ;
    //第三方向微信终端发送一个SendAuthReq消息结构
    [WXApi sendReq:req];
}

#include "ScriptingCore.h"
-(void) onResp:(BaseResp*)resp{
    NSLog(@"wx resp data code:%d  str:%@",resp.errCode,resp.errStr);
    if (__isWxLogin) {
        __isWxLogin = false;
        SendAuthResp *aresp = (SendAuthResp *)resp;
        if (aresp.errCode== 0) {
            NSString *code = aresp.code;
            char tmp[255]= {0};
            const char* tcode = [code UTF8String];
            sprintf(tmp, "cc.vv.anysdkMgr.onLoginResp('%s')",tcode);
            ScriptingCore::getInstance()->evalString(tmp);
        }else{
            //ScriptingCore::getInstance()->executeString("specialModule.nativelogincallback(null)");
        }
    }else{
        switch (resp.errCode) {
            case 0:{
                ScriptingCore::getInstance()->executeString("specialModule.wechatShareMsg(0)");
                break;
            }
            case -2:{
                ScriptingCore::getInstance()->executeString("specialModule.wechatShareMsg(2)");
                break;
            }
            default:
            ScriptingCore::getInstance()->executeString("specialModule.wechatShareMsg(3)");
            break;
        }
    }
    __isWxLogin = false;
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    /*
     Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
     */
    cocos2d::Director::getInstance()->resume();
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    /*
     Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
     If your application supports background execution, called instead of applicationWillTerminate: when the user quits.
     */
    cocos2d::Application::getInstance()->applicationDidEnterBackground();
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    /*
     Called as part of  transition from the background to the inactive state: here you can undo many of the changes made on entering the background.
     */
    cocos2d::Application::getInstance()->applicationWillEnterForeground();
}

- (void)applicationWillTerminate:(UIApplication *)application {
    /*
     Called when the application is about to terminate.
     See also applicationDidEnterBackground:.
     */
}


#pragma mark -
#pragma mark Memory management

- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application {
    /*
     Free up as much memory as possible by purging cached data objects that can be recreated (or reloaded from disk) later.
     */
     cocos2d::Director::getInstance()->purgeCachedData();
}


- (void)dealloc {
    [super dealloc];
}


@end

