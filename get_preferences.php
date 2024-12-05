<?php
// Include database connection
include('dbconfig.php');

header('Content-Type: application/json');

// Check if required parameters are provided
if (!isset($_GET['uid']) || !isset($_GET['stock1']) || !isset($_GET['stock2'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required parameters.']);
    exit;
}

$uid = intval($_GET['uid']);
$stock1 = $conn->real_escape_string($_GET['stock1']);
$stock2 = $conn->real_escape_string($_GET['stock2']);

try {
    // Prepare and execute the SQL query
    $query = "
        SELECT slider_low_value, slider_high_value
        FROM 2024F_tomaselj.User_Setting
        WHERE uid = ? AND stock_symbol_a = ? AND stock_symbol_b = ?
    ";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    $stmt->bind_param('iss', $uid, $stock1, $stock2);
    $stmt->execute();

    $result = $stmt->get_result();
    $preferences = $result->fetch_assoc();

    if ($preferences) {
        echo json_encode(['status' => 'success', 'preferences' => $preferences]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No preferences found.']);
    }

    $stmt->close();
} catch (Exception $e) {
    error_log("Error in get_preferences.php: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Error fetching preferences: ' . $e->getMessage()]);
}
