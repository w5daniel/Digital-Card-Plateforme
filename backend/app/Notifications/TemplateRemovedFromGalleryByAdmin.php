<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class TemplateRemovedFromGalleryByAdmin extends Notification
{
    public function __construct(private string $name) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'template_removed_from_gallery',
            'templateName' => $this->name,
            'message'      => "L'administrateur a retiré votre modèle \"{$this->name}\" de la galerie communauté.",
        ];
    }
}
