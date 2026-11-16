"use client";

import React from "react";
import { Check, Lock } from "lucide-react";
import {
  CURRICULUM_UNITS,
  CurriculumUnit,
  getCurriculumProgressSummary,
  isUnitComplete,
  isUnitUnlocked,
} from "@/helpers/curriculum";
import { loadPracticeProgress } from "@/helpers/practiceProgress";

type UnitState = "complete" | "current" | "locked";

type Props = {
  onSelectUnit: (unit: CurriculumUnit) => void;
};

export default function CurriculumPicker({ onSelectUnit }: Props) {
  // Progress only exists in localStorage — load after mount so the server
  // render and first client render match (same hydration-safe pattern used
  // elsewhere in PracticeQuiz/Dashboard).
  const [unitStates, setUnitStates] = React.useState<Record<string, UnitState>>({});
  const [summary, setSummary] = React.useState<{ completedUnits: number; totalUnits: number }>(
    { completedUnits: 0, totalUnits: CURRICULUM_UNITS.length },
  );
  const currentUnitRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    const progress = loadPracticeProgress();
    const states: Record<string, UnitState> = {};

    CURRICULUM_UNITS.forEach((unit, index) => {
      if (isUnitComplete(progress, unit)) {
        states[unit.id] = "complete";
      } else if (isUnitUnlocked(progress, index)) {
        states[unit.id] = "current";
      } else {
        states[unit.id] = "locked";
      }
    });

    setUnitStates(states);
    setSummary(getCurriculumProgressSummary(progress));

    const frame = requestAnimationFrame(() => {
      currentUnitRef.current?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const groupedByGrade = React.useMemo(() => {
    const groups = new Map<number, CurriculumUnit[]>();
    CURRICULUM_UNITS.forEach((unit) => {
      if (!groups.has(unit.grade)) groups.set(unit.grade, []);
      groups.get(unit.grade)!.push(unit);
    });
    return groups;
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-sm font-medium">
          <span>Curriculum progress</span>
          <span className="text-base-content/60">
            Unit {Math.min(summary.completedUnits + 1, summary.totalUnits)} of{" "}
            {summary.totalUnits}
          </span>
        </div>
        <progress
          className="progress progress-primary w-full"
          value={summary.completedUnits}
          max={summary.totalUnits}
        />
      </div>

      <div className="max-h-80 overflow-y-auto space-y-3 pr-1 -mr-1">
        {Array.from(groupedByGrade.entries()).map(([grade, units]) => (
          <div key={grade} className="flex items-center gap-2">
            <span className="text-sm font-semibold text-base-content/70 w-16 shrink-0">
              Level {grade}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {units.map((unit) => {
                const state = unitStates[unit.id] ?? "locked";
                return (
                  <button
                    key={unit.id}
                    type="button"
                    ref={state === "current" ? currentUnitRef : undefined}
                    disabled={state === "locked"}
                    onClick={() => onSelectUnit(unit)}
                    aria-label={`Level ${unit.grade} unit ${unit.unitNumber}, ${state}`}
                    className={`btn btn-xs sm:btn-sm rounded-full w-9 ${
                      state === "complete"
                        ? "btn-success text-success-content"
                        : state === "current"
                          ? "btn-primary ring-2 ring-primary ring-offset-2 ring-offset-base-100"
                          : "btn-disabled bg-base-200 text-base-content/30"
                    }`}
                  >
                    {state === "complete" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : state === "locked" ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      unit.unitNumber
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
