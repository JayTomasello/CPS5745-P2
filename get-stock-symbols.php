<?php
include 'dbconfig.php';

$query = "SELECT DISTINCT symbol FROM Stock_prices";
$result = $conn->query($query);

$symbols = array();
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $symbols[] = $row['symbol'];
    }
}
echo json_encode($symbols);

$conn->close();
