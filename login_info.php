<?php
session_start();

if (isset($_SESSION['user'])) {
    $user = $_SESSION['user'];
    echo json_encode([
        'uid' => $user['uid'],
        'login' => $user['login'],
        'password' => str_repeat('*', strlen($user['password'])), // Censor password
        'name' => $user['name'],
        'gender' => $user['gender']
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'You must login first.']);
}
