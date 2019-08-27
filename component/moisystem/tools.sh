#!/bin/sh

# HOT TO USE
# ./tools.sh build

cmd="$1"

if [ $cmd = build ]
then
    npm run build
    node build-hook.js

    cp build_files/index.html ../../../console/src/base/templates/moi/

    cp -r build_files/css ../../../console/src/moi/static/
    cp -r build_files/js ../../../console/src/moi/static/
    cp -r build_files/img ../../../console/src/moi/static/
    cp -r build_files/static/* ../../../console/src/moi/static/
fi

if [ $cmd = serve ]
then
    npm run serve
fi
