<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailNotification extends Notification
{
    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $id        = $notifiable->getKey();
        $hash      = sha1($notifiable->email);
        $expires   = now()->addMinutes(60)->timestamp;
        $signature = hash_hmac('sha256', "{$id}|{$hash}|{$expires}", config('app.key'));
        $frontend  = config('app.frontend_url', 'http://localhost:5173');
        $url       = "{$frontend}/verify-email?id={$id}&hash={$hash}&expires={$expires}&signature={$signature}";

        return (new MailMessage)
            ->subject('Confirmez votre adresse email — Digital Card Platform')
            ->greeting('Bienvenue sur Digital Card Platform !')
            ->line('Confirmez votre adresse email pour activer votre compte.')
            ->action('Confirmer mon email', $url)
            ->line('Ce lien expire dans 60 minutes.')
            ->line("Si vous n'avez pas créé de compte, ignorez cet email.");
    }
}
