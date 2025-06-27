import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';

type Location = {
  id: string;
  name: string;
  distanceFromYou: string;
  distanceFromPartner: string;
  time: string;
  image: string;
  details: string;
  coordinates: [number, number];
  openingHours?: string;
  address?: string;
  cuisine?: string;
};

type Props = {
  latitude: number;
  longitude: number;
  token?: string;
  onCafesFetched: (cafes: Location[]) => void;
};

const CafeDataFetcher: React.FC<Props> = ({ latitude, longitude, onCafesFetched }) => {
  useEffect(() => {
    let mounted = true;

    const fetchCafeData = async () => {
      try {
        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const radius = 2000;

        const query = `
          [out:json];
          node
            ["amenity"="cafe"]
            (around:${radius},${latitude},${longitude});
          out;
        `;

        const response = await axios.post(overpassUrl, query, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const elements = response.data.elements;

        console.log('--- TOÀN BỘ DỮ LIỆU TRẢ VỀ ---');
        elements.forEach((el: any, index: number) => {
          console.log(`#${index + 1}`, JSON.stringify(el, null, 2));
        });

        const cafes = elements
          .map((place: any) => {
            const distance = calculateDistance(latitude, longitude, place.lat, place.lon);

            // Gộp địa chỉ từ các trường nếu có
            const addressParts = [
              place.tags?.['addr:housenumber'],
              place.tags?.['addr:street'],
              place.tags?.['addr:subdistrict'],
              place.tags?.['addr:district'],
              place.tags?.['addr:city'],
              place.tags?.['addr:province'],
            ].filter(Boolean); // loại bỏ undefined/null

            const fullAddress = addressParts.join(', ');

            return {
              id: place.id.toString(),
              name: place.tags?.name || 'Quán cà phê không tên',
              distanceFromYou: distance.toFixed(1),
              distanceFromPartner: 'N/A',
              time: 'Không rõ',
              image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
              details: place.tags?.amenity || 'Không có mô tả',
              coordinates: [place.lon, place.lat],
              openingHours: place.tags?.opening_hours,
              address: fullAddress || undefined,
              cuisine: place.tags?.cuisine || undefined,
              rawDistance: distance,
            };
          })
          .sort((a: any, b: any) => a.rawDistance - b.rawDistance)
          .slice(0, 10)
          .map(({ rawDistance, ...rest }: { rawDistance: number; [key: string]: any }) => rest);

        cafes.forEach((cafe: Location, index: number) => {
          console.log(`✅ #${index + 1}: ${cafe.name} - ${cafe.distanceFromYou} km`);
        });

        if (mounted) {
          onCafesFetched(cafes);
        }
      } catch (error) {
        console.error('Lỗi khi gọi Overpass API:', error);
        if (mounted) {
          Alert.alert('Lỗi', 'Không thể tải dữ liệu từ Overpass API. Vui lòng thử lại sau.');
          onCafesFetched([]);
        }
      }
    };

    fetchCafeData();
    return () => { mounted = false; };
  }, [latitude, longitude, onCafesFetched]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return null;
};

export default CafeDataFetcher;
