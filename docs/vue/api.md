# API Class
The API classes are ways to integrate your Vue SPA with Laravel's APIs in an Laravel/Eloquent way.

![Api Class](/api-class.png)

## Instantiating Axios
You can either pass an existing `Axios` instance to the package as so:

```js{2,9}
import axios, { AxiosInstance } from 'axios'
import { createHttp } from '@konnec/vue-eloquent'

const http: AxiosInstance = axios.create({
  withCredentials: true,
  baseURL: 'http://localhost:8000',
})

createHttp({ httpClient: http })
```

Or you can let the package create an instance for you:
```js{1,3-6}
import { createHttp } from '@konnec/vue-eloquent'

const http = createHttp({ 
    baseURL: 'http://localhost:8000',
    bearerToken: 'your-token-here'
})
```


You now have access to the `Axios` instance from your application

This will append an `api` prefix to all requests to the `baseUrl`. You can customize the api prefix through the 
`createHttp` method:

```js
const http = createHttp({
    baseURL: 'http://localhost:8000',
    bearerToken: 'your-token-here',
    apiPrefix: 'api/v1'
})
```

## Generating the Api Class
Create a new file called `PostApi.ts` which extends `Api`. Define your api endpoint through the `resource` property:

**Example**

```js{1,4}
import { Api } from '@konnec/vue-eloquent'

export default class PostApi extends Api {
  protected resource = 'posts'

  constructor() {
    super()
  }
}
```

In this example, you are accessing your `posts` endpoint through:
```http
http://localhost:8000/api/posts
```

## Using the API
You can now access your laravel `Posts` API through the following methods

```js
PostApi.get()

PostApi.show(1)

PostApi.store({text: 'My New Post})
    
PostApi.update({id: 1, text: 'My New Post - Updated})
        
PostApi.destroy(1) OR PostApi.destroy({id: 1, text: 'My New Post - Updated})
```

### Mass Updates

You can perform mass assignments through the following methods:

#### batchStore
```js
const posts = [
    { title: 'My New Post', description: 'Lorem ipsum dolor sit amet, consectetur adipis' },
    { title: 'My Second Post', description: 'Lorem ipsum dolor sit amet, consectetur adipis'},
]
PostApi.batchStore(posts)
```

#### batchUpdate
```js
const posts = [
    { id: 1, title: 'My New Post - UPDATED', description: 'Lorem ipsum dolor sit amet, consectetur adipis' },
    { id: 2, title: 'My Second Post - UPDATED', description: 'Lorem ipsum dolor sit amet, consectetur adipis'},
]
PostApi.batchUpdate(posts)
```

#### batchDestroy
```js
const posts = [
    { id: 1, title: 'My New Post - UPDATED', description: 'Lorem ipsum dolor sit amet, consectetur adipis' },
    { id: 2, title: 'My Second Post - UPDATED', description: 'Lorem ipsum dolor sit amet, consectetur adipis'},
]
PostApi.batchDestroy(posts)
```

::: warning
This requires your backend application to implement the required routes as per below. The arguments are packed
into a data param sent:
:::
```php
Route::batch('posts/batch', PostController::class);

// OR

Route::post('posts/batch', [PostController::class, 'storeBatch']);
Route::patch('posts/batch', [PostController::class, 'updateBatch']);
Route::patch('posts/batch-destroy', [PostController::class, 'destroyBatch']);
```
Note that the `batch-destroy` route is defined as `PATCH` instead of `DELETE`.

## API Query
Check the Laravel's [konnec/vue-eloquent-api](../laravel/installation) 
package documentation on how to configure the controllers for the queries below 

### Filtering
```ts
PostApi.where({author: 'John Doe', age: 32}).get()
// You can also chain methods
PostApi.where({author: 'John Doe'}).where({ age: 32}).get()
```
### Relationships
```ts
// Requesting both `author` and `comments` relationships to be added to the response.
PostApi.with(['author', 'comments']).get()
```

### Attributes
```ts
// Views attribute will be added to the response
PostApi.append(['views']).get()
```
### Select
```ts
// Requesting only post id and title from the API
PostApi.select(['id', 'title']).get()
```

### Paginate
```ts
// Set Page number and page size
// Default pageSize = 15
PostApi.paginate({ page: 2, pageSize: 5 }).get()
```

## Relationships

::: warning
The respective endpoints must be manually created on Laravel
:::
The Api exposes four default methods that can be used to interact with the model's relationships:

### One to One
```ts
// GET http://localhost:8000/api/posts/1/comments
await PostApi.hasOne('comments', 1).get()

// GET http://localhost:8000/api/posts/1/comments/2
await PostApi.hasOne('comments', 1).show({id: 2})

// POST http://localhost:8000/api/posts/1/comments
await PostApi.hasOne('comments', 1).create({text: 'ipsum lorem'})

// PATCH http://localhost:8000/api/posts/1/comments/2
await PostApi.hasOne('comments', 1).create({id:2, text: 'ipsum lorem samson'})

// DELETE http://localhost:8000/api/posts/1/comments/2
await PostApi.hasOne('comments', 1).delete({id:2})
```

### One to Many
The Api exposes four default methods that can be used to interact with the model's relationships:

```ts
// GET http://localhost:8000/api/posts/1/comments
await PostApi.hasMany('comments', 1).get()

// GET http://localhost:8000/api/posts/1/comments/2
await PostApi.hasMany('comments', 1).show({id: 2})

// POST http://localhost:8000/api/posts/1/comments
await PostApi.hasMany('comments', 1).create({text: 'ipsum lorem'})

// PATCH http://localhost:8000/api/posts/1/comments/2
await PostApi.hasMany('comments', 1).create({id:2, text: 'ipsum lorem samson'})

// DELETE http://localhost:8000/api/posts/1/comments/2
await PostApi.hasMany('comments', 1).delete({id:2})
```

## Casting Dates
All default laravel timestamps (`created_at`, `updated_at` and `deleted_at`) attributes are automatically converted 
to `Date` objects. You can extend additional attributes by overriding the `dates` property. Dot notation is supported

```ts{5-11}
import { Api } from '@konnec/vue-eloquent'

export default class PostApi extends Api {
  protected resource = 'posts'
  protected dates = [
  'created_at',
  'updated_at',
  'deleted_at',
  'published_at',
  'user.last_login_at'
  ]

  constructor() {
    super()
  }
}
```

## Observers
Similar to Laravel, `Vue Eloquent` also has observers that can be used to extend basic functionality of your 
application:

**Get**: `fetching`, `fetched` and `errorFetching`

**Show**: `retriving`, `retrieved` and `errorRetrieving`

**Update**: `updating`, `updated` and `errorUpdating`

**Store**: `storing`, `stored` and `errorStoring`

**Destroy**: `destryoing`, `destroyed` and `errorDestroying`

Those are good placeholders for displaying error messages to the user, or passing values to the `stores`.

**Example**
```ts{2,11-13}
import { Api } from '@konnec/vue-eloquent'
import { usePostStore } from 'stores/Post'

export default class PostApi extends Api {
  protected resource = 'posts'

  constructor () {
    super()
  }
  
  fetched (args: IPost[]) {
    const store = usePostStore()
    store.posts = [...args]
  }
}
```

## Custom Class
You can also create a custom base class which extends the default `Api` class.

**Example**
```ts
import { Api } from '@konnec/vue-eloquent'

export default abstract class MyApi extends Api {

  constructor () {
    super()
  }
  
  protected updatingError (err: any) {
    // do something
  }

  protected storingError (err: any) {
    // do something
  }
}
```

::: tip
At this point you can start using the Api Class on your app or you can continue extending it through the following
steps
:::
