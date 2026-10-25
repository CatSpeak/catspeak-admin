import React, { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Save, AlertCircle, Info, RefreshCw, Coins, Calculator } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { useToastStore } from "../../../stores/toastStore";
import {
  getCommissionTiers,
  updateCommissionTiers,
  getTuitionFeeConfig,
  updateTuitionFeeConfig,
} from "../api/commissionFeesApi";
import type { CommissionTierItem } from "../types";

const CommissionFeesPage: React.FC = () => {
  const { addToast } = useToastStore();
  const [tiers, setTiers] = useState<CommissionTierItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Minimum tuition fee states
  const [baseFee, setBaseFee] = useState<number>(100000);
  const [perSessionFee, setPerSessionFee] = useState<number>(50000);
  const [tuitionLoading, setTuitionLoading] = useState<boolean>(true);
  const [tuitionSaving, setTuitionSaving] = useState<boolean>(false);

  const fetchTuitionConfig = async () => {
    try {
      setTuitionLoading(true);
      const data = await getTuitionFeeConfig();
      if (data) {
        setBaseFee(data.baseFee);
        setPerSessionFee(data.perSessionFee);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Không thể tải cấu hình học phí tối thiểu.";
      addToast("error", errorMsg);
    } finally {
      setTuitionLoading(false);
    }
  };

  const handleSaveTuitionConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (baseFee < 0 || perSessionFee < 0) {
      addToast("error", "Học phí cơ bản và phí mỗi buổi không được âm.");
      return;
    }
    try {
      setTuitionSaving(true);
      await updateTuitionFeeConfig({ baseFee: Number(baseFee), perSessionFee: Number(perSessionFee) });
      addToast("success", "Cập nhật cấu hình học phí tối thiểu thành công.");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi lưu cấu hình học phí tối thiểu.";
      addToast("error", errorMsg);
    } finally {
      setTuitionSaving(false);
    }
  };

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const data = await getCommissionTiers();
      // Format commissionPercent to 0-100% for display
      const formatted = (data || []).map((t) => ({
        ...t,
        commissionPercent:
          t.commissionPercent <= 1.0 ? Math.round(t.commissionPercent * 10000) / 100 : t.commissionPercent,
      }));
      setTiers(formatted);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Không thể tải danh sách cấu hình phí.";
      addToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
    fetchTuitionConfig();
  }, []);

  // Validation rules for tiers
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (tiers.length === 0) return errors;

    if (tiers[0].minSlot !== 1) {
      errors.push("Bậc đầu tiên bắt buộc phải có Số học viên tối thiểu (Min Slot) là 1.");
    }

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const tierNum = i + 1;

      if (tier.openingFee < 0) {
        errors.push(`Bậc ${tierNum}: Phí mở lớp không được nhỏ hơn 0.`);
      }

      if (tier.commissionPercent < 0 || tier.commissionPercent > 100) {
        errors.push(`Bậc ${tierNum}: Hoa hồng phải từ 0% đến 100%.`);
      }

      if (i < tiers.length - 1) {
        if (tier.maxSlot === null || tier.maxSlot === undefined) {
          errors.push(`Bậc ${tierNum}: Phải nhập Số học viên tối đa (Max Slot).`);
        } else if (tier.maxSlot < tier.minSlot) {
          errors.push(`Bậc ${tierNum}: Max Slot (${tier.maxSlot}) phải lớn hơn hoặc bằng Min Slot (${tier.minSlot}).`);
        }

        const nextTier = tiers[i + 1];
        if (tier.maxSlot !== null && nextTier.minSlot !== tier.maxSlot + 1) {
          errors.push(
            `Bậc ${tierNum + 1} phải bắt đầu từ ${tier.maxSlot + 1} để liền kề với Bậc ${tierNum} (kết thúc ở ${tier.maxSlot}).`
          );
        }
      }
    }

    return errors;
  }, [tiers]);

  const handleAddTier = () => {
    setTiers((prev) => {
      if (prev.length === 0) {
        return [
          {
            minSlot: 1,
            maxSlot: null,
            openingFee: 0,
            commissionPercent: 10,
          },
        ];
      }

      const lastTier = prev[prev.length - 1];
      const lastMax = lastTier.maxSlot ?? lastTier.minSlot + 9;

      // Update previous last tier to have a concrete maxSlot if it was null
      const updatedPrev = [...prev];
      if (lastTier.maxSlot === null) {
        updatedPrev[updatedPrev.length - 1] = {
          ...lastTier,
          maxSlot: lastMax,
        };
      }

      const newMinSlot = (updatedPrev[updatedPrev.length - 1].maxSlot ?? 0) + 1;

      return [
        ...updatedPrev,
        {
          minSlot: newMinSlot,
          maxSlot: null,
          openingFee: 0,
          commissionPercent: 15,
        },
      ];
    });
  };

  const handleRemoveTier = (index: number) => {
    setTiers((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      // Auto-adjust the last tier's maxSlot to null if it has elements
      if (next.length > 0) {
        next[next.length - 1] = {
          ...next[next.length - 1],
          maxSlot: null,
        };
      }
      return next;
    });
  };

  const handleChangeTier = (index: number, field: keyof CommissionTierItem, value: number | null) => {
    setTiers((prev) => {
      const next = [...prev];
      const target = { ...next[index], [field]: value };

      // If user changed maxSlot and it's not the last tier, auto update next tier's minSlot
      if (field === "maxSlot" && value !== null && index < next.length - 1) {
        next[index] = target;
        next[index + 1] = {
          ...next[index + 1],
          minSlot: value + 1,
        };
        return next;
      }

      next[index] = target;
      return next;
    });
  };

  const handleSave = async () => {
    if (validationErrors.length > 0) {
      addToast("error", "Vui lòng sửa các lỗi trước khi lưu cấu hình.");
      return;
    }

    setShowConfirmModal(false);
    try {
      setSaving(true);
      await updateCommissionTiers(tiers);
      addToast("success", "Lưu cấu hình phí mở lớp và hoa hồng thành công!");
      await fetchTiers();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu cấu hình.";
      addToast("error", errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <Breadcrumb
        items={[
          { label: "Tài chính & Thanh toán", href: "/payments" },
          { label: "Cấu hình phí & Hoa hồng" },
        ]}
      />

      <PageHeader
        icon={<Coins size={22} />}
        title="Cấu hình Phí mở lớp & Hoa hồng"
        desc="Quản lý động các bậc quy mô lớp học, phí mở lớp nền tảng và tỷ lệ hoa hồng chiết khấu."
      />

      {/* Info notice */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4.5 flex items-start gap-3 text-blue-900 text-sm">
        <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">Quy tắc cấu hình bậc học viên (Slots):</p>
          <ul className="list-disc list-inside text-xs text-blue-800 space-y-0.5">
            <li>Bậc 1 bắt buộc bắt đầu từ <strong>1 slot</strong>.</li>
            <li>Các bậc kế tiếp phải liền kề với bậc trước đó (MinSlot = MaxSlot bậc trước + 1).</li>
            <li>Bậc cuối cùng luôn có MaxSlot là <strong>Vô hạn</strong> (áp dụng cho mọi lớp có số slot từ MinSlot trở lên).</li>
            <li>Nếu danh sách trống, hệ thống sẽ mặc định <strong>miễn phí 100%</strong> (0đ phí mở lớp, 0% hoa hồng).</li>
          </ul>
        </div>
      </div>

      {/* Minimum Tuition Fee Card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Cấu hình mức học phí tối thiểu (Sàn học phí)</h2>
              <p className="text-xs text-gray-500">Giới hạn mức học phí tối thiểu giáo viên được phép thiết lập khi tạo hoặc sửa lớp</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchTuitionConfig}
            disabled={tuitionLoading || tuitionSaving}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={tuitionLoading ? "animate-spin" : ""} />
            <span>Tải lại</span>
          </button>
        </div>

        <div className="p-6">
          {tuitionLoading ? (
            <div className="py-8 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw size={20} className="animate-spin text-gray-400" />
              <span>Đang tải cấu hình học phí...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveTuitionConfig} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Học phí cơ bản (Base Fee - VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={baseFee}
                      onChange={(e) => setBaseFee(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:bg-white focus:border-[#8B0000] focus:ring-2 focus:ring-red-100 transition outline-none"
                      required
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-400">VNĐ</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Mức phí nền cố định áp dụng cho mọi lớp</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Phí mỗi buổi học (Per Session Fee - VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={perSessionFee}
                      onChange={(e) => setPerSessionFee(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:bg-white focus:border-[#8B0000] focus:ring-2 focus:ring-red-100 transition outline-none"
                      required
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-400">VNĐ / buổi</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Phí nhân theo tổng số buổi học của lớp</p>
                </div>
              </div>

              {/* Note / Preview */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <Info size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    Công thức: Mức học phí tối thiểu = {baseFee.toLocaleString("vi-VN")} VNĐ + ({perSessionFee.toLocaleString("vi-VN")} VNĐ × Số buổi học)
                  </p>
                  <p className="text-amber-800">
                    Ví dụ minh họa: Lớp học 12 buổi sẽ có mức học phí tối thiểu là{" "}
                    <span className="font-bold underline">
                      {(baseFee + perSessionFee * 12).toLocaleString("vi-VN")} VNĐ
                    </span>
                    ; lớp 24 buổi là{" "}
                    <span className="font-bold underline">
                      {(baseFee + perSessionFee * 24).toLocaleString("vi-VN")} VNĐ
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={tuitionSaving || tuitionLoading}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#8B0000] hover:bg-[#a00000] text-white transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save size={15} />
                  <span>{tuitionSaving ? "Đang lưu..." : "Lưu cấu hình học phí"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#8B0000] flex items-center justify-center">
              <Coins size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Danh sách các bậc phí (Tiers)</h2>
              <p className="text-xs text-gray-500">Đang có {tiers.length} bậc cấu hình</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchTiers}
              disabled={loading || saving}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Tải lại</span>
            </button>

            <button
              type="button"
              onClick={handleAddTier}
              disabled={loading || saving}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gray-900 hover:bg-black text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Plus size={15} />
              <span>Thêm bậc mới</span>
            </button>
          </div>
        </div>

        {/* Table content */}
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
            <span>Đang tải cấu hình bậc phí...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Bậc</th>
                  <th className="py-3 px-4 w-44">Từ (Min Slots)</th>
                  <th className="py-3 px-4 w-44">Đến (Max Slots)</th>
                  <th className="py-3 px-4">Phí mở lớp (VNĐ)</th>
                  <th className="py-3 px-4">Hoa hồng (%)</th>
                  <th className="py-3 px-4 w-20 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {tiers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm italic">
                      Chưa có bậc phí nào. Nhấn &quot;Thêm bậc mới&quot; để thiết lập.
                    </td>
                  </tr>
                ) : (
                  tiers.map((tier, idx) => {
                    const isLast = idx === tiers.length - 1;
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-gray-600">
                          #{idx + 1}
                        </td>

                        {/* Min Slot */}
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min={1}
                            value={tier.minSlot}
                            disabled={idx === 0} // First tier must always start at 1
                            onChange={(e) => handleChangeTier(idx, "minSlot", parseInt(e.target.value, 10) || 1)}
                            className="w-full h-9 px-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] disabled:bg-gray-100 disabled:text-gray-500 font-semibold"
                          />
                        </td>

                        {/* Max Slot */}
                        <td className="py-3 px-4">
                          {isLast ? (
                            <div className="h-9 px-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 flex items-center font-semibold text-xs">
                              Vô hạn (≥ {tier.minSlot})
                            </div>
                          ) : (
                            <input
                              type="number"
                              min={tier.minSlot}
                              value={tier.maxSlot ?? ""}
                              onChange={(e) =>
                                handleChangeTier(
                                  idx,
                                  "maxSlot",
                                  e.target.value === "" ? null : parseInt(e.target.value, 10) || null
                                )
                              }
                              className="w-full h-9 px-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] font-semibold"
                            />
                          )}
                        </td>

                        {/* Opening Fee */}
                        <td className="py-3 px-4">
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              step={10000}
                              value={tier.openingFee}
                              onChange={(e) =>
                                handleChangeTier(idx, "openingFee", Math.max(0, parseFloat(e.target.value) || 0))
                              }
                              className="w-full h-9 px-3 pr-12 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] font-semibold text-right"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                              VNĐ
                            </span>
                          </div>
                        </td>

                        {/* Commission Rate */}
                        <td className="py-3 px-4">
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={tier.commissionPercent}
                              onChange={(e) =>
                                handleChangeTier(
                                  idx,
                                  "commissionPercent",
                                  Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                                )
                              }
                              className="w-full h-9 px-3 pr-8 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] font-semibold text-right"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                              %
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Xóa bậc này"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Validation Errors Alert Box */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-red-50/80 border-t border-red-100 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <div className="space-y-1">
              <span className="font-bold">Cần khắc phục các lỗi sau trước khi lưu:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-gray-500">
            Thay đổi sẽ có hiệu lực tức thì cho các lớp học mới tạo trên toàn hệ thống.
          </p>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={saving || loading || validationErrors.length > 0}
            className="px-6 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] text-white font-bold text-sm transition flex items-center gap-2 shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Xác nhận lưu cấu hình phí"
        description="Các thay đổi về phí mở lớp và tỷ lệ hoa hồng sẽ ảnh hưởng trực tiếp đến quy trình mở lớp của giáo viên. Bạn có chắc chắn muốn lưu cấu hình này không?"
        confirmText="Xác nhận lưu"
        cancelText="Hủy bỏ"
        onConfirm={handleSave}
        onClose={() => setShowConfirmModal(false)}
        isLoading={saving}
      />
    </div>
  );
};

export default CommissionFeesPage;
