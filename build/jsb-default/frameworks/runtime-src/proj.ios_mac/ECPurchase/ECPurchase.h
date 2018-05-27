//
//  ECPurchase.h
//  myPurchase
//
//  Created by ris on 10-4-23.
//  Copyright 2010 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <StoreKit/StoreKit.h>
#import "ECStoreObserver.h"
#include <string>
#define ECLOG NSLogb

#ifndef RELEASE_SAFELY(__POINTER)
#define RELEASE_SAFELY(__POINTER) { [__POINTER release]; __POINTER = nil; }
#endif




#ifndef SINGLETON_INTERFACE(CLASSNAME)
#define SINGLETON_INTERFACE(CLASSNAME)  \
+ (CLASSNAME*)shared;
#endif

#ifndef SINGLETON_IMPLEMENTATION(CLASSNAME)			
#define SINGLETON_IMPLEMENTATION(CLASSNAME)         \
\
static CLASSNAME* g_shared##CLASSNAME = nil;        \
\
+ (CLASSNAME*)shared                                \
{                                                   \
if (g_shared##CLASSNAME != nil) {                   \
return g_shared##CLASSNAME;                         \
}                                                   \
\
@synchronized(self) {                               \
if (g_shared##CLASSNAME == nil) {                    \
g_shared##CLASSNAME = [[self alloc]  init];      \
[g_shared##CLASSNAME postInit];	\
\
}                                                   \
}                                                   \
\
return g_shared##CLASSNAME;                         \
}                                                   \
\
+ (id)allocWithZone:(NSZone*)zone                   \
{                                                   \
@synchronized(self) {                               \
if (g_shared##CLASSNAME == nil) {                   \
g_shared##CLASSNAME = [super allocWithZone:zone];	\
return g_shared##CLASSNAME;                         \
}                                                   \
}                                                   \
NSAssert(NO, @ "[" #CLASSNAME                       \
" alloc] explicitly called on singleton class.");   \
return nil;                                         \
}                                                   \
\
- (id)copyWithZone:(NSZone*)zone                    \
{                                                   \
return self;                                        \
}                                                   \
\
- (id)retain                                        \
{                                                   \
return self;                                        \
}                                                   \
\
- (unsigned)retainCount                             \
{                                                   \
return UINT_MAX;                                    \
}                                                   \
\
- (void)release                                     \
{                                                   \
}                                                   \
\
- (id)autorelease                                   \
{                                                   \
return self;                                        \
}
#endif

/**************************************
 ECPurchaseTransactionDelegate
 **************************************/
@protocol ECPurchaseTransactionDelegate
@required
-(void)didFailedTransaction:(const std::string&)proIdentifier;
-(void)didRestoreTransaction:(const std::string&)proIdentifier;
@optional
//if you do not need to verify receipt,plz implement this function
-(void)didCompleteTransaction:(const std::string&)proIdentifier;
//if you want to verify receipt via iphone or server,plz implement the follow functions
-(void)didCompleteTransactionAndVerifySucceed:(const std::string&)proIdentifier;
-(void)didCompleteTransactionAndVerifyFailed:(const std::string&)proIdentifier withError:(const std::string&)error;
@end

/***********************************
 ECPurchaseProductDelegate
 ***********************************/
namespace cocos2d {
//    class CCArray;
}
@protocol ECPurchaseProductDelegate
@required
//-(void)didReceivedProducts:(const cocos2d::CCArray* )products;
@end

typedef enum  {
	ECTransactionStatusComplete,
	ECTransactionStatusRestore,
	ECTransactionStatusFailed
}ECTransactionStatus;

typedef enum {
	ECVerifyRecepitModeiPhone,
	ECVerifyRecepitModeServer,
	ECVerifyRecepitModeNone
}ECVerifyRecepitMode;

/******************************
 SKProduct extend
 *****************************/
@interface SKProduct (LocalizedPrice)

@property (nonatomic, readonly) NSString *localizedPrice;

@end

/***********************************
 ECPurchaseHTTPRequest
 ***********************************/
//@interface ECPurchaseHTTPRequest:ASIFormDataRequest{
//	NSString *_productIdentifier;
//    NSString *_tmpStr;
//}
//@property(nonatomic,retain) NSString *productIdentifier;
//@property(nonatomic,retain) NSString *tmpStr;
//@end

/******************************
 ECPurchase
 ******************************/
@interface ECPurchase : NSObject <SKProductsRequestDelegate,UIAlertViewDelegate>{
    SKProductsRequest		*_productsRequest;
	id<ECPurchaseProductDelegate>	_productDelegate;
	id<ECPurchaseTransactionDelegate>	_transactionDelegate;
	ECStoreObserver			*_storeObserver;
    //IECPurchaseResult       *_purchaseResultDelegate;
	//ASINetworkQueue			*_networkQueue;
	ECVerifyRecepitMode		_verifyRecepitMode;
    NSMutableDictionary		*_paymentDic;
    BOOL                    isRestoring;
    int                     _luaFunc;
    int               _goodsId;
    int               _accountId;
}
SINGLETON_INTERFACE(ECPurchase);
@property(assign) id<ECPurchaseProductDelegate> productDelegate;
@property(assign) id<ECPurchaseTransactionDelegate> transactionDelegate;
@property(nonatomic, retain) NSMutableDictionary *paymentDic;


-(void)postInit;

-(void)requestProductData:(NSString*) argsDic;

-(void)addTransactionObserver;
-(void)removeTransactionObserver;
-(void)addPaymentToQueue:(NSString *)productIdentifier authNumber:(NSString *)authNumber;
-(void)registerNotifications;
-(void)verifyReceipt:(SKPaymentTransaction *)transaction;
-(void)restoreProduct;
-(void)showAlertView:(NSString *)message cancelButton:(NSString *)cancelTitle otherButton:(NSString *) confirmTitle;

-(void)verifyReceiptFromSelfServer:(SKPaymentTransaction *)transaction;


-(void)buyFinish:(NSString*)productIdentifier result:(NSString* )result;
-(void)buyFailed:(NSString*)errorMsgType;


-(NSMutableArray *)getCompleteTrans;
-(NSMutableArray *)getRestoreTrans;
-(NSMutableArray *)getFailedTrans;

/*
 NSNotificationCenter method*/
-(void)completeTransaction:(NSNotification *)note;
-(void)failedTransaction:(NSNotification *)note;
-(void)restoreTransaction:(NSNotification *)note;
@end


