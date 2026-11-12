<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
requireAuth(); 


function adjustInventoryForItems(PDO $pdo, array $items, int $direction): void {
    $catStmt = $pdo->prepare("
        SELECT c.name FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.name = ? LIMIT 1
    ");
    $recipeStmt = $pdo->prepare("SELECT inventory_id, qty_per_unit FROM category_ingredients WHERE category_name = ?");
    $adjustStmt = $pdo->prepare("UPDATE inventory SET stock = GREATEST(0, stock + ?) WHERE id = ?");

    foreach ($items as $item) {
        $itemName = $item['name'] ?? '';
        $itemQty = (int) ($item['qty'] ?? 1);
        if ($itemName === '' || $itemQty <= 0) continue;

        $catStmt->execute([$itemName]);
        $cat = $catStmt->fetchColumn();
        if (!$cat) continue; 

        $recipeStmt->execute([$cat]);
        foreach ($recipeStmt->fetchAll() as $ing) {
            $amount = (float) $ing['qty_per_unit'] * $itemQty * $direction;
            if ($amount == 0) continue;
            $adjustStmt->execute([$amount, $ing['inventory_id']]);
        }
    }
}

try {
    if ($method === 'GET') {
        $orders = $pdo->query("
            SELECT id, qnum, customer_name AS customer, type, status, total, payment,
                   cashier, order_time AS time, order_date AS date, hold
            FROM orders
            ORDER BY created_at DESC
        ")->fetchAll();

        $itemRows = $pdo->query("SELECT order_id, name, qty, price, customization AS cust FROM order_items")->fetchAll();
        $itemsByOrder = [];
        foreach ($itemRows as $row) {
            $oid = $row['order_id'];
            unset($row['order_id']);
            $row['qty'] = (int) $row['qty'];
            $row['price'] = (float) $row['price'];
            $itemsByOrder[$oid][] = $row;
        }

        $result = array_map(function ($o) use ($itemsByOrder) {
            return [
                'id' => $o['id'], 'qnum' => $o['qnum'], 'customer' => $o['customer'],
                'type' => $o['type'], 'status' => $o['status'], 'total' => (float) $o['total'],
                'payment' => $o['payment'], 'cashier' => $o['cashier'], 'time' => $o['time'],
                'date' => $o['date'], 'hold' => (bool) $o['hold'],
                'items' => $itemsByOrder[$o['id']] ?? [],
            ];
        }, $orders);

        echo json_encode($result);
        exit;
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    if ($method === 'POST') {
        
        
        requirePermission('pos');
        if (empty($body['id']) || empty($body['items']) || !is_array($body['items'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Order id and at least one item are required']);
            exit;
        }

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("
                INSERT INTO orders (id, qnum, customer_name, type, status, total, payment, cashier, order_time, order_date, hold)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $body['id'], $body['qnum'] ?? null, $body['customer'] ?? 'Walk-in',
                $body['type'] ?? null, $body['status'] ?? 'Waiting', (float) ($body['total'] ?? 0),
                $body['payment'] ?? null, $body['cashier'] ?? null, $body['time'] ?? null,
                $body['date'] ?? date('Y-m-d'), !empty($body['hold']) ? 1 : 0,
            ]);

            $itemStmt = $pdo->prepare("INSERT INTO order_items (order_id, name, qty, price, customization) VALUES (?, ?, ?, ?, ?)");
            foreach ($body['items'] as $item) {
                $itemStmt->execute([
                    $body['id'], $item['name'] ?? '', (int) ($item['qty'] ?? 1),
                    (float) ($item['price'] ?? 0), $item['cust'] ?? '',
                ]);
            }

            
            
            
            
            if (empty($body['hold'])) {
                adjustInventoryForItems($pdo, $body['items'], -1);
            }
            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }

        echo json_encode(['success' => true, 'id' => $body['id']]);
        exit;
    }

    if ($method === 'PUT') {
        
        
        requirePermission('orders');
        if (empty($body['id']) || empty($body['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Order id and status are required']);
            exit;
        }
        $validStatuses = ['Waiting','Preparing','Ready','Completed','Voided'];
        if (!in_array($body['status'], $validStatuses, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid status value']);
            exit;
        }

        $current = $pdo->prepare("SELECT status, hold FROM orders WHERE id = ?");
        $current->execute([$body['id']]);
        $existing = $current->fetch();
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
            exit;
        }

        if ($body['status'] === 'Voided') {
            
            
            
            requireRole(['Owner','Admin','Manager']);
            if ($existing['status'] === 'Voided') {
                http_response_code(400);
                echo json_encode(['error' => 'Order is already voided']);
                exit;
            }

            $pdo->beginTransaction();
            try {
                $itemRows = $pdo->prepare("SELECT name, qty FROM order_items WHERE order_id = ?");
                $itemRows->execute([$body['id']]);
                $items = $itemRows->fetchAll();

                
                
                if (!$existing['hold']) {
                    adjustInventoryForItems($pdo, $items, +1);
                }

                $upd = $pdo->prepare("UPDATE orders SET status = 'Voided' WHERE id = ?");
                $upd->execute([$body['id']]);
                $pdo->commit();
                logActivity($pdo, 'Voided order', $body['id']);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            echo json_encode(['success' => true]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE orders SET status=? WHERE id=?");
        $stmt->execute([$body['status'], $body['id']]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        
        
        requirePermission('pos');
        $id = $_GET['id'] ?? '';
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing id']); exit; }
        $stmt = $pdo->prepare("DELETE FROM orders WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Orders request failed', 'details' => $e->getMessage()]);
}
