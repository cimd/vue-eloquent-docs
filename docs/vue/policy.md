# Policy

`Policy` classes are simple ways to define user authorization rules for models for their application.

## Define Model Policy

```ts{1,25,30-39}
import { required } from '@vuelidate/validators'
import { Model, Policy } from '@konnec/vue-eloquent'
import PostApi from './PostApi'
import { IPost } from 'PostInterface'
import { computed, reactive } from 'vue'

export default class Post extends Model {
  protected api = PostApi
  
  // Policy
  $acl: Policy

  model = reactive({
    id: undefined,
    title: undefined,
    description: undefined,
    created_at: undefined,
    deleted_at: undefined,
    updated_at: undefined,
  } as IPost)

  constructor(post?: IPost){
    super()
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
        })
    }
```

## Available Methods
### Set
You can update the permissions with the `set` method:
```ts
// Using the Post method above as an example:
const post = new Post()
post.$acl.set({ update: false })
```

### Can
Check if the user can perform any of the CRUD methods:

```ts
// Using the Post method above as an example:
const post = new Post()
post.$acl.set({ update: false })

console.log(post.$acl.can('update'))
false
```

### Cannot
The inverse of the Can method:

```ts
// Using the Post method above as an example:
const post = new Post()
post.$acl.set({ update: false })

console.log(post.$acl.canno('update'))
true
```
