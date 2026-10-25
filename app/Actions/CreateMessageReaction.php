<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final readonly class CreateMessageReaction
{
    public function __construct(private UpdateMessageReactionsVersion $updateMessageReactionsVersion)
    {
        //
    }

    /**
     * Inserted unless already there, so reacting twice with the same emoji leaves one reaction.
     *
     * The request checks the cap before this runs, but reactions sent at the same moment each see the others missing.
     * So the message is locked and the cap counted again here: a reaction past it changes nothing.
     */
    public function handle(User $user, Message $message, string $emoji): void
    {
        DB::transaction(function () use ($user, $message, $emoji): void {
            Message::query()->whereKey($message->id)->lockForUpdate()->first();

            $reacted = MessageReaction::query()
                ->where('message_id', $message->id)
                ->where('user_id', $user->id)
                ->pluck('emoji');

            if ($reacted->count() >= MessageReaction::MAX_PER_MESSAGE && $reacted->doesntContain($emoji)) {
                return;
            }

            $inserted = MessageReaction::query()->insertOrIgnore([
                'message_id' => $message->id,
                'user_id' => $user->id,
                'emoji' => $emoji,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($inserted > 0) {
                $this->updateMessageReactionsVersion->handle($message);
            }
        });
    }
}
