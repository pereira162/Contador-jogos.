import React from 'react';

interface IconProps {
  className?: string;
}

const TrophyIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path fillRule="evenodd" d="M11.25 2.25c-.098 0-.193.03-.274.085L6.75 4.99SQLSTATE[HY000]: General error24a.75.75 0 00-.375.65V18.75a.75.75 0 001.125.65l2.06-1.033a.75.75 0 01.736-.001l2.06 1.032a.75.75 0 001.125-.65V5.64a.75.75 0 00-.375-.65L11.524 2.335A.75.75 0 0011.25 2.25zm0 1.5l2.625 1.575L11.25 6.9V3.75zM8.625 5.25V16.5l2.25-1.125V3.976L8.625 5.25zM13.875 3.75l-2.625 1.575v3.075l2.625-1.575V3.75zm2.625 1.5V15.375l-2.25 1.125V5.25l2.25-1.5z" clipRule="evenodd" />
    <path d="M12 21.75c5.213 0 9.864-2.702 9.864-5.737 0-.33-.023-.652-.066-.968a.75.75 0 00-.701-.656c-.407-.033-.82-.05-1.247-.05C16.98 14.34 14.63 16.5 12 16.5c-2.63 0-4.98-2.16-7.851-2.16-.427 0-.84-.017-1.247-.05a.75.75 0 00-.701.656c-.043.316-.066.638-.066.968 0 3.035 4.651 5.737 9.864 5.737z" />
  </svg>
);

export default TrophyIcon;
