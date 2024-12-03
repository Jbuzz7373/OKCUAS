import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to disable SSR
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css'; // Import Leaflet styles

const HomePage = () => {
    const [droneData, setDroneData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    const twoYearsAgo = new Date(today);
    twoYearsAgo.setFullYear(today.getFullYear() - 2);

    // Fetch drone data from the API
    useEffect(() => {
        const fetchDroneData = async () => {
            try {
                const response = await fetch(`/api/skydio?startDate=${startDate}&endDate=${endDate}`);
                const data = await response.json();

                if (response.ok) {
                    setDroneData(data.data.flights || []);
                } else {
                    setError('Failed to fetch drone data');
                }
            } catch (err) {
                setError('Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchDroneData();
    }, [startDate, endDate]); // Fetch when dates are changed

    useEffect(() => {
        if (startDate && endDate) {
            const filtered = droneData.filter((flight) => {
                const takeoffDate = new Date(flight.takeoff);
                return takeoffDate >= new Date(startDate) && takeoffDate <= new Date(endDate);
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(droneData);
        }
    }, [startDate, endDate, droneData]);

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    if (loading) return <p>Loading drone locations...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Drone Locations</h1>

            <div>
                <label>Start Date: </label>
                <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    max={last7Days.toISOString().split('T')[0]} // Prevent selecting dates within the last 7 days
                    min={twoYearsAgo.toISOString().split('T')[0]} // Allow selecting dates up to two years ago
                />

                <label>End Date: </label>
                <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    max={last7Days.toISOString().split('T')[0]} // Prevent selecting dates within the last 7 days
                    min={twoYearsAgo.toISOString().split('T')[0]} // Allow selecting dates up to two years ago
                />
            </div>

            <div style={{ height: '1000px', width: '100%' }}>
                <MapContainer center={[35.4676, -97.5164]} zoom={10} style={{ height: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    {filteredData
                        .filter((flight) => flight.takeoff_latitude && flight.takeoff_longitude)
                        .map((flight) => (
                            <Marker
                                key={flight.flight_id}
                                position={[flight.takeoff_latitude, flight.takeoff_longitude]}
                            >
                                <Popup>
                                    <strong>Flight ID:</strong> {flight.flight_id} <br />
                                    <strong>User Email:</strong> {flight.user_email} <br />
                                    <strong>Has Telemetry:</strong> {flight.has_telemetry ? 'Yes' : 'No'} <br />
                                    <strong>Takeoff Time:</strong> {new Date(flight.takeoff).toLocaleString()} <br />
                                    <strong>Landing Time:</strong> {new Date(flight.landing).toLocaleString()} <br />
                                    <strong>Vehicle Serial:</strong> {flight.vehicle_serial} <br />
                                </Popup>
                            </Marker>
                        ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default HomePage;
