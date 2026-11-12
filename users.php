<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];


requirePermission('users');

try {
    if ($method === 'GET') {
        $rows = $pdo->query("SELECT id, name, email, role, color FROM users ORDER BY name")->fetchAll();
        echo json_encode($rows);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        if ($name === '' || $email === '') {
            http_response_code(400);
            echo json_encode(['error' => 'User name and email are required']);
            exit;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Please enter a valid email address']);
            exit;
        }
        $dupe = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)");
        $dupe->execute([$email]);
        if ($dupe->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'A staff account with that email already exists']);
            exit;
        }
        $id = nextId($pdo, 'users', 'u');
        $stmt = $pdo->prepare("
            INSERT INTO users (id, name, email, pass, role, color)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $body['name'],
            $body['email'],
            password_hash($body['pass'] ?: '1234', PASSWORD_DEFAULT),
            $body['role'] ?? 'Cashier',
            $body['color'] ?? '#6F4E37',
        ]);
        logActivity($pdo, 'Created staff account', ($body['name'] ?? '') . ' — ' . ($body['role'] ?? 'Cashier'));
        echo json_encode([
            'id' => $id, 'name' => $body['name'], 'email' => $body['email'],
            'role' => $body['role'] ?? 'Cashier', 'color' => $body['color'] ?? '#6F4E37',
        ]);
        exit;
    }

    if ($method === 'PUT') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (empty($body['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User id is required']);
            exit;
        }
        $current = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $current->execute([$body['id']]);
        $existing = $current->fetch();
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        
        $newPass = !empty($body['pass']) ? password_hash($body['pass'], PASSWORD_DEFAULT) : $existing['pass'];
        $stmt = $pdo->prepare("
            UPDATE users SET name = ?, email = ?, pass = ?, role = ?, color = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $body['name']  ?? $existing['name'],
            $body['email'] ?? $existing['email'],
            $newPass,
            $body['role']  ?? $existing['role'],
            $body['color'] ?? $existing['color'],
            $body['id'],
        ]);
        $roleChanged = isset($body['role']) && $body['role'] !== $existing['role'];
        $passChanged = !empty($body['pass']);
        $detail = ($body['name'] ?? $existing['name']);
        if ($roleChanged) $detail .= " — role: {$existing['role']} → {$body['role']}";
        if ($passChanged) $detail .= ($roleChanged ? ', ' : ' — ') . 'password reset';
        logActivity($pdo, 'Updated staff account', $detail);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'User id is required']);
            exit;
        }
        $existing = $pdo->prepare("SELECT name, role FROM users WHERE id = ?");
        $existing->execute([$id]);
        $u = $existing->fetch();
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        logActivity($pdo, 'Deleted staff account', $u ? "{$u['name']} ({$u['role']})" : $id);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'User request failed', 'details' => $e->getMessage()]);
}
