# API Class
The API classes are ways to integrate your Vue SPA with Laravel's APIs in an Laravel/Eloquent way.

![Api Class](/api-class.png)

## Instantiating Axios
You can either pass an existing `Axios` instance to the package as so:

```ts{2,9}
import axios, { AxiosInstance } from 'axios'
import { createHttp } from '@konnec/vue-eloquent'

const http: AxiosInstance = axios.create({
  withCredentials: true,
  baseURL: 'http://localhost:8000',
})

createHttp({ httpClient: http })
```

Or you can let the package create an instance for you (with `withCredentials: true`):
```ts{1,3-6}
import { createHttp } from '@konnec/vue-eloquent'

const http = createHttp({ 
    baseURL: 'http://localhost:8000',
    bearerToken: 'your-token-here'
})
```

`createHttp` returns the `Axios` instance, so you have access to it from your application. It throws an error if you 
provide neither a `httpClient` nor a `baseURL`. The instance is also exported as `http`.

This will append an `api` prefix to all requests to the `baseURL`. You can customize the api prefix through the 
`createHttp` method:

```ts
const http = createHttp({
    baseURL: 'http://localhost:8000',
    bearerToken: 'your-token-here',
    apiPrefix: 'api/v1'
})
```

## Generating the Api Class
Create a new file called `PostApi.ts` which extends `Api`. Define your api endpoint through the `resource` property:

**Example**

```ts{1,4}
import { Api } from '@konnec/vue-eloquent'

export default class PostApi extends Api {
  protected override resource = 'posts'

  constructor() {
    super()
  }
}
```

::: warning
Keep the `constructor`. The base constructor is `protected`, and the static methods (`PostApi.get()`, `PostApi.show()`...)
create an instance of your class internally.
:::

In this example, you are accessing your `posts` endpoint through:
```http
http://localhost:8000/api/posts
```

## Using the API
You can now access your laravel `Posts` API through the following **static** methods

| Method | Request |
|---|---|
| `PostApi.get()` | `GET /api/posts` |
| `PostApi.first()` | `GET /api/posts` (resolves the first record, sends `limit=1`) |
| `PostApi.show(1)` | `GET /api/posts/1` |
| `PostApi.store(post)` | `POST /api/posts` |
| `PostApi.update(post)` | `PATCH /api/posts/{post.id}` |
| `PostApi.destroy(1)` or `PostApi.destroy(post)` | `DELETE /api/posts/1` |
| `PostApi.logs(1)` | `GET /api/posts/1/logs` |

```ts
PostApi.get()

PostApi.show(1)

PostApi.store({ text: 'My New Post' })

PostApi.update({ id: 1, text: 'My New Post - Updated' })

PostApi.destroy(1) // OR PostApi.destroy({ id: 1, text: 'My New Post - Updated' })
```

### Responses

All the methods above resolve with the body of the response, which Laravel wraps in a `data` attribute. 
Hence, the record(s) are available from `data`:

```ts
const response = await PostApi.show(1)
console.log(response.data.title)

const posts = await PostApi.get()
console.log(posts.data.length)
```

The response is typed as `ApiResponse<T>`: `{ data: T, count?: number, message?: string | string[] }`. 
Use the generic to type the data: `PostApi.show<IPost>(1)`.

### Errors

If the request fails, the promise is rejected with an `ApiError`. Its message is formed by the method name and the 
Axios message (e.g. `Show ||| Request failed with status code 404`) and the original Axios error is available 
from the `error` property, where you can read Laravel's validation messages from:

```ts
import { ApiError } from '@konnec/vue-eloquent'

try {
  await PostApi.store({ title: '' })
} catch (e) {
  if (e instanceof ApiError) {
    console.log(e.error.response?.data) // Laravel's response, e.g. { message: '...', errors: {...} }
  }
}
```

::: tip
`e.error.response` is `undefined` when no response was received (network errors, timeouts), so always use optional 
chaining. The original error is also available as the standard `e.cause`.
:::

### Destroying without a model
By default `destroy` takes a model (or an id) and calls `DELETE /api/posts/{id}`. If you pass `false` as the second 
argument, no id is added to the url and the payload is sent as query parameters instead:

```ts
// DELETE /api/posts?author_id=1
PostApi.destroy({ author_id: 1 }, false)
```

### Mass Updates

You can perform mass assignments through the following methods:

#### batchStore
```ts
const posts = [
    { title: 'My New Post', description: 'Lorem ipsum dolor sit amet, consectetur adipis' },
    { title: 'My Second Post', description: 'Lorem ipsum dolor sit amet, consectetur adipis'},
]
PostApi.batchStore(posts)
```

#### batchUpdate
```ts
const posts = [
    { id: 1, title: 'My New Post - UPDATED', description: 'Lorem ipsum dolor sit amet, consectetur adipis' },
    { id: 2, title: 'My Second Post - UPDATED', description: 'Lorem ipsum dolor sit amet, consectetur adipis'},
]
PostApi.batchUpdate(posts)
```

#### batchDestroy
```ts
const posts = [
    { id: 1, title: 'My New Post - UPDATED', description: 'Lorem ipsum dolor sit amet, consectetur adipis' },
    { id: 2, title: 'My Second Post - UPDATED', description: 'Lorem ipsum dolor sit amet, consectetur adipis'},
]
PostApi.batchDestroy(posts)
```

::: warning
This requires your backend application to implement the required routes as per below. The arguments are packed
into a `data` param sent:
:::
```php
Route::batch('posts/batch', PostController::class);

// OR

Route::post('posts/batch', [PostController::class, 'storeBatch']);
Route::patch('posts/batch', [PostController::class, 'updateBatch']);
Route::patch('posts/batch-destroy', [PostController::class, 'destroyBatch']);
```
Note that the `batch-destroy` route is defined as `PATCH` instead of `DELETE`.

::: info
`batchDelete` (`POST posts/batch-delete`) and `delete` are deprecated. Use `batchDestroy` and `destroy` instead.
:::

## API Query
Check the Laravel's [konnec/vue-eloquent-api](../laravel/installation) 
package documentation on how to configure the controllers for the queries below.

The query methods are available both statically and on an instance, and each of them (except `get`) returns the 
instance so you can chain them. Finish the chain with `get()`.

```ts
const posts = await PostApi
  .where({ author_id: 1 })
  .with(['author', 'comments'])
  .sort(['-created_at'])
  .paginate({ page: 1, pageSize: 10 })
  .get()
```

### Filtering
```ts
PostApi.where({author: 'John Doe', age: 32}).get()
// You can also chain methods: filters are merged
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

### Sorting
```ts
// Sorting `author_id` ascending and then title in descending order.
PostApi.sort(['author_id', '-title']).get()

// Shortcut to sort a column in descending order (same as `sort(['-created_at'])`).
PostApi.latest('created_at').get()
```

### Paginate
```ts
// Set Page number and page size
// Default pageSize = 15
PostApi.paginate({ page: 2, pageSize: 5 }).get()
```

### Limit
```ts
// Requesting at most 10 records
PostApi.limit(10).get()
```

### First
```ts
// Requests a single record (`limit=1`) and resolves with it, or `null` when the list is empty
const response = await PostApi.where({ author_id: 1 }).latest('created_at').first()
console.log(response.data?.title)
```

::: tip
`where` and `paginate` merge the values of repeated calls. `with`, `append`, `select`, `limit` and `sort` replace the 
values of previous calls, while `latest` adds its column to the current sorting (a later `sort` replaces it).
:::

::: warning
Passing a payload to `get` (`PostApi.get({ author_id: 1 })`) is deprecated: the payload is sent as is as the 
query parameters. Use `where` instead.
:::

## Relationships

::: warning
The respective endpoints must be manually created on Laravel
:::
The Api exposes two methods that can be used to interact with the model's relationships. Both return an object with 
the `get`, `show`, `store`, `update` and `delete` methods.

### One to One
```ts
// GET http://localhost:8000/api/posts/1/comments
// Resolves with the first item of the response
await PostApi.hasOne('comments', 1).get()

// GET http://localhost:8000/api/posts/1/comments/2
await PostApi.hasOne('comments', 1).show({id: 2})

// POST http://localhost:8000/api/posts/1/comments
await PostApi.hasOne('comments', 1).store({text: 'ipsum lorem'})

// PATCH http://localhost:8000/api/posts/1/comments/2
await PostApi.hasOne('comments', 1).update({id:2, text: 'ipsum lorem samson'})

// DELETE http://localhost:8000/api/posts/1/comments/2
await PostApi.hasOne('comments', 1).delete({id:2})
```

### One to Many
```ts
// GET http://localhost:8000/api/posts/1/comments
// Resolves with the array of comments
await PostApi.hasMany('comments', 1).get()

// GET http://localhost:8000/api/posts/1/comments/2
await PostApi.hasMany('comments', 1).show({id: 2})

// POST http://localhost:8000/api/posts/1/comments
await PostApi.hasMany('comments', 1).store({text: 'ipsum lorem'})

// PATCH http://localhost:8000/api/posts/1/comments/2
await PostApi.hasMany('comments', 1).update({id:2, text: 'ipsum lorem samson'})

// DELETE http://localhost:8000/api/posts/1/comments/2
await PostApi.hasMany('comments', 1).delete({id:2})
```

## Custom Endpoints

For routes that don't fit the REST methods above, use `send`. Use `url` to build the path based on the `apiPrefix` 
and `resource`:

```ts
// POST http://localhost:8000/api/posts/1/publish?notify=1
const result = await PostApi.send(
  'post',                         // 'get' | 'post' | 'put' | 'patch' | 'delete'
  PostApi.url('1', 'publish'),    // 'api/posts/1/publish'
  { published_at: '2025-01-01' }, // request body (optional)
  { notify: 1 }                   // query parameters (optional)
)
```

::: warning
`send` uses the path **as given**: the `apiPrefix` and `resource` are not added (that's what `url` is for), and 
unlike the REST methods it:
- resolves with the response body as is (no `Date` conversion), 
- does not call the observers, 
- rejects with the Axios error instead of an `ApiError`.
:::

Other helpers:

```ts
PostApi.getResource() // 'posts'
```

## Casting Dates
All default laravel timestamps (`created_at`, `updated_at` and `deleted_at`) attributes are automatically converted 
to `Date` objects. You can extend additional attributes by overriding the `dates` property. Dot notation is supported

```ts{5-11}
import { Api } from '@konnec/vue-eloquent'

export default class PostApi extends Api {
  protected override resource = 'posts'
  protected override dates = [
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
application. They are `protected` methods that you can override in your Api class:

| Request | Observers |
|---|---|
| **Get** | `fetching`, `fetched` and `fetchingError` |
| **Show** | `retrieving`, `retrieved` and `retrievingError` |
| **Store** | `storing`, `stored` and `storingError` |
| **Update** | `updating`, `updated` and `updatingError` |
| **Destroy** | `destroying`, `destroyed` and `destroyingError` |
| **Batch** | `batchStoringError`, `batchUpdatingError` and `batchDestroyingError` |
| **Logs** | `fetchingLogsError` |

Those are good placeholders for displaying error messages to the user, or passing values to the `stores`.

**Example**
```ts{2,11-14}
import { Api } from '@konnec/vue-eloquent'
import { usePostStore } from 'stores/Post'

export default class PostApi extends Api {
  protected override resource = 'posts'

  constructor () {
    super()
  }
  
  protected override fetched (args: ApiResponse<IPost[]>) {
    const store = usePostStore()
    store.posts = [...args.data]
  }
}
```

The `hasOne` and `hasMany` requests call the same observers.

::: info
The batch requests only have error observers, and `send` doesn't call any observer.
:::

## Custom Class
You can also create a custom base class which extends the default `Api` class.

**Example**
```ts
import { Api } from '@konnec/vue-eloquent'

export default abstract class MyApi extends Api {

  protected constructor () {
    super()
  }
  
  protected override updatingError (err: any) {
    // do something
  }

  protected override storingError (err: any) {
    // do something
  }
}
```

::: tip
At this point you can start using the Api Class on your app or you can continue extending it through the following
steps
:::
