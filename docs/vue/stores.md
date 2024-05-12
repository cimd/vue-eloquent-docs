# Pinia Stores

The package has a Pinia plugin to persist the stores on the server side. This is an alternative 
to other packages like `piniaPluginPersistedstate` that persists the stores locally.
The store's state will be persisted on Laravel's cache driver configured on your project.

The Laravel package already has all the necessary endpoints to interact with the store.
## Installation

```ts
import { PiniaApiPlugin } from '@konnec/vue-eloquent'

app.use(PiniaApiPlugin)
```

## Configuration

```ts {10-14}
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    favouritePosts: [1,2],
    token: 'asjdlkfjaZH:Hhkjhlkhk',
  }),
  actions: {
  },
  persist: {
    sync: true,
    suffix: 1,  // probably the user id
    name: 'user'
  }
})
```

Add a `persist` property to the store. The other properties are optional.

`sync`: set sync to true if you want the changes to the state to be watched 
and automatically persisted to the server when it changes.

`name`: you can customize the store name that will be persisted on the server. It defaults
to the store name

`suffix`: this will be added to the store name and will serve as a unique identifier
for the store on the server. Useful when you have multiple stores for different users. 
It's recommended to add the user's unique identifier (user id?) as a suffix.

In the example above, the package will commit a key `store-user-1` on Laravel's cache.

## Usage

### Fetching the server state
At your component's initialization, you can fetch the current store persisted on the server:
```ts
const store = useUserStore()
store.$get()
```
This will set your store's state with the data from the server.

### Updating the server state
If you have `sync: true` enabled, any changes to the store will automatically be
persisted to the server.

You can manually disable it by calling:
```ts
const store = useUserStore()
// to temporarily disable the live sync
store.$sync(false)

// or to reenable it
store.$sync()
```

If you have live sync disabled, you can manually push the state to the server by calling:
```ts
const store = useUserStore()
store.$save()
```

### Deleting the server state
```ts
const store = useUserStore()
store.$delete()
```
