import React, { useEffect, useRef, useState } from 'react';
import { Club } from './ClubList';

interface ClubDetailsModalProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FlashMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const ClubDetailsModal: React.FC<ClubDetailsModalProps> = ({
  club,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [flashMessages, setFlashMessages] = useState<FlashMessage[]>([]);
  const flashIdCounter = useRef(0);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Flash message system
  const showFlash = (message: string, type: FlashMessage['type'] = 'success') => {
    const id = flashIdCounter.current++;
    const newFlash: FlashMessage = { id, message, type };
    setFlashMessages(prev => [...prev, newFlash]);
    
    // Auto-dismiss after 3.6 seconds
    setTimeout(() => {
      setFlashMessages(prev => prev.filter(f => f.id !== id));
    }, 3600);
  };

  const dismissFlash = (id: number) => {
    setFlashMessages(prev => prev.filter(f => f.id !== id));
  };

  // Quick actions
  const handleContact = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      showFlash(`Copied ${email}`, 'success');
    }).catch(() => {
      showFlash('Failed to copy email', 'error');
    });
  };

  const handleSave = () => {
    // Save to favorites (localStorage mock)
    const favorites = JSON.parse(localStorage.getItem('clubtableFavorites') || '[]');
    if (!favorites.includes(club!.id)) {
      favorites.push(club!.id);
      localStorage.setItem('clubtableFavorites', JSON.stringify(favorites));
      showFlash(`Saved ${club!.name} to favorites`, 'success');
    } else {
      showFlash(`${club!.name} is already in favorites`, 'info');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showFlash('Link copied to clipboard', 'success');
    }).catch(() => {
      showFlash('Failed to copy link', 'error');
    });
  };

  const handleInterestJoin = () => {
    showFlash(`Interested in joining ${club!.name}!`, 'success');
    // In a real app, this would trigger an application or join flow
  };

  if (!isOpen || !club) {
    return null;
  }

  // Format deadline date
  const formatDeadline = (deadline: string): string => {
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return deadline;
    }
  };

  return (
    <>
      {/* Animation Styles */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .modal-overlay {
          animation: modalFadeIn 0.2s ease-out;
        }
        .modal-content {
          animation: modalScaleUp 0.2s ease-out;
        }
      `}</style>
      
      {/* Flash Messages */}
      {flashMessages.length > 0 && (
        <div className="flash-banner-container">
          {flashMessages.map(flash => (
            <div key={flash.id} className={`flash-banner flash-${flash.type}`}>
              <i className={`fas ${
                flash.type === 'success' ? 'fa-check-circle' :
                flash.type === 'error' ? 'fa-exclamation-circle' :
                flash.type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle'
              } flash-icon`}></i>
              <span className="flash-text">{flash.message}</span>
              <button
                onClick={() => dismissFlash(flash.id)}
                className="flash-close"
                aria-label="Dismiss"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 modal-overlay"
      >
        <div
          ref={modalRef}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col modal-content"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors duration-200"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Gradient Hero Header */}
          <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
            {club.coverImage && (
              <img
                src={club.coverImage}
                alt={`${club.name} cover`}
                className="w-full h-full object-cover opacity-40"
              />
            )}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-lg">
                {club.name}
              </h2>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {club.auditionRequired ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                    <i className="fas fa-microphone mr-1.5"></i>
                    Requires Audition
                  </span>
                ) : club.applicationRequired ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                    <i className="fas fa-clipboard-list mr-1.5"></i>
                    Requires Application
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    <i className="fas fa-check-circle mr-1.5"></i>
                    Open Join
                  </span>
                )}
                {club.applicationDeadline && (club.applicationRequired || club.auditionRequired) && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                    Deadline: {formatDeadline(club.applicationDeadline)}
                  </span>
                )}
              </div>
              {/* Interest/Join Button */}
              <button
                onClick={handleInterestJoin}
                className="self-start px-4 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-md"
              >
                <i className="fas fa-heart mr-2"></i>
                I'm Interested
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              {club.contactEmails && club.contactEmails.length > 0 && (
                <button
                  onClick={() => handleContact(club.contactEmails[0])}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors duration-200"
                >
                  <i className="fas fa-envelope"></i>
                  Contact
                </button>
              )}
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                <i className="fas fa-bookmark"></i>
                Save
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                <i className="fas fa-share-alt"></i>
                Share
              </button>
            </div>

            {/* Description */}
            {club.description && (
              <div className="mb-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  About
                </h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {club.description}
                </div>
              </div>
            )}

            {/* Owner / Liaison */}
            <div className="mb-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Owner / Liaison
              </h3>
              {Array.isArray(club.owner) ? (
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {club.owner.map((owner, idx) => (
                    <li key={idx}>{owner}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">{club.owner}</p>
              )}
            </div>

            {/* Contact Email(s) */}
            {club.contactEmails && club.contactEmails.length > 0 && (
              <div className="mb-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Contact
                </h3>
                <ul className="space-y-2">
                  {club.contactEmails.map((email, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <a
                        href={`mailto:${email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex-1"
                      >
                        {email}
                      </a>
                      <button
                        onClick={() => handleCopyEmail(email)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors duration-200"
                        title="Copy email"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Meeting Time + Location */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Meeting Time
                </h3>
                <p className="text-gray-700 flex items-start">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {club.meetingTime}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Location
                </h3>
                <p className="text-gray-700 flex items-start">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {club.location}
                </p>
              </div>
            </div>

            {/* Application / Audition Info */}
            {(club.applicationInfo || club.auditionInfo) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {club.auditionInfo ? 'Audition Information' : 'Application Information'}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-line leading-relaxed">
                  {club.auditionInfo || club.applicationInfo}
                </div>
              </div>
            )}

            {/* Extra Metadata */}
            {club.metadata && Object.keys(club.metadata).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Additional Information
                </h3>
                <dl className="space-y-2">
                  {Object.entries(club.metadata).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-start">
                      <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide sm:w-1/3 sm:pr-4">
                        {key}
                      </dt>
                      <dd className="text-sm text-gray-900 sm:w-2/3 mt-1 sm:mt-0">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClubDetailsModal;

