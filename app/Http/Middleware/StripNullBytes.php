<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpFoundation\Response;

/**
 * PostgreSQL text cannot hold a NUL byte and the database driver cuts a string at the first one, so whatever was typed
 * after it would be dropped without a word. Taking them out of every input keeps the rest of the text. The raw body
 * a signature covers is left as it was sent.
 */
final readonly class StripNullBytes
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $this->strip($request->query);
        $this->strip($request->isJson() ? $request->json() : $request->request);

        return $next($request);
    }

    private function strip(ParameterBag $inputs): void
    {
        $inputs->replace($this->clean($inputs->all()));
    }

    /**
     * @template TKey of array-key
     *
     * @param  array<TKey, mixed>  $values
     * @return array<TKey, mixed>
     */
    private function clean(array $values): array
    {
        return array_map(fn (mixed $value): mixed => match (true) {
            is_string($value) => str_replace("\0", '', $value),
            is_array($value) => $this->clean($value),
            default => $value,
        }, $values);
    }
}
