# Auth
The Auth class allows you to interact with Laravel's authentication routes, as well as handling 
Laravel Sanctum api tokens.

::: warning
The instructions below assume that you have already created your http instance through `createHttp()`, and that 
you are running in a browser: the token is kept in the browser's `localStorage`.
:::

## Creating the class
You can use the `Auth` class as is, or extend it to customise the endpoints and to hook into the authentication
events:

```ts{3,8-13}
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

  override loggedIn(payload: any)
  {
    // do something here
    // maybe interact with your pinia store
  }

  override loggedOut(_payload: any)
  {
    // do something here
    // maybe interact with your pinia store
  }
}

const auth = new Auth()
```

The endpoints are relative to the `apiPrefix` set on `createHttp`, e.g. `login` is `POST api/login`.

## Login
```ts
const auth = new Auth()

const payload = {
    email: 'email@example.com',
    password: 'my-password'
}
// This will store the received token in the browser's local storage
await auth.login(payload)

// You can now access the Sanctum token from local storage:
console.log(auth.token)
```

Logging in will:
1. request the CSRF cookie from `GET /api/csrf-cookie` (this url is not affected by the `apiPrefix`),
2. send the payload to the login endpoint,
3. store the `token` property of the response in the browser's local storage (`sanctum_token`),
4. set it as the `Bearer` token of all the following requests,
5. call the `loggedIn(payload)` observer.

If the request fails the promise is rejected, and the `loginError(error)` observer is called.

::: tip
After a page reload, pass the stored token to `createHttp` so the requests are authenticated:

```ts
const auth = new Auth()
createHttp({ baseURL: 'http://localhost:8000', bearerToken: auth.token })
```
:::

## Logout
```ts
const auth = new Auth()

// This will remove the token from the browser's local storage
await auth.logout()
```

The `loggedOut(payload)` observer is called on success and `logoutError(error)` if the request fails.

On success it also calls `flushState()`, which clears the [state](/vue/model#state-management) kept by every model and 
collection, so what was fetched for this user is not there for the next one. A failed logout keeps them.

## Available methods

### isAuthenticated
```ts
const auth = new Auth()

// Returns true if the user is authenticated (token is set on local storage),
// or false if no token is found
auth.isAuthenticated()
```

### forgotPassword
```ts
// Sends the email to the forgot password endpoint
await auth.forgotPassword('email@example.com')
```

### resetPassword
```ts
// Sends the payload to the reset password endpoint. The response `token` is stored
// (as per the login) and the `loggedIn(payload)` observer is called
await auth.resetPassword({
  email: 'email@example.com',
  password: 'my-new-password',
  password_confirmation: 'my-new-password',
  token: 'reset-token'
})
```

### token
```ts
// The Sanctum token in local storage
auth.token
```

## Observers
Override these methods to react to the authentication events:

`loggedIn(payload)`, `loginError(error)`, `loggedOut(payload)` and `logoutError(error)`
