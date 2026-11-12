<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
requireAuth(); 
if ($method !== 'GET') {
    
    
    requirePermission('menu');
}



function categoryId(PDO $pdo, string $name): int {
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE name = ?");
    $stmt->execute([$name]);
    $row = $stmt->fetch();
    if ($row) return (int) $row['id'];
    $max = (int) $pdo->query("SELECT COALESCE(MAX(sort_order),0) FROM categories")->fetchColumn();
    $ins = $pdo->prepare("INSERT INTO categories (name, sort_order) VALUES (?, ?)");
    $ins->execute([$name, $max + 1]);
    return (int) $pdo->lastInsertId();
}

try {
    if ($method === 'GET') {
        $products = $pdo->query("
            SELECT p.id, c.name AS cat, p.name, p.base_price AS price,
                   p.emoji, p.img_url AS img, p.is_popular AS popular,
                   p.is_new AS `new`, p.is_available AS available, p.description AS `desc`
            FROM products p
            JOIN categories c ON c.id = p.category_id
            ORDER BY c.sort_order, p.id
        ")->fetchAll();

        $sizeRows = $pdo->query("SELECT product_id, size_key, price FROM product_sizes")->fetchAll();
        $sizesByProduct = [];
        foreach ($sizeRows as $row) {
            $sizesByProduct[$row['product_id']][$row['size_key']] = (float) $row['price'];
        }

        $result = array_map(function ($p) use ($sizesByProduct) {
            return [
                'id'         => 'p' . $p['id'],
                'cat'        => $p['cat'],
                'name'       => $p['name'],
                'price'      => (float) $p['price'],
                'sizePrices' => $sizesByProduct[$p['id']] ?? null,
                'emoji'      => $p['emoji'],
                'img'        => $p['img'],
                'popular'    => (bool) $p['popular'],
                'new'        => (bool) $p['new'],
                'available'  => (bool) $p['available'],
                'desc'       => $p['desc'],
            ];
        }, $products);

        echo json_encode($result);
        exit;
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    if ($method === 'POST') {
        $catId = categoryId($pdo, $body['cat'] ?? 'Coffee');
        $name = trim($body['name'] ?? '');
        $price = (float) ($body['price'] ?? 0);
        if ($name === '' || mb_strlen($name) < 2) {
            http_response_code(400);
            echo json_encode(['error' => 'Product name must be at least 2 characters']);
            exit;
        }
        if ($price <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Price must be greater than 0']);
            exit;
        }
        $stmt = $pdo->prepare("
            INSERT INTO products (category_id, name, base_price, emoji, img_url, is_popular, is_new, is_available, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $catId,
            $body['name'] ?? '',
            (float) ($body['price'] ?? 0),
            $body['emoji'] ?? '☕',
            $body['img'] ?? null,
            !empty($body['popular']) ? 1 : 0,
            !empty($body['new']) ? 1 : 0,
            array_key_exists('available', $body) ? (!empty($body['available']) ? 1 : 0) : 1,
            $body['desc'] ?? '',
        ]);
        $newId = (int) $pdo->lastInsertId();
        logActivity($pdo, 'Created product', ($body['name'] ?? '') . ' (p' . $newId . ')');

        echo json_encode([
            'id' => 'p' . $newId, 'cat' => $body['cat'] ?? 'Coffee', 'name' => $body['name'] ?? '',
            'price' => (float) ($body['price'] ?? 0), 'sizePrices' => null, 'emoji' => $body['emoji'] ?? '☕',
            'img' => $body['img'] ?? null, 'popular' => !empty($body['popular']), 'new' => !empty($body['new']),
            'available' => array_key_exists('available', $body) ? !empty($body['available']) : true,
            'desc' => $body['desc'] ?? '',
        ]);
        exit;
    }

    if ($method === 'PUT') {
        $rawId = (string) ($body['id'] ?? '');
        $id = (int) preg_replace('/^p/', '', $rawId); 
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing or invalid id']); exit; }

        $name = trim($body['name'] ?? '');
        $price = (float) ($body['price'] ?? 0);
        if ($name === '' || mb_strlen($name) < 2) {
            http_response_code(400);
            echo json_encode(['error' => 'Product name must be at least 2 characters']);
            exit;
        }
        if ($price <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Price must be greater than 0']);
            exit;
        }

        $catId = categoryId($pdo, $body['cat'] ?? 'Coffee');
        $stmt = $pdo->prepare("
            UPDATE products SET category_id=?, name=?, base_price=?, emoji=?, img_url=?,
                   is_popular=?, is_new=?, is_available=?, description=?
            WHERE id=?
        ");
        $stmt->execute([
            $catId,
            $body['name'] ?? '',
            (float) ($body['price'] ?? 0),
            $body['emoji'] ?? '☕',
            $body['img'] ?? null,
            !empty($body['popular']) ? 1 : 0,
            !empty($body['new']) ? 1 : 0,
            array_key_exists('available', $body) ? (!empty($body['available']) ? 1 : 0) : 1,
            $body['desc'] ?? '',
            $id,
        ]);
        logActivity($pdo, 'Updated product', ($body['name'] ?? '') . " ($rawId)");
        echo json_encode(['success' => true, 'id' => $rawId]);
        exit;
    }

    if ($method === 'DELETE') {
        $rawId = (string) ($_GET['id'] ?? '');
        $id = (int) preg_replace('/^p/', '', $rawId);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing or invalid id']); exit; }
        $stmt = $pdo->prepare("DELETE FROM products WHERE id=?");
        $stmt->execute([$id]);
        logActivity($pdo, 'Deleted product', $rawId);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Products request failed', 'details' => $e->getMessage()]);
}
