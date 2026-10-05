import React, { useState } from 'react';

// Reusable logo mapping for all 19 distinct IPL team identities
const TEAM_LOGO_MAP: Record<string, string> = {
  'Chennai Super Kings': '/logos/chennai_super_kings.png',
  'Deccan Chargers': '/logos/deccan_chargers.png',
  'Delhi Capitals': '/logos/delhi_capitals.png',
  'Delhi Daredevils': '/logos/delhi_daredevils.png',
  'Gujarat Lions': '/logos/gujarat_lions.png',
  'Gujarat Titans': '/logos/gujarat_titans.png',
  'Kings XI Punjab': '/logos/kings_xi_punjab.png',
  'Kochi Tuskers Kerala': '/logos/kochi_tuskers_kerala.png',
  'Kolkata Knight Riders': '/logos/kolkata_knight_riders.png',
  'Lucknow Super Giants': '/logos/lucknow_super_giants.png',
  'Mumbai Indians': '/logos/mumbai_indians.png',
  'Pune Warriors': '/logos/pune_warriors.png',
  'Punjab Kings': '/logos/punjab_kings.png',
  'Rajasthan Royals': '/logos/rajasthan_royals.png',
  'Rising Pune Supergiant': '/logos/rising_pune_supergiant.png',
  'Rising Pune Supergiants': '/logos/rising_pune_supergiants.png',
  'Royal Challengers Bangalore': '/logos/royal_challengers_bangalore.png',
  'Royal Challengers Bengaluru': '/logos/royal_challengers_bengaluru.png',
  'Sunrisers Hyderabad': '/logos/sunrisers_hyderabad.png',
};

// Colors for fallback initials badge
const TEAM_COLOR_MAP: Record<string, string> = {
  'Chennai Super Kings': 'bg-amber-500 text-slate-900',
  'Mumbai Indians': 'bg-sky-600 text-white',
  'Kolkata Knight Riders': 'bg-purple-900 text-amber-400',
  'Royal Challengers Bangalore': 'bg-red-700 text-white',
  'Royal Challengers Bengaluru': 'bg-red-700 text-white',
  'Delhi Capitals': 'bg-blue-800 text-white',
  'Delhi Daredevils': 'bg-red-600 text-white',
  'Kings XI Punjab': 'bg-red-600 text-white',
  'Punjab Kings': 'bg-red-600 text-white',
  'Rajasthan Royals': 'bg-pink-600 text-white',
  'Sunrisers Hyderabad': 'bg-orange-600 text-white',
  'Deccan Chargers': 'bg-slate-800 text-sky-400',
  'Gujarat Titans': 'bg-slate-900 text-amber-400',
  'Lucknow Super Giants': 'bg-teal-700 text-white',
  'Gujarat Lions': 'bg-orange-600 text-white',
  'Rising Pune Supergiant': 'bg-purple-800 text-pink-400',
  'Rising Pune Supergiants': 'bg-purple-800 text-pink-400',
  'Pune Warriors': 'bg-blue-900 text-sky-400',
  'Kochi Tuskers Kerala': 'bg-orange-600 text-purple-900',
};

interface TeamLogoProps {
  teamName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamName,
  size = 'md',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  }[size];

  const logoUrl = TEAM_LOGO_MAP[teamName];
  const colorClass = TEAM_COLOR_MAP[teamName] || 'bg-slate-700 text-white';

  // Get initials for fallback badge
  const initials = teamName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 3)
    .toUpperCase();

  if (!logoUrl || failed) {
    return (
      <div
        className={`inline-flex items-center justify-center font-black rounded-xl shadow-xs border border-white/20 shrink-0 ${sizeClasses} ${colorClass} ${className}`}
        title={teamName}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${teamName} Logo`}
      onError={() => setFailed(true)}
      className={`inline-block object-contain shrink-0 transition-transform ${sizeClasses} ${className}`}
      loading="lazy"
    />
  );
};
