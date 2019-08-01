#!/bin/sh

# HOT TO USE
# ./tools.sh build

cmd="$1"

if [ $cmd = build ]
then
    npm run build
    node build-hook.js

    cp dist/index.html ../../../console/src/base/templates/pa/
    # cp dist/index.html ../../../console/src/base/templates/location/

    # rm -rf ../../../console/src/dashboard/static/css
    # rm -rf ../../../console/src/dashboard/static/img
    # rm -rf ../../../console/src/dashboard/static/imgs
    # rm -rf ../../../console/src/dashboard/static/js

    cp -r dist/css ../../../console/src/pa/static/
    cp -r dist/js ../../../console/src/pa/static/
    cp -r dist/img ../../../console/src/pa/static/
    cp -r dist/static/* ../../../console/src/pa/static/
fi

if [ $cmd = serve ]
then
    npm run serve
fi
