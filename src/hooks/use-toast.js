import { useAlert } from "../contexts/AlertContext";

export function useToast() {
  const { showAlert } = useAlert();

  const toast = (props) => {
    const { title, description, variant } = props;
    const type = variant === "destructive" ? "danger" : "success";
    showAlert(description || title, type, description ? title : "");

    return {
      id: Math.random().toString(),
      dismiss: () => { },
      update: () => { },
    };
  };

  return {
    toasts: [],
    toast,
    dismiss: () => { },
  };
}
