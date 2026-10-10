# Collection

While the `Model` class provides an eloquent way to manage a **single Model**,
the `Collection` class provides way of managing a **collection (array) of models**.

That is a difference from the *Laravel way* because on the front end
you would typically have different components for handling a single
`Model` or a `Collection` of models.

![Collection Class](/collection-class.png)

## Create a Collection Class
Create a `PostsCollection` class that extends the default `Collection` class. Note we're using the `PostApi` 
created previously.

**Example**

```ts
import { Collection } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import type { IPost } from './PostInterface'
import { reactive } from 'vue'

export default class PostsCollection extends Collection {
  override api = PostApi
    
  // Note that data should be a reactive array
  override data = reactive<IPost[]>([])

  constructor(posts?: IPost[]){
    super()
      
    // The factory method is only required if you choose to create an instance
    // from an existing IPost array
    if (posts) super.factory(posts)
  }
}
```

::: warning
The `Collection` constructor is `protected`, so your class must declare its own `constructor` and call `super()` first.
:::

You can then access the collection from the `data` attribute.

```vue{2,7,12}
<script lang="ts">
import PostsCollection from './PostsCollection'

export default defineComponent({
  data() {
    return {
      posts: new PostsCollection(),
    }
  },
  created() {
    // this will fetch all posts from the API and instantiate them to
    // this.posts.data attribute
    this.posts.get()
  }
})
</script>
```

`get` also resolves with the fetched records.

::: tip
Create your collections inside the component (`setup()`, `data()`...). The constructor registers an 
`onBeforeUnmount` hook, which leaves the broadcast channel when the component is unmounted. Outside of a component 
Vue will log a warning.
:::

## Eloquent Api

The `Collection` has the same query methods as the [API Class](/vue/api#api-query), which are sent to the API when
you call `get()`.

### Filtering

```ts
// Chaining several where clauses
this.posts.where({ author_id: 1 }).where({ title: 'Tech' }).get()

// OR, passing multiple parameters to single where clause
this.posts.where({ author_id: 1, title: 'Tech' }).get()
```

### Relationships

```ts
// Requesting both `author` and `comments` relationships to be added to the response.
this.posts.with(['author', 'comments']).get()
```

### Attributes
```ts
// Views attribute will be added to the response
this.posts.append(['views']).get()
```

### Select
```ts
// Requesting only post id and title from the API
this.posts.select(['id', 'title']).get()
```

### Sorting
```ts
// Sorting `author_id` ascending.
this.posts.sort(['author_id']).get()

// OR
// Sorting `author_id` ascending and then title in descending order.
this.posts.sort(['+author_id','-title']).get()
```

### Paginate
```ts
// Set Page number and page size
this.posts.paginate({ page: 2, pageSize: 5 }).get()
```

## Errors
If the request fails, `get` throws a `CollectionError` and `state.isError` is set to `true`.

```ts
import { CollectionError } from '@konnec/vue-eloquent'

try {
  await this.posts.get()
} catch (e) {
  if (e instanceof CollectionError) {
    console.log(e.error) // the ApiError
  }
}
```

## States
The `Collection` has 3 states which are available and updated during the API requests. You can use them to display
state changes on you UI, e.g. a `loading` indicator on a button

```ts
state: {
    isLoading: boolean,
    isSuccess: boolean,
    isError: boolean
}
```

## Observers
Similar to the `Api` class, you can override these `protected` methods:

`fetching(payload)`: runs before the request, with the query being sent

`fetched(response)`: runs after the request, with the API response

`fetchingError(error)`: runs if the request fails

## Broadcast

`Vue Eloquent` uses `Laravel Echo` for broadcasting. After defining the channel
name on your Collection you have to join the channel on your component.

Firstly you need to pass your `Laravel Echo` instance to the package:
```ts
import { createBroadcast } from '@konnec/vue-eloquent'
import Echo from 'laravel-echo'

const broadcast: Echo = ((<any>window).Echo = new Echo({
// your configuration here
}))
    
createBroadcast(broadcast)
```

Then you need to define the channel name on your collection class

```ts{9}
import { Collection } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import type { IPost } from './PostInterface'
import { reactive } from 'vue'

export default class PostsCollection extends Collection {
  override api = PostApi
    
  protected override channel = 'posts'
    
  override data = reactive<IPost[]>([])
    
  constructor(posts?: IPost[]){
    super()
    if (posts) super.factory(posts)
  }
}
```

```vue{10}
<script lang="ts">
import PostsCollection from './PostsCollection'

export default defineComponent({
  data() {
    return {
      posts: new PostsCollection(),
    }
  },
  created() {
    this.posts.joinChannel()
    // this will fetch all posts from the API and instantiate them to
    // this.posts.data attribute
    this.posts.get()
  }
})
</script>
```

Alternatively you can pass a new channel directly to the `joinChannel` method:
```ts
this.posts.joinChannel('posts')
```

The collection listens to the `.created`, `.updated` and `.deleted` events of the channel. The channel is left 
automatically when the component is unmounted, or you can leave it manually:

```ts
this.posts.leaveChannel()
```

### Broadcast Observers

`broadcastCreated(e: any)`

`broadcastUpdated(e: any)`

`broadcastDeleted(e: any)`

Broadcast Observers are called when the respective event is received. They do nothing by default, so they are the 
place to update your `Collection` accordingly.

```ts{18-22}
import { reactive } from 'vue'
import { Collection } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import type { IPost } from './PostInterface'

export default class PostsCollection extends Collection {
  override api = PostApi

  protected override channel = 'posts'

  override data = reactive<IPost[]>([])

  constructor(posts?: IPost[]){
    super()
    if (posts) super.factory(posts)
  }

  protected override async broadcastCreated(e: any): Promise<void> {
    // add new post to the collection
    const newPost = await this.api.show<IPost>(e.id)
    this.data.push(newPost.data)
  }
}
```

## State Management

`getState()` manages the state of a collection as it does for the [Model](/vue/model#state-management): the collection
is created the first time it is called, and every call after that returns the same instance, so its rows live beyond
your components. A page opened again finds the rows (and the `state`) as it left them, and shows them while `get()` 
fetches fresh ones.

```vue
<script lang="ts">
import PostsCollection from './PostsCollection'

export default defineComponent({
  setup() {
    return { posts: PostsCollection.getState() }
  },
  async created() {
    // posts.data still has the previous rows until the response arrives
    await this.posts.where({ author_id: 1 }).get()
  }
})
</script>
```

Pass a key to keep one per, for instance, author: `PostsCollection.getState(String(authorId))`.
`forgetState(key?)` clears the state of a key, or of all the class' instances without one, and `flushState()` clears 
the state of every model and collection (it is called when the user logs out).

::: warning
The query (`where`, `sort`, `with`...) is kept with the instance, so set it on every visit. A filter applied the last 
time the page was open is still there otherwise.
:::

::: tip
A collection with state is not tied to the component that created it, so it does not leave its broadcast channel when that 
component unmounts. Call `leaveChannel()` when the page is left, or let `forgetState()` and `flushState()` do it:
they leave the channel of the collections they clear.
:::
