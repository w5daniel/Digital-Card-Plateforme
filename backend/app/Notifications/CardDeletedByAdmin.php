<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class CardDeletedByAdmin extends Notification
{
    public function __construct(private string $title) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'      => 'card_deleted',
            'cardTitle' => $this->title,
            'message'   => "L'administrateur a supprimé votre carte \"{$this->title}\".",
        ];
    }
}
