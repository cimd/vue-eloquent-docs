# Collection

While the `Model` class provides an eloquent way to manage a **single Model**,
the `Collection` class provides way of managing a **collection (array) of models**.

That is a difference from the *Laravel way* because on the front end
you would typically have different components for handling a single
`Model` or a `Collection` of models.

![Collection Class](/collection-class.png)

## Create a Collection Class
Create a `PostCollection` class that extends the default `Collection` class. Note we're using the `PostApi` 
created previously.

**Example**

```js
import { Collection } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import { IPost } from './IPost'
import { reactive } from 'vue'

export default class PostCollection extends Collection {
  protected api = PostApi

  public data = reactive([] as IPost[])

  constructor(posts?: IPost[]){
    super()
    this.factory(posts)
  }
}
```

You can then access the collection from the `data` attribute.

```js{2,7,13}
<script lang="ts">
import PostsCollection from './Post'

export default defineComponent({
  data() {
    return {
      posts: new PostsCollection(),
    }
  },
  created: {
    // this will fetch all posts from the API and instantiate them to
    // this.posts.data attribute
    this.posts.get()
  }
})
</script>
```

## Eloquent Api

### Filtering

```js
// Chaining several where clauses
this.posts.where({ author_id: 1 }).where({ title: 'Tech' }).get()

// OR, passing multiple parameters to single where clause
this.posts.where({ author_id: 1, title: 'Tech' }).get()
```

### Relationships

Requesting both `author` and `comments` relationships to be added to the response.

```js
this.posts.with(['author', 'comments']).get()
```

### Sorting

Sorting `author_id` ascending.

```js
this.posts.sort(['author_id']).get()
```
::: warning
Sorting in `descending` order is not supported yet.
:::

## States
The `Collection` has 3 states which are available and updated during the API requests. You can use them to display
state changes on you UI, e.g. a `loading` indicator on a button

```js
state: {
    isLoading: boolean,
    isSucess: boolean,
    isError: boolean
}
```

## Broadcast

`Vue Eloquent` uses `Laravel Echo` for broadcasting. After defining the channel
name on your Collection you have to initialize the broadcasting on your
component.

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

```js{9}
import { Collection } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import { IPost } from './IPost'
import { reactive } from 'vue'

export default class PostCollection extends Collection {
    protected api = PostApi
    
    protected channel = 'posts'
    
    public data = reactive([] as IPost[])
    
    public filter = reactive({
    creator_id: undefined as number | undefined,
    })
    
    constructor(posts?: IPost[]){
    super()
    this.factory(posts)
    }
}
```

```js{11}
<script lang="ts">
import PostsCollection from './Post'

export default defineComponent({
  data() {
    return {
      posts: new PostsCollection(),
    }
  },
  created: {
    this.initBroadcast()
    // this will fetch all posts from the API and instantiate them to
    // this.posts.data attribute
    this.posts.get()
  }
})
</script>
```

Alternatively you can pass a new channel directly to the broadcast constructor:
```js
this.initBroadcast('posts')
```


### Broadcast Observers

`broadcastCreated(e: any)`

`broadcastUpdated(e: any)`

`broadcastDeleted(e: any)`

Broadcast Observers are a good place to subscribe to broadcast events and update your `Collection` accordingly.

```ts{18-23}
import { reactive } from 'vue'
import { Collection } from '../src/index'
import PostApi from './PostApi'
import { IPost } from './PostInterface'

export default class PostsCollection extends Collection {
  protected api = PostApi

  protected channel = 'posts'

  public data = reactive([] as IPost[])

  constructor(posts?: IPost[]){
    super()
    this.factory(posts)
  }

  protected async broadcastCreated(e: any): Promise<{ data: IPost }>
  {
    // add new post to the collection
    const newPost = await this.api.show(e.id)
    this.data.push(newPost)
  }
}
```
