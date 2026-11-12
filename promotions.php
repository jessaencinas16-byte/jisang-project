<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
requireAuth(); 
if ($method !== 'GET') {
    
    
    requirePermission('promotions');
}

try {
    if ($method === 'GET') {
        $rows = $pdo->query("SELECT * FROM promotions ORDER BY name")->fetchAll();
        $result = array_map(function ($p) {
            return [
                'id'       => $p['id'],
                'name'     => $p['name'],
                'type'     => $p['type'],
                'desc'     => $p['description'],
                'code'     => $p['code'],
                'status'   => $p['status'],
                'discount' => (float) $p['discount'],
                'applies'  => $p['applies'],
            ];
        }, $rows);
        echo json_encode($result);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $name = trim($body['name'] ?? '');
        $discount = (float) ($body['discount'] ?? 0);
        if ($name === '' || mb_strlen($name) < 2) {
            http_response_code(400);
            echo json_encode(['error' => 'Promotion name must be at least 2 characters']);
            exit;
        }
        if ($discount <= 0 || $discount > 100) {
            http_response_code(400);
            echo json_encode(['error' => 'Discount must be between 1 and 100']);
            exit;
        }
        $id = nextId($pdo, 'promotions', 'pr');
        $stmt = $pdo->prepare("
            INSERT INTO promotions (id, name, type, description, code, status, discount, applies)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $body['name'],
            $body['type'] ?? null,
            $body['desc'] ?? '',
            $body['code'] ?? 'PROMO',
            $body['status'] ?? 'Active',
            $body['discount'] ?? 0,
            $body['applies'] ?? 'all',
        ]);
        logActivity($pdo, 'Created promotion', ($body['name'] ?? '') . " ($id)");
        echo json_encode([
            'id' => $id, 'name' => $body['name'], 'type' => $body['type'] ?? null,
            'desc' => $body['desc'] ?? '', 'code' => $body['code'] ?? 'PROMO',
            'status' => $body['status'] ?? 'Active', 'discount' => (float) ($body['discount'] ?? 0),
            'applies' => $body['applies'] ?? 'all',
        ]);
        exit;
    }

    if ($method === 'PUT') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (empty($body['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Promotion id is required']);
            exit;
        }
        $current = $pdo->prepare("SELECT * FROM promotions WHERE id = ?");
        $current->execute([$body['id']]);
        $existing = $current->fetch();
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Promotion not found']);
            exit;
        }
        $stmt = $pdo->prepare("
            UPDATE promotions
            SET name = ?, type = ?, description = ?, code = ?, status = ?, discount = ?, applies = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $body['name']     ?? $existing['name'],
            $body['type']     ?? $existing['type'],
            $body['desc']     ?? $existing['description'],
            $body['code']     ?? $existing['code'],
            $body['status']   ?? $existing['status'],
            $body['discount'] ?? $existing['discount'],
            $body['applies']  ?? $existing['applies'],
            $body['id'],
        ]);
        $statusChanged = isset($body['status']) && $body['status'] !== $existing['status'];
        logActivity($pdo, $statusChanged ? 'Toggled promotion status' : 'Updated promotion',
            $existing['name'] . ($statusChanged ? " → {$body['status']}" : ''));
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Promotion id is required']);
            exit;
        }
        $existing = $pdo->prepare("SELECT name FROM promotions WHERE id = ?");
        $existing->execute([$id]);
        $p = $existing->fetch();
        $stmt = $pdo->prepare("DELETE FROM promotions WHERE id = ?");
        $stmt->execute([$id]);
        logActivity($pdo, 'Deleted promotion', $p ? $p['name'] : $id);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Promotion request failed', 'details' => $e->getMessage()]);
}
