import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    {/* Include the MarkerCluster CSS from CDN */}
                    <link
                        rel="stylesheet"
                        href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"
                        integrity="sha384-XYZ"  // You may use the appropriate integrity hash
                        crossOrigin="anonymous"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
