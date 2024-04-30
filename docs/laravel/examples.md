# Examples

## Usage

### Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Konnec\VueEloquentApi\Filters\WhereEqual;
use Konnec\VueEloquentApi\Traits\EloquentApi;

class Post extends Model
{
    use HasFactory;
    use EloquentApi;

    protected array $protected = [
        'created_at',
        'updated_at',
    ];

    protected array $filters = [
        'author_id' => WhereEqual::class,
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function readers(): HasMany
    {
        return $this->hasMany(User::class, 'id', 'readers_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

### Routes

```php
<?php

use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::batch('posts', PostController::class);
Route::apiResource('posts', PostController::class);
```

### Controller

```php
<?php

namespace App\Http\Controllers;

use Konnec\VueEloquentApi\Traits\HasBatchActions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Post;

class PostController extends Controller
{
    use HasBatchActions;

    public function index(Request $request): JsonResponse
    {
        $result = Post::apiQuery($request);

        return response()->index($result);
    }

    public function store(Request $request): JsonResponse
    {
        $post = Post::create($request->all());

        return response()->store($post);
    }

    public function show(Post $post): JsonResponse
    {
        return response()->show($post);
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        $post->fill($request->all())->save();

        return response()->update($post);
    }


    public function destroy(Post $post): array
    {
        $post->delete();

        return response()->destroy($post);
    }
}
```
