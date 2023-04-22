# Model

`Model` classes allows you to connect your laravel models with your front end forms.

## Generating Model Classes
Create a `Post` model that extends the default `Model` class. Note we're using the `PostApi` created previously.

**Example**

```js
import { Model } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import { IPost } from 'PostInterface'
import { computed, reactive } from 'vue'

export default class Post extends Model {
  protected api = PostApi

  public model = reactive({
    id: undefined,
    title: undefined,
    description: undefined,
    created_at: undefined,
    deleted_at: undefined,
    updated_at: undefined,
  } as IPost)

  constructor(post?: IPost){
    super()
    this.factory(post)
  }
}
```

::: tip
Notice the `model` attribute is a reactive property. This allows
you to maintain reactivity in your components
:::

You `model` property is where you encapsulate your model attributes. And now you can use it in our component:

```js{3-5,11,16,21-22}
<template>
    <div>
        <q-input v-model='post.model.id' label='ID' />
        <q-input v-model='post.model.title' label='Title' />
        <q-input v-model='post.model.description' label='Description' />
        <q-btn label='Submit' @click='onSubmit />
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

This will **fetch** the `post` with id = 1 from the API and attach it to the `post.model` property
```js
this.post.find(1)
```

**Create** a new instance of the post
```js
this.post.create()
```

**Update** the existing instance of the post
```js
this.post.update()
```

Alternatively, you can also use the convenient `post.save()` method. If your `post.model` has a defined `id` attribute, it will send a `PATCH` request to the API to update it. Otherwise, 
it will send a `POST` request to create a new `post`
```js
this.post.save()
```

You can **delete** the existing post by calling:
```js
this.post.delete()
```

::: tip
The **API Class** methods connect to Laravel controllers and hence use the same terminology: `get`(`index`), `show`, `store`, `update`, `destroy`

The **Model Class** methods connect to Laravel Models, hence use Laravel Eloquent's terminology: 
`create`, `find`, `update`, `delete`, `save`
:::

## Default Attribute Values

You can pass default values directly to the model property:

```js
  public model = reactive({
    id: undefined,
    title: 'Default Title',
    description: undefined,
    created_at: undefined,
    deleted_at: undefined,
    updated_at: undefined,
  } as IPost)
```

## Refreshing Models

If you already have an instance of a model that was retrieved from the API, you can "refresh" the model using the
`refresh` method.

```js
this.post.find(1)

this.post.refresh()
```
You can also call the `refresh` method to re-retrieve a new model from the API:

```js
this.post.find(1)
// post instance is not using model with id = 2
this.post.refresh(2)
```

If you want to create a fresh (empty declaration) of the model you can call the `fresh` method:

```js
this.post.find(1)
// post.model.id = 1

this.post.fresh()
// post.model.id = undefined
```

## Relationships

You can create `hasOne` and `hasMany` relationships on your model:

```js
import { reactive } from 'vue'
import { Model } from '../../src'
import PostApi from './PostApi'
import { IPost } from './PostInterface'
import UserApi from './UserApi'
import { IUser } from './UserInterface'
import CommentApi from './CommentApi'
import { IComment } from './CommentInterface'

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
        comments: undefined as IComment[],
    } as IPost)

    constructor(post?: IPost) {
        super()
        this.factory(post)
        super.initValidations()
    }
    
    async author(): Promise<IUser>
    {
        return await this.hasOne(UserApi, this.model.author_id)
    }
    
    async comments(): Promise<IComment[]>
    {
        return await this.hasMany(CommentApi, 'id', this.model.id)
    }
}

```

### Has One Relationship

On a `hasOne` relationship, the first parameter is the `Api` Class
of your relationship, and the second parameter is the `foreign key`
on your relationship model

```js
async author(): Promise<IUser>
{
    return await this.hasOne(UserApi, this.model.author_id)
}
```

### Has Many Relationship

On a `hasMany` relationship, the first parameter is the `Api` Class
of your relationship. Second parameter is the `primary key` on the 
relationship model. The third parameter is the `foreign key` on your relationship model

```js
async comments(): Promise<IComment[]>
{
    return await this.hasMany(CommentApi, 'id', this.model.id)
}
```

::: tip
The inverse relationships methods are not available but can be
abstracted using the same `hasOne` and `hasMany` methods.
:::

### Eager Loading

The relationships can be 'eager loaded' by passing the `with` method
while creating the model instance:

```js
this.posts.with(['author', 'comments']).find(1)
```

### Lazy Loading

The relationships can be 'lazy loaded' by calling the `load` method
after the model has been instantiated:

```js
this.posts.load(['author', 'comments'])
```

## Validation
`Vue Eloquent` uses [Vuelidate](https://vuelidate-next.netlify.app/) which is a great model validation library for 
Vue.
You need to define the validation rules in your Model class:
```js{1,22,25-34}
import { required } from '@vuelidate/validators'
import { Model } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import { IPost } from 'PostInterface'
import { computed, reactive } from 'vue'

export default class Post extends Model {
  protected api = PostApi

  public model = reactive({
    id: undefined,
    title: undefined,
    description: undefined,
    created_at: undefined,
    deleted_at: undefined,
    updated_at: undefined,
  } as IPost)

  constructor(post?: IPost){
    super()
    this.factory(post)
    super.initValidations()
  }

  protected validations = computed(() => ({
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
Note the `validations` property is a computed property
:::

You then need to initialize the validations in your component.
From there on you can access your `Vuelidate` model through `this.post.$model`

```js{3-6,11,16,20,24-25}
<template>
    <div>
        <q-input v-model='post.model.id' label='ID' />
        <q-input v-model='post.model.title' label='Title' />
        <q-input v-model='post.model.description' label='Description' />
        <q-btn label='Submit' @click='onSubmit />
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
  created() {
    this.model.initValidations()
  },
  methods: {
    async onSubmit() {
        this.post.$validate()
        if (this.post.$invalid) return
        
        const { actioned, model } = await this.post.save()
        // Do something here, e.g: emit the value to a parent component
        // this.$emit(actioned, model)
        // actioned = 'created' or 'updated'
    }
  }
})
</script>
```

### Validation messages
```js{7-8,13-14}
<template>
    <div>
        <q-input v-model='post.model.id' label='ID' />
        <q-input 
            v-model='post.model.title' 
            label='Title' 
            :error='post.$model.title.$error' 
            :error-message='post.$model.title.$errors[0]'
        />
        <q-input 
            v-model='post.model.description' 
            label='Description'
            :error='post.$model.description.$error' 
            :error-message='post.$model.description.$errors[0]'
        />
        <q-btn label='Submit' @click='onSubmit />
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

```js
state: {
    isLoading: boolean,
    isSucess: boolean,
    isError: boolean
}
```

```js{16}
<template>
    <div>
        <q-input v-model='post.model.id' label='ID' />
        <q-input 
            v-model='post.model.title' 
            label='Title' 
            :error='post.$model.title.$error' 
            :error-message='post.$model.title.$errorMessage'
        />
        <q-input 
            v-model='post.model.description' 
            label='Description'
            :error='post.$model.description.$error' 
            :error-message='post.$model.description.$errorMessage'
        />
        <q-btn label='Submit' @click='onSubmit :loading='post.state.isLoading'/>
    </div>
</template>
```

## Observers
Similarly to the API class, the Model also has Observers:

**Find**: `retriving` and `retrieved`

**Update**: `updating` and `updated`

**Create**: `storing` and `stored`

**Delete**: `deleting` and `deleted`

Those are good placeholders for displaying error messages to the user, or passing values to the Store

::: tip
The `save` method will trigger the `Create` or `Update` observers accordingly
:::
