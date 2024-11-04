<?php
$host = 'db_host';             // Database host
$username = 'db_username';     // Database username
$password = 'db_password';     // Database password
$dbname = 'db_name';           // Database name

// Create connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
