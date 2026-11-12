<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
requireAuth(); 
if ($method !== 'GET') {
    
    
    requirePermission('inventory');
}

try {
    if ($method === 'GET') {
        $rows = $pdo->query("SELECT * FROM inventory ORDER BY name")->fetchAll();
        $result = array_map(function ($i) {
            return [
                'id'       => $i['id'],
                'name'     => $i['name'],
                'category' => $i['category'],
                'stock'    => (float) $i['stock'],
                'min'      => (float) $i['min'],
                'unit'     => $i['unit'],
                'expiry'   => $i['expiry'] ?? '—',
                'supplier' => $i['supplier'],
                'cost'     => (float) $i['cost'],
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
            echo json_encode(['error' => 'Ingredient name must be at least 2 characters']);
            exit;
        }
        if ((float) ($body['stock'] ?? 0) < 0 || (float) ($body['min'] ?? 0) < 0 || (float) ($body['cost'] ?? 0) < 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Stock, minimum, and cost cannot be negative']);
            exit;
        }
        $id = nextId($pdo, 'inventory', 'i');
        $expiry = (!empty($body['expiry']) && $body['expiry'] !== '—') ? $body['expiry'] : null;
        $stmt = $pdo->prepare("
            INSERT INTO inventory (id, name, category, stock, min, unit, expiry, supplier, cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $id,
            $body['name'],
            $body['category'] ?? 'Pantry',
            $body['stock'] ?? 0,
            $body['min'] ?? 0,
            $body['unit'] ?? '',
            $expiry,
            $body['supplier'] ?? '—',
            $body['cost'] ?? 0,
        ]);
        logActivity($pdo, 'Added ingredient', ($body['name'] ?? '') . " ($id)");
        echo json_encode([
            'id' => $id, 'name' => $body['name'], 'category' => $body['category'] ?? 'Pantry',
            'stock' => (float) ($body['stock'] ?? 0), 'min' => (float) ($body['min'] ?? 0),
            'unit' => $body['unit'] ?? '', 'expiry' => $expiry ?? '—',
            'supplier' => $body['supplier'] ?? '—', 'cost' => (float) ($body['cost'] ?? 0),
        ]);
        exit;
    }

    if ($method === 'PUT') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (empty($body['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Ingredient id is required']);
            exit;
        }
        if ((array_key_exists('stock', $body) && (float) $body['stock'] < 0)
            || (array_key_exists('min', $body) && (float) $body['min'] < 0)
            || (array_key_exists('cost', $body) && (float) $body['cost'] < 0)) {
            http_response_code(400);
            echo json_encode(['error' => 'Stock, minimum, and cost cannot be negative']);
            exit;
        }
        $current = $pdo->prepare("SELECT * FROM inventory WHERE id = ?");
        $current->execute([$body['id']]);
        $existing = $current->fetch();
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Ingredient not found']);
            exit;
        }
        $expiry = array_key_exists('expiry', $body)
            ? ((!empty($body['expiry']) && $body['expiry'] !== '—') ? $body['expiry'] : null)
            : $existing['expiry'];
        $stmt = $pdo->prepare("
            UPDATE inventory
            SET name = ?, category = ?, stock = ?, min = ?, unit = ?, expiry = ?, supplier = ?, cost = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $body['name']     ?? $existing['name'],
            $body['category'] ?? $existing['category'],
            $body['stock']    ?? $existing['stock'],
            $body['min']      ?? $existing['min'],
            $body['unit']     ?? $existing['unit'],
            $expiry,
            $body['supplier'] ?? $existing['supplier'],
            $body['cost']     ?? $existing['cost'],
            $body['id'],
        ]);
        if (array_key_exists('stock', $body) && (float) $body['stock'] > (float) $existing['stock']) {
            $delta = (float) $body['stock'] - (float) $existing['stock'];
            logActivity($pdo, 'Stock In', "{$existing['name']}: +{$delta} {$existing['unit']} (now {$body['stock']})");
        } else {
            logActivity($pdo, 'Updated ingredient', $existing['name'] . " ({$body['id']})");
        }
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Inventory request failed', 'details' => $e->getMessage()]);
}
