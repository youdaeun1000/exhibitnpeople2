
import React, { useEffect, useRef, useState } from 'react';

interface KakaoMapProps {
  address: string;
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    kakao: any;
  }
}

const KakaoMap: React.FC<KakaoMapProps> = ({ address, zoom = 3, className = "" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 사용자의 카카오 JavaScript 키
    const apiKey = '5f792113b2952cd767d012c989a0c18c';
    const scriptId = 'kakao-maps-sdk';

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        setError("카카오맵 객체를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      // v3 스크립트를 autoload=false로 불렀을 때 필수적인 load 콜백
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;

        try {
          const geocoder = new window.kakao.maps.services.Geocoder();

          geocoder.addressSearch(address, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

              const mapOption = {
                center: coords,
                level: zoom
              };

              // 지도 생성
              const map = new window.kakao.maps.Map(mapRef.current, mapOption);

              // 마커 표시
              new window.kakao.maps.Marker({
                map: map,
                position: coords
              });

              // 지도가 렌더링될 때 컨테이너 크기 재계산 (회색 화면 방지)
              map.relayout();
              map.setCenter(coords);
              
              setLoading(false);
            } else {
              setError(`주소 검색 실패: ${status}\n(${address})`);
              setLoading(false);
            }
          });
        } catch (err) {
          console.error("Map initialization error:", err);
          setError("지도 초기화 중 오류가 발생했습니다.");
          setLoading(false);
        }
      });
    };

    const loadScript = () => {
      // 1. 이미 로드되어 있고 객체도 사용 가능한 경우
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        initMap();
        return;
      }

      // 2. 스크립트 태그는 있지만 아직 로드 완료 전인 경우 대기
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
      if (existingScript) {
        existingScript.addEventListener('load', initMap);
        return;
      }

      // 3. 스크립트 태그가 없는 경우 새로 생성
      const script = document.createElement('script');
      script.id = scriptId;
      // appkey 파라미터가 정확히 포함되었는지 확인
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
      script.async = true;
      script.onload = initMap;
      script.onerror = () => {
        setError("카카오맵 SDK 스크립트 로드 실패. 키와 도메인 설정을 확인해주세요.");
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    setLoading(true);
    setError(null);
    loadScript();

    // 컴포넌트 언마운트 시 로직이 필요할 경우 추가 가능 (현재는 불필요)
  }, [address, zoom]);

  return (
    <div 
      className={`relative overflow-hidden rounded-[2rem] bg-slate-100 border border-slate-100 shadow-inner ${className}`}
      style={{ minHeight: '200px' }} // 최소 높이 보장
    >
      {/* 지도 영역 */}
      <div ref={mapRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />

      {/* 로딩 오버레이 */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
          <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">지도 데이터를 불러오는 중...</p>
        </div>
      )}
      
      {/* 에러 오버레이 */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50 z-10">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
            <i className="fa-solid fa-map-location-dot text-teal-300 text-xl"></i>
          </div>
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed whitespace-pre-wrap">{error}</p>
          <p className="mt-2 text-[9px] text-slate-300">카카오 개발자 콘솔에서 도메인 등록을 확인해주세요.</p>
        </div>
      )}
    </div>
  );
};

export default KakaoMap;
