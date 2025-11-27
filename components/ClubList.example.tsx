// Example usage of ClubList component
import React from 'react';
import ClubList, { Club } from './ClubList';

// Sample club data with extended fields for modal
const sampleClubs: Club[] = [
  {
    id: '1',
    name: 'Yale Debate Association',
    owner: ['Sarah Chen', 'Michael Park'],
    meetingTime: 'Tuesdays, 2:00 PM - 4:00 PM',
    location: 'Linsly-Chittenden Hall, Room 101',
    applicationRequired: true,
    applicationDeadline: '2024-09-15',
    description: 'The Yale Debate Association is one of the oldest and most prestigious debate societies at Yale. We engage in competitive debate tournaments, host public debates on campus, and provide training for students interested in developing their argumentation and public speaking skills.\n\nOur members participate in both parliamentary and policy debate formats, competing at regional and national tournaments. We welcome students of all experience levels and provide comprehensive training workshops throughout the semester.',
    contactEmails: ['debate@yale.edu', 'sarah.chen@yale.edu'],
    applicationInfo: 'Applications are reviewed by the executive board. Please submit a brief statement of interest (500 words) and your debate experience (if any). Interviews will be conducted the week after the deadline.',
    coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
    metadata: {
      'Founded': '1892',
      'Members': '45',
      'Meeting Frequency': 'Weekly'
    }
  },
  {
    id: '2',
    name: 'Code4Good',
    owner: 'Michael Rodriguez',
    meetingTime: 'Wednesdays, 3:00 PM - 5:00 PM',
    location: 'Computer Science Building, Room 203',
    applicationRequired: false,
    description: 'Code4Good brings together students passionate about using technology for social impact. We work on projects that address real-world problems, from building apps for local nonprofits to developing tools for social justice organizations.\n\nNo coding experience required! We welcome students from all majors and provide workshops and mentorship to help you get started.',
    contactEmails: ['code4good@yale.edu'],
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800'
  },
  {
    id: '3',
    name: 'Yale Daily News',
    owner: 'Emily Johnson',
    meetingTime: 'Thursdays, 10:00 AM - 11:30 AM',
    location: '202 York Street',
    applicationRequired: true,
    applicationDeadline: '2024-09-20',
    description: 'The Yale Daily News is the oldest college daily newspaper in the United States. We publish daily during the academic year and cover campus news, sports, arts, and opinion pieces.\n\nJoin our team of writers, editors, photographers, and designers to help tell the stories that matter to the Yale community.',
    contactEmails: ['editor@yaledailynews.com'],
    applicationInfo: 'Submit 2-3 writing samples and a brief cover letter explaining your interest in journalism. All majors welcome!',
    coverImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'
  },
  {
    id: '4',
    name: 'Yale Environmental Society',
    owner: 'David Kim',
    meetingTime: 'Mondays, 4:00 PM - 5:30 PM',
    location: 'Kroon Hall, Room 320',
    applicationRequired: false,
    description: 'The Yale Environmental Society works to promote sustainability on campus and engage students in environmental advocacy. We organize events, work on campus sustainability initiatives, and connect students with environmental opportunities.',
    contactEmails: ['environment@yale.edu']
  },
  {
    id: '5',
    name: 'Yale Political Union',
    owner: ['Jessica Martinez', 'Robert Chen'],
    meetingTime: 'Fridays, 7:00 PM - 9:00 PM',
    location: 'William L. Harkness Hall',
    applicationRequired: true,
    applicationDeadline: '2024-09-18',
    description: 'The Yale Political Union is the largest and most active political organization on campus. We host weekly debates, bring prominent speakers to campus, and provide a forum for political discussion across the ideological spectrum.',
    contactEmails: ['ypu@yale.edu'],
    applicationInfo: 'Submit a brief statement of interest and attend an orientation session. No prior political experience required.',
    coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800'
  },
  {
    id: '6',
    name: 'Yale A Cappella Group',
    owner: 'Alex Thompson',
    meetingTime: 'Sundays, 2:00 PM - 4:00 PM',
    location: 'Woolsey Hall',
    applicationRequired: false,
    auditionRequired: true,
    applicationDeadline: '2024-09-25',
    description: 'One of Yale\'s premier a cappella groups, we perform at campus events, tour nationally, and record albums. We sing a diverse repertoire from contemporary pop to classic standards.',
    contactEmails: ['acappella@yale.edu'],
    auditionInfo: 'Auditions consist of singing a prepared piece (1-2 minutes) and a brief sight-reading exercise. No prior a cappella experience required. All voice parts welcome!',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
  }
];

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClubList clubs={sampleClubs} />
    </div>
  );
};

export default App;

