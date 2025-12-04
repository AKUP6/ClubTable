// Example usage of ClubList component
import React from 'react';
import ClubList, { Club } from './ClubList';

// Import club data from JSON file
// @ts-ignore - JSON import
import clubsData from '../../database/json/clubs/clubs.json';

const sampleClubs: Club[] = clubsData.clubs as Club[];

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClubList clubs={sampleClubs} />
    </div>
  );
};

export default App;

