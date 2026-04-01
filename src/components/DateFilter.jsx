import React from "react";
import { Dropdown } from "react-bootstrap";
import { Calendar } from "lucide-react";

const options = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7days" },
  { label: "30 Days", value: "30days" },
  { label: "3 Months", value: "3months" },
  { label: "1 Year", value: "1year" },
  { label: "All Time", value: "alltime" },
];

export function DateFilter({ value = "today", onChange }) {
  const activeOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="d-flex justify-content-end">
      <div className="bg-white shadow-sm rounded-3 p-1">
        {/* Desktop View: Buttons */}
        <div className="d-none d-md-flex gap-1 flex-wrap">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`btn btn-sm rounded-2 fw-bold px-3 transition-colors border-0 ${
                value === option.value ? "btn-primary shadow-sm" : "text-muted hover-bg-light"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Mobile View: Dropdown */}
        <div className="d-md-none">
          <Dropdown>
            <Dropdown.Toggle
              variant="light"
              id="date-filter-dropdown"
              className="d-flex align-items-center gap-2 border-0 bg-transparent py-2 px-3 fw-bold text-primary shadow-none"
              size="sm"
            >
              <Calendar size={16} />
              <span>{activeOption.label}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow border-0 rounded-4 mt-2 py-2 dropdown-menu-end">
              {options.map((option) => (
                <Dropdown.Item
                  key={option.value}
                  onClick={() => onChange(option.value)}
                  className={`px-3 py-2 fw-semibold mb-1 mx-1 rounded-3 ${
                    value === option.value ? "bg-primary text-white" : "text-dark"
                  }`}
                >
                  {option.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
