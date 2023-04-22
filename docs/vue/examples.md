# Examples

## Setup

### Api Class

```js
import { Api } from '../../src/index'

export default class PostApi extends Api {
    protected resource = 'posts'

    protected dates = [
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

```js
import { required } from '@vuelidate/validators'
import { computed, reactive } from 'vue'
import { Model } from '../../src'
import PostApi from './PostApi'
import { IPost } from './PostInterface'
import UserApi from './UserApi'
import { IUser } from './UserInterface'

export default class Post extends Model {
  protected api = PostApi

  public model = reactive({
    id: undefined,
    created_at: undefined,
    updated_at: undefined,
    deleted_at: undefined,
    author_id: undefined,
    title: undefined,
    text: undefined,
    author: undefined as IUser,
    readers: undefined as IUser[],
  } as IPost)

  protected parameters = {
    title: 'New Post',
  }

  constructor(post?: IPost) {
    super()
    this.factory(post)
    super.initValidations()
  }

  protected validations = computed(() => ({
    model: {
      title: {
        required
      },
      description: { required },
    }
  }))

  async author(): Promise<IUser>
  {
    return await this.hasOne(UserApi, this.model.author_id)
  }

  async readers(): Promise<IUser[]>
  {
    return await this.hasMany(UserApi, 'id', this.model.author_id)
  }
}
```

### Collection

```js
import { reactive } from 'vue'
import { Collection } from '../../src/index'
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
}
```

## Usage

### Form Component

```js
<template>
  <q-card style='width:400px;max-width:100%; '>
    <q-card-section class='bg-primary'>
      <span class='text-white text-h6'>My Post</span>
    </q-card-section>
    <q-form @submit='onSubmit'>
      <q-card-section>
        <div class='row'><div class='col'><q-input v-show='false' v-model='post.model.id' label='ID' /></div></div>
        <div class='row'><div class='col'><q-input v-model='post.model.name' :error='post.$model.title.$error' label='Title' /></div></div>
        <div class='row'><div class='col'><q-input v-model='post.model.description' label='Description' /></div></div>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-button label='Submit' :loading='post.state.isLoading' type='submit' />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import Post from './Post'
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
    },
  },
  data() {
    return {
      post: new Post()
    }
  },
  created() {
    // Using the same for form to CREATE, VIEW OR EDIT a Post
    if (this.action !== Action.CREATE) {
      this.post = new Post(this.postId)
    }
  },
  methods: {
    async onSubmit() {
      // Validate the form. Display error messages if invalid, or continue to submitting
      this.post.$validate()
      if (this.post.$invalid) return

      const { actioned, model } = await this.post.save()
      this.$emit(actioned, model)
      this.$emit('close')
    }
  }
})
</script>
```

### Collection Component

```js
<template>
  <q-page>

    <span class='text-white text-h6'>Posts Page</span>

    <div class='row'>
      <!--  Display your posts here -->
    </div>

    <q-dialog v-model='open'>
      <post-form
        :action='action'
        :post-id='postId'
        @close='open = false'
        @created='onCreated'
        @deleted='onDeleted'
        @updated='onUpdated' />
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
    }
  },
  created() {
    this.posts.where({ author_id: 1 }).get()
  },
  methods: {
    onCreated(args) {
      // do something
    },
    onUpdated(args) {
      // do something
    },
    onDeleted(args) {
      // do something
    },
  },
})
</script>
```
