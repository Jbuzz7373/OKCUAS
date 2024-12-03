export default async function handler(req, res) {
    // Default date range (3 months ago to 7 days ago)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    // Set default dates if not provided by query parameters
    const startDate = req.query.startDate || threeMonthsAgo.toISOString().split('T')[0];  // Default to 3 months ago
    const endDate = req.query.endDate || sevenDaysAgo.toISOString().split('T')[0];  // Default to 7 days ago

    // Validate that both startDate and endDate are provided
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Set up the Skydio API request options
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: '5a953ef0de24187922c8fb5a1a481e769987167f2ba74699de45b056813eea1a',
        },
    };

    // Construct the API URL with the date filters and additional parameters
    const url = `https://api.skydio.com/api/v0/flights?takeoff_before=${endDate}&takeoff_since=${startDate}&per_page=500&page_number=1`;

    try {
        // Make the request to Skydio API
        const apiResponse = await fetch(url, options);

        // Check if the response is successful
        if (!apiResponse.ok) {
            const data = await apiResponse.json();
            return res.status(apiResponse.status).json(data);
        }

        // Parse and send the data back
        const data = await apiResponse.json();
        return res.status(200).json(data);
    } catch (error) {
        // Log any error that occurs during the API request
        console.error('Error fetching drone data:', error);
        return res.status(500).json({ error: 'An error occurred while fetching drone data' });
    }
}
