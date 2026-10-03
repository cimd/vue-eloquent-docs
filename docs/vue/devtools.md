# DevTools Plugin

To install the plugin:

```js
import { VueEloquentPlugin } from '@konnec/vue-eloquent'
app.use(VueEloquentPlugin)
```

The plugin integrates with [Vue DevTools](https://devtools.vuejs.org/) and is only active when `NODE_ENV` is 
not `production`, so it is safe to leave it installed in your production build.

## Models and Collections
Every `Model` and `Collection` instance is listed in the inspector, with its attributes, `state`, validations and 
query.

<img src="https://raw.githubusercontent.com/cimd/vue-eloquent-docs/main/docs/public/devtools-1.png">

## Timeline
The timeline records the events of your models and collections: initialization, loading states, requests, 
validation, creation, updates, deletion, and broadcasting.

<img src="https://raw.githubusercontent.com/cimd/vue-eloquent-docs/main/docs/public/devtools-2.png">
