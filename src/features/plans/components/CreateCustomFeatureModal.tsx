import React, { useState, useEffect } from "react";
import { X, Plus, AlertCircle, Loader2 } from "lucide-react";

interface CreateCustomFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (featureData: {
    featureCode: string;
    featureName: string;
    limitValue: string;
    isActive: boolean;
    displayOrder: number;
  }) => Promise<boolean>;
  existingCodes: string[];
  existingCount?: number;
}

export const CreateCustomFeatureModal: React.FC<CreateCustomFeatureModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingCodes,
  existingCount,
}) => {
  const [featureCode, setFeatureCode] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [valueType, setValueType] = useState<"boolean" | "number" | "text">("boolean");
  const [limitValue, setLimitValue] = useState("true");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFeatureCode("");
      setFeatureName("");
      setValueType("boolean");
      setLimitValue("true");
      setIsSubmitting(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to UPPERCASE and replace spaces/hyphens with underscores
    const val = e.target.value.toUpperCase().replace(/[\s-]+/g, "_");
    setFeatureCode(val);
    setError(null);
  };

  const handleTypeChange = (type: "boolean" | "number" | "text") => {
    setValueType(type);
    if (type === "boolean") {
      setLimitValue("true");
    } else if (type === "number") {
      setLimitValue("10");
    } else {
      setLimitValue("-");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = featureCode.trim();
    const cleanName = featureName.trim();

    if (!cleanCode) {
      setError("Mã quyền lợi (Feature Code) không được để trống.");
      return;
    }
    if (!/^[A-Z0-9_]+$/.test(cleanCode)) {
      setError("Mã quyền lợi chỉ được chứa chữ cái in hoa, số và dấu gạch dưới (_).");
      return;
    }
    if (existingCodes.some((c) => c.toUpperCase() === cleanCode.toUpperCase())) {
      setError(`Mã quyền lợi '${cleanCode}' đã tồn tại trong gói dịch vụ.`);
      return;
    }
    if (!cleanName) {
      setError("Tên quyền lợi không được để trống.");
      return;
    }

    setIsSubmitting(true);
    try {
      const order = typeof existingCount === "number" ? existingCount + 1 : existingCodes.length + 1;
      const success = await onAdd({
        featureCode: cleanCode,
        featureName: cleanName,
        limitValue: limitValue.trim(),
        isActive: true,
        displayOrder: order,
      });

      if (success) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi tạo quyền lợi mới.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Thêm Quyền Lợi Tùy Chỉnh Mới
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Định nghĩa thuộc tính mới cho gói và lưu vào danh mục hệ thống
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Feature Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              Mã thuộc tính (Feature Code) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={featureCode}
              onChange={handleCodeChange}
              placeholder="VD: ALLOW_SPEAKING_RECORD, MAX_CUSTOM_CARDS"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all uppercase"
              autoFocus
            />
            <p className="text-[11px] text-gray-400">
              Chữ in hoa, số và dấu gạch dưới. Sẽ được dùng trong Backend code để kiểm tra quyền.
            </p>
          </div>

          {/* Feature Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              Tên quyền lợi hiển thị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              placeholder="VD: Cho phép ghi âm bài nói, Giới hạn thẻ từ vựng"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          {/* Value Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              Loại giá trị thuộc tính
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange("boolean")}
                className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                  valueType === "boolean"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Bật / Tắt (Có / Không)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("number")}
                className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                  valueType === "number"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Con số (Hạn mức)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("text")}
                className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                  valueType === "text"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Chuỗi văn bản
              </button>
            </div>
          </div>

          {/* Default Limit Value */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">
              Giá trị cấu hình (Hạn mức / Mặc định)
            </label>
            {valueType === "boolean" ? (
              <select
                value={limitValue}
                onChange={(e) => setLimitValue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="true">Bật (true - Có quyền)</option>
                <option value="false">Tắt (false - Không có quyền)</option>
              </select>
            ) : valueType === "number" ? (
              <div className="space-y-1">
                <input
                  type="number"
                  value={limitValue}
                  onChange={(e) => setLimitValue(e.target.value)}
                  placeholder="VD: 30 (hoặc 999 để không giới hạn)"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <p className="text-[11px] text-gray-400">
                  Nhập số lượng cụ thể, hoặc 999 để hiển thị là Không giới hạn.
                </p>
              </div>
            ) : (
              <input
                type="text"
                value={limitValue}
                onChange={(e) => setLimitValue(e.target.value)}
                placeholder="VD: Standard, Pro, High"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Thêm quyền lợi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomFeatureModal;
