import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getChallenges } from "../api/getChallenges";
import { createChallenge } from "../api/createChallenge";
import { updateChallenge } from "../api/updateChallenge";
import { deleteChallenge } from "../api/deleteChallenge";
import type { ChallengeDto, ChallengeCreateDto, ChallengeStatusFilter } from "../types";
import { useToastStore } from "../../../stores/toastStore";
import { getApiErrorMessage } from "../../../lib/axios";

export function useChallenges() {
  const addToast = useToastStore((s) => s.addToast);

  const [challenges, setChallenges] = useState<ChallengeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChallengeStatusFilter>("All");
  const requestId = useRef(0);

  // Fetch from endpoint
  const fetchChallenges = useCallback(async () => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    setLoading(true);
    setError(null);
    try {
      const data = await getChallenges();
      if (currentRequestId !== requestId.current) return;
      setChallenges(data || []);
    } catch (err) {
      if (currentRequestId !== requestId.current) return;
      console.error("API Challenges fetch failed:", err);
      setError("Failed to retrieve challenges from the server. Please check your connection.");
      setChallenges([]);
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Determine dynamic challenge status based on start/end dates
  const getChallengeStatus = useCallback((challenge: ChallengeDto): "Active" | "Upcoming" | "Completed" => {
    const now = Date.now();
    const start = new Date(challenge.startDate).getTime();
    const end = new Date(challenge.endDate).getTime();

    if (now < start) return "Upcoming";
    if (now > end) return "Completed";
    return "Active";
  }, []);

  // Filtered & Sorted Challenges
  const filteredChallenges = useMemo(() => {
    let result = [...challenges];

    // 1. Search filter (by name or hashtag)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace("#", "");
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.hashtag?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (statusFilter !== "All") {
      result = result.filter((c) => getChallengeStatus(c) === statusFilter);
    }

    // Sort by creation date or start date
    result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return result;
  }, [challenges, searchQuery, statusFilter, getChallengeStatus]);

  // Create Challenge Mutation
  const handleCreateChallenge = useCallback(async (payload: ChallengeCreateDto) => {
    addToast("info", `Creating challenge "${payload.name}"...`);
    try {
      const response = await createChallenge(payload);
      const createdItem = response.data;
      if (createdItem) {
        setChallenges((prev) => [createdItem, ...prev]);
      } else {
        await fetchChallenges();
      }
      addToast("success", `Challenge "${payload.name}" created successfully.`);
    } catch (err) {
      addToast(
        "error",
        getApiErrorMessage(err, `Failed to create challenge "${payload.name}".`)
      );
      throw err;
    }
  }, [addToast, fetchChallenges]);

  // Update Challenge Mutation
  const handleUpdateChallenge = useCallback(async (challengeId: number, payload: ChallengeCreateDto) => {
    addToast("info", `Updating challenge "${payload.name}"...`);
    const backupState = [...challenges];

    // Optimistically update
    setChallenges((prev) =>
      prev.map((c) =>
        c.challengeId === challengeId
          ? {
            ...c,
            name: payload.name,
            hashtag: payload.hashtag,
            description: payload.description,
            startDate: payload.startDate,
            endDate: payload.endDate,
          }
          : c
      )
    );

    try {
      await updateChallenge(challengeId, payload);
      addToast("success", `Challenge "${payload.name}" updated successfully.`);
      await fetchChallenges(); // background sync
    } catch (err) {
      setChallenges(backupState);
      addToast(
        "error",
        getApiErrorMessage(err, `Failed to update challenge "${payload.name}".`)
      );
      throw err;
    }
  }, [challenges, addToast, fetchChallenges]);

  // Delete Challenge Mutation
  const handleDeleteChallenge = useCallback(async (challengeId: number) => {
    const itemToDelete = challenges.find((c) => c.challengeId === challengeId);
    const itemName = itemToDelete?.name || `ID ${challengeId}`;

    addToast("info", `Deleting challenge "${itemName}"...`);
    const backupState = [...challenges];

    // Optimistic delete
    setChallenges((prev) => prev.filter((c) => c.challengeId !== challengeId));

    try {
      await deleteChallenge(challengeId);
      addToast("success", `Challenge "${itemName}" deleted successfully.`);
    } catch (err) {
      setChallenges(backupState);
      addToast(
        "error",
        getApiErrorMessage(err, `Failed to delete challenge "${itemName}".`)
      );
    }
  }, [challenges, addToast]);

  return {
    challenges: filteredChallenges,
    rawChallenges: challenges,
    loading,
    error,

    // Filters & Queries
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,

    // Dynamic statuses
    getChallengeStatus,

    // Mutations
    handleCreateChallenge,
    handleUpdateChallenge,
    handleDeleteChallenge,
    refetch: fetchChallenges,
  };
}
