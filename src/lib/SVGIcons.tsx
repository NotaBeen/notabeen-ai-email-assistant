import React from "react";

export const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.82"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export const RocketIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.5-1.5 3 0 4.5l-2 2-2-2"></path>
    <path d="M20 2v2l-2 2h-4l2-2v-2l-2-2z"></path>
    <path d="M17.5 12.5c-1.5-1.5-1.5-3 0-4.5l2-2-2-2"></path>
    <path d="M12 22l-2 2v2l-2-2h-4z"></path>
  </svg>
);

export const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

export const KeyIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-lucide="key"
      className="lucide lucide-key w-5 h-5 text-blue-400 mt-0.5"
    >
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"></path>
      <path d="m21 2-9.6 9.6"></path>
      <circle cx="7.5" cy="15.5" r="5.5"></circle>
    </svg>
  );
};

export const ProcessIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-lucide="cpu"
      className="lucide lucide-cpu w-5 h-5 text-purple-400 mt-0.5"
    >
      <path d="M12 20v2"></path>
      <path d="M12 2v2"></path>
      <path d="M17 20v2"></path>
      <path d="M17 2v2"></path>
      <path d="M2 12h2"></path>
      <path d="M2 17h2"></path>
      <path d="M2 7h2"></path>
      <path d="M20 12h2"></path>
      <path d="M20 17h2"></path>
      <path d="M20 7h2"></path>
      <path d="M7 20v2"></path>
      <path d="M7 2v2"></path>
      <rect x="4" y="4" width="16" height="16" rx="2"></rect>
      <rect x="8" y="8" width="8" height="8" rx="1"></rect>
    </svg>
  );
};

export const ShieldIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-lucide="shield"
      className="lucide lucide-shield w-5 h-5 text-green-400 mt-0.5"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
    </svg>
  );
};

// These are the missing icons needed to make the DisplayIcon component work
export const BulbIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 14c.2-.8.5-1.4 1-2 .5-.5 1-.9 1.5-1.4.3-.4.6-.8.8-1.3.2-.5.3-1 .3-1.6 0-1.6-1.3-3-3-3S9 4.3 9 6c0 .6.1 1.1.3 1.6.2.5.5.9.8 1.3.5.5 1 1 1.5 1.4.5.6.8 1.2 1 2 .2.8.3 1.6.2 2.5a4 4 0 0 0 4 4c.6 0 1.1-.1 1.6-.3.5-.2.9-.5 1.3-.8.4-.3.8-.6 1.3-.8.5-.2 1-.3 1.6-.3a2 2 0 1 1 0 4c-1.1 0-2.1-.2-3.1-.5-.9-.3-1.8-.7-2.7-1.1-1-.5-2-.9-3-1.4-1.1-.5-2.2-.9-3.3-1.4z" />
  </svg>
);

export const CodeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 18l6-6-6-6M8 6L2 12l6 6" />
  </svg>
);

export const EarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" />
  </svg>
);

export const EncryptionIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const GDPRIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 12h-4v-4h4" />
    <path d="M12 12h4v-4h-4" />
  </svg>
);

export const HeartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.68l-1.06-1.07a5.5 5.5 0 0 0-7.78 7.78l1.06 1.07L12 21.23l7.78-7.78 1.06-1.07a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const InfinityIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.74 1.48a1 1 0 0 0-1.48 0L1 9.74a1 1 0 0 0 0 1.48l8.26 8.26a1 1 0 0 0 1.48 0l8.26-8.26a1 1 0 0 0 0-1.48L12.26 1.48a1 1 0 0 0-1.48 0z" />
  </svg>
);

export const MindIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 12h-4v-4h4" />
  </svg>
);

export const ReadyIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 14h-4v-4h4" />
  </svg>
);

export const SupportIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 12v-4" />
    <path d="M12 16h-.01" />
  </svg>
);

export const TrustIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.82M22 4L12 14.01 9 11.01" />
  </svg>
);

export const UsersIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v.01" />
    <path d="M22 12h-2" />
  </svg>
);

export const VerifiedIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.82M22 4L12 14.01 9 11.01" />
  </svg>
);

export const WorkIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
    <path d="M10 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
    <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
  </svg>
);
