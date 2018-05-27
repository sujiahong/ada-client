#!/usr/bin/python
# -*- coding:utf-8 -*-
import os
import shutil
import zipfile
from subprocess import call
import csv
import sys
import time
import re

from optparse import OptionParser


UPDATE_URLS = {
    'test':'http://test-hotupdate.niren.org/',
    'release':'http://hotupdate.niren.org/',
}

UPDATE_DIR = {
    'test':'mahjong-update-test',
    'release':'mahjong-update',
}


CocosCreator_BIN = "/Applications/CocosCreator.app/Contents/MacOS/CocosCreator"

def script_path():
    path = os.path.realpath(sys.path[0])
    if os.path.isfile(path):
        path = os.path.dirname(path)
    return os.path.abspath(path)



def shell_call(cmd):
    """Call the shell command"""
    print cmd
    call(cmd, shell = True)

def get_time_str():
    return time.strftime('%Y-%m-%d-%H-%M')

#channel_pattern = re.compile("<channel>.*</channel>")
#content = channel_pattern.sub("<channel>%s</channel>"%pay_id, content)
def reg_replace(content, pattern_str, replace_str):
    #import pdb;pdb.set_trace()
    pattern = re.compile(pattern_str)
    content = pattern.sub(replace_str, content)
    return content



def modifiy_Config(opts):
    Config_file = "assets/scripts/Config.js"
    env = opts["env"]
    version = opts['version']
    content = open(Config_file, "rb").read()
    new_content = reg_replace(content, 'cc.MJConfig.ENV = ".*";', 'cc.MJConfig.ENV = "%s";'%env)
    new_content = reg_replace(new_content, 'cc.MJConfig.Version = ".*";', 'cc.MJConfig.Version = "v%s";'%version)
    open(Config_file, "w").write(new_content)


def build_script(platform):
    build_command = '%s --path . --build "platform=%s;debug=false;template=default"'%(CocosCreator_BIN,platform)
    print "\n*********\n"
    print build_command
    print "\n*********\n"
    shell_call(build_command)

def gen_version_info(opts):
    env = opts['env']
    url = UPDATE_URLS[env]
    if url == None:
        return
    
    current_dir = script_path()
    update_item = UPDATE_DIR[env]
    mahjong_update_dir = os.path.normpath(os.path.join(current_dir, '../../', update_item))

    version = opts['version']
    shell_call('node version_generator.js -v %s -u %s -d %s'%(version,url, mahjong_update_dir))

    from_src_dir = os.path.join(current_dir, 'build/jsb-default/src')
    to_src_dir = os.path.join(mahjong_update_dir, 'src')
    copy_dir_to_dir(from_src_dir, to_src_dir)

    from_res_dir = os.path.join(current_dir, 'build/jsb-default/res')
    to_res_dir = os.path.join(mahjong_update_dir, 'res')
    copy_dir_to_dir(from_res_dir, to_res_dir)

    os.chdir(mahjong_update_dir)
    shell_call('git add * ; git commit -m "add" -a; git push origin master')

    os.chdir(current_dir)
    #copy_dir_to_dir('./build/res', '../../mahjong-update/res')

def delete_dir(dir):
	print "delete dir: ",dir
	try:
		shutil.rmtree(dir)
	except os.error, err:
		print err

def copy_dir_to_dir(from_path, to_path, create_new_path = True):
    print 'from_path %s, to_path %s create_new_path %s'%(from_path, to_path, create_new_path)
    if create_new_path and os.path.isdir(to_path):
        delete_dir(to_path)
    try:
        pass
      #os.makedirs(to_path)
    except:
        pass
    shutil.copytree(from_path, to_path)

def test():
    print  reg_replace("hello <channel>nihao</channel>", "<channel>.*</channel>", "<channel>fuck</channel>",)

if __name__ == "__main__":
    test()

