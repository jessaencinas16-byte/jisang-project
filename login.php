<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($body['email'] ?? '');
$pass  = (string) ($body['pass'] ?? '');

if ($email === '' || $pass === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, name, email, pass, role, color FROM users WHERE LOWER(email) = LOWER(?)");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    $valid = false;
    if ($user) {
        $stored = $user['pass'];
        $isHashed = str_starts_with($stored, '$2y$') || str_starts_with($stored, '$2a$') || str_starts_with($stored, '$2b$');
        if ($isHashed) {
            $valid = password_verify($pass, $stored);
        } else {
            
            $valid = hash_equals($stored, $pass);
            if ($valid) {
                $upd = $pdo->prepare("UPDATE users SET pass = ? WHERE id = ?");
                $upd->execute([password_hash($pass, PASSWORD_DEFAULT), $user['id']]);
            }
        }
    }

    if (!$valid) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        exit;
    }

    unset($user['pass']); 

    
    
    session_regenerate_id(true);
    $_SESSION['user'] = $user;
    logActivity($pdo, 'Logged in', $user['role']);

    echo json_encode($user);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Login failed', 'details' => $e->getMessage()]);
}
