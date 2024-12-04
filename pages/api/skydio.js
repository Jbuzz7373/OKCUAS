export default async function handler(req, res) {
    const { startDate, endDate } = req.query;

    // Validate the presence of required query parameters
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Missing startDate or endDate query parameter' });
    }

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: '5a953ef0de24187922c8fb5a1a481e769987167f2ba74699de45b056813eea1a',
        },
    };

    try {
        const apiUrl = `https://api.skydio.com/api/v0/flights?takeoff_since=${startDate}&takeoff_before=${endDate}&per_page=500&page_number=1`;
        const response = await fetch(apiUrl, options);

        if (!response.ok) {
            throw new Error(`Skydio API responded with status ${response.status}`);
        }

        const data = await response.json();

        res.status(200).json({
            data: data.data?.flights || [], // Ensure flights is always an array
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ error: 'Failed to fetch flights from Skydio API' });
    }
}
