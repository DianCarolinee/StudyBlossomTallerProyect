export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5" />
    <path d="M12 7.5a4.5 4.5 0 1 0-4.5 4.5" />
    <path d="M16.5 12a4.5 4.5 0 1 1-4.5 4.5" />
    <path d="M16.5 12a4.5 4.5 0 1 0-4.5-4.5" />
    <path d="M7.5 12a4.5 4.5 0 1 1 4.5-4.5" />
    <path d="M7.5 12a4.5 4.5 0 1 0 4.5 4.5" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);
