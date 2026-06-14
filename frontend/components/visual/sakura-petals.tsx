export default function SakuraPetals() {
  const petals = [
    { top: "8%", left: "15%", size: 18, opacity: 0.25, rotate: 20 },
    { top: "18%", left: "72%", size: 12, opacity: 0.18, rotate: -15 },
    { top: "35%", left: "8%", size: 22, opacity: 0.20, rotate: 45 },
    { top: "55%", left: "80%", size: 14, opacity: 0.15, rotate: 30 },
    { top: "72%", left: "20%", size: 16, opacity: 0.22, rotate: -30 },
    { top: "85%", left: "60%", size: 20, opacity: 0.18, rotate: 60 },
    { top: "25%", left: "45%", size: 10, opacity: 0.12, rotate: -45 },
  ];

  return (
    <>
      {petals.map((p, i) => (
        <svg
          key={i}
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`,
          }}
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M12 2C9 2 6 5 6 8c0 2 1 3.5 3 4.5C7 13.5 6 15 6 17c0 3 3 5 6 5s6-2 6-5c0-2-1-3.5-3-4.5 2-1 3-2.5 3-4.5 0-3-3-6-6-6z" />
        </svg>
      ))}
    </>
  );
}