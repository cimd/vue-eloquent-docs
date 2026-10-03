# Installation

Installing the package in `Laravel`.

```sh
composer require konnec/vue-eloquent-api
```

The Laravel package brings the required API to help and integrate the Vue 3 package to your endpoints

## Vue 3

This package pairs with javascript's ```@konnec/vue-eloquent``` package [vue installation](/vue/installation).

## IDE Support

The Laravel package registers `index`, `show`, `store`, `update` and `destroy` as `response()` macros, so your IDE may flag them as undefined methods.

- **IDE:** generate helper stubs with [barryvdh/laravel-ide-helper](https://github.com/barryvdh/laravel-ide-helper) (`php artisan ide-helper:generate`).
- **PHPStan / Larastan:** add the bundled stub to your `phpstan.neon`:

```neon
parameters:
    scanFiles:
        - vendor/konnec/vue-eloquent-api/_ide_helper_macros.php
```
