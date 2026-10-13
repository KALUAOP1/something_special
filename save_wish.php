<?php
/**
 * Secret Wish Recorder - Appends secret birthday wishes to README_SECRET_WISHES.md
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || empty($data['wish'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Wish cannot be empty']);
    exit;
}

$wish = trim($data['wish']);
$date = isset($data['date']) ? trim($data['date']) : date('d M Y, h:i A');
$author = isset($data['author']) ? trim($data['author']) : 'Friend';

// Sanitize display text to avoid broken markdown
$cleanWish = htmlspecialchars($wish, ENT_QUOTES, 'UTF-8');
$cleanAuthor = htmlspecialchars($author, ENT_QUOTES, 'UTF-8');

$entry = "\n### 💖 Wish Received on {$date}\n";
$entry .= "- **From**: {$cleanAuthor}\n";
$entry .= "- **Wish**: *\"{$cleanWish}\"*\n";
$entry .= "---\n";

$targetFile = __DIR__ . '/README_SECRET_WISHES.md';
file_put_contents($targetFile, $entry, FILE_APPEND | LOCK_EX);

// Also append to a backup text file
$backupFile = __DIR__ . '/assets/secret_wishes.txt';
@file_put_contents($backupFile, "[{$date}] ({$cleanAuthor}): {$cleanWish}\n", FILE_APPEND | LOCK_EX);

echo json_encode([
    'success' => true,
    'message' => 'Wish successfully saved in README_SECRET_WISHES.md'
]);
