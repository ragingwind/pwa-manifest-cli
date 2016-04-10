# pwa-manifest-cli [![Build Status](https://travis-ci.org/ragingwind/pwa-manifest-cli.svg?branch=master)](https://travis-ci.org/ragingwind/pwa-manifest-cli)

> Cli for Creating a Web Manifest for Progressive Web App with interactive or command mode

![](http://g.recordit.co/HIWl6UBtHM.gif)

## Install

```
$ npm install --save pwa-manifest-cli
```


## Usage

```shell
Usage
  $ pwa-manifest dest <options>

Options
  --name Name of app [Default: package name or basedir name]
  --short_name Short name of app [Default: package name or basedir name]
  --start_url Start URL [Default: /index.html?homescreen=1]
  --display Display mode [Default: standalone]
  --background_color Background color in CSS color [Default: #FFFFFF]
  --theme_color Theme color in CSS color[Default: #3F51B5]
  --orientation Orientation [Default: natural]
  --direction Base direction [Default: standalone]
  --interactive Creating a manifest in interactive mode [Default: false]

Examples
  $ pwa-manifest --name='My Progressive Web App' --short='My PWA' --display=fullscreen --background_color=#fefefe --theme_color=#f44336 --orientation=any --direction=portrait
  $ pwa-manifest --interactive
```

## License

MIT © [ragingwind](http://ragingwind.me)
