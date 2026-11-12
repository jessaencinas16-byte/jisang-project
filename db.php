<?php
if (session_status() === PHP_SESSION_NONE) {
    
    
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

require_once __DIR__ . '/auth.php';



$DB_HOST = 'localhost';
$DB_NAME = 'brewpos';   
$DB_USER = 'root';
$DB_PASS = '';          
$DB_CHARSET = 'utf8mb4';

$dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,         
    PDO::ATTR_EMULATE_PREPARES   => false,                    
];






function nextId(PDO $pdo, string $table, string $prefix): string {
    $stmt = $pdo->prepare("SELECT id FROM `$table` WHERE id LIKE ?");
    $stmt->execute([$prefix . '%']);
    $max = 0;
    foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $id) {
        $n = (int) substr($id, strlen($prefix));
        if ($n > $max) $max = $n;
    }
    return $prefix . ($max + 1);
}

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    
    
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Database connection failed',
        'details' => $e->getMessage(),
        'hint' => 'Check that MySQL is running in the XAMPP control panel, and that the "brewpos" database was imported.'
    ]);
    exit;
}
