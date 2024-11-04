<?php
include 'dbconfig.php';

header('Content-Type: application/json');

// Start the JSON array
echo '[';

$batchSize = 100000; // Adjust based on your server's capacity and dataset size
$offset = 0;
$firstBatch = true;

do {
    $query = "SELECT * FROM Stock_prices ORDER BY date LIMIT $offset, $batchSize";
    $result = $conn->query($query);

    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Output a comma before each row except the first one
            if (!$firstBatch) {
                echo ',';
            }
            
            echo json_encode(array(
                'id' => (int)$row['id'],
                'symbol' => $row['symbol'],
                'date' => $row['date'],
                'open' => (float)$row['open'],
                'high' => (float)$row['high'],
                'low' => (float)$row['low'],
                'close' => (float)$row['close'],
                'volume' => (int)$row['volumne'],
                'adj_close' => (float)$row['adj_close']
            ));

            $firstBatch = false;
        }
        $offset += $batchSize;
    } else {
        break; // Exit loop if no more results are found
    }
} while ($result && $result->num_rows > 0);

// End the JSON array
echo ']';

$conn->close();
