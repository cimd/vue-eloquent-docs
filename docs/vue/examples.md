# Examples

These examples are also available in the package's 
[examples folder](https://github.com/cimd/vue-eloquent/tree/main/examples).

### Setup

```ts
import Auth from './examples/Auth'
import { createHttp, VueEloquentPlugin } from '@konnec/vue-eloquent'

/**
 * Create your auth class to handle the authentication endpoints
 * The Auth class should extend the package's default Auth class
 */
const auth = new Auth()

/**
 * Create an instance of the HTTP service.
 */
const http = createHttp({
    baseURL: 'http://localhost:9000',
    apiPrefix: 'api/v1',
    bearerToken: auth.token,
})

/**
 * Optional: Vue DevTools support
 */
app.use(VueEloquentPlugin)
```

### Interfaces

```ts
import type { ModelParams } from '@konnec/vue-eloquent'
import type { IUser } from './UserInterface'
import type { IComment } from './CommentInterface'

export interface IPost extends ModelParams {
  title: string | undefined
  description: string | undefined
  author_id: number | undefined
  author?: IUser | undefined
  comments?: IComment[] | undefined
}
```

### Api Class

```ts
import { Api } from '@konnec/vue-eloquent'

export default class PostApi extends Api {
    protected override resource = 'posts'

    protected override dates = [
        'created_at',
        'updated_at',
        'deleted_at',
        'author.created_at'
    ]

    constructor() {
        super()
    }
}
```

### Model

```ts
import { required } from '@vuelidate/validators'
import { computed, reactive } from 'vue'
import { Model } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import type { IPost } from './PostInterface'
import UserApi from './UserApi'
import type { IUser } from './UserInterface'
import CommentApi from './CommentApi'
import type { IComment } from './CommentInterface'

export default class Post extends Model<IPost> {
  override api = PostApi

  override model = reactive({
    id: undefined,
    created_at: undefined,
    updated_at: undefined,
    deleted_at: undefined,
    author_id: undefined,
    title: undefined,
    description: undefined,
    author: {} as IUser,
    comments: [] as IComment[],
  }) as unknown as IPost

  protected override parameters = {
    title: 'New Post',
  }

  constructor(post?: IPost) {
    super()
    super.factory(post)
    super.initValidations()
  }

  protected override validations = computed(() => ({
    model: {
      title: {
        required
      },
      description: { required },
    }
  }))

  async author(): Promise<IUser> {
    return await this.hasOne(UserApi, this.model.author_id as number)
  }

  comments() {
    return this.hasMany(CommentApi, this.model.id as number)
  }
}
```

### Collection

```ts
import { reactive } from 'vue'
import { Collection } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import type { IPost } from './PostInterface'

export default class PostsCollection extends Collection {
  override api = PostApi

  protected override channel = 'posts'

  override data = reactive<IPost[]>([])

  constructor(posts?: IPost[]) {
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

### Policy

```ts
import { Policy } from '@konnec/vue-eloquent'

export default class Acl extends Policy {
  constructor(acl?: any) {
    super(acl)
  }
}
```

## Usage

### Form Component

```vue
<template>
  <q-card style="width: 400px; max-width: 100%">
    <q-card-section class="bg-primary">
      <span class="text-white text-h6">My Post</span>
    </q-card-section>
    <q-form @submit="onSubmit">
      <q-card-section>
        <div class="row">
          <div class="col"><q-input v-show="false" v-model="post.model.id" label="ID" /></div>
        </div>
        <div class="row">
          <div class="col">
            <q-input
              v-model="post.model.title"
              :error="post.$model.title.$error"
              :error-message="post.$model.title.$errors[0]?.$message"
              label="Title"
            />
          </div>
        </div>
        <div class="row">
          <div class="col"><q-input v-model="post.model.description" label="Description" /></div>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn label="Submit" :loading="post.state.isLoading" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import Post from './Post'
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { Action } from '@konnec/vue-eloquent'

export default defineComponent({
  props: {
    postId: {
      required: true,
      type: Number,
      default: 0
    },
    action: {
      required: true,
      type: String as PropType<Action>
    }
  },
  emits: ['close', 'created', 'updated'],
  data() {
    return {
      post: new Post()
    }
  },
  async created() {
    // Using the same form to CREATE, VIEW OR EDIT a Post
    if (this.action !== Action.CREATE) {
      this.post = await Post.find(this.postId)
    }
  },
  methods: {
    async onSubmit() {
      // Validate the form. Display error messages if invalid, or continue to submitting
      if (!this.post.$validate()) return

      const { actioned, model } = await this.post.save()
      this.$emit(actioned, model)
      this.$emit('close')
    }
  }
})
</script>
```

### Collection Component

```vue
<template>
  <q-page>

    <span class="text-white text-h6">Posts Page</span>

    <div class="row">
      <!--  Display your posts here: posts.data -->
    </div>

    <q-dialog v-model="open">
      <post-form
        :action="action"
        :post-id="postId"
        @close="open = false"
        @created="onCreated"
        @updated="onUpdated" />
    </q-dialog>

  </q-page>
</template>

<script lang="ts">
import PostsCollection from './PostsCollection'
import { defineComponent } from 'vue'
import PostForm from './PostForm.vue'
import { Action } from '@konnec/vue-eloquent'

export default defineComponent({
  components: {
    PostForm
  },
  data() {
    return {
      posts: new PostsCollection(),
      open: false,
      action: Action.CREATE as Action,
      postId: 0,
    }
  },
  created() {
    this.posts.joinChannel()
    this.posts.where({ author_id: 1 }).get()
  },
  methods: {
    onCreated(args: IPost) {
      // do something
    },
    onUpdated(args: IPost) {
      // do something
    },
  },
})
</script>
```
