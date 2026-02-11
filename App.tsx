
import { db, formatToFirebasePhone } from './firebase'
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, collection, addDoc, query, where, getDocs, orderBy, deleteDoc, onSnapshot } from 'firebase/firestore'
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import FormSection from './components/FormSection';
import OperatingHoursForm from './components/OperatingHoursForm';
import ExhibitionList from './components/ExhibitionList';
import ExhibitionDetail from './components/ExhibitionDetail';
import MyTourSession from './components/MyTourSession';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import BlockedManagementView from './components/BlockedManagementView';
import SignupView from './components/SignupView';
import LoginView from './components/LoginView';
import WithdrawalGuideView from './components/WithdrawalGuideView';
import ReportGuideView from './components/ReportGuideView';
import CustomerServiceView from './components/CustomerServiceView';
import ReportModal from './components/ReportModal';
import ExhibitionMeetingsView from './components/ExhibitionMeetingsView';
import MeetingDetail from './components/MeetingDetail';
import ChatRoom from './components/ChatRoom';
import ChatList from './components/ChatList';
// Fixed: Added Participant to the imports to resolve the error on line 578
import { ExhibitionData, ViewType, Tour, Meeting, DayOfWeek, TourStop, UserRole, ReportReason, ChatMessage, ChatRoomMetadata, Participant } from './types';
import { DUMMY_EXHIBITIONS, DUMMY_USERS, DAYS, REGIONS } from './constants';

const SUSPENDED_PHONE_NUMBERS = ['01000000000'];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingMessage, setSavingMessage] = useState('정보를 처리하고 있습니다...');
  
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [history, setHistory] = useState<ViewType[]>([]);
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [editingExhibitionId, setEditingExhibitionId] = useState<string | null>(null);
  const [pendingEditTour, setPendingEditTour] = useState<Tour | null>(null);
  
  const [currentUser, setCurrentUser] = useState({
    id: '',
    name: '익명',
    phoneNumber: '',
    instagramUrl: null as string | null,
    bio: null as string | null,
    role: 'Viewer' as UserRole,
    lastNicknameChangedAt: 0,
  });

  const [likedExhibitionIds, setLikedExhibitionIds] = useState<Set<string>>(new Set());
  const [targetUserData, setTargetUserData] = useState<{id: string, name: string, instagramUrl: string | null, bio: string | null, role: UserRole} | null>(null);
  const [isTargetLoading, setIsTargetLoading] = useState(false);
  const [exhibitions, setExhibitions] = useState<ExhibitionData[]>([]);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [tourExhibitionIds, setTourExhibitionIds] = useState<string[]>([]);
  const [createdTours, setCreatedTours] = useState<Tour[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoomMetadata[]>([]);
  const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessage[]>([]);

  // For Reporting
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{id: string, name: string} | null>(null);

  const [formData, setFormData] = useState<any>({
    representativeLink: '',
    title: '',
    artist: '',
    startDate: '',
    endDate: '',
    selectedDays: [...DAYS],
    closingNote: '',
    galleryName: '',
    region: '삼청/인사'
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const fetchExhibitions = async () => {
    try {
      const q = query(collection(db, "exhibitions"), where("status", "!=", "hidden"));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          artist: data.artist || data.artistName || '',
          location: data.location || data.address || ''
        };
      }) as ExhibitionData[];
      setExhibitions(fetched.length > 0 ? fetched : DUMMY_EXHIBITIONS);
    } catch (error) {
      console.error("전시 목록 로드 실패:", error);
      setExhibitions(DUMMY_EXHIBITIONS);
    }
  };

  const fetchTours = async () => {
    try {
      const q = query(collection(db, "tours"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setCreatedTours(fetched);
    } catch (error) {
      console.error("투어 목록 로드 실패:", error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const q = query(collection(db, "meetings"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          meetingDate: data.meetingDate?.toDate ? data.meetingDate.toDate().toISOString().split('T')[0] : data.meetingDate,
        }
      }) as any[];
      setMeetings(fetched);
    } catch (error) {
      console.error("모임 목록 로드 실패:", error);
    }
  };

  useEffect(() => { 
    fetchExhibitions(); 
    fetchTours();
    fetchMeetings();
  }, []);

  // Listen for Chat Rooms
  useEffect(() => {
    if (!isLoggedIn || !currentUser.id) return;
    const q = query(collection(db, "chats"), where("participants", "array-contains", currentUser.id), orderBy("lastMessageAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatRoomMetadata[];
      setChatRooms(fetched);
    });
    return () => unsubscribe();
  }, [isLoggedIn, currentUser.id]);

  // Listen for Messages when in a chat room
  useEffect(() => {
    if (currentView !== 'chat-room' || !selectedMeetingId) {
      setCurrentChatMessages([]);
      return;
    }
    const q = query(collection(db, "chats", selectedMeetingId, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setCurrentChatMessages(fetched);
    });
    return () => unsubscribe();
  }, [currentView, selectedMeetingId]);

  const fetchUserFavorites = async (userId: string) => {
    try {
      const uRef = doc(db, "Users", userId);
      const uDoc = await getDoc(uRef);
      if (uDoc.exists()) {
        const data = uDoc.data();
        if (data.favorites && Array.isArray(data.favorites)) {
          setLikedExhibitionIds(new Set(data.favorites));
        }
        
        setCurrentUser(prev => ({ 
          ...prev, 
          name: data.nickname || data.name || prev.name,
          instagramUrl: data.instagramUrl || null,
          bio: data.bio || null,
          role: data.role || 'Viewer'
        }));
      }
    } catch (error) { 
      console.error("사용자 정보 동기화 실패:", error); 
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('exhibireg_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      fetchUserFavorites(user.id);
    }
  }, []);

  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [isTourCreating, setIsTourCreating] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const handleLikeToggle = async (exhibitionId: string) => {
    if (!isLoggedIn) { 
      setShowLoginOverlay(true); 
      return; 
    }
    
    const isAlreadyLiked = likedExhibitionIds.has(exhibitionId);
    
    setLikedExhibitionIds(prev => {
      const next = new Set(prev);
      if (isAlreadyLiked) next.delete(exhibitionId);
      else next.add(exhibitionId);
      return next;
    });

    try {
      const userRef = doc(db, "Users", currentUser.id);
      await updateDoc(userRef, { 
        favorites: isAlreadyLiked ? arrayRemove(exhibitionId) : arrayUnion(exhibitionId) 
      });
    } catch (error) { 
      console.error("좋아요 DB 업데이트 실패:", error);
      setLikedExhibitionIds(prev => {
        const next = new Set(prev);
        if (isAlreadyLiked) next.add(exhibitionId);
        else next.delete(exhibitionId);
        return next;
      });
      alert('좋아요 처리에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const navigateTo = (view: ViewType) => {
    if (['profile', 'settings', 'register', 'mytour', 'chat-list', 'chat-room'].includes(view)) {
      if (!isLoggedIn) { setShowLoginOverlay(true); return; }
    }
    setHistory(prev => [...prev, currentView]);
    setCurrentView(view);
    window.scrollTo({ top: 0 });
  };

  const requireAuth = (callback: () => void) => {
    if (!isLoggedIn) { setShowLoginOverlay(true); return; }
    callback();
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(prevStack => prevStack.slice(0, -1));
      setCurrentView(prev);
    } else setCurrentView('list');
    window.scrollTo({ top: 0 });
  };

  const handleExhibitionSelect = (ex: ExhibitionData) => {
    setSelectedExhibitionId(ex.id);
    navigateTo('exhibition-detail');
  };

  const handleJoinMeetingClick = (ex: ExhibitionData) => {
    requireAuth(() => {
      setSelectedExhibitionId(ex.id);
      navigateTo('exhibition-meetings');
    });
  };

  const handleVerifyComplete = (phone: string, isExisting: boolean) => {
    if (isExisting) {
      const existingUser = DUMMY_USERS[0]; 
      if (existingUser) {
        const userWithMeta = { 
          ...existingUser, 
          instagramUrl: (existingUser as any).instagramUrl || null,
          bio: (existingUser as any).bio || null,
          role: (existingUser as any).role || 'Viewer' as UserRole
        };
        setCurrentUser(userWithMeta);
        localStorage.setItem('exhibireg_user', JSON.stringify(userWithMeta));
        setIsLoggedIn(true);
        setShowLoginOverlay(false);
        fetchUserFavorites(existingUser.id);
      }
    } else { 
      setPendingPhone(phone); 
      setIsNewUser(true); 
    }
  };

  const handleSignupComplete = async (userData: { name: string; phoneNumber: string }) => {
    if (isSaving) return;
    setIsSaving(true);
    const userId = `user_${Date.now()}`;
    const formattedPhone = formatToFirebasePhone(userData.phoneNumber);
    try {
      await setDoc(doc(db, "Users", userId), {
        userId: userId, 
        phone: formattedPhone, 
        nickname: userData.name, 
        favorites: [], 
        instagramUrl: null, 
        bio: null, 
        role: 'Viewer', 
        createdAt: serverTimestamp(),
      });
      const newUser = { 
        id: userId, 
        name: userData.name, 
        phoneNumber: userData.phoneNumber, 
        instagramUrl: null, 
        bio: null, 
        role: 'Viewer' as UserRole, 
        lastNicknameChangedAt: Date.now() 
      };
      setCurrentUser(newUser);
      localStorage.setItem('exhibireg_user', JSON.stringify(newUser));
      setIsLoggedIn(true); 
      setIsNewUser(false); 
      setShowLoginOverlay(false);
      setLikedExhibitionIds(new Set());
    } catch (error) { 
      console.error('가입 오류:', error); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleUserClick = async (userId: string) => {
    setSelectedUserId(userId); 
    navigateTo('user-profile');
    setIsTargetLoading(true); 
    setTargetUserData(null);
    try {
      const uRef = doc(db, "Users", userId);
      const uDoc = await getDoc(uRef);
      if (uDoc.exists()) {
        const data = uDoc.data();
        setTargetUserData({ 
          id: userId, 
          name: data.nickname || '알 수 없음', 
          instagramUrl: data.instagramUrl || null,
          bio: data.bio || null,
          role: data.role || 'Viewer'
        });
      }
    } catch (error) { 
      console.error("사용자 정보 조회 실패:", error); 
    } finally { 
      setIsTargetLoading(false); 
    }
  };

  const handleBlockToggle = (id: string) => {
    setBlockedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleNicknameChange = async (newName: string) => { 
    setCurrentUser(p => {
      const next = { ...p, name: newName, lastNicknameChangedAt: Date.now() };
      localStorage.setItem('exhibireg_user', JSON.stringify(next));
      return next;
    });
    try {
      await updateDoc(doc(db, "Users", currentUser.id), { nickname: newName });
    } catch (e) { console.error("닉네임 변경 반영 실패:", e); }
  };

  const handleInstagramUrlChange = async (newUrl: string | null) => {
    setCurrentUser(p => {
      const next = { ...p, instagramUrl: newUrl };
      localStorage.setItem('exhibireg_user', JSON.stringify(next));
      return next;
    });
    try {
      await updateDoc(doc(db, "Users", currentUser.id), { instagramUrl: newUrl });
    } catch (e) { console.error("인스타 URL 업데이트 실패:", e); }
  };

  const handleBioChange = async (newBio: string | null) => {
    setCurrentUser(p => {
      const next = { ...p, bio: newBio };
      localStorage.setItem('exhibireg_user', JSON.stringify(next));
      return next;
    });
    try {
      await updateDoc(doc(db, "Users", currentUser.id), { bio: newBio });
    } catch (e) { console.error("자기소개 업데이트 실패:", e); }
  };

  const handleRoleChange = async (newRole: UserRole) => {
    setCurrentUser(p => {
      const next = { ...p, role: newRole };
      localStorage.setItem('exhibireg_user', JSON.stringify(next));
      return next;
    });
    try {
      await updateDoc(doc(db, "Users", currentUser.id), { role: newRole });
    } catch (e) { console.error("역할 업데이트 실패:", e); }
  };

  const handleReportUser = (id: string, name: string) => {
    requireAuth(() => {
      setReportTarget({ id, name });
      setIsReportModalOpen(true);
    });
  };

  const handleReportSubmit = async (reason: ReportReason, description: string) => {
    if (!reportTarget) return;
    setIsSaving(true);
    setSavingMessage('신고를 안전하게 접수 중입니다...');
    try {
      await addDoc(collection(db, "reports"), {
        targetUserId: reportTarget.id,
        reporterUserId: currentUser.id,
        reason,
        description,
        createdAt: serverTimestamp()
      });
      alert('신고가 정상적으로 접수되었습니다. 깨끗한 커뮤니티를 위한 참여에 감사드립니다.');
      setIsReportModalOpen(false);
      setReportTarget(null);
    } catch (error) {
      console.error("신고 저장 실패:", error);
      alert('신고 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDayList = (dayList: DayOfWeek[]) => {
    if (dayList.length === 0) return '';
    if (dayList.length === 7) return '매일';
    const sortedDays = [...dayList].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
    const dayIndices = sortedDays.map(d => DAYS.indexOf(d));
    const segments: string[] = [];
    let start = dayIndices[0];
    let end = dayIndices[0];
    for (let i = 1; i < dayIndices.length; i++) {
      if (dayIndices[i] === end + 1) {
        end = dayIndices[i];
      } else {
        segments.push(start === end ? DAYS[start] : `${DAYS[start]}~${DAYS[end]}`);
        start = dayIndices[i];
        end = dayIndices[i];
      }
    }
    segments.push(start === end ? DAYS[start] : `${DAYS[start]}~${DAYS[end]}`);
    return segments.join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { alert('전시 제목을 입력해 주세요.'); return; }
    if (!formData.galleryName) { alert('갤러리 이름을 입력해 주세요.'); return; }
    if (!formData.representativeLink) { alert('전시 공식 링크를 입력해 주세요.'); return; }
    if (!formData.endDate) { alert('전시 마감일을 입력해 주세요.'); return; }
    if (formData.selectedDays.length === 0) { alert('운영 요일을 선택해 주세요.'); return; }
    setIsSaving(true);
    setSavingMessage('전시 정보를 처리하고 있습니다...');
    try {
      const daysStr = formatDayList(formData.selectedDays);
      let openingHours = `${daysStr}`;
      if (formData.closingNote) openingHours += ` (${formData.closingNote})`;
      const exhibitionPayload: any = {
        representativeLink: formData.representativeLink,
        title: formData.title,
        artist: formData.artist || '',
        startDate: formData.startDate || '',
        endDate: formData.endDate,
        galleryName: formData.galleryName,
        region: formData.region,
        openingHours,
        operatingDays: formData.selectedDays,
        closingNote: formData.closingNote,
        authorNickname: currentUser.name,
        updatedAt: serverTimestamp(),
        creatorId: currentUser.id,
        status: 'active'
      };
      if (editingExhibitionId) await updateDoc(doc(db, 'exhibitions', editingExhibitionId), exhibitionPayload);
      else {
        exhibitionPayload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'exhibitions'), exhibitionPayload);
      }
      setIsSuccess(true);
      await fetchExhibitions();
    } catch (error) { console.error('전시 저장 중 오류 발생:', error); } finally { setIsSaving(false); }
  };

  const handleCreateTour = async (title: string, stops: TourStop[], tourDate?: string, tourTime?: string) => {
    if (stops.length === 0) { alert('코스에 전시나 티타임을 최소 하나 이상 추가해 주세요.'); return; }
    requireAuth(async () => {
      setIsSaving(true);
      setSavingMessage('투어 정보를 저장하고 있습니다...');
      try {
        const steps = stops.map(stop => {
          if (stop.type === 'exhibition') return { type: 'exhibition', exhibitionId: stop.exhibitionId };
          return { type: 'teatime' };
        });
        const exhibitionIds = stops.filter(s => s.type === 'exhibition').map(s => s.exhibitionId!);
        await addDoc(collection(db, "tours"), {
          title, exhibitionIds, steps, creatorId: currentUser.id, userName: currentUser.name, createdAt: serverTimestamp(), likeCount: 0,
          tourDate: tourDate || null,
          tourTime: tourTime || null
        });
        alert('투어가 저장되었습니다');
        setIsTourCreating(false);
        await fetchTours();
      } catch (error) { console.error("투어 저장 오류:", error); alert('투어 저장 중 오류가 발생했습니다.'); } finally { setIsSaving(false); }
    });
  };

  const handleUpdateTourData = async (id: string, title: string, stops: TourStop[], tourDate?: string, tourTime?: string) => {
    if (stops.length === 0) { alert('코스에 전시나 티타임을 최소 하나 이상 추가해 주세요.'); return; }
    setIsSaving(true);
    setSavingMessage('투어 정보를 수정하고 있습니다...');
    try {
      const steps = stops.map(stop => {
        if (stop.type === 'exhibition') return { type: 'exhibition', exhibitionId: stop.exhibitionId };
        return { type: 'teatime' };
      });
      const exhibitionIds = stops.filter(s => s.type === 'exhibition').map(s => s.exhibitionId!);
      await updateDoc(doc(db, "tours", id), { 
        title, exhibitionIds, steps, updatedAt: serverTimestamp(),
        tourDate: tourDate || null,
        tourTime: tourTime || null
      });
      alert('투어가 저장되었습니다');
      await fetchTours();
    } catch (error) { console.error("투어 수정 오류:", error); alert('투어 수정 중 오류가 발생했습니다.'); } finally { setIsSaving(false); }
  };

  const handleDeleteTour = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tours", id));
      setCreatedTours(prev => prev.filter(t => t.id !== id));
      alert('삭제 완료');
    } catch (error) { console.error("투어 삭제 오류:", error); alert('투어 삭제 중 오류가 발생했습니다.'); }
  };

  const handleSelectMeeting = (id: string) => {
    setSelectedMeetingId(id);
    navigateTo('meeting-detail');
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedMeetingId || !currentUser.id) return;
    try {
      const chatRef = doc(db, "chats", selectedMeetingId);
      await addDoc(collection(chatRef, "messages"), {
        meetingId: selectedMeetingId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text,
        createdAt: Date.now()
      });
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp()
      });
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  const handleJoinRequest = async (meetingId: string) => {
    requireAuth(async () => {
      try {
        const mRef = doc(db, "meetings", meetingId);
        const mDoc = await getDoc(mRef);
        if (!mDoc.exists()) return;
        
        const participant: Participant = {
          userId: currentUser.id,
          userName: currentUser.name,
          status: 'accepted', // 데모용 자동 수락, 실제론 'pending'
          answer: '참가 신청합니다.'
        };
        
        await updateDoc(mRef, {
          participants: arrayUnion(participant)
        });
        
        const chatRef = doc(db, "chats", meetingId);
        await updateDoc(chatRef, {
          participants: arrayUnion(currentUser.id),
          lastMessage: `${currentUser.name}님이 모임에 참여했습니다.`,
          lastMessageAt: serverTimestamp()
        });

        alert('모임 참여가 완료되었습니다!');
        fetchMeetings();
      } catch (error) {
        console.error("참여 신청 실패:", error);
      }
    });
  };

  if (showLoginOverlay) {
    if (isNewUser) return <SignupView phoneNumber={pendingPhone} onSignupComplete={handleSignupComplete} />;
    return (
      <div className="fixed inset-0 z-[2000] bg-white max-w-lg mx-auto overflow-y-auto">
        <div className="absolute top-8 left-8 z-[2001]">
          <button onClick={() => setShowLoginOverlay(false)} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <LoginView onVerifyComplete={handleVerifyComplete} suspendedNumbers={SUSPENDED_PHONE_NUMBERS} existingPhoneNumbers={DUMMY_USERS.map(u => u.phoneNumber)} />
      </div>
    );
  }

  const shouldShowHeader = !isTourCreating && !['exhibition-detail', 'user-profile', 'register', 'settings', 'blocked-management', 'withdrawal-guide', 'report-guide', 'customer-service', 'exhibition-meetings', 'meeting-detail', 'chat-room'].includes(currentView);
  const shouldShowBottomNav = !isTourCreating && ['list', 'mytour', 'profile', 'chat-list'].includes(currentView);

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen relative flex flex-col">
      {shouldShowHeader && (
        <Header 
          showAddButton={currentView === 'list'} 
          onAddClick={() => requireAuth(() => { setEditingExhibitionId(null); navigateTo('register'); })} 
          isLoggedIn={isLoggedIn} 
          onLoginClick={() => setShowLoginOverlay(true)} 
        />
      )}
      <main ref={mainRef} className={`flex-1 ${shouldShowBottomNav ? 'pb-24' : ''}`}>
        {isSaving ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-12 text-center bg-white">
            <div className="w-14 h-14 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-10"></div>
            <p className="text-sm font-medium text-slate-500 leading-relaxed tracking-tight px-8">{savingMessage}</p>
          </div>
        ) : isSuccess ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-10"><i className="fa-solid fa-check text-2xl text-slate-800"></i></div>
            <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tighter">{editingExhibitionId ? '수정 완료' : '등록 완료'}</h2>
            <button onClick={() => { setIsSuccess(false); setCurrentView('list'); setHistory([]); }} className="w-full py-5 bg-slate-800 text-white font-black rounded-[2rem] active:scale-[0.98] transition-all">확인</button>
          </div>
        ) : currentView === 'list' ? (
          <ExhibitionList 
            exhibitions={exhibitions} 
            onSelect={handleExhibitionSelect} 
            onJoinMeeting={handleJoinMeetingClick}
            likedIds={likedExhibitionIds} 
            onLikeToggle={handleLikeToggle} 
            currentUserId={currentUser.id} 
          />
        ) : currentView === 'exhibition-detail' && selectedExhibitionId ? (
          <ExhibitionDetail 
            exhibitionId={selectedExhibitionId} 
            initialExhibition={exhibitions.find(e => e.id === selectedExhibitionId)} 
            allExhibitions={exhibitions} 
            allTours={createdTours} 
            allMeetings={meetings} 
            isLiked={likedExhibitionIds.has(selectedExhibitionId)} 
            currentUserId={currentUser.id} 
            onBack={goBack} 
            onLikeToggle={() => handleLikeToggle(selectedExhibitionId)} 
            onSelectTour={(t) => {}} 
            onSelectMeeting={handleSelectMeeting} 
            onSelectUser={handleUserClick} 
          />
        ) : currentView === 'exhibition-meetings' && selectedExhibitionId ? (
          <ExhibitionMeetingsView 
            exhibitionId={selectedExhibitionId}
            exhibitionTitle={exhibitions.find(e => e.id === selectedExhibitionId)?.title || ''}
            meetings={meetings}
            currentUserId={currentUser.id}
            onBack={goBack}
            onSelectMeeting={handleSelectMeeting}
            onCreateNew={() => requireAuth(() => navigateTo('meeting-create'))}
            onSelectUser={handleUserClick}
          />
        ) : currentView === 'meeting-detail' && selectedMeetingId ? (
          <MeetingDetail 
            meeting={meetings.find(m => m.id === selectedMeetingId)!}
            allExhibitions={exhibitions}
            allTours={createdTours}
            onBack={goBack}
            onSelectExhibition={handleExhibitionSelect}
            onSelectTour={(t) => {}}
            onAcceptParticipant={() => {}}
            onEnterChat={() => navigateTo('chat-room')}
            currentUserId={currentUser.id}
            onJoinRequest={() => handleJoinRequest(selectedMeetingId)}
            onSelectUser={handleUserClick}
          />
        ) : currentView === 'chat-list' ? (
          <ChatList
            rooms={chatRooms}
            meetings={meetings}
            onSelectRoom={(id) => { setSelectedMeetingId(id); navigateTo('chat-room'); }}
            onLeaveChat={(id) => { /* 탈퇴 로직 */ }}
          />
        ) : currentView === 'chat-room' && selectedMeetingId ? (
          <ChatRoom
            meetingId={selectedMeetingId}
            meeting={meetings.find(m => m.id === selectedMeetingId)!}
            allExhibitions={exhibitions}
            allTours={createdTours}
            messages={currentChatMessages}
            onBack={goBack}
            onSelectExhibition={handleExhibitionSelect}
            onSelectTour={() => {}}
            onSelectMeeting={handleSelectMeeting}
            onSendMessage={handleSendMessage}
            currentUserId={currentUser.id}
            onSelectUser={handleUserClick}
          />
        ) : currentView === 'mytour' ? (
          <MyTourSession 
            likedExhibitions={exhibitions.filter(ex => likedExhibitionIds.has(ex.id))} 
            likedExhibitionIds={likedExhibitionIds} 
            onSelectExhibition={handleExhibitionSelect} 
            tourExhibitionIds={tourExhibitionIds} 
            onUpdateTour={setTourExhibitionIds} 
            createdTours={createdTours.filter(t => !blockedIds.has(t.creatorId))} 
            onCreateTour={handleCreateTour} 
            onUpdateTourData={handleUpdateTourData} 
            onDeleteTour={handleDeleteTour} 
            onLikeTourToggle={(id) => {}} 
            onTourSelect={(t) => {}} 
            allExhibitions={exhibitions} 
            onSelectExhibitionRaw={handleExhibitionSelect} 
            onCreatingStateChange={setIsTourCreating} 
            requireAuth={requireAuth} 
            currentUserId={currentUser.id} 
            initialEditTour={pendingEditTour} 
            onEditStarted={() => setPendingEditTour(null)} 
          />
        ) : currentView === 'profile' ? (
          <ProfileView 
            userId={currentUser.id} 
            userName={currentUser.name} 
            instagramUrl={currentUser.instagramUrl} 
            bio={currentUser.bio} 
            role={currentUser.role} 
            isMe={true} 
            myBlockedIds={blockedIds} 
            likedExhibitionIds={likedExhibitionIds} 
            meetings={meetings} 
            tours={createdTours} 
            allExhibitions={exhibitions} 
            onBack={goBack} 
            onBlockToggle={handleBlockToggle} 
            onReport={handleReportUser} 
            onSelectMeeting={handleSelectMeeting} 
            onSelectTour={() => {}} 
            onSelectExhibition={handleExhibitionSelect} 
            onSelectUser={handleUserClick} 
            onGoSettings={() => navigateTo('settings')} 
            onNicknameChange={handleNicknameChange} 
            onInstagramUrlChange={handleInstagramUrlChange} 
            onBioChange={handleBioChange} 
            onRoleChange={handleRoleChange} 
          />
        ) : currentView === 'user-profile' && selectedUserId ? (
          isTargetLoading ? (
            <div className="flex flex-col items-center justify-center py-40"><div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-6"></div><p className="text-sm font-medium text-slate-400">불러오는 중...</p></div>
          ) : targetUserData ? (
            <ProfileView 
              userId={targetUserData.id} 
              userName={targetUserData.name} 
              instagramUrl={targetUserData.instagramUrl} 
              bio={targetUserData.bio} 
              role={targetUserData.role} 
              isMe={false} 
              myBlockedIds={blockedIds} 
              likedExhibitionIds={new Set()} 
              meetings={meetings} 
              tours={createdTours} 
              allExhibitions={exhibitions} 
              onBack={goBack} 
              onBlockToggle={handleBlockToggle} 
              onReport={handleReportUser} 
              onSelectMeeting={handleSelectMeeting} 
              onSelectTour={() => {}} 
              onSelectExhibition={handleExhibitionSelect} 
              onSelectUser={handleUserClick} 
              onGoSettings={() => {}} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-40 px-10 text-center"><p className="text-sm font-medium text-slate-400">사용자를 찾을 수 없습니다.</p><button onClick={goBack} className="mt-8 px-10 py-4 bg-slate-800 text-white font-black rounded-[2rem] text-xs">뒤로 가기</button></div>
          )
        ) : currentView === 'settings' ? (
          <SettingsView onBack={goBack} onNavigateBlocked={() => navigateTo('blocked-management')} onNavigateCustomerService={() => navigateTo('customer-service')} onWithdrawal={() => navigateTo('withdrawal-guide')} />
        ) : currentView === 'blocked-management' ? (
          <BlockedManagementView blockedIds={blockedIds} onBack={goBack} onUnblock={handleBlockToggle} />
        ) : currentView === 'withdrawal-guide' ? ( <WithdrawalGuideView onBack={goBack} />
        ) : currentView === 'report-guide' ? ( <ReportGuideView onBack={goBack} />
        ) : currentView === 'customer-service' ? ( <CustomerServiceView onBack={goBack} />
        ) : currentView === 'register' ? (
          <div className="pb-32 animate-in fade-in duration-500 bg-white">
             <div className="px-8 py-10 flex items-center gap-6">
              <button onClick={goBack} className="text-slate-400 active:scale-90"><i className="fa-solid fa-chevron-left"></i></button>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editingExhibitionId ? '전시 수정' : '새 전시 등록'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="px-8 space-y-12">
              <FormSection title="공식 정보" required>
                <div className="space-y-4">
                  <p className="text-xs font-medium text-slate-400">전시 공식 정보가 담긴 URL을 입력해 주세요.</p>
                  <input type="url" placeholder="https://..." value={formData.representativeLink} onChange={(e) => setFormData({...formData, representativeLink: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-slate-100 outline-none" />
                </div>
              </FormSection>
              <FormSection title="전시 내용" required>
                <div className="space-y-6">
                  <input type="text" placeholder="전시 제목" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-slate-100 outline-none" />
                  <input type="text" placeholder="작가명 (선택)" value={formData.artist || ''} onChange={(e) => setFormData({...formData, artist: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-slate-100 outline-none" />
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">전시 마감일 <span className="text-red-400">*</span></label>
                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-800" />
                  </div>
                </div>
              </FormSection>
              <FormSection title="장소 정보" required>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block mb-3">갤러리 이름 <span className="text-red-400">*</span></label>
                    <input type="text" placeholder="갤러리 이름을 입력하세요" value={formData.galleryName} onChange={(e) => setFormData({...formData, galleryName: e.target.value})} className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-slate-100" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block mb-3">관람 지역 <span className="text-red-400">*</span></label>
                    <div className="grid grid-cols-3 gap-2">
                      {REGIONS.map(reg => (
                        <button key={reg} type="button" onClick={() => setFormData({...formData, region: reg})} className={`py-3 rounded-xl text-[11px] font-black transition-all border ${formData.region === reg ? 'bg-slate-800 border-slate-800 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{reg}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </FormSection>
              <FormSection title="이용 시간" required>
                <OperatingHoursForm selectedDays={formData.selectedDays} closingNote={formData.closingNote} onDaysChange={(days) => setFormData({...formData, selectedDays: days})} onClosingNoteChange={(val) => setFormData({...formData, closingNote: val})} />
              </FormSection>
              <div className="pt-8 pb-12"><button type="submit" className="w-full py-5 bg-slate-800 text-white font-black rounded-[2rem] active:scale-95 transition-transform">{editingExhibitionId ? '수정 완료' : '등록 완료'}</button></div>
            </form>
          </div>
        ) : ( <div className="p-20 text-center text-slate-300 font-bold">LOADING...</div> )}
      </main>
      {shouldShowBottomNav && <BottomNav currentView={currentView} onViewChange={navigateTo} />}
      {isReportModalOpen && reportTarget && (
        <ReportModal targetUserName={reportTarget.name} onClose={() => { setIsReportModalOpen(false); setReportTarget(null); }} onSubmit={handleReportSubmit} />
      )}
    </div>
  );
};

export default App;
