# Nota Solidária App
Ionic project

## How to install

### Required

- git https://git-scm.com/downloads
- ionic framework http://ionicframework.com/getting-started

### Installation

- Upload project `git clone https://github.com/CodeForCuritiba/nota_solidaria.git`
- Go to app directory `cd nota_solidaria/app`

You may want to install the project API contained in (Nota Solidaria Portal)[https://github.com/CodeForCuritiba/nota_solidaria_portal]


### Environment configuration

- copy `config/template.json` to `config/localdev.json`
- edit `config/localdev.json`
- run `gulp replace` => this will update files with you configuration

## How to test

### Test with Ionic View app

- Create an ionic.io account
- Install Ionic View app on your phone
- Get an invitation using `ionic share myemail@....`

**[TODO] check if the process above is OK**

For info:

- App name: NotaSolidariaApp
- App id: e60de1bd

### In browser

Run `ionic server`

* Note: scan doesn't work in browser

#### Bypass CORS limitation

Browsers block cross domains ajax calls. This is call CROS (Cross Origin Resource Sharing). There should be some http header configuration solution for that but we couldn't make it work. To bypass the problem with Chrome you can use extension [Allow-Control-Allow-Origin: *](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi)

There is no problem with Android and IOs apps.

### On your phone

1. Install Ionic View app on your phone
2. Run `gulp replace --env production` (or whatever environment config you want to use)
3. Run `ionic upload`
4. Run `gulp replace` to revert to local configuration
5. On Ionic View app on your phone, `sync` app and `view`.
