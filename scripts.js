let isLoggedIn = false;     // Flag to check if the user is logged in
let isDataLoaded = false;   // Flag to check if data is loaded

// Function to handle logging into the DB
function connectToDB() {
    fetch('login_info.php')
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'error') {
                // User is already logged in
                alert(`You are already logged in as ${data.name}.`);
                isLoggedIn = true; // Set logged in flag to true
            } else {
                // Show custom login modal if not already logged in
                document.getElementById('loginModal').style.display = 'block';

                // Handle the login submission
                function submitLogin() {
                    const login = document.getElementById('login').value;
                    const password = document.getElementById('password').value;

                    if (login && password) {
                        fetch('login.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: `login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.status === 'success') {
                                    displayWelcomeMessage(data.message); // Display success message
                                    isLoggedIn = true; // Set logged in flag to true
                                    document.getElementById('loginModal').style.display = 'none'; // Close modal
                                } else if (data.status === 'already_logged_in') {
                                    alert(data.message); // Show already logged in message
                                    isLoggedIn = true;
                                    document.getElementById('loginModal').style.display = 'none'; // Close modal
                                } else {
                                    alert(data.message); // Show error message
                                }
                            })
                            .catch(error => console.error('Error during login:', error));
                    }
                }

                document.getElementById('submitLogin').onclick = submitLogin;

                // Handle enter key on password input field
                document.getElementById('password').addEventListener('keypress', function (event) {
                    if (event.key === 'Enter') {
                        event.preventDefault(); // Prevent form submission behavior
                        submitLogin(); // Trigger login submission
                    }
                });

                // Handle cancel button
                document.getElementById('cancelLogin').onclick = function () {
                    document.getElementById('loginModal').style.display = 'none'; // Close modal
                };
            }
        })
        .catch(error => console.error('Error checking login status:', error));
}

// Function to check login status on page load
function checkLoginStatus() {
    fetch('login_info.php')
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'error') {
                // User is logged in
                isLoggedIn = true;
                displayWelcomeMessage(`Welcome back, ${data.name}!`); // Show welcome message
            } else {
                // User is not logged in
                isLoggedIn = false;
            }
        })
        .catch(error => console.error('Error checking login status:', error));
}

// Call checkLoginStatus when the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus(); // Check login status on page load

    // Initially hide the symbol, month/year dropdowns, and generate graph button
    hideLineChartOptions();
    hideRadioButtons();
});

// Function to check if the user is logged in and return a boolean value
async function isUserLoggedIn() {
    try {
        const response = await fetch('login_info.php');
        const data = await response.json();
        if (data.status !== 'error') {
            // User is logged in
            return true;
        } else {
            // User is not logged in
            return false;
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}

// Load stock data only if logged in
async function loadStockData() {
    const loggedIn = await isUserLoggedIn(); // Check login status asynchronously
    if (!loggedIn) {
        alert("Please login to load a dataset.");
        clearTablesAndCharts();
        clearDataSelection();
        hideLineChartOptions();
        return;
    }

    clearTablesAndCharts();
    clearDataSelection();
    hideLineChartOptions();

    // Display loading message in the table div
    document.getElementById('table').innerHTML = '<p>Loading table data...</p>';

    fetch('get-all-stock-prices.php')
        .then(response => response.json())
        .then(data => {
            drawStockPricesTable(data);
            loadStockSymbols();

            // Count the number of rows in the data
            const rowCount = data.length;

            displayMessage(`US Stock Prices data successfully loaded - ${rowCount} records`);

            isDataLoaded = true;

            // Show the radio buttons after dataset is loaded
            showRadioButtons();
        })
        .catch(error => {
            console.error('Error loading stock prices:', error);
            document.getElementById('table').innerHTML = '<p>Error loading table data.</p>';
        });
}

// Show Line Chart options if radio button is selected
function showLineChartOptions() {
    // TODO: Add existence check
    const selectedOption = document.querySelector('input[name="dataOption"]:checked');

    if (!selectedOption && !isLoggedIn) {
        alert("Please login and load a dataset to use the View options.");
        return;
    }

    if (!selectedOption && isLoggedIn && !isDataLoaded) {
        alert("Please load a dataset to use the View options.");
        return;
    }

    if (!selectedOption && isLoggedIn) {
        alert("Please select an option (Open Price or Growth Rate).");
        return;
    }

    // TODO: Replace with dynamically added symbol choice dropdown
    if (selectedOption.value === 'openPrice') {
        document.getElementById('symbolChoice').style.display = 'block';
        document.getElementById('symbolLabel').style.display = 'block';
        hideRadioButtons();
    }

    if (selectedOption.value === 'growthRate') {
        alert("The Growth Rate attribute can only be graphed as an Area Chart.");
        return;
    }
}

function showAreaChartOptions() {
    // TODO: Add existence check
    const selectedOption = document.querySelector('input[name="dataOption"]:checked');

    if (!selectedOption && !isLoggedIn) {
        alert("Please login and load a dataset to use the View options.");
        return;
    }

    if (!selectedOption && isLoggedIn && !isDataLoaded) {
        alert("Please load a dataset to use the View options.");
        return;
    }

    if (!selectedOption && isLoggedIn) {
        alert("Please select an option (Open Price or Growth Rate).");
        return;
    }

    if (selectedOption && selectedOption.value === 'growthRate') {
        // Hide the radio buttons since we are focusing on Area Chart for growth rate
        hideRadioButtons();

        // TODO: Replace with dynamically added symbol choice dropdowns
        // Show the stock selection dropdowns
        document.getElementById('stockSymbol1').style.display = 'block';
        document.getElementById('stockSymbol1Label').style.display = 'block';
        document.getElementById('stockSymbol2').style.display = 'block';
        document.getElementById('stockSymbol2Label').style.display = 'block';

        // Populate stock symbol dropdowns options from the database
        loadStockSymbols();
    }

    if (selectedOption.value === 'openPrice') {
        alert("The Open Price attribute can only be graphed as a Line Chart.");
        return;
    }
}

function fetchYearlyGrowth(stock1, stock2) {
    // Fetch growth data for both stocks from the database
    fetch(`get-yearly-growth.php?stock1=${stock1}&stock2=${stock2}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error from server:', data.error);
                return;
            }

            console.log('Fetched growth data:', data);
            drawAreaChart(data);
        })
        .catch(error => console.error('Error fetching growth data:', error));
}

function drawAreaChart(growthData) {
    // TODO: Add existence check
    const stock1 = document.getElementById('stockSymbol1').value;
    const stock2 = document.getElementById('stockSymbol2').value;

    google.charts.load('current', {
        packages: ['corechart']
    });
    google.charts.setOnLoadCallback(() => {
        const data = new google.visualization.DataTable();

        // Use the stock symbols for the column labels
        data.addColumn('string', 'Year');
        data.addColumn('number', stock1); // Stock 1 symbol as the label
        data.addColumn('number', stock2); // Stock 2 symbol as the label

        console.log('Received growth data:', growthData);

        // Add rows to the chart data
        growthData.forEach(row => {
            const year = String(row.year); // Ensure the year is a string
            const stock1Growth = parseFloat(row.stock1_growth); // Ensure it's a number
            const stock2Growth = parseFloat(row.stock2_growth); // Ensure it's a number

            if (!isNaN(stock1Growth) && !isNaN(stock2Growth)) {
                data.addRow([year, stock1Growth, stock2Growth]);
            } else {
                console.error('Invalid data for year:', year, stock1Growth, stock2Growth);
            }
        });

        const options = {
            title: 'Yearly Growth Comparison',
            hAxis: {
                title: 'Year'
            },
            vAxis: {
                title: 'Growth Rate (%)'
            },
            isStacked: false,
            areaOpacity: 0.4,
            colors: ['#1b9e77', '#d95f02'],
            legend: {
                position: 'bottom'
            },
            height: 600 // Adjust height of the chart
        };

        const chart = new google.visualization.AreaChart(document.getElementById('graph'));
        chart.draw(data, options);
    });
    // Create a new div element to display the information
    const existingInfoDiv = document.getElementById("calculationInfo");
    if (!existingInfoDiv) {
        // Create a new div element with an id
        const infoDiv = document.createElement("div");
        infoDiv.id = "calculationInfo"; // Assign an id for easy removal
        infoDiv.innerHTML = `
            <h2><strong>Growth Rate Equation:</strong></h2> 
            <p>((Last Closing Price of the Year - First Closing Price of the Year) / First Closing Price of the Year) * 100
            </p>`;

        // Append the infoDiv after the stock chart
        const graphArea = document.querySelector(".graph-area");
        graphArea.appendChild(infoDiv);
    }
}

function showRadioButtons() {
    if (isDataLoaded) {
        const form = document.getElementById('dataForm');

        // Create and append the radio buttons
        if (!document.getElementById('openPrice')) {
            // Open Price Radio Button and Label
            const openPriceRadio = document.createElement('input');
            openPriceRadio.type = 'radio';
            openPriceRadio.id = 'openPrice';
            openPriceRadio.name = 'dataOption';
            openPriceRadio.value = 'openPrice';

            const openPriceLabel = document.createElement('label');
            openPriceLabel.htmlFor = 'openPrice';
            openPriceLabel.innerHTML = 'Open Price<br>';

            form.appendChild(openPriceRadio);
            form.appendChild(openPriceLabel);
        }

        if (!document.getElementById('growthRate')) {
            // Growth Rate Radio Button and Label
            const growthRateRadio = document.createElement('input');
            growthRateRadio.type = 'radio';
            growthRateRadio.id = 'growthRate';
            growthRateRadio.name = 'dataOption';
            growthRateRadio.value = 'growthRate';

            const growthRateLabel = document.createElement('label');
            growthRateLabel.htmlFor = 'growthRate';
            growthRateLabel.innerHTML = 'Growth Rate<br>';

            form.appendChild(growthRateRadio);
            form.appendChild(growthRateLabel);
        }
    }
}

function hideRadioButtons() {
    const form = document.getElementById('dataForm');

    // Remove Open Price Radio Button and its Label
    const openPriceRadio = document.getElementById('openPrice');
    const openPriceLabel = document.querySelector('label[for="openPrice"]'); // Target label using 'for' attribute

    if (openPriceRadio) {
        form.removeChild(openPriceRadio);
    }
    if (openPriceLabel) {
        form.removeChild(openPriceLabel);
    }

    // Remove Growth Rate Radio Button and its Label
    const growthRateRadio = document.getElementById('growthRate');
    const growthRateLabel = document.querySelector('label[for="growthRate"]'); // Target label using 'for' attribute

    if (growthRateRadio) {
        form.removeChild(growthRateRadio);
    }
    if (growthRateLabel) {
        form.removeChild(growthRateLabel);
    }
}

// TODO: Replace with removal of symbol choice dropdown + month dropdown
// Hide radio buttons initially or when not logged in
function hideLineChartOptions() {
    document.getElementById('symbolChoice').style.display = 'none';
    document.getElementById('symbolLabel').style.display = 'none';
    document.getElementById('monthChoice').style.display = 'none';
    document.getElementById('monthLabel').style.display = 'none';
    document.getElementById('generateGraphButton').style.display = 'none';
}

// TODO: Replace with removal of symbol choice dropdown
function hideAreaChartOptions() {
    document.getElementById('stockSymbol1').style.display = 'none';
    document.getElementById('stockSymbol1Label').style.display = 'none';
    document.getElementById('stockSymbol2').style.display = 'none';
    document.getElementById('stockSymbol2Label').style.display = 'none';
    document.getElementById('generateAreaChartButton').style.display = 'none';
}

// Function to show a message if the user tries to view charts without login/dataset
function handleViewOptions() {
    if (!isLoggedIn) {
        alert("Please login and load a dataset to use the View options.");
        return;
    }
    if (!isDataLoaded) {
        alert("Please load a dataset to use the View options.");
    }
}

function showLoginInfo() {
    fetch('login_info.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                alert(data.message);
            } else {
                const userInfo = `UID: ${data.uid}\nLogin: ${data.login}\nPassword: ${data.password}\nName: ${data.name}\nGender: ${data.gender}`;
                alert(userInfo); // Show user information in a pop-up
            }
        })
        .catch(error => console.error('Error fetching login info:', error));
}

function showDeveloperInfo() {
    const devInfo = `Name: Joseph Tomasello\nClass ID: CPS*5745*02\nProject Date (Part 2): 12/04/2024`;
    alert(devInfo);
}

function showBrowserOSInfo() {
    const browserInfo = `Browser: ${navigator.appName} ${navigator.appVersion}`;
    const osInfo = `Platform: ${navigator.platform}`;

    const fullInfo = `Browser Information:\n${browserInfo}\n\nOperating System Information:\n${osInfo}`;

    alert(fullInfo);
}

// TODO: Replace with existence check
document.addEventListener('DOMContentLoaded', () => {
    // Initially hide the symbol, month/year dropdowns, and generate graph button
    hideLineChartOptions();
});

function drawStockPricesTable(stockPrices, pageSize = 20) {
    console.log("Rendering Stock Prices DataTable with page size:", pageSize);

    const tableDiv = document.getElementById('table');
    tableDiv.innerHTML = '';

    // Create table
    const table = document.createElement('table');
    table.id = 'dataTable';
    table.classList.add('display');
    table.style.width = '100%';
    tableDiv.appendChild(table);

    const headers = [
        { display: 'ID', key: 'id' },
        { display: 'Symbol', key: 'symbol' },
        { display: 'Date', key: 'date' },
        { display: 'Open', key: 'open' },
        { display: 'High', key: 'high' },
        { display: 'Low', key: 'low' },
        { display: 'Close', key: 'close' },
        { display: 'Volume', key: 'volume' },
        { display: 'Adjusted Close', key: 'adj_close' }
    ];

    // Step 1: Group percent changes by stock symbol
    const percentChangesBySymbol = {};
    stockPrices.forEach(stock => {
        if (stock.open > 0) { // Avoid division by zero
            const percentChange = Math.abs((stock.close - stock.open) / stock.open) * 100;
            if (!percentChangesBySymbol[stock.symbol]) {
                percentChangesBySymbol[stock.symbol] = [];
            }
            percentChangesBySymbol[stock.symbol].push(percentChange);
        }
    });

    // Step 2: Calculate IQR and outlier threshold for each stock symbol
    const thresholdsBySymbol = {};
    for (const [symbol, percentChanges] of Object.entries(percentChangesBySymbol)) {
        const sortedChanges = percentChanges.sort((a, b) => a - b);
        const q1 = sortedChanges[Math.floor((sortedChanges.length / 4))];
        const q3 = sortedChanges[Math.floor((sortedChanges.length * 3) / 4)];
        const iqr = q3 - q1;
        const outlierThreshold = q3 + 1.5 * iqr;
        thresholdsBySymbol[symbol] = outlierThreshold;
    }

    console.log('Outlier thresholds by symbol:', thresholdsBySymbol);

    // Step 3: Highlight rows with percent changes > outlierThreshold for the specific stock symbol
    $('#dataTable').DataTable({
        destroy: true,
        data: stockPrices,
        columns: headers.map(header => ({
            title: header.display,
            data: header.key
        })),
        rowCallback: function (row, data) {
            if (data.open > 0) { // Avoid division by zero
                const percentChange = Math.abs((data.close - data.open) / data.open) * 100;
                const threshold = thresholdsBySymbol[data.symbol];
                if (percentChange > threshold) {
                    // Add custom styling for outlier rows
                    $(row).css('background-color', '#ffff71');  // Light yellow background
                    $(row).css('color', '#8b0000');             // Dark red text
                }
            }
        },
        deferRender: true,
        pageLength: pageSize,
        responsive: true,
        dom: 'Bfrtip',
        buttons: ['copy', 'csv', 'excel', 'pdf'],
        paging: true,
        lengthChange: true,
        searching: true,
        order: [[0, 'asc']]
    });
}

// TODO: Split function to load the stock symbol dropdowns for the line and area charts separately
// Function to load all the available stock symbols for the line and area charts
function loadStockSymbols() {
    // Fetch available stock symbols and populate the dropdowns
    fetch('get-stock-symbols.php')
        .then(response => response.json())
        .then(symbols => {
            const symbolChoice = document.getElementById('symbolChoice');
            const symbolSelect1 = document.getElementById('stockSymbol1');
            const symbolSelect2 = document.getElementById('stockSymbol2');

            // Clear previous options and add the default "select" option
            symbolChoice.innerHTML = '<option value="select" selected disabled>Select Stock Symbol</option>';
            symbolSelect1.innerHTML = '<option value="select" selected disabled>Select Stock Symbol</option>';
            symbolSelect2.innerHTML = '<option value="select" selected disabled>Select Stock Symbol</option>';

            // Populate the dropdowns with stock symbols
            symbols.forEach(symbol => {
                const option1 = document.createElement('option');
                const option2 = document.createElement('option');
                const option3 = document.createElement('option');

                option1.value = symbol;
                option1.textContent = symbol;

                option2.value = symbol;
                option2.textContent = symbol;

                option3.value = symbol;
                option3.textContent = symbol;

                // Append the options to the respective dropdowns
                symbolChoice.appendChild(option1); // Line Chart dropdown
                symbolSelect1.appendChild(option2); // Area Chart first stock
                symbolSelect2.appendChild(option3); // Area Chart second stock
            });
        })
        .catch(error => {
            console.error('Error fetching stock symbols:', error);
        });
}

function loadAvailableMonths() {
    const selectedSymbol = document.getElementById('symbolChoice').value;

    // Fetch available months and years for the selected symbol
    fetch(`get-available-months.php?symbol=${selectedSymbol}`)
        .then(response => response.json())
        .then(months => {
            const monthSelect = document.getElementById('monthChoice');
            monthSelect.innerHTML = ''; // Clear previous options

            const defaultOption = document.createElement('option');
            defaultOption.value = 'select';
            defaultOption.textContent = 'Select Year-Month';
            defaultOption.selected = true;
            defaultOption.disabled = true;
            monthSelect.appendChild(defaultOption);

            months.forEach(month => {
                const option = document.createElement('option');
                option.value = month;
                option.textContent = month;
                monthSelect.appendChild(option);
            });

            // Show the month/year dropdown and label
            document.getElementById('monthChoice').style.display = 'block';
            document.getElementById('monthLabel').style.display = 'block';

            // Initially hide the "Generate Graph" button
            document.getElementById('generateGraphButton').style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching available months:', error);
        });

    // Add event listener to month choice dropdown
    document.getElementById('monthChoice').addEventListener('change', showGenerateGraphButton);
}

function showGenerateGraphButton() {
    const symbolChoice = document.getElementById('symbolChoice').value;
    const monthChoice = document.getElementById('monthChoice').value;

    // Ensure both symbol and month are selected and not default before showing the button
    if (symbolChoice !== "select" && monthChoice !== "select") {
        document.getElementById('generateGraphButton').style.display = 'block';
    } else {
        document.getElementById('generateGraphButton').style.display = 'none';
    }
}

function generateGraph() {
    const symbol = document.getElementById('symbolChoice').value;
    const [year, month] = document.getElementById('monthChoice').value.split('-');
    const monthChoice = document.getElementById('monthChoice').value;

    // Fetch the daily open prices for the selected symbol and month
    fetch(`get-stock-open-prices.php?symbol=${symbol}&year=${year}&month=${month}`)
        .then(response => response.json())
        .then(data => {
            drawStockChart(data); // Generate the line graph
            displayMessage(`Line graph successfully generated for ${symbol} - ${monthChoice}.`); // Display success message
        })
        .catch(error => {
            console.error('Error fetching stock data:', error);
        });
}

function drawStockChart(stockData) {
    const symbol = document.getElementById('symbolChoice').value;
    const monthChoice = document.getElementById('monthChoice').value;
    google.charts.load('current', {
        'packages': ['corechart']
    });
    google.charts.setOnLoadCallback(() => {
        const googleData = new google.visualization.DataTable();

        // Use 'date' type for the Date column to ensure proper time series display
        googleData.addColumn('date', 'Date');
        googleData.addColumn('number', 'Open Price');

        // Iterate through stockData and convert the date string into a proper Date object
        stockData.forEach(item => {
            const dateParts = item.date.split('-'); // Split 'YYYY-MM-DD'
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; // Month is 0-based in JS Date
            const day = parseInt(dateParts[2], 10);

            googleData.addRow([new Date(year, month, day), item.open]);
        });

        const options = {
            title: `${symbol} - Daily Open Prices (${monthChoice})`,
            hAxis: {
                title: 'Date (MM/dd/yyyy)',
                format: 'MM/dd/yyyy',
                gridlines: {
                    count: stockData.length // Adjust gridlines based on data length
                }
            },
            vAxis: {
                title: 'Open Price (USD)'
            },
            legend: 'none',
            height: 600
        };

        const chart = new google.visualization.LineChart(document.getElementById('graph'));
        chart.draw(googleData, options);
    });
}

// Function to display login status message
function displayWelcomeMessage(message) {
    const messageDiv = document.getElementById('message');
    const newMessage = document.createElement('p'); // Create a new paragraph for the message
    newMessage.textContent = message;
    newMessage.style.fontWeight = 'bold';
    messageDiv.appendChild(newMessage); // Append the new message under previous messages
}

// Displays descriptive messages in the message area based on user actions and page events
function displayMessage(content) {
    const messageDiv = document.getElementById('message');

    // Create a new container for the message and timestamp
    const messageContainer = document.createElement('div');
    messageContainer.style.marginTop = '20px'; // Add spacing between messages
    messageContainer.style.marginBottom = '20px';

    // Generate timestamp
    const timestamp = Date.now(); // Store as a raw timestamp

    // Create the timestamp element
    const timeSpan = document.createElement('span');
    timeSpan.dataset.timestamp = timestamp; // Store the raw timestamp
    timeSpan.textContent = new Date(timestamp).toLocaleString(); // Display formatted
    timeSpan.style.fontWeight = 'bold';
    timeSpan.style.color = 'green'; // Initially set the color to green
    timeSpan.style.display = 'block';

    // Create the message element
    const messageText = document.createElement('p');
    messageText.textContent = content;
    messageText.style.margin = '5px 0 0';

    // Append the timestamp and message to the container
    messageContainer.appendChild(timeSpan);
    messageContainer.appendChild(messageText);

    // Append the container to the message area
    messageDiv.appendChild(messageContainer);

    // Scroll to the bottom of the message area
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

// Function to monitor and update message styles
function monitorMessages() {
    const messageDiv = document.getElementById('message');
    const timestamps = messageDiv.querySelectorAll('span'); // Select all timestamp spans

    timestamps.forEach((timeSpan) => {
        const timestamp = parseInt(timeSpan.dataset.timestamp, 10); // Parse raw timestamp
        const currentTime = Date.now();
        const timeDifference = (currentTime - timestamp) / (1000 * 60 * 60); // Difference in hours

        if (timeDifference > 1) {
            timeSpan.style.color = 'red';
            timeSpan.textContent = `[Data is more than ${Math.floor(timeDifference)} hour(s) old] ${new Date(timestamp).toLocaleString()}`;
        } else {
            timeSpan.style.color = 'green'; // Reset to green if less than 1 hour
            timeSpan.textContent = new Date(timestamp).toLocaleString();
        }
    });
}

// Set up periodic monitoring
setInterval(monitorMessages, 60000); // Check every 1 minute

function logoutDB() {
    // Ask the user for confirmation before exiting
    const userConfirmed = confirm("Are you sure you want to logout?");

    if (userConfirmed) {
        fetch('logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Clear the session and UI
                    clearMessages();
                    clearTablesAndCharts();
                    clearDataSelection();
                    isLoggedIn = false;
                    isDataLoaded = false;

                    // Clear login and password fields for security
                    clearLoginFields();

                    // Display a pop-up confirming the logout
                    alert(data.message);
                } else if (data.status === 'error') {
                    // User is not logged in, display the appropriate message
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
            });
    } else {
        // If the user cancels, simply return without doing anything
        return;
    }
}

// Function to clear login and password fields when modal opens for security
function clearLoginFields() {
    document.getElementById('login').value = '';
    document.getElementById('password').value = '';
}

// Function to clear all messages
function clearMessages() {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = ''; // Clear all messages in the message-area
}

// Function to clear any active tables + charts
function clearTablesAndCharts() {
    const table = document.getElementById('table');
    const graph = document.getElementById('graph');
    const infoDiv = document.getElementById("calculationInfo");

    if (infoDiv) {
        infoDiv.remove(); // Remove the div if it exists
    }

    // Clear any existing tables and charts
    if (table) table.innerHTML = '';
    if (graph) graph.innerHTML = '';
}

// Function to clear data selection area
function clearDataSelection() {
    const symbolChoice = document.getElementById('symbolChoice');
    const monthChoice = document.getElementById('monthChoice');
    const generateGraphButton = document.getElementById('generateGraphButton');

    // Clear and hide the data selection area
    symbolChoice.innerHTML = '';
    monthChoice.innerHTML = '';

    // Hide the data selection elements
    symbolChoice.style.display = 'none';
    monthChoice.style.display = 'none';
    document.getElementById('symbolLabel').style.display = 'none';
    document.getElementById('monthLabel').style.display = 'none';
    hideRadioButtons();
    hideAreaChartOptions();

    // Hide the Generate Graph button
    generateGraphButton.style.display = 'none';
}

// Function to generate an area chart based on user's selection of 2 stock symbols
function generateAreaChart() {
    const stock1 = document.getElementById('stockSymbol1').value;
    const stock2 = document.getElementById('stockSymbol2').value;

    if (stock1 === "" || stock2 === "") {
        alert("Please select two stocks to compare their growth.");
        return;
    }

    if (stock1 === stock2) {
        alert("Please select 2 DIFFERENT stocks to compare their growth.");
        return;
    }

    // Proceed with fetching data and generating the area chart
    fetchYearlyGrowth(stock1, stock2);

    // Add the success message to the message area
    displayMessage(`Area chart successfully generated for ${stock1} and ${stock2}.`);
}

// Check if two stocks are selected before showing the "Generate Area Chart" button
document.getElementById('stockSymbol1').addEventListener('change', checkStocksSelected);
document.getElementById('stockSymbol2').addEventListener('change', checkStocksSelected);

// TODO: Replace with check for element existence
function checkStocksSelected() {
    const stock1 = document.getElementById('stockSymbol1').value;
    const stock2 = document.getElementById('stockSymbol2').value;

    // Only show the button if both stock selections are not the default "select" option and they are different
    if (stock1 !== 'select' && stock2 !== 'select' && stock1 !== stock2) {
        document.getElementById('generateAreaChartButton').style.display = 'block';
    } else {
        document.getElementById('generateAreaChartButton').style.display = 'none';
    }
}

// Function to log user out of system (if they are logged in) + close web page
function exitApplication() {
    // Ask the user for confirmation before exiting
    const userConfirmed = confirm("Are you sure you want to logout and exit this page?");

    if (userConfirmed) {
        // Attempt to clear session via logout.php
        fetch('logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Notify the user that the session has been cleared
                    alert(data.message);
                } else if (data.status === 'error') {
                    // Notify the user they are not logged in
                    console.log(data.message);
                }
            })
            .catch(error => console.error('Error during logout:', error))
            .finally(() => {
                // Always attempt to close the browser tab/window
                window.close();

                // Fallback to a blank page if the browser prevents closing the window
                setTimeout(() => {
                    window.location.href = 'about:blank';
                }, 1000); // Add a small delay to show alert
            });
    } else {
        // If the user cancels, simply return without doing anything
        return;
    }
}
