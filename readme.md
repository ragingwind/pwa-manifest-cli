# pwa-manifest-cli [![Build Status](https://travis-ci.org/ragingwind/pwa-manifest-cli.svg?branch=master)](https://travis-ci.org/ragingwind/pwa-manifest-cli)

> Cli for Creating a Web Manifest for Progressive Web App with interactive or command mode

Using in interactive mode

![](http://g.recordit.co/kwR4Dh7rM3.gif)

or manually

```sh
 pwa-manifest --icons=./images/logo.png
```

## Install

```
$ npm install --save pwa-manifest-cli
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

# generate manifest.json and resized icons to `./app`.
$ pwa-manifest ./app --icons=./logo.png

# generate manifest.json to `./app` and icons to `./app/images/icons`
$ pwa-manifest ./app ./app/images/icons --icons=./logo.png

# generate manifest.json to './' with updated values of name, short_name, background_color, theme_color, orientation, and direction as well as resizes images
$ pwa-manifest --name='My Progressive Web App' --short='My PWA' --display=fullscreen --background_color=#fefefe --theme_color=#f44336 --orientation=any --direction=portrait --icons=./images/logo.png

# using interactive mode for generating manifest.json and resized images to current working path
$ pwa-manifest --interactive
```

## Options in details

### --icons

`icons` requires the path of source image. It will generated those of icons in multiple sizes under the actual size of the source image and the names of resized image presetting in manifest are not able to be changed by option yet.


## License

MIT © [ragingwind](http://ragingwind.me)
