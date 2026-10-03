# Installation

Installing the package in your Vue 3 app.

```sh
yarn add @konnec/vue-eloquent
```

The package is written in TypeScript and ships its own types. It requires `Vue 3`. `axios`, `@vuelidate/core`, 
`@vuelidate/validators` and `laravel-echo` are installed as dependencies.

## Setup

Configure the package once, before your first request (e.g. in your `main.ts` or a boot file):

```ts
import { createHttp, createBroadcast, VueEloquentPlugin } from '@konnec/vue-eloquent'

// Required: the HTTP client used by every Api, Model and Collection class.
// See the "API Class" page for all the options.
createHttp({
  baseURL: 'http://localhost:8000',
  apiPrefix: 'api' // default
})

// Optional: needed only if you broadcast events to your Collections.
// See the "Collection" page.
createBroadcast(echo)

// Optional: Vue DevTools support. Only active when NODE_ENV is not `production`.
app.use(VueEloquentPlugin)
```

::: warning
`createHttp` must be called before any `Api`, `Model` or `Collection` class makes a request.
:::

## What's included

| Class | Purpose |
|---|---|
| [`Api`](/vue/api) | Static methods that map to a Laravel REST resource |
| [`Model`](/vue/model) | A single record: reactive attributes, validation, state, `save`/`find`/`delete` |
| [`Collection`](/vue/collection) | A list of records, with query building and broadcasting |
| [`Auth`](/vue/auth) | Laravel Sanctum login, logout and password reset |
| [`Policy`](/vue/policy) | CRUD permissions and the current action mode |

## Laravel Package

This package pairs with composer's ```konnec/vue-eloquent-api``` package [laravel installation](/laravel/installation).
