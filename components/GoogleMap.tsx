
import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  address: string;
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({ address, zoom = 15, className = "" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // API_KEY는 반드시 process.env.API_KEY를 사용해야 합니다.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      setError("Google Maps API 키가 설정되지 않았습니다.");
      setLoading(false);
      return;
    }

    const initMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) return;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results: any, status: string) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const map = new window.google.maps.Map(mapRef.current!, {
            center: location,
            zoom,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: 'cooperative',
            styles: [
              {
                "featureType": "poi",
                "stylers": [{ "visibility": "off" }]
              },
              {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#e9e9e9" }]
              },
              {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [{ "color": "#f5f5f5" }]
              }
            ]
          });

          new window.google.maps.Marker({
            map,
            position: location,
            animation: window.google.maps.Animation.DROP,
          });

          setLoading(false);
        } else {
          setError(`위치를 찾을 수 없습니다: ${address}`);
          setLoading(false);
        }
      });
    };

    const loadScript = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const scriptId = 'google-maps-script';
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.addEventListener('load', initMap);
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setError("지도 로드에 실패했습니다.");
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    setLoading(true);
    setError(null);
    loadScript();

  }, [address, zoom]);

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] bg-slate-50 ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-3"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LOADING MAP</p>
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 z-10">
          <p className="text-[11px] font-bold text-slate-400 leading-relaxed">{error}</p>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full" />
      )}
    </div>
  );
};

export default GoogleMap;
