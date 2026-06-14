export default function ToriiGate({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="10" y="60" width="280" height="18" rx="2" fill="rgba(188,0,45,0.85)" />
      <rect x="0" y="68" width="20" height="10" rx="2" fill="rgba(188,0,45,0.85)" />
      <rect x="280" y="68" width="20" height="10" rx="2" fill="rgba(188,0,45,0.85)" />
      <rect x="40" y="110" width="220" height="12" rx="1" fill="rgba(188,0,45,0.7)" />
      <rect x="55" y="78" width="22" height="322" rx="2" fill="rgba(188,0,45,0.75)" />
      <rect x="223" y="78" width="22" height="322" rx="2" fill="rgba(188,0,45,0.75)" />
      <rect x="50" y="50" width="200" height="12" rx="1" fill="rgba(188,0,45,0.6)" />
      <path d="M10 60 Q0 65 0 78" stroke="rgba(188,0,45,0.85)" strokeWidth="3" fill="none" />
      <path d="M290 60 Q300 65 300 78" stroke="rgba(188,0,45,0.85)" strokeWidth="3" fill="none" />
    </svg>
  );
}
