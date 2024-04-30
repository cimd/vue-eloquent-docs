# Model

## EloquentApi Trait
You should use the `EloquentApi` trait on your model:

**Example**

```php{6,10}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Konnec\VueEloquentApi\Traits\EloquentApi;

class Post extends Model
{
    use EloquentApi;
}
```

## Filters
Filters allows you to query data through the API. You can define which attributes
can be filtered, and how it can be filtered.

To get started, create a `$filter` property and extend the required filters:

```php{13-15}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Konnec\VueEloquentApi\Filters\WhereEqual;
use Konnec\VueEloquentApi\Traits\EloquentApi;

class Post extends Model
{
    use EloquentApi;

    protected array $filters = [
        'author_id' => WhereEqual::class,
    ];
}
```

In the example above, we are enabling the `author_id` property of the `Post` model to be filtered by an equality operator:
```sql
select * from posts where author_id=?
```

### Available Filters

`WhereIn` Enables a filter by a range of values
```sql
select * from posts where author_id in (1,2)
```

`WhereLike` Enables a filter by a range of values
```sql
select * from posts where title like %Tech%
```

### Custom Filters
You can create your own custom filters by extending the `Filter` interface.
The example below allows you to filter through the `Posts` Author relationship where all `authors` in id range

```php{6,8}
<?php

namespace App\Models\Filters;

use Illuminate\Database\Eloquent\Builder;
use Konnec\VueEloquentApi\Filters\Filter;

class WhereHasAuthorIn implements Filter
{
    public function __construct(
        private readonly Builder $query,
        private readonly string $key,
        private readonly array $value
    ) {
    }

    public function handle(): Builder
    {
        return $this->query->whereHas('author', function ($q) {
            $q->whereIn($this->key, $this->value);
        });
    }
}
```

Then you would call out this filter in your model like this:

```php
    protected array $filters = [
        'author' => WhereHasAuthorIn::class,
    ];
```
