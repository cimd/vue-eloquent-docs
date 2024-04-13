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

use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $result = Post::apiQuery($request);

        return response()->json($result);
    }

    public function store(Request $request): array
    {
        $post = Post::create($request->all());

        return [
            'data' => $post->fresh()->toArray(),
        ];
    }

    public function show(Post $post): array
    {
        return [
            'data' => $post->toArray(),
        ];
    }

    public function update(Request $request, Post $post): array
    {
        $post->fill($request->all())->save();

        return [
            'data' => $post->toArray(),
        ];
    }

    public function destroy(Post $post): array
    {
        $post->delete();

        return [
            'data' => $post->toArray(),
        ];
    }
}
```
