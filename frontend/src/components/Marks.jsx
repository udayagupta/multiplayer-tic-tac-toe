export const Xmark = ({ size = 24, className = "mark" }) => {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="var(--x-red)" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    >
      <path d="M5 5L19 19M19 5L5 19" />
    </svg>
  );
};

export const Omark = ({ size = 24, className = "mark" }) => {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="var(--o-teal)" 
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
};

export const Mark = ({ mark, size, className }) => {
  if (mark === 'X') return <Xmark size={size} className={className} />;
  if (mark === 'O') return <Omark size={size} className={className} />;
  return null;
};

// Example of how your original row now looks using these components:
export const MarkRowExample = () => {
  return (
    <div className="mark-row">
      <Xmark />
      <Omark />
      {/* Example of overriding the default size */}
      <Xmark size={48} /> 
    </div>
  );
};