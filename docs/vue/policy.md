# Policy

`Policy` classes are simple ways to define user authorization rules for models for their application. A `Policy` 
holds the **permissions** the user has (create, read, update and delete), and the **action** the user is currently 
performing.

## Define Model Policy

The `Model` does not have a policy by default; create it as a property of your model:

```ts{2,10-11,23-28}
import { required } from '@vuelidate/validators'
import { Model, Policy } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import type { IPost } from './PostInterface'
import { computed, reactive } from 'vue'

export default class Post extends Model<IPost> {
  override api = PostApi
  
  // Policy
  $acl: Policy

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
    super.initValidations()
    
    this.$acl = new Policy({
      create: true,
      read: true,
      update: true,
      delete: false
    })
  }
}
```

::: warning
Always pass all four permissions. When you create a `Policy` **without** arguments every permission is `true`, 
but any permission omitted from the arguments of the constructor, or from `set()`, is set to `false`.
:::

::: tip
For more advanced use cases, check [CASL](https://casl.js.org/v6/en/). Use can also use the Policy classes 
with CASL.
:::

```ts
    //Example Using CASL
    import { useAbility } from '@casl/vue'
    import { subject } from '@casl/ability'

    constructor()
    {
        super()
        super.initValidations()
    
        const { can } = useAbility()
        this.$acl = new Policy({
            create: can('create', 'Post'),
            read: can('read', 'Post'),
            update: can('update', subject('Post', this.model)),
            delete: can('delete', subject('Post', this.model)),
        })
    }
```

You can also extend the `Policy` class to share the rules across your application:

```ts
import { Policy } from '@konnec/vue-eloquent'

export default class Acl extends Policy {
  constructor(acl?: any) {
    super(acl)
  }
}
```

## Available Methods
### Set
You can update the permissions with the `set` method. Pass all the permissions:
```ts
// Using the Post method above as an example:
const post = new Post()
post.$acl.set({ create: true, read: true, update: false, delete: false })
```

### Can
Check if the user can perform any of the CRUD actions, using the `Action` enum:

```ts
import { Action } from '@konnec/vue-eloquent'

// Using the Post method above as an example:
const post = new Post()
post.$acl.set({ create: true, read: true, update: false, delete: false })

console.log(post.$acl.can(Action.UPDATE))
false
```

### Cannot
The inverse of the Can method:

```ts
console.log(post.$acl.cannot(Action.UPDATE))
true
```

## Action Mode

The policy also keeps track of the action being performed on the model, which you can use to switch your 
forms between creating, reading, updating and deleting. The methods `creating()`, `reading()`, `updating()` and 
`deleting()` change the mode if the user has the respective permission, and return `false` if they don't:

```ts
const post = new Post()

if (post.$acl.updating()) {
  // The user is allowed to update, and the policy is now in `update` mode
}

post.$acl.isUpdating() // true
post.$acl.isReading()  // false
post.$acl.isCreating() // false
post.$acl.isDeleting() // false

// The current action is also available from the `action` property
post.$acl.action // Action.UPDATE
```

The `action` is reactive, so you can use it in your templates:

```vue
<q-input v-model="post.model.title" :readonly="post.$acl.isReading()" />
<q-btn v-if="post.$acl.can(Action.DELETE)" label="Delete" @click="post.delete()" />
```

::: info
The default action is `Action.CREATE`. The `edit()` and `isReadOnly()` methods are deprecated. Use `updating()` and 
`isReading()` instead.
:::
