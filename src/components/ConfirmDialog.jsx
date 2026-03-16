export function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content rounded-4 border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>

          <div className="modal-body p-4 pt-3">
            <p className="text-muted mb-4">{message}</p>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary flex-grow-1 py-2 rounded-3 fw-bold"
                onClick={onCancel}
              >
                {cancelText}
              </button>

              <button
                type="button"
                className="btn btn-danger flex-grow-1 py-2 rounded-3 fw-bold"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
