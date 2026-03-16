import React from "react";

export function MacroRing({ label, value, goal, color, unit = "g" }) {
    const size = 74;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = Math.min((value / goal) * 100, 100);
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="nt-ringWrap">
            <div className="position-relative d-inline-flex align-items-center justify-content-center">
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#e9ecef"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
                    />
                </svg>
                <div className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center">
                    <span className="nt-ringVal" style={{ fontSize: "14px" }}>{value}{unit}</span>
                </div>
            </div>
            <div className="nt-ringLabel mt-2">{label}</div>
            <div className="nt-ringGoal">{value} / {goal}{unit}</div>
        </div>
    );
}
