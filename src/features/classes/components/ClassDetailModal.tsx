import React, { useCallback, useEffect, useState } from "react";
import { X, Users, CalendarClock, Trash2, Plus, Loader2 } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../lib/axios";
import { useToastStore } from "../../../stores/toastStore";
import { useLanguage } from "../../../stores/languageStore";
import { getClassDetail, addStudent, removeStudent, setClassStatus } from "../api/classApi";
import type { AdminClass, AdminClassDetail } from "../types";
import { ClassStatusBadge } from "./ClassStatusBadge";

const STATUS_ORDER = [
  "UPCOMING",
  "OPEN_FOR_ENROLLMENT",
  "NOT_STARTED",
  "TEACHING",
  "ARCHIVED",
  "FINISHED",
] as const;

function fromTick(tick?: number): string {
  if (!tick) return "—";
  return new Date(tick / 10000 - 62135596800000).toLocaleDateString("vi-VN");
}

interface ClassDetailModalProps {
  cl: AdminClass | null;
  onClose: () => void;
  onChanged: () => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  cl,
  onClose,
  onChanged,
}) => {
  const { t } = useLanguage();
  const addToast = useToastStore((s) => s.addToast);
  const [detail, setDetail] = useState<AdminClassDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const loadDetail = useCallback(async () => {
    if (!cl) return;
    setLoading(true);
    try {
      setDetail(await getClassDetail(cl.id));
    } catch (err) {
      addToast("error", getApiErrorMessage(err, "Failed to load class detail."));
    } finally {
      setLoading(false);
    }
  }, [cl, addToast]);

  useEffect(() => {
    if (cl) {
      setDetail(null);
      setNewStudentId("");
      loadDetail();
    }
  }, [cl, loadDetail]);

  if (!cl) return null;

  const handleAddStudent = async () => {
    const accountId = Number(newStudentId);
    if (!accountId) {
      addToast("error", t.classes.addStudentPlaceholder);
      return;
    }
    setAdding(true);
    try {
      await addStudent(cl.id, accountId);
      addToast("success", t.classes.addStudentSuccess);
      setNewStudentId("");
      await loadDetail();
      onChanged();
    } catch (err) {
      addToast("error", getApiErrorMessage(err, "Failed to add student."));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStudent = async (accountId: number) => {
    if (!window.confirm(t.classes.removeStudentConfirm)) return;
    setRemovingId(accountId);
    try {
      await removeStudent(cl.id, accountId);
      addToast("success", t.classes.removeStudent);
      await loadDetail();
      onChanged();
    } catch (err) {
      addToast("error", getApiErrorMessage(err, "Failed to remove student."));
    } finally {
      setRemovingId(null);
    }
  };

  const handleSetStatus = async (status: string) => {
    try {
      await setClassStatus(cl.id, status);
      addToast("success", t.classes.setStatusSuccess);
      await loadDetail();
      onChanged();
    } catch (err) {
      addToast("error", getApiErrorMessage(err, "Failed to update status."));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {t.classes.classDetails}
            </h2>
            <p className="text-sm text-gray-500 truncate">
              #{cl.id} — {cl.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading && !detail ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
          ) : detail ? (
            <>
              {/* Overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <OverviewCell label={t.classes.course} value={detail.item.courseName ?? "—"} />
                <OverviewCell label={t.classes.teacher} value={detail.item.teacherName ?? "—"} />
                <OverviewCell label={t.classes.language} value={detail.item.language} />
                <OverviewCell
                  label={t.classes.status}
                  value={
                    <ClassStatusBadge
                      status={detail.item.status}
                      label={t.classes.statuses[detail.item.status as keyof typeof t.classes.statuses] ?? detail.item.status}
                    />
                  }
                />
                <OverviewCell
                  label={t.classes.capacity}
                  value={`${detail.item.enrolledCount}/${detail.item.capacity}`}
                />
                <OverviewCell
                  label={t.classes.price}
                  value={`${detail.item.price.toLocaleString("vi-VN")} ₫`}
                />
              </div>

              {/* Status change */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  {t.classes.setStatus}:
                </span>
                {STATUS_ORDER.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleSetStatus(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      detail.item.status === status
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {t.classes.statuses[status] ?? status}
                  </button>
                ))}
              </div>

              {/* Schedule */}
              <section>
                <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                  <CalendarClock size={16} className="text-gray-400" />
                  {t.classes.schedule}
                </h3>
                {detail.schedule.length === 0 ? (
                  <p className="text-sm text-gray-400">—</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[400px]">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-3 py-2 font-medium">{t.classes.day}</th>
                          <th className="px-3 py-2 font-medium">{t.classes.startTime}</th>
                          <th className="px-3 py-2 font-medium">{t.classes.endTime}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.schedule.map((s, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="px-3 py-2">
                              {t.classes.days[s.dayOfWeek as keyof typeof t.classes.days] ?? s.dayOfWeek}
                            </td>
                            <td className="px-3 py-2">{s.startTime}</td>
                            <td className="px-3 py-2">{s.endTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Sessions */}
              <section>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  {t.classes.sessions} ({detail.sessions.length})
                </h3>
                {detail.sessions.length === 0 ? (
                  <p className="text-sm text-gray-400">—</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[400px]">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-3 py-2 font-medium">{t.classes.sessionNumber}</th>
                          <th className="px-3 py-2 font-medium">{t.classes.date}</th>
                          <th className="px-3 py-2 font-medium">{t.classes.startTime}</th>
                          <th className="px-3 py-2 font-medium">{t.classes.endTime}</th>
                          <th className="px-3 py-2 font-medium">{t.classes.modified}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.sessions.map((s) => (
                          <tr key={s.sessionNumber} className="border-b border-gray-100">
                            <td className="px-3 py-2">{s.sessionNumber}</td>
                            <td className="px-3 py-2">{s.date}</td>
                            <td className="px-3 py-2">{s.startTime}</td>
                            <td className="px-3 py-2">{s.endTime}</td>
                            <td className="px-3 py-2">
                              {s.isModified ? <Badge type="Yellow" title="✓" /> : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Students */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <Users size={16} className="text-gray-400" />
                    {t.classes.students} ({detail.students.length})
                  </h3>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    placeholder={t.classes.addStudentPlaceholder}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <Button
                    size="sm"
                    isLoading={adding}
                    leftIcon={<Plus size={14} />}
                    onClick={handleAddStudent}
                  >
                    {t.classes.addStudent}
                  </Button>
                </div>

                {detail.students.length === 0 ? (
                  <p className="text-sm text-gray-400">{t.classes.noStudents}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[480px]">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-3 py-2 font-medium">{t.classes.accountId}</th>
                          <th className="px-3 py-2 font-medium">{t.classes.studentName}</th>
                          <th className="px-3 py-2 font-medium">{t.classes.studentEmail}</th>
                          <th className="px-3 py-2 font-medium">{t.classes.enrollmentDate}</th>
                          <th className="px-3 py-2 text-right font-medium">{t.common.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.students.map((st) => (
                          <tr key={st.accountId} className="border-b border-gray-100">
                            <td className="px-3 py-2 text-gray-500">{st.accountId}</td>
                            <td className="px-3 py-2 font-medium text-gray-800">{st.name}</td>
                            <td className="px-3 py-2 text-gray-600">{st.email}</td>
                            <td className="px-3 py-2 text-gray-600">{fromTick(st.enrolledAtTick)}</td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                isLoading={removingId === st.accountId}
                                leftIcon={<Trash2 size={14} />}
                                onClick={() => handleRemoveStudent(st.accountId)}
                              >
                                {t.classes.removeStudent}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const OverviewCell: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
      {label}
    </p>
    <div className="text-sm text-gray-800">{value}</div>
  </div>
);
