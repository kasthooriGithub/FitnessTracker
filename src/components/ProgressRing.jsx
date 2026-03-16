export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = "#0d6efd",     // bootstrap primary
  bgColor = "#e9ecef",   // bootstrap light border
  className = "",
  children,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div
      className={`position-relative d-inline-flex align-items-center justify-content-center ${className}`}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={bgColor}
          fill="none"
          style={{ opacity: 0.4 }}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 700ms ease-out",
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center">
        {children}
      </div>
    </div>
  );
}
