import { useState } from "react";
import { Edit2, Eye, CheckCircle2, XCircle, Trash2, Copy } from "lucide-react";
import ActionsMenu from "../../../components/ui/table/components/ActionsMenu";
import { useLanguage } from "../../../stores/languageStore";

interface ScriptActionsCellProps {
  s: any;
  navigate: (path: string) => void;
  handleBulkStatus: (status: "Published" | "Draft", ids: number[]) => void;
  setDeleteIds: (ids: number[]) => void;
}

export default function ScriptActionsCell({ s, navigate, handleBulkStatus, setDeleteIds }: ScriptActionsCellProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div onClick={(e) => e.stopPropagation()} className="inline-flex justify-center w-full">
      <ActionsMenu
        row={s}
        isOpen={isOpen}
        onToggle={() => setIsOpen(prev => !prev)}
        onClose={() => setIsOpen(false)}
        actions={[
          {
            label: t.scripts?.actionEdit || "Sửa nội dung",
            icon: <Edit2 className="w-4 h-4 text-gray-400" />,
            handler: (s) => navigate(`/scripts/${s.id}`),
          },
          {
            label: t.scripts?.actionClone || "Nhân bản script",
            icon: <Copy className="w-4 h-4 text-gray-400" />,
            handler: (s) => navigate(`/scripts/create?cloneId=${s.id}`),
          },
          {
            label: t.scripts?.actionPreview || "Xem trước",
            icon: <Eye className="w-4 h-4 text-gray-400" />,
            handler: (s) => navigate(`/scripts/${s.id}`),
          },
          {
            label: t.scripts?.actionPublish || "Xuất bản",
            icon: <CheckCircle2 className="w-4 h-4 text-gray-400" />,
            handler: (s) => handleBulkStatus("Published", [s.id]),
            hidden: (s: any) => s.status === "Published",
          },
          {
            label: t.scripts?.actionDraft || "Chuyển sang Nháp",
            icon: <XCircle className="w-4 h-4 text-gray-400" />,
            handler: (s) => handleBulkStatus("Draft", [s.id]),
            hidden: (s: any) => s.status !== "Published",
          },
          {
            label: t.scripts?.actionDelete || "Xóa script",
            icon: <Trash2 className="w-4 h-4 text-red-500" />,
            danger: true,
            handler: (s) => setDeleteIds([s.id]),
          }
        ]}
      />
    </div>
  );
}
