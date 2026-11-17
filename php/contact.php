<?php
/*
 * Contact form endpoint.
 * Receives the POST from #contactForm and sends it via SMTP with PHPMailer.
 * Always answers JSON: { "ok": true } or { "ok": false, "error": "..." }.
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function field(string $key, int $maxLen): string
{
    $value = isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : '';
    // quita caracteres de control (deja saltos de línea y tabs)
    $value = preg_replace('/[^\P{C}\n\t]/u', '', $value) ?? '';
    return mb_substr($value, 0, $maxLen);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    error_log('[contact] Missing php/config.php');
    respond(500, ['ok' => false, 'error' => 'The form is not configured yet. Please email us directly.']);
}
$config = require $configFile;

// Honeypot: los humanos no ven este campo; si viene con algo, es un bot.
// Respondemos ok para no darle pistas.
if (field('website', 200) !== '') {
    respond(200, ['ok' => true]);
}

require __DIR__ . '/PHPMailer/Exception.php';
require __DIR__ . '/PHPMailer/PHPMailer.php';
require __DIR__ . '/PHPMailer/SMTP.php';

$name         = field('name', 120);
$email        = field('email', 254);
$company      = field('company', 120);
$message      = field('message', 5000);

// Servicios: checkboxes service[]; solo aceptamos los valores conocidos
$allowedServices = [
    'e-Learning & Video',
    'Brand & Marketing',
    'Digital Accessibility',
    'Content Globalization',
    'Other',
];
$services = isset($_POST['service']) && is_array($_POST['service'])
    ? array_filter($_POST['service'], 'is_string')
    : [];
$services = array_values(array_intersect($allowedServices, $services));

$errors = [];
if ($name === '') {
    $errors['name'] = 'Please enter your name.';
}
if ($email === '' || !PHPMailer::validateAddress($email)) {
    $errors['email'] = 'Please enter a valid e-mail address.';
}
if (!$services) {
    $errors['service'] = "Please choose at least one service you're interested in.";
}
if ($message === '') {
    $errors['message'] = 'Please write a message.';
}
if ($errors) {
    respond(422, ['ok' => false, 'error' => reset($errors), 'fields' => $errors]);
}

$rows = [
    'Name'     => $name,
    'E-mail'   => $email,
    'Company'  => $company,
    'Services' => implode(', ', $services),
];
$body = '';
foreach ($rows as $label => $value) {
    if ($value !== '') {
        $body .= $label . ': ' . $value . "\n";
    }
}
$body .= "\nMessage:\n" . $message . "\n";

$smtp = $config['smtp'];
$mailCfg = $config['mail'];

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = $smtp['host'];
    $mail->Port       = (int) $smtp['port'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtp['username'];
    $mail->Password   = $smtp['password'];
    $mail->SMTPSecure = $smtp['encryption'] === 'tls'
        ? PHPMailer::ENCRYPTION_STARTTLS
        : PHPMailer::ENCRYPTION_SMTPS;
    $mail->Timeout    = 15;
    $mail->CharSet    = PHPMailer::CHARSET_UTF8;

    if (!empty($config['debug'])) {
        $mail->SMTPDebug   = 2;
        $mail->Debugoutput = 'error_log';
    }

    $mail->setFrom($mailCfg['from_email'], $mailCfg['from_name']);
    $mail->addAddress($mailCfg['to_email'], $mailCfg['to_name']);
    $mail->addReplyTo($email, $name);

    $mail->Subject = $mailCfg['subject'] . ' — ' . $name;
    $mail->Body    = $body;
    $mail->isHTML(false);

    $mail->send();
} catch (MailException $e) {
    error_log('[contact] Mail error: ' . $mail->ErrorInfo);
    respond(502, ['ok' => false, 'error' => 'We couldn’t send your message. Please try again or email us directly.']);
}

respond(200, ['ok' => true]);
