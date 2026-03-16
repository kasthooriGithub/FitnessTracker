import { createContext, useContext, useState, useCallback } from "react";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
    const [alert, setAlert] = useState(null);

    const showAlert = useCallback((message, type = "success", title = "") => {
        setAlert({ message, type, title });
        // Auto-hide after 5 seconds
        setTimeout(() => {
            setAlert(null);
        }, 5000);
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(null);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {alert && (
                <div
                    className="position-fixed top-0 start-50 translate-middle-x mt-3"
                    style={{ zIndex: 9999, minWidth: '300px' }}
                >
                    <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-lg border-0 rounded-4`} role="alert">
                        {alert.title && <h6 className="alert-heading fw-bold mb-1">{alert.title}</h6>}
                        <div className="d-flex align-items-center gap-2">
                            <span>{alert.message}</span>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={hideAlert}
                            aria-label="Close"
                        ></button>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlert must be used within an AlertProvider");
    }
    return context;
}
