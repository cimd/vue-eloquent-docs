# Controller

In your `PostController` you need to add the `apiQuery` scope and pass the `$request` to it.

```php{13}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Post;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $result = Post::apiQuery($request);

        return response()->json(['data' => $result]);
    }   
}
```

## Response Macros
The vue package expects the responses to be inside a `data` object. 
```php
return response()->json(['data' => $result]);
```
To help with that, you can
use the `Response Macros` below.
```php
response()->index($posts);    //or response()->json(['data' => $posts, 200);
response()->show($posts);     //or response()->json(['data' => $posts, 200);
response()->store($posts);    //or response()->json(['data' => $posts, 201);
response()->update($posts);   //or response()->json(['data' => $posts, 200);
response()->destroy($posts);  //or response()->json(['data' => $posts, 200);

```

## Mass Assignments

If you're going to use mass assignments, you need to create its routes first. The package
comes with a route macro `batch` helper:

```php{1,5-7}
Route::batch('posts', PostController::class);
Route::apiResource('posts', PostController::class);

// which is equivalent to
Route::post('posts/batch', [PostController::class, 'storeBatch']);
Route::patch('posts/batch', [PostController::class, 'updateBatch']);
Route::patch('posts/batch-destroy', [PostController::class, 'destroyBatch']);
Route::apiResource('posts', PostController::class);
```

::: warning
Note the `batch-destroy` endpoint is using a `PATCH` request and not `DELETE`
:::

And then you have to create your controller methods like this:

```php {5,13,19,26,31,38,46}
<?php

namespace Konnec\VueEloquentApi\Controllers;

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
