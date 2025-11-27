import React, { useEffect, useRef } from 'react';
import { Club } from './ClubList';

interface ClubDetailsModalProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
}

const ClubDetailsModal: React.FC<ClubDetailsModalProps> = ({
  club,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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
          {/* Cover Image */}
          {club.coverImage && (
            <div className="w-full h-48 sm:h-64 overflow-hidden">
              <img
                src={club.coverImage}
                alt={`${club.name} cover`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Club Name */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {club.name}
            </h2>

            {/* Application Status Badge */}
            <div className="mb-6">
              {club.applicationRequired ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                    Requires Application
                  </span>
                  {club.applicationDeadline && (
                    <span className="text-sm text-gray-600">
                      Deadline: {formatDeadline(club.applicationDeadline)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  Open Join
                </span>
              )}
              {club.auditionRequired && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 ml-2">
                  Requires Audition
                </span>
              )}
            </div>

            {/* Description */}
            {club.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  About
                </h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {club.description}
                </div>
              </div>
            )}

            {/* Owner / Liaison */}
            <div className="mb-6">
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
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Contact
                </h3>
                <ul className="space-y-1">
                  {club.contactEmails.map((email, idx) => (
                    <li key={idx}>
                      <a
                        href={`mailto:${email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {email}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Meeting Time + Location */}
            <div className="mb-6 space-y-4">
              <div>
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

              <div>
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

