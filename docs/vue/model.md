# Model

`Model` classes allows you to connect your laravel models with your front end forms.

![Model Class](/model-class.png)

## Generating Model Classes
Create a `Post` model that extends the default `Model` class. Note we're using the `PostApi` created previously.

**Example**

```ts
import { Model } from '@konnec/vue-eloquent'
import type { ModelParams } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import { reactive } from 'vue'

// ModelParams adds the id, created_at, updated_at and deleted_at attributes
export interface IPost extends ModelParams {
  title: string | undefined
  description: string | undefined
}

export default class Post extends Model<IPost> {
  override api = PostApi

  override model = reactive({
    id: undefined,
    title: undefined,
    description: undefined,
    created_at: undefined,
    deleted_at: undefined,
    updated_at: undefined,
  }) as unknown as IPost

  constructor(post?: IPost){
    super()
    // The factory method sets the default values (see below) and, if you pass an 
    // existing object, creates the Model instance from it instead of from the API
    super.factory(post)
  }
}
```

::: tip
Notice the `model` attribute is a reactive property. This allows
you to maintain reactivity in your components
:::

::: warning
The `Model` constructor is `protected`, so your class must declare its own `constructor` and call `super()` first.
:::

You `model` property is where you encapsulate your model attributes. And now you can use it in our component:

```vue{3-5,11,16,21-22}
<template>
    <div>
        <q-input v-model="post.model.id" label="ID" />
        <q-input v-model="post.model.title" label="Title" />
        <q-input v-model="post.model.description" label="Description" />
        <q-btn label="Submit" @click="onSubmit" />
    </div>
</template>

<script lang="ts">
import Post from './Post'

export default defineComponent({
  data() {
    return {
      post: new Post(),
    }
  },
  methods: {
    onSubmit() {
        // save() will update or create a new post
        this.post.save()
    }
  }
})
</script>
```


::: info
Note that we're linking `post.model` properties to the form models
:::


## Available methods

### Find

This will **fetch** the `post` with id = 1 from the API and attach it to the `post.model` property
```ts
await this.post.find(1)
```

`find` is also available as a static method, which creates a new instance of the model and fetches it:

```ts
const post = await Post.find(1)
```

### Create
**Create** a new instance of the post
```ts
await this.post.create()
```

### Update
**Update** the existing instance of the post
```ts
await this.post.update()
```

### Save
Alternatively, you can also use the convenient `post.save()` method. If your `post.model` has a defined `id` attribute, it will send a `PATCH` request to the API to update it. Otherwise, 
it will send a `POST` request to create a new `post`. It resolves with the saved `model` and what was `actioned` 
(`'created'` or `'updated'`).
```ts
const { actioned, model } = await this.post.save()
```

You can force a `POST` request, e.g. to duplicate a post, by passing the `Action.CREATE` action:

```ts
import { Action } from '@konnec/vue-eloquent'

await this.post.save(Action.CREATE)
```

### Delete
You can **delete** the existing post by calling:
```ts
await this.post.delete()
```

### Logs
Fetch the model's change logs from `GET /api/posts/{id}/logs`:
```ts
await this.post.logs()
```

::: tip
The **API Class** methods connect to Laravel controllers and hence use the same terminology: `get`(`index`), `show`, `store`, `update`, `destroy`

The **Model Class** methods connect to Laravel Models, hence use Laravel Eloquent's terminology: 
`create`, `find`, `update`, `delete`, `save`
:::

### Errors
If a request fails, the method throws a `ModelError` and `state.isError` is set to `true`. The `ApiError` that 
caused it is available from the `error` property.

```ts
import { ModelError } from '@konnec/vue-eloquent'

try {
  await this.post.save()
} catch (e) {
  if (e instanceof ModelError) {
    console.log(e.error) // the ApiError
  }
}
```

## Default Attribute Values

You can set default values through the `parameters` property. They are applied by `factory()` to the attributes 
that are `undefined`:

```ts
export default class Post extends Model<IPost> {
  override api = PostApi

  override model = reactive({
    id: undefined,
    title: undefined,
    description: undefined,
    created_at: undefined,
    deleted_at: undefined,
    updated_at: undefined,
  }) as unknown as IPost

  protected override parameters = {
    title: 'Default Title',
  }

  constructor(post?: IPost){
    super()
    super.factory(post)
  }
}
```

## Refreshing Models

If you already have an instance of a model that was retrieved from the API, you can "refresh" the model using the
`refresh` method.

```ts
// Retrieve model with id = 1
await this.post.find(1)

// Updates model with id = 1 from the API
await this.post.refresh()
```
You can also call the `refresh` method to re-retrieve a new model from the API:

```ts
// Retrieve model with id = 1
await this.post.find(1)

// post instance is now using model with id = 2
await this.post.refresh(2)
```

If you want to create a fresh (empty declaration) of the model you can call the `fresh` method:

```ts
// Retrieve model with id = 1
await this.post.find(1)
// post.model.id = 1

this.post.fresh()
// post.model.id = undefined
```

The values from the last time the model was retrieved or saved are available through `getOriginal()`, which is 
useful to check if the model was modified:

```ts
this.post.getOriginal().title // 'Title as it was last retrieved or saved'
```

## State Management

By default every `new Post()` is a new instance, so its state is lost with the component: a component that is created
again starts empty and waits for the API. For state that should outlive your components, like the account you are 
working on, keep it in the model itself with `getState()`. It creates the instance the first time it is called and 
returns the same one on every call after that, so the model is your store, with no separate store to keep in sync:

```ts
// In any component, on any page
const account = Account.getState()

// Show what is already there, while fetching fresh data
await account.refresh(1)
```

Because the state outlives the components, a page opened again finds the model (and its `state`) as it was left. 
The user sees the previous data instead of an empty page while the request is running, and
`state.isLoading` tells you when to show an indicator.

```vue
<template>
    <q-card>
        <q-linear-progress v-if="account.state.isLoading" indeterminate />
        <q-card-section>{{ account.model.name }}</q-card-section>
    </q-card>
</template>

<script lang="ts">
import Account from './Account'

export default defineComponent({
  setup() {
    return { account: Account.getState() }
  },
  async created() {
    await this.account.refresh(1)
  }
})
</script>
```

To keep more than one instance of the same class, e.g. one per account, pass a key:

```ts
const mine = Account.getState('U123')
const other = Account.getState('U456')
```

Clear the state with `forgetState()`, so the next `getState()` starts from a new instance:

```ts
Account.forgetState('U123') // only this key
Account.forgetState()       // every state of Account
```

To clear the state of every model and collection, use `flushState()`. `Auth.logout()` calls it for you, so the 
next user does not see the data of the previous one.

```ts
import { flushState } from '@konnec/vue-eloquent'

flushState()
```

::: warning
The instance is created without arguments, so `getState()` fits models that are one known thing, not records built 
from a payload. The state is global to the application: call `flushState()` between your tests.
:::

::: info
The state is kept while the application is open. It is not saved to `localStorage`, so a page reload starts empty.
:::

## Relationships

You can create `hasOne` and `hasMany` relationships on your model:

```ts{20-22,24-26}
import { reactive } from 'vue'
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
        text: undefined,
        author: {} as IUser,
        comments: [] as IComment[],
    }) as unknown as IPost

    constructor(post?: IPost) {
        super()
        super.factory(post)
    }
    
    async author(): Promise<IUser> {
        return await this.hasOne(UserApi, this.model.author_id as number)
    }
    
    comments() {
        return this.hasMany(CommentApi, this.model.id as number)
    }
}

```

### Has One Relationship

On a `hasOne` relationship, the first parameter is the `Api` Class
of your relationship, and the second parameter is the `foreign key`
on your relationship model. It resolves with the related record:

```ts
async author(): Promise<IUser> {
    return await this.hasOne(UserApi, this.model.author_id as number)
}
```

### Has Many Relationship

On a `hasMany` relationship, the first parameter is the `Api` Class
of your relationship. The second parameter is the `foreign key` on your relationship model.
It returns an object with the `get`, `show`, `create`, `update` and `delete` methods to interact with the 
related records:

```ts
comments() {
    return this.hasMany(CommentApi, this.model.id as number)
}
```

```ts
const comments = await this.post.comments().get()

await this.post.comments().create({ text: 'ipsum lorem' })
await this.post.comments().update({ id: 2, text: 'ipsum lorem samson' })
await this.post.comments().delete({ id: 2 })
```

::: warning
The respective endpoints must be manually created on Laravel. See the [API Class relationships](/vue/api#relationships).
:::

::: tip
The inverse relationships methods are not available but can be
abstracted using the same `hasOne` and `hasMany` methods.
:::


### Lazy Loading

The relationships can be 'lazy loaded' by calling the `load` method
after the model has been instantiated. The result is assigned to the model attribute with the same name:

```ts
await this.post.load(['comments'])
// this.post.model.comments = [...]
```

::: warning
`load` calls `get()` on the object returned by your relationship method, so it works with `hasMany` style 
relationships. A relationship method that already resolves the record (like the `hasOne` example above) should
be called directly: `this.post.model.author = await this.post.author()`.
:::

## Validation
`Vue Eloquent` uses [Vuelidate](https://vuelidate-next.netlify.app/) which is a great model validation library for 
Vue.
You need to define the validation rules in your Model class:
```ts{1,23,28-37}
import { required } from '@vuelidate/validators'
import { Model } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import type { IPost } from './PostInterface'
import { computed, reactive } from 'vue'

export default class Post extends Model<IPost> {
  override api = PostApi

  // MUST be a reactive property
  override model = reactive({
    id: undefined,
    title: undefined,
    description: undefined,
    created_at: undefined,
    deleted_at: undefined,
    updated_at: undefined,
  }) as unknown as IPost

  constructor(post?: IPost){
    super()
    super.factory(post)
    
    // Create validation instance
    super.initValidations()
  }
  
  // Validation rules, as per Vuelidate methods
  // MUST be a computed property
  protected override validations = computed(() => ({
    model: {
      title: {
        required
      },
      description: {
        required
      }
    }
  }))
}
```

::: warning
Note the `validations` property is a computed property, and that `initValidations()` must be called in the 
constructor. Without it `$validate()` and `$reset()` are not available.
:::

From there on you can access your `Vuelidate` model through `this.post.$model`. Call `$validate()` before 
submitting: it validates the model, displays the error messages and returns `true` if the model is valid.

```vue{19-20}
<template>
    <div>
        <q-input v-model="post.model.id" label="ID" />
        <q-input v-model="post.model.title" label="Title" />
        <q-input v-model="post.model.description" label="Description" />
        <q-btn label="Submit" @click="onSubmit" />
    </div>
</template>

<script lang="ts">
import Post from './Post'

export default defineComponent({
  data() {
    return {
      post: new Post(),
    }
  },
  methods: {
    async onSubmit() {
        if (!this.post.$validate()) return
        
        const { actioned, model } = await this.post.save()
        // Do something here, e.g: emit the value to a parent component
        // this.$emit(actioned, model)
        // actioned = 'created' or 'updated'
    }
  }
})
</script>
```

You can clear the error messages with `this.post.$reset()`.

### Validation messages
```vue{7-8,13-14}
<template>
    <div>
        <q-input v-model="post.model.id" label="ID" />
        <q-input 
            v-model="post.model.title" 
            label="Title" 
            :error="post.$model.title.$error" 
            :error-message="post.$model.title.$errors[0]?.$message"
        />
        <q-input 
            v-model="post.model.description" 
            label="Description"
            :error="post.$model.description.$error" 
            :error-message="post.$model.description.$errors[0]?.$message"
        />
        <q-btn label="Submit" @click="onSubmit" />
    </div>
</template>
```

### Validation Rules

You can find several rules available out-of-the-box in the 
[ Vuelidate Built-in Validators ](https://vuelidate-next.netlify.app/validators.html)
documentation and also on how to create your own custom rules 
[ Vuelidate Custom Validators ](https://vuelidate-next.netlify.app/custom_validators.html).

## States
The `Model` has 3 states which are available and updated during the API requests. You can use them to display
state changes on you UI, e.g. a `loading` indicator on a button.

```ts
state: {
    isLoading: boolean,
    isSuccess: boolean,
    isError: boolean
}
```

```vue{16}
<template>
    <div>
        <q-input v-model="post.model.id" label="ID" />
        <q-input 
            v-model="post.model.title" 
            label="Title" 
            :error="post.$model.title.$error" 
            :error-message="post.$model.title.$errors[0]?.$message"
        />
        <q-input 
            v-model="post.model.description" 
            label="Description"
            :error="post.$model.description.$error" 
            :error-message="post.$model.description.$errors[0]?.$message"
        />
        <q-btn label="Submit" :loading="post.state.isLoading" @click="onSubmit" />
    </div>
</template>
```

## Observers
Similarly to the API class, the Model also has Observers. They are `protected` methods that you can override:

| Request | Observers |
|---|---|
| **Find** and **Refresh** | `retrieving()`, `retrieved(payload)` and `retrievingError(error)` |
| **Create** | `creating()` and `created(payload)` |
| **Update** | `updating()` and `updated(payload)` |
| **Save** | `saving()` and `saved(payload)` |
| **Delete** | `deleting()` and `deleted(payload)` |

Those are good placeholders for displaying error messages to the user, passing values to the Store, or mutating the data:

```ts{23-26,28-31}
import { required } from '@vuelidate/validators'
import { computed, reactive } from 'vue'
import { Model } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import type { IPost } from './PostInterface'

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
  }) as unknown as IPost
    
  constructor(post?: IPost) {
    super()
    super.factory(post)
  }

  protected override updating() {
    // strip html tags from this.model.text
    // before submitting to the backend
    // OR
    // modifying a update_by field with the current username 
  }
  
  protected override updated(payload: IPost) {
    // Update a store with the returned payload
  }
}
```

::: tip
The `save` method will trigger the `saving` and `saved` observers, along with the `Create` or `Update` observers 
accordingly.
:::

::: info
The `Api` class also has [observers](/vue/api#observers), which run for every request made through that Api.
:::
