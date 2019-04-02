# M-Project

## Usage

* Frontend : Vuejs + jinja
* Backend : Quart(Flask extends)

## Setup

``` shell
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

## Trouble Shooting

* Quart 0.8.1
  * (await request.files)['file']
  * ref : https://gitlab.com/pgjones/quart/commit/483ba634c5c17b3e63b8a8096c590828866589d
