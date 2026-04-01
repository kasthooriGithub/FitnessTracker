import React from "react";

const options = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7days" },
  { label: "30 Days", value: "30days" },
  { label: "3 Months", value: "3months" },
  { label: "1 Year", value: "1year" },
  { label: "All Time", value: "alltime" },
];

export function DateFilter({ value = "today", onChange }) {
  return (
    <div className="d-flex gap-2 flex-wrap justify-content-end bg-white shadow-sm rounded-3 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`btn btn-sm rounded-2 fw-bold px-3 transition-colors ${
            value === option.value ? "btn-primary" : "btn-outline-primary"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
