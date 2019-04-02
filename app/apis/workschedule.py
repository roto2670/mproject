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

import os
import logging

from quart import Blueprint
from quart import render_template, request

import app.util


bp = Blueprint(
    'work_blueprint',
    __name__,
    url_prefix='/work'
)


@bp.route('/')
async def route_default():
  return await render_template('work.html')


@bp.route('/upload', methods=['POST'])
async def upload_work_schedule():
  """"Ref
  - https://gitlab.com/pgjones/quart/commit/483ba634c5c17b3e63b8a8096c590828866589df
  """
  content = (await request.files)['file']
  path = app.util.get_work_schedule_path()
  file_path = os.path.join(path, 'work.jpg')
  content.save(file_path)
  return "/static/work/work.jpg"


@bp.route('/schedule', methods=['GET'])
async def get_schedule():
  path = app.util.get_work_schedule_path()
  file_path = os.path.join(path, 'work.jpg')
  if os.path.exists(file_path):
    return "/static/work/work.jpg"
  else:
    return ""
