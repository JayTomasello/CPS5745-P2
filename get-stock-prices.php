<?php
include 'dbconfig.php';

$query = "SELECT * FROM Stock_prices";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $data = array();
    while($row = $result->fetch_assoc()) {
        // Cast appropriate fields to ensure correct types
        $data[] = array(
            'id' => (int)$row['id'],  // ID is bigint, cast to integer
            'symbol' => $row['symbol'],  // Symbol is varchar
            'date' => $row['date'],   // Date is a date, treat as string
            'open' => (float)$row['open'],  // Open is float
            'high' => (float)$row['high'],  // High is float
            'low' => (float)$row['low'],    // Low is float
            'close' => (float)$row['close'],  // Close is float
            'volume' => (int)$row['volumne'], // Volume (typo: volumne) is bigint, cast to integer
            'adj_close' => (float)$row['adj_close']  // Adjusted close is float
        );
    }
    echo json_encode($data);  // Send the results back as JSON
} else {
    echo json_encode([]);
}

$conn->close();
