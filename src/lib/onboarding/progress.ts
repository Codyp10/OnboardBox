import type { OnboardingStep } from "@/lib/types/database";

export function calculateOnboardingProgress(steps: OnboardingStep[]) {
  const actionable = steps.filter((s) => s.status !== "skipped");
  const completed = actionable.filter((s) => s.status === "completed");
  const completionPercentage =
    actionable.length === 0
      ? 0
      : Math.round((completed.length / actionable.length) * 100);

  const blocking = actionable.filter((s) => s.blocks_launch);
  const blockingIncomplete = blocking.filter((s) => s.status !== "completed");
  const readyToLaunch = blocking.length > 0 && blockingIncomplete.length === 0;

  const requiredIncomplete = actionable.filter(
    (s) => s.required && s.status !== "completed",
  );

  return {
    completionPercentage,
    readyToLaunch: blocking.length === 0 ? completed.length === actionable.length : readyToLaunch,
    blockingIncomplete,
    requiredIncomplete,
    completedCount: completed.length,
    totalCount: actionable.length,
  };
}
