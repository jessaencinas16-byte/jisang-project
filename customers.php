<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
requireAuth(); 
if ($method !== 'GET') {
    
    
    requirePermission('customers');
}

try {
    if ($method === 'GET') {
        $rows = $pdo->query("SELECT * FROM customers ORDER BY name")->fetchAll();
        $result = array_map(function ($c) {
            return [
                'id'       => $c['id'],
                'name'     => $c['name'],
                'phone'    => $c['phone'],
                'email'    => $c['email'],
                'points'   => (int) $c['points'],
                'level'    => $c['level'],
                'favorite' => $c['favorite'],
                'visits'   => (int) $c['visits'],
                'spent'    => (float) $c['spent'],
            ];
        }, $rows);
        echo json_encode($result);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $name = trim($body['name'] ?? '');
        if ($name === '' || mb_strlen($name) < 2) {
            http_response_code(400);
            echo json_encode(['error' => 'Customer name must be at least 2 characters']);
            exit;
        }
        if (!empty($body['email']) && !filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Please enter a valid email address']);
            exit;
        }
        $id = nextId($pdo, 'customers', 'c');
        $stmt = $pdo->prepare("
            INSERT INTO customers (id, name, phone, email, points, level, favorite, visits, spent)
            VALUES (?, ?, ?, ?, 0, 'Member', ?, 0, 0)
        ");
        $stmt->execute([
            $id,
            $body['name'],
            $body['phone'] ?? '',
            $body['email'] ?? '',
            $body['favorite'] ?? '—',
        ]);
        logActivity($pdo, 'Added customer', ($body['name'] ?? '') . " ($id)");
        echo json_encode([
            'id' => $id, 'name' => $body['name'], 'phone' => $body['phone'] ?? '',
            'email' => $body['email'] ?? '', 'points' => 0, 'level' => 'Member',
            'favorite' => $body['favorite'] ?? '—', 'visits' => 0, 'spent' => 0,
        ]);
        exit;
    }

    if ($method === 'PUT') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (empty($body['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Customer id is required']);
            exit;
        }
        $stmt = $pdo->prepare("
            UPDATE customers
            SET name = ?, phone = ?, email = ?, favorite = ?,
                points = ?, level = ?, visits = ?, spent = ?
            WHERE id = ?
        ");
        
        
        $current = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
        $current->execute([$body['id']]);
        $existing = $current->fetch();
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Customer not found']);
            exit;
        }
        $stmt->execute([
            $body['name']     ?? $existing['name'],
            $body['phone']    ?? $existing['phone'],
            $body['email']    ?? $existing['email'],
            $body['favorite'] ?? $existing['favorite'],
            $body['points']   ?? $existing['points'],
            $body['level']    ?? $existing['level'],
            $body['visits']   ?? $existing['visits'],
            $body['spent']    ?? $existing['spent'],
            $body['id'],
        ]);
        $loyaltyOnly = isset($body['points']) || isset($body['level']) || isset($body['visits']) || isset($body['spent']);
        logActivity($pdo, $loyaltyOnly ? 'Updated loyalty points' : 'Updated customer', $existing['name'] . " ({$body['id']})");
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Customer request failed', 'details' => $e->getMessage()]);
}
