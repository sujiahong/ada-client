#include "SDKManager.h"

using namespace anysdk::framework;

SDKManager* SDKManager::_pInstance = NULL;

SDKManager::SDKManager()
{
}

SDKManager::~SDKManager()
{
	_pAgent->unloadAllPlugins();
}

SDKManager* SDKManager::getInstance()
{
    if (_pInstance == NULL) {
        _pInstance = new SDKManager();
    }
    return _pInstance;
}

void SDKManager::purge()
{
    if (_pInstance)
    {
        delete _pInstance;
        _pInstance = NULL;
    }
}

void SDKManager::loadAllPlugins()
{
    /**
     * appKey, appSecret and privateKey are the only three parameters generated 
     * after the packing tool client finishes creating the game.
     * The oauthLoginServer parameter is the API address provided by the game service
     * to login verification
     */
    std::string oauthLoginServer = "";
    std::string appKey = "48CBDBF9-B043-780E-288D-3F5DA799BA1D";
    std::string appSecret = "1cbd0dccc965aa33f1312acd4e37260b";
    std::string privateKey = "834CC380F0594110E1B7448DD8D64EE9";
    
    AgentManager* pAgent = AgentManager::getInstance();
    pAgent->init(appKey,appSecret,privateKey,oauthLoginServer);
    
    //Initialize plug-ins, including SDKs.
    pAgent->loadAllPlugins();
}


