import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  latitude: number;
  longitude: number;
  token: string;
  locations: Location[];
};

type Location = {
  id: string;
  name: string;
  coordinates: [number, number];
  details: string;
};

const CafeMapView: React.FC<Props> = ({ latitude, longitude, token, locations }) => {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    const markersJS = locations
      .map(
        (place) => `
          new mapboxgl.Marker()
            .setLngLat([${place.coordinates[0]}, ${place.coordinates[1]}])
            .setPopup(new mapboxgl.Popup().setHTML("<h3>${place.name}</h3><p>${place.details}</p>"))
            .addTo(map);
        `
      )
      .join('\n');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Cafe Map</title>
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
  <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
  <style>
    body, html { margin: 0; padding: 0; height: 100%; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
    .mapboxgl-popup-content { font-family: Arial, sans-serif; font-size: 14px; }
    .mapboxgl-popup-content h3 { margin: 0; font-size: 16px; }
    .mapboxgl-popup-content p { margin: 5px 0 0; color: #555; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    mapboxgl.accessToken = '${token}';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [${longitude}, ${latitude}],
      zoom: 14
    });

    map.on('load', () => {
      ${markersJS}
      new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([${longitude}, ${latitude}])
        .setPopup(new mapboxgl.Popup().setText("Vị trí của bạn"))
        .addTo(map);
    });
  </script>
</body>
</html>
    `;

    setHtmlContent(html);
  }, [latitude, longitude, token, locations]);

  return (
    <View style={styles.container}>
      {htmlContent ? (
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />}
        />
      ) : (
        <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
});

export default CafeMapView;