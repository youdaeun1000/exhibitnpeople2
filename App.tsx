
import { db, auth } from './firebase'
import { doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp, collection, addDoc, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import FormSection from './components/FormSection';
import OperatingHoursForm from './components/OperatingHoursForm';
import ExhibitionList from './components/ExhibitionList';
import ExhibitionDetail from './components/ExhibitionDetail';
import MyTourSession from './components/MyTourSession';
import MeetingCreate from './components/MeetingCreate';
import MeetingList from './components/MeetingList';
import MeetingDetail from './components/MeetingDetail';
import ChatRoom from './components/ChatRoom';
import ChatList from './components/ChatList';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import BlockedManagementView from './components/BlockedManagementView';
import SignupView from './components/SignupView';
import LoginView from './components/LoginView';
import WithdrawalGuideView from './components/WithdrawalGuideView';
import ReportGuideView from './components/ReportGuideView';
import CustomerServiceView from './components/CustomerServiceView';
import ExhibitionMeetingsView from './components/ExhibitionMeetingsView';
import ReportModal from './components/ReportModal';
import { ExhibitionData, ViewType, Tour, Meeting, ChatMessage, DayOfWeek, TourStop, UserRole, ReportReason } from './types';
import { DUMMY_EXHIBITIONS, DUMMY_USERS, DAYS, REGIONS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [pendingUser, setPendingUser] = useState<{uid: string, email: string, name: string} | null>(null);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingMessage, setSavingMessage] = useState('정보를 처리하고 있습니다...');
  
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [history, setHistory] = useState<ViewType[]>([]);
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string | null>(null);
  const [editingExhibitionId, setEditingExhibitionId] = useState<string | null>(null);
  const [pendingEditTour, setPendingEditTour] = useState<Tour | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [selectedExhibitionForMeetings, setSelectedExhibitionForMeetings] = useState<{id: string, title: string} | null>(null);
  
  const initialUserState = {
    id: '',
    name: '익명',
    email: '',
    instagramUrl: null as string | null,
    bio: null as string | null,
    role: 'Viewer' as UserRole,
    lastNicknameChangedAt: 0,
  };

  const [currentUser, setCurrentUser] = useState(initialUserState);

  const [likedExhibitionIds, setLikedExhibitionIds] = useState<Set<string>>(new Set());
  const [targetUserData, setTargetUserData] = useState<{id: string, name: string, instagramUrl: string | null, bio: string | null, role: UserRole} | null>(null);
  const [isTargetLoading, setIsTargetLoading] = useState(false);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [exhibitions, setExhibitions] = useState<ExhibitionData[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [tourExhibitionIds, setTourExhibitionIds] = useState<string[]>([]);
  const [createdTours, setCreatedTours] = useState<Tour[]>([]);

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

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    if (currentView === 'chat-room' && selectedMeetingId) {
      const q = query(
        collection(db, "chats", selectedMeetingId, "messages"),
        orderBy("createdAt", "asc")
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            meetingId: selectedMeetingId,
            senderId: data.senderId,
            senderName: data.senderName,
            text: data.text,
            createdAt: data.createdAt?.toMillis() || Date.now(),
          } as ChatMessage;
        });
        setMessages(msgs);
      });
    }
    return () => unsubscribe();
  }, [currentView, selectedMeetingId]);

  useEffect(() => {
    if (!isLoggedIn || !currentUser.id) {
      setChatRooms([]);
      return;
    }
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      rooms.sort((a: any, b: any) => {
        const timeA = a.lastMessageAt?.toMillis() || 0;
        const timeB = b.lastMessageAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setChatRooms(rooms);
    }, (error) => {
      console.error("채팅방 목록 로드 실패:", error);
    });
    return () => unsubscribe();
  }, [isLoggedIn, currentUser.id]);

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
      const creatorIds: string[] = Array.from(new Set(querySnapshot.docs.map(doc => doc.data().creatorId as string))).filter((id): id is string => !!id);
      
      const userProfiles: Record<string, string> = {};
      await Promise.all(creatorIds.map(async (uid: string) => {
        try {
          const uDoc = await getDoc(doc(db, "Users", uid));
          if (uDoc.exists()) {
            const userData = uDoc.data();
            userProfiles[uid] = userData.nickname || userData.name || '알 수 없음';
          }
        } catch (e) {
          console.error(`User profile fetch error (${uid}):`, e);
        }
      }));

      const fetched = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const meetingDateStr = data.meetingDate && data.meetingDate.toDate ? data.meetingDate.toDate().toISOString().split('T')[0] : '';
        const meetingTimeStr = data.meetingDate && data.meetingDate.toDate ? data.meetingDate.toDate().toTimeString().split(' ')[0].slice(0, 5) : '';
        
        return { 
          id: doc.id, 
          ...data,
          targetId: data.targetId || data.tourId || data.exhibitionId || '',
          targetType: data.targetType || (data.tourId ? 'tour' : 'exhibition'),
          location: data.meetingPlace || data.location || '',
          creatorName: userProfiles[data.creatorId as string] || '알 수 없음',
          meetingDate: meetingDateStr,
          meetingTime: meetingTimeStr,
          participants: (data.participants || []).map((p: any) => typeof p === 'string' ? { userId: p, status: 'accepted', userName: '참가자' } : p),
          kickedUserIds: data.kickedUserIds || []
        };
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

  const fetchUserFavorites = async (userId: string) => {
    try {
      const uRef = doc(db, "Users", userId);
      const uDoc = await getDoc(uRef);
      if (uDoc.exists()) {
        const data = uDoc.data();
        if (data.favorites && Array.isArray(data.favorites)) setLikedExhibitionIds(new Set(data.favorites));
        
        setCurrentUser(prev => ({ 
          ...prev, 
          name: data.nickname || data.name || '알 수 없음',
          instagramUrl: data.instagramUrl || null,
          bio: data.bio || null,
          role: data.role || 'Viewer'
        }));
      }
    } catch (error) { console.error("좋아요 목록 동기화 실패:", error); }
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
  const [meetingContext, setMeetingContext] = useState<{ id: string, title: string, type: 'exhibition' | 'tour', location: string } | null>(null);
  const [isTourCreating, setIsTourCreating] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const navigateTo = (view: ViewType) => {
    if (['chat', 'profile', 'settings', 'register'].includes(view)) {
      if (!isLoggedIn) { setShowLoginOverlay(true); return; }
    }
    setHistory(prev => [...prev, currentView]);
    setCurrentView(view);
    window.scrollTo({ top: 0 });
  };

  const handleExhibitionSelect = (ex: ExhibitionData) => {
    setSelectedExhibitionId(ex.id);
    navigateTo('exhibition-detail');
  };

  const handleMeetingSelect = (id: string) => {
    setSelectedMeetingId(id);
    navigateTo('meeting-detail');
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

  const handleSendMessage = async (text: string) => {
    if (!selectedMeetingId) return;
    try {
      await addDoc(collection(db, "chats", selectedMeetingId, "messages"), {
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: text,
        createdAt: serverTimestamp()
      });
      const meeting = meetings.find(m => m.id === selectedMeetingId);
      const meetingTitle = meeting ? meeting.title : "알 수 없는 모임";
      await setDoc(doc(db, "chats", selectedMeetingId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        participants: arrayUnion(currentUser.id),
        meetingTitle: meetingTitle
      }, { merge: true });
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  const handleLeaveChat = async (chatId: string) => {
    if (!window.confirm("채팅방에서 나가시겠습니까? 나간 후에는 대화 내용을 볼 수 없으며 다시 참여하려면 모임 신청이 필요할 수 있습니다.")) return;
    setIsSaving(true);
    setSavingMessage('채팅방을 나가는 중입니다...');
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        participants: arrayRemove(currentUser.id)
      });
      alert('정상적으로 처리되었습니다.');
    } catch (error) {
      console.error("채팅방 나가기 오류:", error);
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleJoinRequest = async (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    requireAuth(async () => {
      if (meeting.kickedUserIds?.includes(currentUser.id)) {
        alert("이 모임에는 더 이상 참여할 수 없습니다.");
        return;
      }
      const isAlreadyParticipating = meeting.creatorId === currentUser.id || 
        meeting.participants.some(p => p.userId === currentUser.id);
      if (isAlreadyParticipating) {
        alert("이미 참여 중인 모임입니다.");
        return;
      }
      const acceptedCount = meeting.participants.filter(p => p.status === 'accepted').length + 1;
      if (acceptedCount >= meeting.maxParticipants) {
        alert("정원이 초과되어 신청할 수 없습니다.");
        return;
      }
      const answer = window.prompt(meeting.question || "참가 신청 답변을 입력해주세요.");
      if (answer === null) return;
      if (!answer.trim()) {
        alert("답변을 입력해야 신청이 가능합니다.");
        return;
      }
      setIsSaving(true);
      setSavingMessage("참가 신청을 처리하고 있습니다...");
      try {
        const meetingRef = doc(db, "meetings", meetingId);
        await updateDoc(meetingRef, {
          participants: arrayUnion(currentUser.id)
        });
        const chatRef = doc(db, "chats", meetingId);
        await setDoc(chatRef, {
          participants: arrayUnion(currentUser.id),
          lastMessage: `${currentUser.name}님이 참여하셨습니다.`,
          lastMessageAt: serverTimestamp(),
          meetingTitle: meeting.title
        }, { merge: true });
        alert("참가 신청이 완료되었습니다.");
        await fetchMeetings();
      } catch (error) {
        console.error("모임 신청 오류:", error);
        alert("신청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
      } finally {
        setIsSaving(false);
      }
    });
  };

  const handleKickParticipant = async (meetingId: string, userId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting || meeting.creatorId !== currentUser.id) return;
    if (!window.confirm("이 사용자를 모임에서 내보내시겠어요?")) return;
    setIsSaving(true);
    setSavingMessage('참여자를 내보내는 중입니다...');
    try {
      const meetingRef = doc(db, "meetings", meetingId);
      const chatRef = doc(db, "chats", meetingId);
      const updatedParticipants = meeting.participants.filter(p => p.userId !== userId);
      await updateDoc(meetingRef, {
        participants: updatedParticipants,
        kickedUserIds: arrayUnion(userId)
      });
      await updateDoc(chatRef, {
        participants: arrayRemove(userId)
      });
      alert('해당 사용자가 모임에서 제외되었습니다.');
      await fetchMeetings();
    } catch (error) {
      console.error("내보내기 오류:", error);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLikeToggle = async (exhibitionId: string) => {
    if (!isLoggedIn) { setShowLoginOverlay(true); return; }
    const isAlreadyLiked = likedExhibitionIds.has(exhibitionId);
    setLikedExhibitionIds(prev => {
      const next = new Set(prev);
      if (isAlreadyLiked) next.delete(exhibitionId);
      else next.add(exhibitionId);
      return next;
    });
    try {
      const userRef = doc(db, "Users", currentUser.id);
      await updateDoc(userRef, { favorites: isAlreadyLiked ? arrayRemove(exhibitionId) : arrayUnion(exhibitionId) });
    } catch (error) { console.error("좋아요 DB 업데이트 실패:", error); }
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

  const resetForm = () => {
    setFormData({
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
    setEditingExhibitionId(null);
  };

  const handleAddExhibitionClick = () => {
    requireAuth(() => { resetForm(); navigateTo('register'); });
  };

  const handleJoinMeetingClick = (id: string, title: string) => {
    requireAuth(() => {
      setSelectedExhibitionForMeetings({id, title});
      navigateTo('exhibition-meetings');
    });
  };

  const handleVerifyComplete = (userData: {uid: string, email: string, name: string}, isExisting: boolean) => {
    if (isExisting) {
      // 기존 유저는 바로 로그인
      const user = {
        id: userData.uid,
        name: userData.name,
        email: userData.email,
        instagramUrl: null,
        bio: null,
        role: 'Viewer' as UserRole,
        lastNicknameChangedAt: 0
      };
      setCurrentUser(user);
      localStorage.setItem('exhibireg_user', JSON.stringify(user));
      setIsLoggedIn(true);
      setShowLoginOverlay(false);
      fetchUserFavorites(userData.uid);
    } else {
      // 신규 유저는 프로필 설정으로
      setPendingUser(userData);
      setIsNewUser(true);
    }
  };

  const handleSignupComplete = async (userData: { name: string; email: string }) => {
    if (isSaving || !pendingUser) return;
    setIsSaving(true);
    const userId = pendingUser.uid;
    try {
      await setDoc(doc(db, "Users", userId), {
        userId: userId, 
        email: userData.email, 
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
        email: userData.email, 
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
    } catch (error) { console.error('가입 오류:', error); } finally { setIsSaving(false); }
  };

  const handleUserClick = async (userId: string) => {
    setSelectedUserId(userId); navigateTo('user-profile');
    setIsTargetLoading(true); setTargetUserData(null);
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
    } catch (error) { console.error("사용자 정보 조회 실패:", error); } finally { setIsTargetLoading(false); }
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

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    setIsSaving(true);
    setSavingMessage('로그아웃 중입니다...');
    try {
      await signOut(auth);
      localStorage.removeItem('exhibireg_user');
      setIsLoggedIn(false);
      setCurrentUser(initialUserState);
      setLikedExhibitionIds(new Set());
      setCurrentView('list');
      setHistory([]);
      alert("로그아웃 되었습니다.");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
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

  const handleCreateTour = async (title: string, stops: TourStop[]) => {
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
        });
        alert('투어가 저장되었습니다');
        setIsTourCreating(false);
        await fetchTours();
      } catch (error) { console.error("투어 저장 오류:", error); alert('투어 저장 중 오류가 발생했습니다.'); } finally { setIsSaving(false); }
    });
  };

  const handleUpdateTourData = async (id: string, title: string, stops: TourStop[]) => {
    if (stops.length === 0) { alert('코스에 전시나 티타임을 최소 하나 이상 추가해 주세요.'); return; }
    setIsSaving(true);
    setSavingMessage('투어 정보를 수정하고 있습니다...');
    try {
      const steps = stops.map(stop => {
        if (stop.type === 'exhibition') return { type: 'exhibition', exhibitionId: stop.exhibitionId };
        return { type: 'teatime' };
      });
      const exhibitionIds = stops.filter(s => s.type === 'exhibition').map(s => s.exhibitionId!);
      await updateDoc(doc(db, "tours", id), { title, exhibitionIds, steps, updatedAt: serverTimestamp() });
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

  if (showLoginOverlay) {
    if (isNewUser && pendingUser) return <SignupView email={pendingUser.email} onSignupComplete={handleSignupComplete} />;
    return (
      <div className="fixed inset-0 z-[2000] bg-white max-w-lg mx-auto overflow-y-auto">
        <div className="absolute top-8 left-8 z-[2001]">
          <button onClick={() => setShowLoginOverlay(false)} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <LoginView onVerifyComplete={handleVerifyComplete} />
      </div>
    );
  }

  const shouldShowHeader = !isTourCreating && !['exhibition-detail', 'meeting-detail', 'meeting-create', 'chat-room', 'user-profile', 'register', 'settings', 'blocked-management', 'withdrawal-guide', 'report-guide', 'customer-service', 'exhibition-meetings'].includes(currentView);
  const shouldShowBottomNav = !isTourCreating && ['list', 'mytour', 'meeting', 'chat', 'profile'].includes(currentView);

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen relative flex flex-col">
      {shouldShowHeader && <Header showAddButton={currentView === 'list'} onAddClick={handleAddExhibitionClick} isLoggedIn={isLoggedIn} onLoginClick={() => setShowLoginOverlay(true)} />}
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
          <ExhibitionList exhibitions={exhibitions} onSelect={handleExhibitionSelect} likedIds={likedExhibitionIds} onLikeToggle={handleLikeToggle} onJoinMeetingClick={handleJoinMeetingClick} currentUserId={currentUser.id} />
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
            onSelectMeeting={handleMeetingSelect} 
            onSelectUser={handleUserClick} 
          />
        ) : currentView === 'mytour' ? (
          <MyTourSession likedExhibitions={exhibitions.filter(ex => likedExhibitionIds.has(ex.id))} likedExhibitionIds={likedExhibitionIds} onSelectExhibition={handleExhibitionSelect} tourExhibitionIds={tourExhibitionIds} onUpdateTour={setTourExhibitionIds} createdTours={createdTours.filter(t => !blockedIds.has(t.creatorId))} onCreateTour={handleCreateTour} onUpdateTourData={handleUpdateTourData} onDeleteTour={handleDeleteTour} onLikeTourToggle={(id) => {}} onTourSelect={(t) => {}} allExhibitions={exhibitions} onSelectExhibitionRaw={handleExhibitionSelect} onCreateMeeting={(id, title) => requireAuth(() => { const tour = createdTours.find(ct => ct.id === id); const firstExId = tour?.exhibitionIds?.[0]; setMeetingContext({ id, title, type: 'tour', location: exhibitions.find(e => e.id === (firstExId || ''))?.region || '' }); navigateTo('meeting-create'); })} onCreatingStateChange={setIsTourCreating} requireAuth={requireAuth} currentUserId={currentUser.id} initialEditTour={pendingEditTour} onEditStarted={() => setPendingEditTour(null)} />
        ) : currentView === 'meeting' ? (
          <MeetingList meetings={meetings.filter(m => !blockedIds.has(m.creatorId))} allExhibitions={exhibitions} allTours={createdTours} currentUserId={currentUser.id} onSelectMeeting={handleMeetingSelect} onEnterChat={(id) => requireAuth(() => { setSelectedMeetingId(id); navigateTo('chat-room'); })} onSelectUser={handleUserClick} onJoinRequest={handleJoinRequest} onKickParticipant={handleKickParticipant} />
        ) : currentView === 'meeting-detail' && selectedMeetingId ? (
          <MeetingDetail 
            meeting={meetings.find(m => m.id === selectedMeetingId)!} 
            allExhibitions={exhibitions} 
            allTours={createdTours} 
            onBack={goBack} 
            onSelectExhibition={handleExhibitionSelect} 
            onSelectTour={(t) => {}} 
            onAcceptParticipant={() => {}} 
            onEnterChat={() => requireAuth(() => { setSelectedMeetingId(selectedMeetingId); navigateTo('chat-room'); })} 
            currentUserId={currentUser.id} 
            onJoinRequest={() => handleJoinRequest(selectedMeetingId)} 
            onSelectUser={handleUserClick} 
            onKickParticipant={(uid) => handleKickParticipant(selectedMeetingId, uid)} 
          />
        ) : currentView === 'chat' ? (
          <ChatList rooms={chatRooms} meetings={meetings} onSelectRoom={(id) => { setSelectedMeetingId(id); navigateTo('chat-room'); }} onLeaveChat={handleLeaveChat} />
        ) : currentView === 'profile' ? (
          <ProfileView userId={currentUser.id} userName={currentUser.name} instagramUrl={currentUser.instagramUrl} bio={currentUser.bio} role={currentUser.role} isMe={true} myBlockedIds={blockedIds} likedExhibitionIds={likedExhibitionIds} meetings={meetings} tours={createdTours} allExhibitions={exhibitions} onBack={goBack} onBlockToggle={handleBlockToggle} onReport={handleReportUser} onSelectMeeting={handleMeetingSelect} onSelectTour={(tour) => {}} onSelectExhibition={handleExhibitionSelect} onSelectUser={handleUserClick} onGoSettings={() => navigateTo('settings')} onNicknameChange={handleNicknameChange} onInstagramUrlChange={handleInstagramUrlChange} onBioChange={handleBioChange} onRoleChange={handleRoleChange} />
        ) : currentView === 'user-profile' && selectedUserId ? (
          isTargetLoading ? (
            <div className="flex flex-col items-center justify-center py-40"><div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-6"></div><p className="text-sm font-medium text-slate-400">불러오는 중...</p></div>
          ) : targetUserData ? (
            <ProfileView userId={targetUserData.id} userName={targetUserData.name} instagramUrl={targetUserData.instagramUrl} bio={targetUserData.bio} role={targetUserData.role} isMe={false} myBlockedIds={blockedIds} likedExhibitionIds={new Set()} meetings={meetings} tours={createdTours} allExhibitions={exhibitions} onBack={goBack} onBlockToggle={handleBlockToggle} onReport={handleReportUser} onSelectMeeting={handleMeetingSelect} onSelectTour={(tour) => {}} onSelectExhibition={handleExhibitionSelect} onSelectUser={handleUserClick} onGoSettings={() => {}} />
          ) : (
            <div className="flex flex-col items-center justify-center py-40 px-10 text-center"><p className="text-sm font-medium text-slate-400">사용자를 찾을 수 없습니다.</p><button onClick={goBack} className="mt-8 px-10 py-4 bg-slate-800 text-white font-black rounded-[2rem] text-xs">뒤로 가기</button></div>
          )
        ) : currentView === 'settings' ? (
          <SettingsView onBack={goBack} onNavigateBlocked={() => navigateTo('blocked-management')} onNavigateCustomerService={() => navigateTo('customer-service')} onWithdrawal={() => navigateTo('withdrawal-guide')} onLogout={handleLogout} />
        ) : currentView === 'blocked-management' ? (
          <BlockedManagementView blockedIds={blockedIds} onBack={goBack} onUnblock={handleBlockToggle} />
        ) : currentView === 'withdrawal-guide' ? ( <WithdrawalGuideView onBack={goBack} />
        ) : currentView === 'report-guide' ? ( <ReportGuideView onBack={goBack} />
        ) : currentView === 'customer-service' ? ( <CustomerServiceView onBack={goBack} />
        ) : currentView === 'exhibition-meetings' && selectedExhibitionForMeetings ? (
          <ExhibitionMeetingsView exhibitionId={selectedExhibitionForMeetings.id} exhibitionTitle={selectedExhibitionForMeetings.title} meetings={meetings} currentUserId={currentUser.id} onBack={goBack} onSelectMeeting={handleMeetingSelect} onCreateNew={() => { setMeetingContext({ id: selectedExhibitionForMeetings.id, title: selectedExhibitionForMeetings.title, type: 'exhibition', location: exhibitions.find(e => e.id === selectedExhibitionForMeetings.id)?.region || '' }); navigateTo('meeting-create'); }} onSelectUser={handleUserClick} />
        ) : currentView === 'meeting-create' && meetingContext ? (
          <MeetingCreate context={meetingContext} onBack={goBack} onCreated={(m) => { fetchMeetings(); setCurrentView('meeting'); setHistory([]); }} currentUserId={currentUser.id} />
        ) : currentView === 'chat-room' && selectedMeetingId ? (
          <ChatRoom meetingId={selectedMeetingId} meeting={meetings.find(m => m.id === selectedMeetingId)!} allExhibitions={exhibitions} allTours={createdTours} messages={messages.filter(msg => msg.meetingId === selectedMeetingId)} onBack={goBack} onSelectExhibition={handleExhibitionSelect} onSelectTour={(tour) => {}} onSelectMeeting={handleMeetingSelect} onSendMessage={handleSendMessage} currentUserId={currentUser.id} onSelectUser={handleUserClick} />
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
