
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center py-5 px-3 ${className || ""}`}>
      {/* Illustration */}
      <div className="position-relative mb-4">
        <div className="position-absolute top-0 start-0 end-0 bottom-0 bg-secondary opacity-25 rounded-circle" style={{ filter: 'blur(40px)', transform: 'scale(1.5)' }} />
        <div className="position-relative d-flex h-24 w-24 align-items-center justify-content-center rounded-4 bg-light">
          {Icon && <Icon className="h-12 w-12 text-muted" />}
        </div>
      </div>

      {/* Text */}
      <h3 className="h4 fw-bold mb-2 text-center">{title}</h3>
      <p className="text-muted text-center max-w-sm mb-4">{description}</p>

      {/* Action */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
