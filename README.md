# M-Project

## Requirement

* upper Python3.7

## Usage

* Frontend : Vuejs + jinja
* Backend : Quart(Flask extends)

## Setup

``` shell
> pip install virtualenv
> virtualenv venv_mproject
> source venv_mproject/bin/activate
> git clone git@g.thenaran.com:/solutions/mproject.git
> cd mproject
> pip install -r requrements.txt
```

## Run

``` shell
> python run.py
```

## Access

* Go to the http://127.0.0.1:8000

## Trouble Shooting

* Quart 0.8.1
  * (await request.files)['file']
  * ref : https://gitlab.com/pgjones/quart/commit/483ba634c5c17b3e63b8a8096c590828866589d

## Reference

* quart : https://pgjones.gitlab.io/quart/index.html
* vuejs : https://vuejs.org/
* flask-vuejs : https://github.com/yymm/flask-vuejs

## Apply to Console

``` shell
> ./tools.sh build
```