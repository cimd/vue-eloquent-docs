# Auth
The Auth class allows you to interact with Laravel's authentication routes, as well as handling 
Laravel Sanctum api tokens.


## Creating the class
You can either an existing `Axios` instance to the package as so:

```js{1,3,30}
import { Auth as KonnecAuth } from '@konnec/vue-eloquent'

export default class Auth extends KonnecAuth {

  constructor()
  {
    // In case you want to customise the default endpoints from Laravel
    // The defaults are per below:
    super({
        login: 'login',
        logout: 'logout',
        forgotPassword: 'users/forgot-password',
        resetPassword: 'users/reset-password',
      })
  }

  loggedIn(payload: any)
  {
    // do something here
    // maybe interact with your pinia store
  }

  loggedOut(_payload: any)
  {
    // do something here
    // maybe interact with your pinia store
  }
}

const auth = new Auth()
```

::: warning
The instructions below assume that you have already created your http instance through ``createHttp()``
:::

## Login
```js
const auth = new Auth()

const payload = {
    email: 'email@example.com',
    password: 'my-password'
}
// This will store the received token in the browser's local storage
auth.login(payload)

// You can now access the Sanctum token from local storage:
console.log(auth.token)
```

## Logout
```js
const auth = new Auth()

// This will remove the token from the browser's local storage
auth.logout()
```

## Available methods

### isAuthenticated
```ts
const auth = new Auth()

// Returns true if the user is authenticated (token is set on local storage),
// or false if no token is found
auth.isAuthenticated()
```
