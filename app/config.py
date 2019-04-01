# -*- coding: utf-8 -*-
#
# Copyright 2019 Naran Inc. All rights reserved.
#  __    _ _______ ______   _______ __    _
# |  |  | |   _   |    _ | |   _   |  |  | |
# |   |_| |  |_|  |   | || |  |_|  |   |_| |
# |       |       |   |_||_|       |       |
# |  _    |       |    __  |       |  _    |
# | | |   |   _   |   |  | |   _   | | |   |
# |_|  |__|__| |__|___|  |_|__| |__|_|  |__|


import os.path


class Config(object):
  SECRET_KEY = 'key'
  WTF_CSRF_SECRET_KEY = 'key wtf'
  TOKEN = 'token'
  SQLALCHEMY_TRACK_MODIFICATIONS = False
  LOG_BACKUP_COUNT = 10
  LOG_MAX_BYTES = 10485760
  SEND_FILE_MAX_AGE_DEFAULT = 0


class DebugConfig(Config):
  DEBUG = True
  SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
  SQLALCHEMY_BINDS = {
  }
  LOG_PATH = '/tmp/mproject.log'


class ProductionConfig(Config):
  DEBUG = False
  SQLALCHEMY_DATABASE_URI = ''
  SQLALCHEMY_BINDS = {
  }
  LOG_PATH = os.path.join(os.path.expanduser('~'), 'log', 'mproject.log')

