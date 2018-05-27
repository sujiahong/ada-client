 //
//  ECPurchase.m
//  myPurchase
//
//  Created by ris on 10-4-23.
//  Copyright 2010 __MyCompanyName__. All rights reserved.
//

#import "ECPurchase.h"
//#import "SBJSON.h"
//#import "GTMBase64.h"
#import "cocos2d.h"
//#import "ASINetworkQueue.h"
//#import "ASIHTTPRequest.h"
//#import "ASIFormDataRequest.h"
#include "ScriptingCore.h"

//#import "ShopLayer.h"
//#include "Wrapper.h"
//#include "EncryptionManager.h"
//#include "Device_Wrapper.h"

/******************************
 SKProduct extend
 *****************************/


#define IAP_ERROR @"苹果内购支付出错"
#define IAP_SERVER_VERIFY_ERROR @"支付校验出错"
#define IAP_ARGS_ERROR @"支付参数出错"
#define IAP_SERVER_VERIFY_CONNECT_ERROR @"支付校验请求失败"



@implementation SKProduct (LocalizedPrice)

- (NSString *)localizedPrice{
    NSNumberFormatter *numberFormatter = [[NSNumberFormatter alloc] init];
    [numberFormatter setFormatterBehavior:NSNumberFormatterBehavior10_4];
    [numberFormatter setNumberStyle:NSNumberFormatterCurrencyStyle];
    [numberFormatter setLocale:self.priceLocale];
    NSString *formattedString = [numberFormatter stringFromNumber:self.price];
    [numberFormatter release];
    return formattedString;
}

@end

/***********************************
 ECPurchaseHTTPRequest
// ***********************************/
//@implementation ECPurchaseHTTPRequest
//@synthesize productIdentifier = _productIdentifier;
//@synthesize tmpStr = _tmpStr;
//
//- (void)dealloc
//{
//    self.productIdentifier = nil;
//    self.tmpStr = nil;
//    [super dealloc];
//}
//
//@end

/******************************
 ECPurchase
 ******************************/
@implementation ECPurchase
@synthesize productDelegate = _productDelegate;
@synthesize transactionDelegate =_transactionDelegate;
@synthesize paymentDic = _paymentDic;

SINGLETON_IMPLEMENTATION(ECPurchase);


//you can init the object here as the object init is in SINGLETON_IMPLEMENTATION
-(void)postInit
{
    NSMutableDictionary *dic = [NSMutableDictionary dictionary];
    self.paymentDic = dic;
    [self addTransactionObserver];
	[self registerNotifications];
}

- (void)requestProductData:(NSString*) productId{
    NSSet *productIdentifiers = [NSSet setWithObject:productId];
    _productsRequest = [[SKProductsRequest alloc] initWithProductIdentifiers:productIdentifiers];
    _productsRequest.delegate = self;

    [_productsRequest start];
    
}

- (void)showPurchaseFailedAlert{
    [self buyFailed: IAP_ERROR];
}

#pragma mark -
#pragma mark SKProductsRequestDelegate methods
- (void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response{
    
    NSArray *products = response.products;
    //response.
#ifdef ECPURCHASE_TEST_MODE	
    
#else
    if ([products count]<1) {
        [self showPurchaseFailedAlert];
    }else
    {
        for (SKProduct *pro in products) {
            NSString *proid = [pro productIdentifier];
            /*
            cocos2d::CCString* str = new cocos2d::CCString([proid UTF8String]);
            tArray->addObject(str);
            */
            [self addPaymentToQueue:proid];
        }
    }
#endif   
//	[_productsRequest release];
}

- (void)request:(SKRequest *)request didFailWithError:(NSError *)error {
    
    [self buyFailed:IAP_ERROR];
}

-(void)addTransactionObserver{
	_storeObserver = [[ECStoreObserver alloc] init];
	[[SKPaymentQueue defaultQueue] addTransactionObserver:_storeObserver];
}

-(void)removeTransactionObserver{
	[[SKPaymentQueue defaultQueue] removeTransactionObserver:_storeObserver];
}



-(void)addPaymentToQueue:(NSString *)productIdentifier{
    SKPayment *payment = [SKPayment paymentWithProductIdentifier:productIdentifier];
	[[SKPaymentQueue defaultQueue] addPayment:payment];
}

-(void)addPaymentToQueue:(NSString *)productIdentifier authNumber:(NSString *)authNumber{
    [self.paymentDic setObject:authNumber forKey:productIdentifier];
    [self addPaymentToQueue:productIdentifier];
}

#pragma mark -
#pragma mark NSNotificationCenter Methods
-(void)completeTransaction:(NSNotification *)note{
	SKPaymentTransaction *trans = [[note userInfo] objectForKey:@"transaction"];
    NSString *productIdentifier = trans.payment.productIdentifier;

    [self buyFinish:productIdentifier];
    //[self verifyReceiptFromSelfServer:trans];

    
}

-(void)failedTransaction:(NSNotification *)note{
	SKPaymentTransaction *trans = [[note userInfo] objectForKey:@"transaction"];
    NSError* error = [trans error];
    NSString* localStr = [[trans error] localizedDescription];
    NSLog(@"%s", [[[trans error] localizedDescription] UTF8String]);
    
    [self buyFailed:localStr];
}

-(void)restoreTransaction:(NSNotification *)note{
    
	SKPaymentTransaction *trans = [[note userInfo] objectForKey:@"transaction"];

    NSMutableArray *productIDsToRestore = [NSMutableArray array];
#if 0
    StoreDataProductIdMap  productMap = StoreDataManager::getInstance()->getItemProductIDMap_PSW();
    
    StoreDataProductIdMap::const_iterator it = productMap.begin();//m_proId_GC.find(productIdentifier);

    while (it != productMap.end())
	{
        
//        printf("first %s", it->first.c_str());
//        printf("second %d", it->second);
		[productIDsToRestore addObject:[NSString stringWithUTF8String:it->first.c_str()]];
		it ++;
	}
#endif
    SKPaymentTransaction *transaction = trans;
    if(trans && [trans payment]){
        NSString  *_productIdentifier = [[trans payment] productIdentifier];
        if (_productIdentifier) {
            if ([productIDsToRestore containsObject:_productIdentifier]) {
                // Re-download the Apple-hosted content, then finish the transaction
                // and remove the product identifier from the array of product IDs.
                [self buyFinish:_productIdentifier];
                [productIDsToRestore removeObject:trans.payment.productIdentifier];
               
            }
            else {
                [[SKPaymentQueue defaultQueue] finishTransaction:transaction];
            }
        }
    }
}

-(void)restoreComplete:(NSNotification *)note{
#if 0
    if (Game::sharedGame()->getGameState() == eStateMainScene)
    {
        //若是处于商城界面，则购买成功后及时刷新，反之等进入商城后再刷新
        PopupUILayer* curpop = nullptr;
        if (PopupUILayerManager::getInstance()->isOpenPopup(ePopupStore, curpop))
        {
            StoreUILayer* store = dynamic_cast<StoreUILayer*>(curpop);
            if (store)
            {
                store->setRestoreDisable();
                //ActivityIndicatorCpp::sharedyIndicator()->hideActivityIndicator();
                
                //                [[SKPaymentQueue defaultQueue] restoreCompletedTransactions];
            }
        }
    }
#endif
}

-(void)restoreError:(NSNotification *)note{
    //ActivityIndicatorCpp::sharedyIndicator()->hideActivityIndicator();
}
-(void)registerNotifications{
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(completeTransaction:) name:@"completeTransaction" object:nil];
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(failedTransaction:) name:@"failedTransaction" object:nil];
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(restoreTransaction:) name:@"restoreTransaction" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(restoreComplete:) name:@"paymentQueueRestoreCompletedTransactionsFinished" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(restoreError:) name:@"restoreCompletedTransactionsFailedWithError" object:nil];
}

#pragma mark -
#pragma mark verify receipt From punchbox server


//-(void)verifyReceiptFromSelfServer:(SKPaymentTransaction *)transaction{
//    
//    _networkQueue = [ASINetworkQueue queue];
//	[_networkQueue retain];
    

//    
//    NSString *tmpStr = [NSString stringWithFormat:@"%ld", (long)[[NSDate date] timeIntervalSince1970]];
//    //NSString *appVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
//    
//    NSString *receipt = [GTMBase64 stringByEncodingData:transaction.transactionReceipt];
//
//	NSURL *verifyURL = [NSURL URLWithString:_verify_url];
//    NSLog(@"verifyURL %@", verifyURL);
//	ECPurchaseHTTPRequest *request = [ECPurchaseHTTPRequest requestWithURL:verifyURL];
//    [request setValidatesSecureCertificate:NO];//设置验证证书
//    
//    NSDictionary *dataDictionary= [[NSDictionary alloc] initWithObjectsAndKeys:
//                                   _channel, @"channel",
//                                   @"iap", @"pay_type",
//                                   [NSString stringWithFormat:@"%d",_accountId], @"account_id",
//                                   [NSString stringWithFormat:@"%d",_goodsId], @"goods_id",
//                                   _token, @"token",
//                                   APP_ID, @"app_id",
//                                   _version, @"version",
//                                   receipt, @"receipt",
//                                   transaction.payment.productIdentifier, @"product_id",
//                                   nil];
//
//    if (![NSJSONSerialization isValidJSONObject:dataDictionary])
//    {
//        [self buyFailed:IAP_ARGS_ERROR];
//    }
//    NSError *error;
//    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dataDictionary options:NSJSONWritingPrettyPrinted error: &error];
//    NSMutableData *tempJsonData = [NSMutableData dataWithData:jsonData];
//    NSLog(@"Register JSON:%@",[[NSString alloc] initWithData:tempJsonData encoding:NSUTF8StringEncoding]);
//        
//    [request addRequestHeader:@"Content-Type" value:@"application/x-www-form-urlencoded"];
//    [request setRequestMethod:@"POST"];
//    [request setPostBody:tempJsonData];
//
//    [request setProductIdentifier:transaction.payment.productIdentifier];
//    [request setDelegate:self];
//	[request setDidFinishSelector:@selector(didVerifySuccessFromSelfServer:)];
//    [request setDidFailSelector:@selector(didVerifyFailedFromSelfServer:)];
//
//	[_networkQueue addOperation: request];
//	[_networkQueue go];

//}
//
//-(void)didVerifySuccessFromSelfServer:(ECPurchaseHTTPRequest *)request
//{
//#ifdef DEBUG
//    NSLog(@"didVerifySuccessFromSelfServer");
//#endif
//    NSString *response = [request responseString];
//    
//    
//    SBJsonParser *jsonParser = [[SBJsonParser alloc] init];
//    
//    NSMutableDictionary *dict = [jsonParser objectWithString:response];
//    
//    NSString *error = [dict objectForKey:@"err"];
//    NSLog(@"error= %@", error);
//    
//    NSString *productIdentifier = [request productIdentifier];
//    NSLog(@"productIdentifier= %@", productIdentifier);
//    if(error != NULL && [error length] == 0 && productIdentifier != NULL)
//    {
//        NSError *error;
//        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dict options:NSJSONWritingPrettyPrinted error: &error];
//        NSMutableData *tempJsonData = [NSMutableData dataWithData:jsonData];
//        NSString* result =  [[NSString alloc] initWithData:tempJsonData encoding:NSUTF8StringEncoding];
//        NSLog(@"Register JSON:%@",result);
//        
//        [self buyFinish:productIdentifier];
//        
//    }else{
//        [self buyFailed:IAP_SERVER_VERIFY_ERROR];
//    }
//    
//    [jsonParser release];
//}
//
//-(void)didVerifyFailedFromSelfServer:(ECPurchaseHTTPRequest *)request
//{
//#ifdef DEBUG
//    NSLog(@"didVerifyFailedFromSelfServer");
//#endif
//    [self buyFailed:IAP_SERVER_VERIFY_CONNECT_ERROR];
//}
 
#pragma mark -restoreProduct
-(void)restoreProduct{
    [[SKPaymentQueue defaultQueue] restoreCompletedTransactions];
}

- (void)showAlertView:(NSString *)message cancelButton:(NSString *)cancelTitle otherButton:(NSString *) confirmTitle{
    
 
    UIAlertView*alertView = [[UIAlertView alloc] initWithTitle:nil
                                                       message:message
                                                      delegate:self
                                             cancelButtonTitle:cancelTitle
                                             otherButtonTitles:confirmTitle, nil] ;
    [alertView show] ;
    [alertView release] ;

}
- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    switch (buttonIndex) {
        case 1:
        {
            [[SKPaymentQueue defaultQueue] restoreCompletedTransactions];
            
        }
            break;
        default:
            break;
    }
}

//
//-(void)didFinishVerify:(ECPurchaseHTTPRequest *)request
//{
//    [request responseStatusCode];
//	NSString *response = [request responseString];
//	SBJsonParser *parser = [SBJsonParser new];
//	NSDictionary* jsonData = [parser objectWithString: response];
//	[parser release];
////
//	NSString *status = [jsonData objectForKey: @"status"];
//    NSDictionary *receipt = [jsonData objectForKey: @"receipt"];
////    NSString *productIdentifier = [receipt objectForKey: @"product_id"];
////    NSString *exception = [jsonData objectForKey: @"exception"];
//    NSString *productIdentifier = [request productIdentifier];
//	if ([status intValue] == 0 || [status intValue] == 21007 ) {
//        if (productIdentifier) {
//            [self buyFinish:productIdentifier];
//        }
//        else{
//            [self buyFailed:IAP_ERROR] ;
//        }
//     
//	}
//	else {
//		[self buyFailed:IAP_ERROR];
//	}
//}
//
//-(void)failedVerify:(ECPurchaseHTTPRequest *)request
//{
//
//    NSString *productIdentifier = [request productIdentifier];
//    if (productIdentifier) {
//        [self buyFinish:productIdentifier];
//    }
//    else{
//        [self buyFailed:IAP_ERROR];
//    }
//}


#pragma mark -
#pragma mark get Auth Number From server
//
//-(void)getAuthNumberSucess:(ECPurchaseHTTPRequest *)request{
//#ifdef DEBUG
//    NSLog(@"getAuthNumberSucess");
//#endif
//    NSString *response = [request responseString];
//	SBJsonParser *parser = [SBJsonParser new];
//	NSDictionary* jsonData = [parser objectWithString: response];
//	[parser release];
//    if (jsonData == nil || ![jsonData isKindOfClass:[NSDictionary class]]) {
//        [self showPurchaseFailedAlert];
//        return;
//    }
//    
//	NSString *status = [jsonData objectForKey: @"status"];
//    if(status == nil || ![status isKindOfClass:[NSString class]] || ![@"true" isEqualToString:status]){
//        [self showPurchaseFailedAlert];
//        return;
//    }
//    
//    NSString *authNumber = [jsonData objectForKey: @"authNumber"];
//    
//    if(authNumber != nil && [authNumber isKindOfClass:[NSString class]]){
//        [self addPaymentToQueue:request.productIdentifier authNumber:authNumber];
//    }else{
//        [self showPurchaseFailedAlert];
//    }
//}
//
//
//-(void)getAuthNumberFailed:(ECPurchaseHTTPRequest *)request{
//#ifdef DEBUG
//    NSLog(@"getAuthNumberFailed");
//#endif
//    [self showPurchaseFailedAlert];
//}


#pragma mark -
#pragma mark Get Property From ECStoreObserver
-(NSMutableArray *)getCompleteTrans{
	return _storeObserver.completeTrans;
}

-(NSMutableArray *)getRestoreTrans{
	return _storeObserver.restoreTrans;
}

-(NSMutableArray *)getFailedTrans{
	return _storeObserver.failedTrans;
}


-(void)buyFinish:(NSString*)productIdentifier
{
    char tmp[255]= {0};
    sprintf(tmp, "cc.vv.anysdkMgr.onIAPResp(true)");
    ScriptingCore::getInstance()->evalString(tmp);
    
}
-(void)buyFailed:(NSString*)errorMsgType
{
    char tmp[255]= {0};
    sprintf(tmp, "cc.vv.anysdkMgr.onIAPResp(false)");
    ScriptingCore::getInstance()->evalString(tmp);
}

-(void)dealloc
{
//	RELEASE_SAFELY(_networkQueue);
	RELEASE_SAFELY(_storeObserver);
//    RELEASE_SAFELY(_token);
//    RELEASE_SAFELY(_channel);
//    RELEASE_SAFELY(_verify_url)
	[super dealloc];
}

@end
