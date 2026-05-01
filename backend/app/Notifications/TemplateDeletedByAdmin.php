<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class TemplateDeletedByAdmin extends Notification
{
    public function __construct(private string $name) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'template_deleted',
            'templateName' => $this->name,
            'message'      => "L'administrateur a supprimé votre modèle \"{$this->name}\".",
        ];
    }
}
