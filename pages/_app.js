// pages/_app.js
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS here globally
import '../styles/globals.css';    // Your global CSS, if any

function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

export default MyApp;
