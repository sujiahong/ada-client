#!/usr/bin/python
# -*- coding:utf-8 -*-
import os
import shutil
import zipfile
from subprocess import call
import csv
import sys
from xml.dom import minidom

import build_common as build

from optparse import OptionParser


APK_NAME = "vr-texas"

APPLICATION_DEBUG = """
APP_STL := gnustl_static

APP_CPPFLAGS := -frtti -DCC_ENABLE_CHIPMUNK_INTEGRATION=1 -std=c++11 -fsigned-char
APP_LDFLAGS := -latomic


APP_CPPFLAGS += -DCOCOS2D_DEBUG=1
APP_OPTIM := debug

#APP_CPPFLAGS += -DNDEBUG
#APP_OPTIM := release
"""

APPLICATION_RELEASE = """
APP_STL := gnustl_static

APP_CPPFLAGS := -frtti -DCC_ENABLE_CHIPMUNK_INTEGRATION=1 -std=c++11 -fsigned-char
APP_LDFLAGS := -latomic


#APP_CPPFLAGS += -DCOCOS2D_DEBUG=1
#APP_OPTIM := debug

APP_CPPFLAGS += -DNDEBUG
APP_OPTIM := release
"""


# 获取debuggable="true"的值
def get_debuggable(channel):
    AndroidManifest = "build/jsb-default/frameworks/runtime-src/proj.android.%s/AndroidManifest.xml"%channel
    content = open(AndroidManifest, "rb").read()
    debug_str = 'android:debuggable="'
    pos = content.find(debug_str)
    if pos == -1:
        return "false"
    else:
        pos2 = content.find('"', pos+len(debug_str))
        return content[pos+len(debug_str):pos2]


def move_apk(mode, channel, env, version_code, version_name,debuggable):
    command_name = "mv frameworks/runtime-src/proj.android.%s/bin/%s-%s.apk  publish/android/%s-%s-env[%s]-v%s-%s-%s-%s-debuggable[%s].apk"%(
        channel, APK_NAME, mode, APK_NAME,channel, env, version_name, version_code, mode, build.get_time_str(), debuggable)
    build.shell_call(command_name)

def modify_application_mk(mode,channel):
    application_mk_file = "frameworks/runtime-src/proj.android.%s/jni/Application.mk"%channel
    content = open(application_mk_file, "r").read()
    if mode == "release":
        if content.find("#APP_OPTIM := release") != -1:
            open(application_mk_file, "w").write(APPLICATION_RELEASE)
    else:
        if content.find("#APP_OPTIM := debug") != -1:
            open(application_mk_file, "w").write(APPLICATION_DEBUG)

def modify_android_Config(env,channel):
    ConfigFile =  "frameworks/runtime-src/proj.android.%s/src/cn/zhangyuhudong/texas/Config.java"%channel
    content = open(ConfigFile, "rb").read()
    stats_id = build.get_stats_id(env)
    new_content = build.reg_replace(content, 'String TALKINGDATA_APP_ID = ".*";',
                                    'String TALKINGDATA_APP_ID = "%s";'%stats_id)

    new_content = build.reg_replace(new_content, 'String CHNANNEL_ID = ".*";',
                                    'String CHNANNEL_ID = "%s";'%channel)
    open(ConfigFile, "w").write(new_content)

def modify_channel_name(channel):
    AndroidManifest = "frameworks/runtime-src/proj.android.%s/AndroidManifest.xml"%channel
    content = open(AndroidManifest, "rb").read()
    new_content = build.reg_replace(content, '<meta-data android:value=".*" android:name="DC_CHANNEL"></meta-data>',
                                    '<meta-data android:value="%s" android:name="DC_CHANNEL"></meta-data>'%channel)
    open(AndroidManifest, "w").write(new_content)


def get_version_name_and_code(channel):
    AndroidManifest = "frameworks/runtime-src/proj.android.%s/AndroidManifest.xml"%channel
    doc = minidom.parse(AndroidManifest)
    root = doc.documentElement
    return ( root.getAttribute("android:versionName"), root.getAttribute("android:versionCode"))


def build_android(opts):
    mode = opts.mode
    channel = opts.channel
    version = opts.version
    env = opts.env
    build.modifiy_Config({ "env":env, "version":version})
    build.build_script('android')
    build.gen_version_info({ "env":env, "version":version})
    #build.modifiy_SwitchConfig({"mode":mode})
    #build.modifiy_project_manifest({"channel":channel, "env":env, "version":version})
    #modify_android_Config(env, channel)
    #modify_channel_name(channel)

    #modify_application_mk(mode, channel)




    # if mode == "release":
    #     build_cmd = "%s compile -p android -c %s -m %s --compile-script 1 --lua-encrypt --lua-encrypt-key %s --lua-encrypt-sign %s"\
    #                  %(build.COCOS_BIN, channel, mode,build.LUA_ENCRYPT_KEY, build.LUA_ENCRYPT_SIGN)
    # else:
    #     build_cmd = '%s compile -p android  -c %s -m %s --compile-script 0'%(build.COCOS_BIN, channel, mode)
    # build.shell_call(build_cmd)
    # debuggable =  get_debuggable(channel)
    # (version_name,version_code) = get_version_name_and_code(channel)
    # move_apk(mode, channel, env, version_code, version_name, debuggable)

def test():
    print get_debuggable()

if __name__ == "__main__":
    #test()

    usage = "usage: %prog all"

    #parse the params
    parser = OptionParser(usage=usage)

    parser.add_option("-e", "--env",
                    dest="env",
                    default="test",
                    help='[test|release|local]')

    parser.add_option("-m", "--mode",
                    dest="mode",
                    default="release",
                    help='[release|debug]')

    parser.add_option("-c", "--channel",
                    dest="channel",
                    default="android",
                    help='channel ')

    parser.add_option("-n", "--name",
                    dest="name",
                    default="鲨鱼牌手",
                    help='set game name ')

    parser.add_option("-v", "--version",
                dest="version",
                default="1.0.0",
                help='version name')
    parser.add_option("-d", "--download_address",
                dest="download_address",
                default="",
                help='download address ')

    (opts, args) = parser.parse_args()

    # if len(args) == 0:
    #     parser.print_help()
    # else:
    build_android(opts)

