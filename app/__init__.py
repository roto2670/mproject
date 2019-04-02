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


import logging
import logging.handlers
from importlib import import_module

from quart import Quart, url_for
from quart_cors import cors

import app.config


def register_extensions(app):
  pass


def register_blueprints(app):
  for module_name in ['dashboard', 'workschedule']:
    module = import_module('app.apis.{}'.format(module_name))
    app.register_blueprint(module.bp)


def configure_database(app):
  @app.before_first_request
  def initialize_database():
    pass

  @app.teardown_request
  def shutdown_session(exception=None):
    pass


def configure_logs(app):
  level = logging.DEBUG
  log_path = app.config.get('LOG_PATH')
  max_bytes = int(app.config.get('LOG_MAX_BYTES'))
  backup_count = int(app.config.get('LOG_BACKUP_COUNT'))
  formatter = logging.Formatter('%(levelname)s\t[%(asctime)s]\t'
                                '%(lineno)d\t%(module)s\t'
                                '%(funcName)s\t%(message)s')
  logging.getLogger().setLevel(level)
  handler = logging.handlers.RotatingFileHandler(log_path,
                                                 maxBytes=max_bytes,
                                                 backupCount=backup_count)
  handler.setFormatter(formatter)
  logging.getLogger().addHandler(handler)


class MyFlask(Quart):
  jinja_options = Quart.jinja_options.copy()
  jinja_options.update(dict(
    block_start_string='{%',
    block_end_string='%}',
    variable_start_string='((',
    variable_end_string='))',
    comment_start_string='{#',
    comment_end_string='#}',
  ))


def create_app(flag):
  server_app = MyFlask(__name__, static_folder='static')
  config = app.config.CONFIG_DICT[flag]
  server_app.config.from_object(config)
  register_blueprints(server_app)
  #register_extensions(server_app)
  #configure_database(server_app)
  configure_logs(server_app)
  if flag == app.config.DEBUG:
    cors_wrapper_app = cors(server_app)
    return cors_wrapper_app
  else:
    return server_app
