<?php
include 'dbconfig.php';

$symbol = $_GET['symbol'];
$year = $_GET['year'];
$month = $_GET['month'];

// Construct the date filter
$dateFilter = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT);

// Query to get daily Open prices for the selected symbol and month/year
$query = "SELECT date, open FROM Stock_prices 
          WHERE symbol = ? AND date LIKE ? 
          ORDER BY date ASC";
$stmt = $conn->prepare($query);
$dateLike = "$dateFilter%";
$stmt->bind_param('ss', $symbol, $dateLike);
$stmt->execute();

$result = $stmt->get_result();
$data = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = array(
            'date' => $row['date'],
            'open' => (float)$row['open']
        );
    }
}
echo json_encode($data);

$conn->close();
