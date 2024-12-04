export default async function handler(req, res) {
    const { startDate, endDate } = req.query;

    // Validate that both startDate and endDate are provided
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Both startDate and endDate are required' });
    }

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: '5a953ef0de24187922c8fb5a1a481e769987167f2ba74699de45b056813eea1a', // Your API Key
        },
    };

    try {
        // Build the URL for the API request with the date filters
        const apiUrl = `https://api.skydio.com/api/v0/flights?takeoff_since=${encodeURIComponent(startDate)}&takeoff_before=${encodeURIComponent(endDate)}&per_page=500&page_number=1`;

        // Log the URL to check if it looks correct
        console.log("API URL:", apiUrl);

        // Fetch data from Skydio API
        const response = await fetch(apiUrl, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch flights data');
        }

        res.status(200).json({ data: data.data?.flights || [] });
    } catch (error) {
        console.error('Error fetching flights data:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
