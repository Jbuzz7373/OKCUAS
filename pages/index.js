import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const MarkerClusterGroup = dynamic(() => import('react-leaflet-markercluster'), { ssr: false });
import 'leaflet/dist/leaflet.css';

const HomePage = ({ flights = [] }) => {
    const [customClusterIcon, setCustomClusterIcon] = useState(null);
    const [filteredFlights, setFilteredFlights] = useState(flights);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');

    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(today.getFullYear() - 2);

    useEffect(() => {
        const L = require('leaflet');
        const createClusterCustomIcon = (cluster) => {
            return L.divIcon({
                html: `
                    <div style="
                        background: rgba(0, 123, 255, 0.6);
                        color: white;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 16px;
                        font-weight: bold;
                        border: 2px solid white;">
                        ${cluster.getChildCount()}
                    </div>`,
                className: 'marker-cluster-custom',
                iconSize: L.point(40, 40), // Use L.point here
            });
        };
        setCustomClusterIcon(() => createClusterCustomIcon);
    }, []);

    const handleStartDateChange = (e) => setStartDate(e.target.value);
    const handleEndDateChange = (e) => setEndDate(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            setError('Please select both start and end dates.');
            return;
        }

        const selectedEndDate = new Date(endDate);
        const selectedStartDate = new Date(startDate);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        if (selectedEndDate >= sevenDaysAgo) {
            setError('End date must be at least 7 days prior to today.');
            return;
        }

        if (selectedStartDate > selectedEndDate) {
            setError('Start date must be earlier than or equal to the end date.');
            return;
        }

        setError('');
        try {
            const res = await fetch(`/api/skydio?startDate=${startDate}&endDate=${endDate}`);
            if (!res.ok) throw new Error('Failed to fetch flights');
            const data = await res.json();
            setFilteredFlights(data.data || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <div>
            <h1>Oklahoma City Public Safety&apos;s UAS Locations</h1>
            <h3>This will only display up to 500 locations at once and no locations in the last 7 days</h3>
            <form onSubmit={handleSubmit}>
                <label>Start Date: </label>
                <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    min={twoYearsAgo.toISOString().split('T')[0]}
                    max={last7Days.toISOString().split('T')[0]}
                />
                <label> End Date: </label>
                <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    min={twoYearsAgo.toISOString().split('T')[0]}
                    max={last7Days.toISOString().split('T')[0]}
                />
                <button type="submit" style={{ marginLeft: '10px' }}>Filter Flights</button>

                <h3></h3>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <MapContainer center={[35.4676, -97.5164]} zoom={11} style={{ height: '85vh' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                {customClusterIcon && (
                    <MarkerClusterGroup iconCreateFunction={customClusterIcon}>
                        {Array.isArray(filteredFlights) &&
                            filteredFlights
                                .filter(
                                    (flight) =>
                                        flight.takeoff_latitude &&
                                        flight.takeoff_longitude
                                )
                                .map((flight) => (
                                    <Marker
                                        key={flight.flight_id}
                                        position={[flight.takeoff_latitude, flight.takeoff_longitude]}
                                    >
                                        <Popup>
                                            <p>
                                                <strong>Flight ID:</strong> {flight.flight_id} <br />
                                                <strong>Takeoff:</strong> {new Date(flight.takeoff).toLocaleString()} <br />
                                                <strong>Landing:</strong> {flight.landing
                                                    ? new Date(flight.landing).toLocaleString()
                                                    : 'N/A'}{' '}
                                                <br />
                                                <strong>Vehicle Serial:</strong> {flight.vehicle_serial}
                                            </p>
                                        </Popup>
                                    </Marker>
                                ))}
                    </MarkerClusterGroup>
                )}
            </MapContainer>
        </div>
    );
};

export default HomePage;
