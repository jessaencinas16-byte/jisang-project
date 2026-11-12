<?php
const ROLE_PERMISSIONS = [
    'Owner'            => ['dashboard','pos','orders','customers','reports','users','settings','activity'],
    'Admin'            => ['dashboard','pos','orders','menu','inventory','customers','promotions','reports','users','settings','kitchen','activity'],
    'Manager'          => ['dashboard','pos','orders','menu','inventory','customers','promotions','reports','settings','kitchen'],
    'Cashier'          => ['dashboard','pos','orders','customers','promotions'],
    'Barista'          => ['kitchen','orders','dashboard'],
    'Inventory Staff'  => ['dashboard','inventory','menu','orders'],
    'Accountant'       => ['dashboard','orders','customers','reports','activity'],
];

function currentUser(): ?array {
    return $_SESSION['user'] ?? null;
}




function requireAuth(): array {
    $u = currentUser();
    if (!$u) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Not authenticated. Please sign in.']);
        exit;
    }
    return $u;
}




function requireRole(array $allowedRoles): array {
    $u = requireAuth();
    if (!in_array($u['role'], $allowedRoles, true)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Your role (' . $u['role'] . ') does not have permission to do that.']);
        exit;
    }
    return $u;
}




function requirePermission(string $permission): array {
    $u = requireAuth();
    $allowed = ROLE_PERMISSIONS[$u['role']] ?? [];
    if (!in_array($permission, $allowed, true)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Your role (' . $u['role'] . ') does not have permission to do that.']);
        exit;
    }
    return $u;
}





function logActivity(PDO $pdo, string $action, string $details = ''): void {
    try {
        $u = currentUser();
        $stmt = $pdo->prepare("INSERT INTO activity_log (user_name, user_role, action, details) VALUES (?, ?, ?, ?)");
        $stmt->execute([$u['name'] ?? 'Unknown', $u['role'] ?? 'Unknown', $action, $details]);
    } catch (Exception $e) {
        
    }
}
