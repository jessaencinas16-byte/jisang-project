<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

requireRole(['Owner','Admin']);

try {
    $limit = isset($_GET['limit']) ? max(1, min(500, (int) $_GET['limit'])) : 100;
    $stmt = $pdo->prepare("SELECT id, user_name, user_role, action, details, created_at FROM activity_log ORDER BY created_at DESC LIMIT ?");
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not load activity log', 'details' => $e->getMessage()]);
}
