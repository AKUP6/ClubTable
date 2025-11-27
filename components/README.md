# ClubList Component

A production-ready React component for displaying Yale clubs with filtering, search, and a modern card-based UI.

## Features

- **Card-based Layout**: Clean, modern cards instead of tables
- **Filtering**: Toggle between All Clubs, Open Join, and Application Required
- **Search**: Real-time search by club name
- **Responsive Design**: 1-3 column grid layout based on screen size
- **TypeScript Support**: Full type definitions included
- **Empty State**: Helpful message when no clubs match filters
- **Badge System**: Visual distinction between open join and application-required clubs

## Usage

```tsx
import ClubList, { Club } from "./components/ClubList";

const clubs: Club[] = [
  {
    id: "1",
    name: "Yale Debate Association",
    owner: "Sarah Chen",
    meetingTime: "Tuesdays, 2:00 PM - 4:00 PM",
    location: "Linsly-Chittenden Hall, Room 101",
    applicationRequired: true,
    applicationDeadline: "2024-09-15",
  },
  // ... more clubs
];

function App() {
  return <ClubList clubs={clubs} />;
}
```

## Props

### ClubListProps

| Prop  | Type     | Required | Description                      |
| ----- | -------- | -------- | -------------------------------- |
| clubs | `Club[]` | Yes      | Array of club objects to display |

### Club Interface

```typescript
interface Club {
  id: string; // Unique identifier
  name: string; // Club name
  owner: string; // Owner/liaison name
  meetingTime: string; // Meeting schedule
  location: string; // Meeting location
  applicationRequired: boolean; // Whether application is needed
  applicationDeadline?: string; // Deadline (only if applicationRequired = true)
}
```

## Styling

The component uses TailwindCSS classes. Ensure TailwindCSS is configured in your project:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    // ... other paths
  ],
  // ... rest of config
};
```

## Features Breakdown

### Filters

- **All Clubs**: Shows all clubs regardless of application requirement
- **Open Join**: Shows only clubs that don't require an application
- **Application Required**: Shows only clubs that require an application

### Search

- Real-time filtering as you type
- Case-insensitive search
- Searches only club names

### Cards Display

Each card shows:

- Club name (large, bold)
- Badge (green for "Open Join", orange for "Application Required")
- Owner/liaison with icon
- Meeting time with icon
- Location with icon
- Application deadline (if applicable) with highlighted styling

### Responsive Layout

- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns

## Example

See `ClubList.example.tsx` for a complete usage example with sample data.
