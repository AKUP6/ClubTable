import React, { useState, useMemo } from 'react';
import ClubDetailsModal from './ClubDetailsModal';

// Type definitions
export interface Club {
  id: string;
  name: string;
  owner: string | string[]; // Can be single owner or list of owners/liaisons
  meetingTime: string;
  location: string;
  applicationRequired: boolean;
  applicationDeadline?: string; // only if applicationRequired = true
  auditionRequired?: boolean; // Optional audition requirement
  // Extended fields for modal
  coverImage?: string; // URL to club cover image
  description?: string; // Multi-paragraph description
  contactEmails?: string[]; // Array of contact email addresses
  applicationInfo?: string; // Additional application information
  auditionInfo?: string; // Additional audition information
  metadata?: Record<string, any>; // Any extra metadata
}

interface ClubListProps {
  clubs: Club[];
}

type FilterType = 'all' | 'open' | 'application';

const ClubList: React.FC<ClubListProps> = ({ clubs }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and search logic
  const filteredClubs = useMemo(() => {
    let result = clubs;

    // Apply filter
    if (activeFilter === 'open') {
      result = result.filter(club => !club.applicationRequired);
    } else if (activeFilter === 'application') {
      result = result.filter(club => club.applicationRequired);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(club =>
        club.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [clubs, activeFilter, searchQuery]);

  // Format deadline date
  const formatDeadline = (deadline: string): string => {
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return deadline;
    }
  };

  // Handle club click to open modal
  const handleClubClick = (club: Club) => {
    setSelectedClub(club);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClub(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Yale Clubs</h1>
        <p className="text-gray-600">Browse and discover clubs at Yale</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search clubs by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
              activeFilter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Clubs
          </button>
          <button
            onClick={() => setActiveFilter('open')}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
              activeFilter === 'open'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Open Join
          </button>
          <button
            onClick={() => setActiveFilter('application')}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
              activeFilter === 'application'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Application Required
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {filteredClubs.length === 1
            ? '1 club found'
            : `${filteredClubs.length} clubs found`}
        </p>
      </div>

      {/* Empty State */}
      {filteredClubs.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clubs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? 'Try adjusting your search or filter criteria.'
              : 'No clubs match your current filter.'}
          </p>
        </div>
      ) : (
        /* Club Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Club Name - Clickable */}
                <button
                  onClick={() => handleClubClick(club)}
                  className="text-left w-full"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                    {club.name}
                  </h2>
                </button>

                {/* Badge */}
                <div className="mb-4">
                  {club.applicationRequired ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                      Application Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Open Join
                    </span>
                  )}
                </div>

                {/* Club Details */}
                <div className="space-y-3">
                  {/* Owner */}
                  <div className="flex items-start">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Owner / Liaison
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {club.owner}
                      </p>
                    </div>
                  </div>

                  {/* Meeting Time */}
                  <div className="flex items-start">
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
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Meeting Time
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {club.meetingTime}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start">
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
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Location
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {club.location}
                      </p>
                    </div>
                  </div>

                  {/* Application Deadline */}
                  {club.applicationRequired && club.applicationDeadline && (
                    <div className="flex items-start pt-2 border-t border-gray-100">
                      <svg
                        className="h-5 w-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <p className="text-xs text-orange-600 uppercase tracking-wide font-semibold">
                          Application Deadline
                        </p>
                        <p className="text-sm font-medium text-orange-700">
                          {formatDeadline(club.applicationDeadline)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => handleClubClick(club)}
                  className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Club Details Modal */}
      <ClubDetailsModal
        club={selectedClub}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ClubList;

