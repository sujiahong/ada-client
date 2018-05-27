//
//  ECStoreObserver.m
//  myPurchase
//
//  Created by ris on 10-4-25.
//  Copyright 2010 __MyCompanyName__. All rights reserved.
//

#import "ECStoreObserver.h" 


@implementation ECStoreObserver
@synthesize completeTrans = _completeTrans;
@synthesize failedTrans = _failedTrans;
@synthesize restoreTrans = _restoreTrans;


-(id)init
{
	if (self = [super init]) {
		_completeTrans = [[NSMutableArray alloc] init];
		_failedTrans = [[NSMutableArray alloc] init];
		_restoreTrans = [[NSMutableArray alloc] init];
	}
	return self;
}

#pragma mark -
#pragma mark SKPaymentTransactionObserver
- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transactions
{
    // todo: 可能这个地方有支付消息过来
//    if(Game::sharedGame()->getGameState() < eStateStartScene){
//        NSLog(@"discard pay info");
//        return ;
//    }
	for (SKPaymentTransaction *transaction in transactions)
    {
        switch (transaction.transactionState)
        {
            case SKPaymentTransactionStatePurchased:
                [self completeTransaction:transaction];
                break;
            case SKPaymentTransactionStateFailed:
                [self failedTransaction:transaction];
                break;
            case SKPaymentTransactionStateRestored:
                [self restoreTransaction:transaction];
                break;
            case SKPaymentTransactionStatePurchasing:
                NSLog(@"商品添加进列表"); 
                break;
            default:
                break;
        }
    }
}

- (void) completeTransaction: (SKPaymentTransaction *)transaction {
	// Your application should implement these two methods.
    [self recordTransaction: transaction withStatus:0];
    [self provideContent: transaction.payment.productIdentifier];
	//post a notification to ECPurchase
	NSDictionary *userInfoDictionary =[NSDictionary dictionaryWithObjectsAndKeys:
									   transaction,@"transaction",nil];
	[[NSNotificationCenter defaultCenter] postNotificationName:@"completeTransaction" object:self userInfo:userInfoDictionary];
	// Remove the transaction from the payment queue.
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
}

- (void) restoreTransaction: (SKPaymentTransaction *)transaction {

    [self recordTransaction: transaction withStatus:1];
    [self provideContent: transaction.originalTransaction.payment.productIdentifier];
	NSDictionary *userInfoDictionary =[NSDictionary dictionaryWithObjectsAndKeys:
									   transaction,@"transaction",nil];
	[[NSNotificationCenter defaultCenter] postNotificationName:@"restoreTransaction" object:self userInfo:userInfoDictionary];
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
}

- (void) failedTransaction: (SKPaymentTransaction *)transaction {

    [self recordTransaction:transaction withStatus:2];
    NSDictionary *userInfoDictionary =[NSDictionary dictionaryWithObjectsAndKeys:
                                       transaction,@"transaction",nil];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"failedTransaction" object:self userInfo:userInfoDictionary];
//    if (transaction.error.code != SKErrorPaymentCancelled)
//    {
//        const char* iapTitle = "IAP"; //DataTableManager::getInstance()->getString(STR_IAP_ERROR);
//        const char* confirm =  "确定"; //DataTableManager::getInstance()->getString(STR_CONFIRM);
//        
//        UIAlertView *alert = [[UIAlertView alloc] initWithTitle: [NSString stringWithUTF8String:iapTitle] message:transaction.error.localizedFailureReason
//                                                       delegate:self cancelButtonTitle:[NSString stringWithUTF8String:confirm] otherButtonTitles:nil];
//        
//        //UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"IAP Failed" message:transaction.error.localizedFailureReason
//        //											   delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil];
//        [alert show];
//        [alert release];
//        // Optionally, display an error here.
//    }
    [[SKPaymentQueue defaultQueue] finishTransaction: transaction];
}

- (void)recordTransaction:(SKPaymentTransaction *)transaction withStatus:(int)status
{
	if (status == 0) 
		[_completeTrans addObject:transaction];
	else if (status == 1)
		[_restoreTrans addObject:transaction];
	else if (status == 2)
		[_failedTrans addObject:transaction];

}

- (void)provideContent:(NSString *)productIdentifier
{

}

- (void)paymentQueueRestoreCompletedTransactionsFinished:(SKPaymentQueue *)queue{
    NSDictionary *userInfoDictionary =[NSDictionary dictionaryWithObjectsAndKeys:
									   queue,@"SKPaymentQueueError",nil];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"paymentQueueRestoreCompletedTransactionsFinished" object:self userInfo:userInfoDictionary];
}

- (void)paymentQueue:(SKPaymentQueue *)queue restoreCompletedTransactionsFailedWithError:(NSError *)error{
    NSDictionary *userInfoDictionary =[NSDictionary dictionaryWithObjectsAndKeys:
									   error,@"SKPaymentQueue",nil];
      [[NSNotificationCenter defaultCenter] postNotificationName:@"restoreCompletedTransactionsFailedWithError" object:self userInfo:userInfoDictionary];
}
-(void)dealloc
{
	RELEASE_SAFELY(_completeTrans);
	RELEASE_SAFELY(_failedTrans);
	RELEASE_SAFELY(_restoreTrans);
	[super dealloc];
}

@end

