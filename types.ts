
export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export type UserRole = 'Viewer' | 'Artist' | 'Collector' | 'Gallery';

export interface OperatingHour {
  isOpen: boolean;
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
}

export type WeeklyHours = Record<DayOfWeek, OperatingHour>;

export interface Review {
  id: string;
  exhibitionId: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // List of user IDs
  createdAt: number;
}

export interface ExhibitionData {
  id: string;
  representativeLink: string; 
  title: string;
  artist?: string;
  startDate?: string;
  endDate: string;
  operatingHours?: WeeklyHours;
  operatingDays?: DayOfWeek[];
  timeRange?: string;
  closingNote?: string;
  openingHours?: string;
  location: string;
  detailLocation?: string; 
  galleryName?: string; // 추가: 갤러리 이름
  region?: string;      // 추가: 선택된 지역명
  createdAt: number;
  updatedAt?: number;
  creatorId: string;
  authorNickname?: string;
  status: 'active' | 'hidden' | 'ended';
  lat?: number;
  lng?: number;
}

export interface TourStop {
  id: string;
  type: 'exhibition' | 'teatime';
  exhibitionId?: string;
  memo?: string; // 추가: 티타임 메모
}

export type ViewType = 
  | 'list' 
  | 'register' 
  | 'edit-exhibition'
  | 'exhibition-detail'
  | 'mytour' 
  | 'meeting' 
  | 'meeting-detail'
  | 'chat' 
  | 'profile' 
  | 'meeting-create' 
  | 'meeting-edit'
  | 'chat-room' 
  | 'user-profile' 
  | 'settings' 
  | 'blocked-management' 
  | 'signup'
  | 'customer-service'
  | 'withdrawal-guide'
  | 'report-guide'
  | 'exhibition-meetings';

export type SortType = 'closing' | 'newest' | 'region';

export interface Tour {
  id: string;
  title: string;
  exhibitionIds: string[]; 
  steps: any[]; 
  creatorId: string; 
  userName?: string;
  createdAt: any; 
  likeCount: number;
}

export interface Participant {
  userId: string;
  userName: string;
  status: 'pending' | 'accepted';
  answer: string;
}

export interface Meeting {
  id: string;
  title: string;
  targetId: string;
  targetType: 'exhibition' | 'tour';
  targetTitle: string; 
  location: string;    
  meetingDate: string;
  meetingTime: string;
  maxParticipants: number;
  question: string;
  isApprovalRequired: boolean;
  creatorId: string;
  creatorName: string;
  createdAt: number;
  participants: Participant[];
  kickedUserIds?: string[]; // 내보내진 사용자 목록
}

export interface ChatMessage {
  id: string;
  meetingId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}

export type ReportReason = '스팸 / 광고' | '부적절한 언행' | '괴롭힘 / 혐오' | '기타';

export interface UserReport {
  targetUserId: string;
  reporterUserId: string;
  reason: ReportReason;
  description: string;
  createdAt: any;
}
