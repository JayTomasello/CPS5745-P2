<?php
include 'dbconfig.php';

$symbol = $_GET['symbol'];

// Query to get distinct year and month values from the date column
$query = "SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') AS month_year FROM Stock_prices WHERE symbol = ? ORDER BY month_year ASC";
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $symbol);
$stmt->execute();

$result = $stmt->get_result();
$months = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $months[] = $row['month_year'];  // Store the year-month format (e.g., '2011-05')
    }
}
echo json_encode($months);

$conn->close();
