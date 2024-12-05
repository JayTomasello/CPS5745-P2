<?php
// Include database connection
include('dbconfig.php');

header('Content-Type: application/json');

// Get the raw POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Log the received data for debugging
error_log("Received data: " . json_encode($data));

// Check if required data is provided
if (!isset($data['uid']) || !isset($data['stock_symbol_a']) || !isset($data['stock_symbol_b']) || 
    !isset($data['slider_low_value']) || !isset($data['slider_high_value'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required data.']);
    exit;
}

$uid = intval($data['uid']);
$login = $data['login'] ?? null;
$stock_symbol_a = $conn->real_escape_string($data['stock_symbol_a']);
$stock_symbol_b = $conn->real_escape_string($data['stock_symbol_b']);
$slider_low_value = intval($data['slider_low_value']);
$slider_high_value = intval($data['slider_high_value']);

try {
    // Prepare the SQL query with ON DUPLICATE KEY UPDATE
    $query = "
        INSERT INTO 2024F_tomaselj.User_Setting (uid, stock_symbol_a, stock_symbol_b, login, slider_low_value, slider_high_value, datetime)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
        slider_low_value = VALUES(slider_low_value),
        slider_high_value = VALUES(slider_high_value),
        datetime = NOW()
    ";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param(
        'isssii', 
        $uid, 
        $stock_symbol_a, 
        $stock_symbol_b, 
        $login, 
        $slider_low_value, 
        $slider_high_value
    );

    // Execute the query
    $stmt->execute();

    // Log the affected rows
    error_log("Rows affected: " . $stmt->affected_rows);

    // Check if the execution was successful
    if ($stmt->affected_rows > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Preferences saved successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No changes were made.']);
    }

    $stmt->close();
} catch (Exception $e) {
    error_log("Error in save preferences: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Error saving preferences: ' . $e->getMessage()]);
}

$conn->close();
