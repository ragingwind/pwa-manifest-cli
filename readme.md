# pwa-manifest-cli [![Build Status](https://travis-ci.org/ragingwind/pwa-manifest-cli.svg?branch=master)](https://travis-ci.org/ragingwind/pwa-manifest-cli)

> Generating manifest, icons and favicon.ico for Progressive Web App by interactive or command mode

Using in interactive mode

![](http://g.recordit.co/kwR4Dh7rM3.gif)

, or manually

```sh
 pwa-manifest --icons=./images/logo.png
```

, or with free icons from [iconfinder.com](https://iconfinder.com/) with [if-got-cli](https://github.com/ragingwind/if-got-cli)

```sh
pwa-manifest ./ ./image/icons --icons=$(if-got icons search --query=love)
```

## Install

```
$ npm install -g pwa-manifest-cli
```

## Usage

```sh
$ pwa-manifest <manifest path> <icons path> <options>
```

Get more information via help

## Examples

```shell
# show help
$ pwa-manifest --help

# Icon from iconfinder
$ pwa-manifest ./ ./image/icons --icons=$(if-got icons search --query=love --count=1)

# generate manifest.json and resized icons to `./app`.
$ pwa-manifest ./app --icons=./logo.png

# generate manifest.json to `./app` and icons to `./app/images/icons`
$ pwa-manifest ./app ./app/images/icons --icons=./logo.png

# generate manifest.json to './' with updated values of name, short_name, background_color, theme_color, orientation, and direction as well as resizes images
$ pwa-manifest --name='My Progressive Web App' --short_name='My PWA' --display=fullscreen --background_color=#fefefe --theme_color=#f44336 --orientation=any --direction=portrait --icons=./images/logo.png

# using interactive mode for generating manifest.json and resized images to current working path
$ pwa-manifest --interactive
```

## Options in details

### --icons

`path` or `http address` can be used for icons of source image. It will generated those of icons in multiple sizes (144, 192 and 512) and named by size of image into manifest. There is no way to be able to be changed by option yet. favicon.icon will be created from icons files at same location of `manifest.json`


## License

MIT © [Jimmy Moon](http://ragingwind.me)
