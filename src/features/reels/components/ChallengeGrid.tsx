import { Trophy, Plus } from "lucide-react";
import ChallengeCard from "./ChallengeCard";
import type { ChallengeDto } from "../types";
import Button from "../../../components/ui/Button";

interface ChallengeGridProps {
  challenges: ChallengeDto[];
  loading: boolean;
  onEdit: (challenge: ChallengeDto) => void;
  onDelete: (challenge: ChallengeDto) => void;
  getChallengeStatus: (challenge: ChallengeDto) => "Active" | "Upcoming" | "Completed";
  onCreateClick: () => void;
}

export default function ChallengeGrid({
  challenges,
  loading,
  onEdit,
  onDelete,
  getChallengeStatus,
  onCreateClick
}: ChallengeGridProps) {

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col h-[320px] bg-gray-50 border border-gray-150 rounded-2xl overflow-hidden p-4 space-y-4">
            <div className="w-full aspect-[16/9] bg-gray-200 rounded-xl" />
            <div className="h-5 bg-gray-200 rounded-md w-3/4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded-md w-full" />
              <div className="h-3 bg-gray-200 rounded-md w-5/6" />
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded-md w-2/5" />
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center select-none max-w-md mx-auto my-6 border border-dashed border-gray-200 bg-gray-50/50 rounded-3xl animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Trophy className="w-7 h-7 text-primary stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">No Active Challenges</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-6">
          Create dynamic, time-bound challenges to encourage users to create and upload reels, keeping your platform interactive and trending.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={onCreateClick}
          className="shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Challenge
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
      {challenges.map((challenge) => {
        const status = getChallengeStatus(challenge);
        return (
          <ChallengeCard
            key={challenge.challengeId}
            challenge={challenge}
            onEdit={onEdit}
            onDelete={onDelete}
            status={status}
          />
        );
      })}
    </div>
  );
}
