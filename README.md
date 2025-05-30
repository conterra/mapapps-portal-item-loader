# dn_portalitemloader

This bundle allows to add portal content

![Static Badge](https://img.shields.io/badge/tested_for_map.apps-4.18.3-%20?labelColor=%233E464F&color=%232FC050)

# Portal Item Loader

The Portal Item Loader allows you to add portal content to your app.

![Screenshot App](https://github.com/conterra/mapapps-portal-item-loader/blob/main/screenshot.JPG)

## Build Status

[![devnet-bundle-snapshot](https://github.com/conterra/mapapps-portal-item-loader/actions/workflows/devnet-bundle-snapshot.yml/badge.svg)](https://github.com/conterra/mapapps-portal-item-loader/actions/workflows/devnet-bundle-snapshot.yml)

## Sample App

https://demos.conterra.de/mapapps/resources/apps/downloads_portalitemloader/index.html

## Installation Guide

[dn_portalitemloader Documentation](https://github.com/conterra/mapapps-portal-item-loader/tree/master/src/main/js/bundles/dn_portalitemloader)

## Quick start

Clone this project and ensure that you have all required dependencies installed correctly (see [Documentation](https://docs.conterra.de/en/mapapps/latest/developersguide/getting-started/set-up-development-environment.html)).

Then run the following commands from the project root directory to start a local development server:

```bash
# install all required node modules
$ mvn initialize

# start dev server
$ mvn compile -Denv=dev -Pinclude-mapapps-deps

# run unit tests
$ mvn test -P run-js-tests,include-mapapps-deps
```
