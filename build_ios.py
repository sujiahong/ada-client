#!/usr/bin/python
# -*- coding:utf-8 -*-

from optparse import OptionParser
import build_common as build
import os
import biplist

#IDENTITY = "texas-adhoc"

# def modify_launch_screen_file(channel):
#     screen_file_path = os.path.join("build/launch_screen", channel)
#     if not os.path.isdir(screen_file_path):
#         screen_file_path = os.path.join("build/launch_screen", "appstore")
#     for item  in os.listdir(screen_file_path):
#         if item.endswith(".png"):
#             item_path = os.path.join(screen_file_path, item)
#             build.shell_call("cp -f %s frameworks/runtime-src/proj.ios_mac/ios"%item_path)


def move_ipa(package_type, env, channel, target,version_name, version_code):
    command_name = "mv publish/ios/Products/%s.ipa  publish/ios/%s-env[%s]-%s-%s-v%s-%s-%s.ipa"%(
        target, target, env, channel, package_type, version_name, version_code, build.get_time_str())
    build.shell_call(command_name)


# def modify_channel_name(channel):
#     AppDelegate = "frameworks/runtime-src/Classes/AppDelegate.cpp"
#     content = open(AppDelegate, "rb").read()
#     new_content = build.reg_replace(content, '#define DATAEYE_CHANNEL_ID ".*"', '#define DATAEYE_CHANNEL_ID "%s"'%channel)
#     open(AppDelegate, "w").write(new_content)

# def get_version_name_and_code(target):
#     info_plist = "frameworks/runtime-src/proj.ios_mac/%s-Info.plist"%target
#     plist = biplist.readPlist(info_plist)
#     return (plist['CFBundleVersion'], plist['CFBundleShortVersionString'])


def build_ios(opts):
    package_type = opts.package_type
    channel = opts.channel
    version = opts.version
    target = opts.target
    env = opts.env
    #download_address = opts.download_address
    build.modifiy_Config({ "env":env, "version":version})
    build.build_script('ios')
    build.gen_version_info({ "env":env, "version":version})

    # build.modifiy_SwitchConfig({"mode": "release"})
    # modify_launch_screen_file(channel)

    # build.modifiy_project_manifest({"channel":channel, "env":opts.env,"version":version})
    # build.shell_call("rm -rf publish/ios/Products/%s.*"%target)

    # modify_channel_name(channel)

    # build_cmd = '%s compile -p ios -m release -t %s  --sign-identity "%s" --lua-encrypt --lua-encrypt-key %s --lua-encrypt-sign %s --compile-script 1'\
    #             %(build.COCOS_BIN, target,"texas-%s"%(package_type), build.LUA_ENCRYPT_KEY, build.LUA_ENCRYPT_SIGN)
    # build.shell_call(build_cmd)
    # (version_name, version_code) = get_version_name_and_code(target)
    # move_ipa(package_type, env, channel,target, version_name, version_code)


def test():
    get_version_name_and_code("vr-texas")

if __name__ == "__main__":

    usage = "usage: %prog all"


    #parse the params
    parser = OptionParser(usage=usage)

    parser.add_option("-e", "--env",
                    dest="env",
                    default="test",
                    help='[test|release]')

    parser.add_option("-p", "--package_type",
                    dest="package_type",
                    default="dist",
                    help='[dist|adhoc]')

    parser.add_option("-n", "--name",
                    dest="name",
                    default="鲨鱼牌手",
                    help='set game name ')

    parser.add_option("-c", "--channel",
                    dest="channel",
                    default="appstore",
                    help='channel ')

    parser.add_option("-t", "--target",
                dest="target",
                default="vr-texas",
                help='set target name')

    parser.add_option("-v", "--version",
                dest="version",
                default="1.0.0",
                help='version name')
    parser.add_option("-d", "--download_address",
                dest="download_address",
                default="1151893885",
                help='download address ')

    (opts, args) = parser.parse_args()
    build_ios(opts)


