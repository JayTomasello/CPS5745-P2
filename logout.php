<?php
session_start();

// Check if the user is logged in
if (isset($_SESSION['user']) || isset($_COOKIE['user'])) {
    // Unset all session variables
    $_SESSION = array();

    // Destroy the session
    session_destroy();

    // Expire the cookie by setting its expiration date in the past
    setcookie('user', '', time() - 3600, "/");

    // Prevent back button login by expiring any cached login page
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");

    // Return a success response
    echo json_encode(['status' => 'success', 'message' => 'You have successfully logged out.']);
} else {
    // User is not logged in
    echo json_encode(['status' => 'error', 'message' => 'You are not currently logged in.']);
}
