<?php
include 'dbconfig.php';

$stock1 = $_GET['stock1'];
$stock2 = $_GET['stock2'];

// Query to get the first and last closing prices for stock 1
$query1 = "SELECT YEAR(date) as year, 
                  MIN(date) as first_date, 
                  MAX(date) as last_date
           FROM Stock_prices 
           WHERE symbol = '$stock1'
           GROUP BY YEAR(date)";

$query2 = "SELECT YEAR(date) as year, 
                  MIN(date) as first_date, 
                  MAX(date) as last_date
           FROM Stock_prices 
           WHERE symbol = '$stock2'
           GROUP BY YEAR(date)";

// Execute both queries
$result1 = mysqli_query($conn, $query1);
$result2 = mysqli_query($conn, $query2);

if (!$result1 || !$result2) {
    echo json_encode(['error' => 'Error with the database query']);
    exit();
}

// Create arrays to store the growth data
$growth1 = [];
$growth2 = [];

// Fetch the first and last closing prices for stock 1
while ($row1 = mysqli_fetch_assoc($result1)) {
    $year = $row1['year'];
    
    // Get the first and last closing prices for that year
    $first_close = mysqli_fetch_assoc(mysqli_query($conn, "SELECT close FROM Stock_prices WHERE symbol = '$stock1' AND date = '{$row1['first_date']}'"))['close'];
    $last_close = mysqli_fetch_assoc(mysqli_query($conn, "SELECT close FROM Stock_prices WHERE symbol = '$stock1' AND date = '{$row1['last_date']}'"))['close'];

    $growth1[$year] = (($last_close - $first_close) / $first_close) * 100;
}

// Fetch the first and last closing prices for stock 2
while ($row2 = mysqli_fetch_assoc($result2)) {
    $year = $row2['year'];
    
    // Get the first and last closing prices for that year
    $first_close = mysqli_fetch_assoc(mysqli_query($conn, "SELECT close FROM Stock_prices WHERE symbol = '$stock2' AND date = '{$row2['first_date']}'"))['close'];
    $last_close = mysqli_fetch_assoc(mysqli_query($conn, "SELECT close FROM Stock_prices WHERE symbol = '$stock2' AND date = '{$row2['last_date']}'"))['close'];

    $growth2[$year] = (($last_close - $first_close) / $first_close) * 100;
}

// Ensure we only include years where both stocks have data
$years = array_intersect(array_keys($growth1), array_keys($growth2));

// Prepare the final data for output
$data = [];
foreach ($years as $year) {
    $data[] = [
        'year' => $year,
        'stock1_growth' => $growth1[$year],
        'stock2_growth' => $growth2[$year]
    ];
}

// Return the data as JSON
echo json_encode($data);
