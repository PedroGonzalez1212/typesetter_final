<?php
/*
 * SMTP settings for the contact form.
 * Copy this file to config.php (same folder) and fill in the real values.
 * config.php is ignored by git and blocked from web access by .htaccess.
 */
return [
    'smtp' => [
        'host'       => 'mail.thetypesetter.com.ar',
        'port'       => 465,          // 465 = SSL/SMTPS, 587 = STARTTLS
        'encryption' => 'ssl',        // 'ssl' (port 465) or 'tls' (port 587)
        'username'   => 'no-reply@thetypesetter.com.ar',
        'password'   => 'CHANGE_ME',
    ],

    'mail' => [
        'from_email' => 'no-reply@thetypesetter.com.ar',
        'from_name'  => 'The Typesetter website',
        'to_email'   => 'hello@thetypesetter.com.ar',
        'to_name'    => 'The Typesetter',
        'subject'    => 'New contact form message',
    ],

    // Set to true only while debugging: errors get logged with SMTP detail.
    'debug' => false,
];
