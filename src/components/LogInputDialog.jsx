import { useEffect, useState } from "react";

export function LogInputDialog({
  open,
  onOpenChange,
  title,
  label,
  unit,
  currentValue,
  onSave,
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) {
      setValue(currentValue?.toString() ?? "");
    }
  }, [open, currentValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(parseFloat(value) || 0);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content rounded-4 border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => onOpenChange(false)}
            />
          </div>

          <div className="modal-body p-4">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div className="form-group">
                <label className="form-label small fw-bold">{label}</label>
                <div className="input-group">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="form-control rounded-3 py-2"
                    autoFocus
                  />
                  <span className="input-group-text bg-transparent border-0 small text-muted">
                    {unit}
                  </span>
                </div>
              </div>

              <div className="d-flex gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary flex-grow-1 py-2 rounded-3 fw-bold"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1 py-2 rounded-3 fw-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
