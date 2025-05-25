import React from 'react';

interface IconProps {
  className?: string;
}

const SaveIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M3 5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25v13.5A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25Zm7.597 2.297a.75.75 0 0 0-1.06 1.06l1.72 1.72a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 1 0-1.06-1.06L11.25 9.69L9.53 7.97a.75.75 0 0 0-1.06-.106Z" />
    <path d="M10.095 12.025a.75.75 0 00-1.06 1.06L10.758 15H6.75a.75.75 0 000 1.5h4.008l-1.723 1.723a.75.75 0 101.061 1.06L13.32 16.06a.75.75 0 000-1.06l-3.224-3.224Z" clipRule="evenodd"/> Fill with actual save icon path if needed
  </svg>
);
// Placeholder, better Save icon:
// <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
//   <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
// </svg>
// A more traditional save icon (floppy disk style):
// <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
//   <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
// </svg>
// Using a floppy disk icon:
const SaveIconGood: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path d="M3,3V21H21V3H3M19,19H5V5H19V19M15,15H9V9H15V15M12,6A3,3 0 0,0 9,9V15A3,3 0 0,0 12,18A3,3 0 0,0 15,15V9A3,3 0 0,0 12,6Z" />
    </svg>
);


export default SaveIconGood;
