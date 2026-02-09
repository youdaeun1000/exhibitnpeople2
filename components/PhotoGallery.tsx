
import React, { useState } from 'react';
import { Review } from '../types';

interface PhotoGalleryProps {
  reviews: Review[];
  currentUserId: string;
  onDeleteReview: (id: string) => void;
  onToggleLike: (id: string) => void;
  onReport: (id: string, type: 'review') => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  reviews,
  currentUserId,
  onDeleteReview,
  onReport
}) => {
  const [expandedReview, setExpandedReview] = useState<Review | null>(null);

  // Get all reviews that have an image
  const photoReviews = reviews.filter(r => !!r.imageUrl);

  if (photoReviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-300 bg-slate-50 rounded-[3rem] mx-4 my-8 border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
           <i className="fa-solid fa-camera-retro text-2xl opacity-20"></i>
        </div>
        <p className="text-xs font-black uppercase tracking-widest">No Gallery Photos</p>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (window.confirm('사진과 함께 작성된 댓글을 삭제하시겠습니까?')) {
      onDeleteReview(id);
      setExpandedReview(null);
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="grid grid-cols-3 gap-1 animate-in fade-in duration-500 rounded-3xl overflow-hidden shadow-sm">
        {photoReviews.map((review, idx) => (
          <div 
            key={`${review.id}-${idx}`} 
            onClick={() => setExpandedReview(review)}
            className="aspect-square relative cursor-pointer overflow-hidden group bg-slate-200"
          >
            <img 
              src={review.imageUrl} 
              alt={`Gallery photo ${idx}`} 
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-active:scale-95" 
            />
          </div>
        ))}
      </div>

      {/* Expanded Image Modal */}
      {expandedReview && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setExpandedReview(null)}
        >
          <div className="absolute top-10 left-8 right-8 flex items-center justify-between z-[1010]">
             <div className="flex items-center gap-2">
                {expandedReview.userId === currentUserId ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(expandedReview.id); }}
                    className="px-4 py-2 bg-red-600 text-white text-[10px] font-black rounded-xl shadow-lg active:scale-90 transition-transform"
                  >
                    삭제
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onReport(expandedReview.id, 'review'); }}
                    className="px-4 py-2 bg-white/20 text-white text-[10px] font-black rounded-xl backdrop-blur-md active:scale-90 transition-transform"
                  >
                    신고
                  </button>
                )}
             </div>
             <button 
               className="text-white/70 hover:text-white text-4xl active:scale-90 transition-transform"
               onClick={() => setExpandedReview(null)}
             >
               <i className="fa-solid fa-xmark"></i>
             </button>
          </div>
          
          <img 
            src={expandedReview.imageUrl} 
            alt="Expanded gallery view" 
            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300" 
          />
          
          <div className="absolute bottom-10 left-8 right-8 bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/10" onClick={(e) => e.stopPropagation()}>
             <p className="text-white font-black text-sm mb-1">{expandedReview.userName}</p>
             <p className="text-white/70 text-xs leading-relaxed line-clamp-3">{expandedReview.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
