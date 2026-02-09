
import { WeeklyHours, DayOfWeek, ExhibitionData } from './types';

export const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];

export const INITIAL_HOURS: WeeklyHours = DAYS.reduce((acc, day) => {
  acc[day] = {
    isOpen: true,
    openTime: '10:00',
    closeTime: '18:00',
  };
  return acc;
}, {} as WeeklyHours);

export const DEFAULT_THEME_COLOR = "indigo-600";

// 전시 관람 동선 기준 지역 목록
export const REGIONS = [
  "삼청/인사",
  "서촌/광화문",
  "한남/이태원",
  "용산",
  "약수",
  "성수/서울숲",
  "강남",
  "청담/압구정",
  "신사/가로수길",
  "연남/홍대",
  "평창/부암",
  "기타"
];

export const DUMMY_USERS = [
  {
    id: 'user_001',
    name: '전시요정',
    phoneNumber: '01012341234',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    lastNicknameChangedAt: Date.now() - (30 * 24 * 60 * 60 * 1000),
  }
];

export const DUMMY_EXHIBITIONS: ExhibitionData[] = [
  {
    id: '1',
    title: '푸른 영혼의 정원',
    artist: '김현수',
    representativeLink: 'https://example.com/exhibition1',
    startDate: '2025-03-01',
    endDate: '2025-03-15',
    operatingHours: INITIAL_HOURS,
    location: '서울시 종로구 인사동길 12',
    galleryName: '인사 갤러리',
    region: '삼청/인사',
    createdAt: Date.now() - 1000000,
    creatorId: 'user_001',
    status: 'active',
  },
  {
    id: '2',
    title: '디지털 노마드: 가상의 공간',
    artist: '박서준',
    representativeLink: 'https://example.com/exhibition2',
    startDate: '2025-03-05',
    endDate: '2025-04-20',
    operatingHours: INITIAL_HOURS,
    location: '서울시 강남구 테헤란로 427',
    galleryName: '노마드 스페이스',
    region: '강남',
    createdAt: Date.now() - 5000000,
    creatorId: 'user_001',
    status: 'active',
  },
  {
    id: '3',
    title: '빛의 환상곡',
    artist: '최유진',
    representativeLink: 'https://example.com/exhibition3',
    startDate: '2025-02-10',
    endDate: '2025-02-28',
    operatingHours: INITIAL_HOURS,
    location: '서울시 용산구 한남대로 91',
    galleryName: '한남 아트홀',
    region: '한남/이태원',
    createdAt: Date.now() - 2000000,
    creatorId: 'user_001',
    status: 'active',
  }
];
