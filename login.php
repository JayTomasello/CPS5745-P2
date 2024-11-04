<?php
session_start();
include 'dbconfig.php';

// Check if the user is already logged in
if (isset($_SESSION['user'])) {
    $user = $_SESSION['user'];
    echo json_encode(['status' => 'already_logged_in', 'message' => 'You are already logged in as ' . $user['name'] . '.']);
    exit();
}

$login = $_POST['login'];
$password = $_POST['password'];

// Protect against SQL injection
$query = "SELECT * FROM DV_User WHERE login = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $login);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if ($user['password'] === $password) {
        // Successful login, create session and cookie
        $_SESSION['user'] = $user;
        setcookie('user', $user['name'], time() + (86400 * 30), "/"); // 30 days
        echo json_encode(['status' => 'success', 'message' => 'Login successful. Welcome, ' . $user['name'] . '!']);
    } else {
        // Incorrect password
        echo json_encode(['status' => 'error', 'message' => $login . ' exists, but the password is incorrect.']);
    }
} else {
    // Invalid login
    echo json_encode(['status' => 'error', 'message' => 'Invalid login. Please try again.']);
}
