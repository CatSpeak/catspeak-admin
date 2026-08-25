import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { useLanguage } from "../../../stores/languageStore";

interface DeleteReportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export default function DeleteReportConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteReportConfirmModalProps) {
  const { t } = useLanguage();

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t.reports?.deleteReportTitle || "Xóa thư báo cáo"}
      description={
        t.reports?.deleteReportConfirm ||
        "Bạn có chắc chắn muốn xóa thư này? Thư sẽ bị xóa vĩnh viễn khỏi hệ thống."
      }
      confirmText={t.common.delete}
      cancelText={t.common.close}
      variant="danger"
      isLoading={isLoading}
    />
  );
}
