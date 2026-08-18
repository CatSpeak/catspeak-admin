import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Users, CalendarClock, Trash2, Loader2, Search } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../lib/axios";
import { useToastStore } from "../../../stores/toastStore";
import { useLanguage } from "../../../stores/languageStore";
import { getClassDetail, addStudent, removeStudent, setClassStatus, searchStudents } from "../api/classApi";
import type { AdminClass, AdminClassDetail, StudentCandidate } from "../types";
import { ClassStatusBadge } from "./ClassStatusBadge";
import { toLocalScheduleEntry, toLocalSession, utcDateFromTick } from "../utils/time";

const STATUS_ORDER = [
  "UPCOMING",
  "OPEN_FOR_ENROLLMENT",
  "NOT_STARTED",
  "TEACHING",
  "ARCHIVED",
  "FINISHED",
] as const;

const AUTO_STATUS = "";

function fromTick(tick?: number): string {
  if (!tick) return "—";
  return utcDateFromTick(tick).toLocaleDateString("vi-VN");
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
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [studentResults, setStudentResults] = useState<StudentCandidate[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchSeq = useRef(0);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

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
      setSearchTerm("");
      setStudentResults([]);
      setMatchedCount(0);
      setShowDropdown(false);
      loadDetail();
    }
  }, [cl, loadDetail]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  if (!cl) return null;

  const enrolledIds = new Set((detail?.students ?? []).map((s) => s.accountId));

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(true);

    if (searchTimer.current) clearTimeout(searchTimer.current);

    const keyword = value.trim();
    if (!keyword) {
      setStudentResults([]);
      setMatchedCount(0);
      setSearching(false);
      return;
    }

    const seq = ++searchSeq.current;
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchStudents(keyword);
        if (seq !== searchSeq.current) return;
        setStudentResults(results.filter((r) => !enrolledIds.has(r.accountId)));
        setMatchedCount(results.length);
      } catch {
        if (seq !== searchSeq.current) return;
        setStudentResults([]);
        setMatchedCount(0);
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, 300);
  };

  const handleAddStudent = async (accountId: number) => {
    setAddingId(accountId);
    try {
      await addStudent(cl.id, accountId);
      addToast("success", t.classes.addStudentSuccess);
      setSearchTerm("");
      setStudentResults([]);
      setMatchedCount(0);
      setShowDropdown(false);
      await loadDetail();
      onChanged();
    } catch (err) {
      addToast("error", getApiErrorMessage(err, "Failed to add student."));
    } finally {
      setAddingId(null);
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

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && studentResults.length > 0) {
      e.preventDefault();
      handleAddStudent(studentResults[0].accountId);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
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
                {detail.item.adminStatus === null && (
                  <button
                    onClick={() => handleSetStatus(AUTO_STATUS)}
                    className="px-3 py-1 rounded-full text-xs font-medium border bg-slate-700 text-white border-slate-700 transition-colors cursor-pointer"
                  >
                    {t.classes.autoStatus}
                  </button>
                )}
                {STATUS_ORDER.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleSetStatus(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      detail.item.status === status &&
                      detail.item.adminStatus !== null
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
                        {detail.schedule.map((s, i) => {
                          const local = toLocalScheduleEntry(
                            s.dayOfWeek,
                            s.startTime,
                            s.endTime,
                            detail.item.startDateTick,
                          );
                          return (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="px-3 py-2">
                                {t.classes.days[local.dayKey as keyof typeof t.classes.days] ?? local.dayKey}
                              </td>
                              <td className="px-3 py-2">{local.startTime}</td>
                              <td className="px-3 py-2">{local.endTime}</td>
                            </tr>
                          );
                        })}
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
                        {detail.sessions.map((s) => {
                          const local = toLocalSession(s.date, s.startTime, s.endTime);
                          return (
                            <tr key={s.sessionNumber} className="border-b border-gray-100">
                              <td className="px-3 py-2">{s.sessionNumber}</td>
                              <td className="px-3 py-2">{local.date}</td>
                              <td className="px-3 py-2">{local.startTime}</td>
                              <td className="px-3 py-2">{local.endTime}</td>
                              <td className="px-3 py-2">
                                {s.isModified ? <Badge type="Yellow" title="✓" /> : "—"}
                              </td>
                            </tr>
                          );
                        })}
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

                <div className="relative mb-3" ref={searchBoxRef}>
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={t.classes.searchStudentPlaceholder}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />

                  {showDropdown && searchTerm.trim() && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searching ? (
                        <div className="flex justify-center py-4">
                          <Loader2 size={18} className="text-primary animate-spin" />
                        </div>
                      ) : studentResults.length === 0 && matchedCount > 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500">
                          {t.classes.allStudentsEnrolled}
                        </p>
                      ) : studentResults.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500">
                          {t.classes.noSearchResults}
                        </p>
                      ) : (
                        studentResults.map((candidate) => (
                          <button
                            key={candidate.accountId}
                            type="button"
                            disabled={addingId === candidate.accountId}
                            onClick={() => handleAddStudent(candidate.accountId)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="font-medium text-gray-800 truncate">
                                {candidate.name}
                              </span>
                              {addingId === candidate.accountId && (
                                <Loader2 size={14} className="text-primary animate-spin shrink-0" />
                              )}
                            </span>
                            <span className="text-gray-400 text-xs truncate shrink-0">
                              {candidate.email}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
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