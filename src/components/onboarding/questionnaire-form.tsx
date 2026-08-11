"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { QuestionnaireQuestion, QuestionnaireResponse } from "@/lib/types/database";
import { Button } from "@/components/ui/button";

export function QuestionnaireForm({
  companyId,
  stepId,
  questionnaireId,
  questions,
  responses,
  action,
}: {
  companyId: string;
  stepId: string;
  questionnaireId: string;
  questions: QuestionnaireQuestion[];
  responses: QuestionnaireResponse[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const q of questions) {
      initial[q.id] =
        responses.find((r) => r.question_id === q.id)?.value ?? "";
    }
    return initial;
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const fd = new FormData();
      fd.set("companyId", companyId);
      fd.set("stepId", stepId);
      fd.set("questionnaireId", questionnaireId);
      fd.set("submit", "false");
      Object.entries(values).forEach(([id, value]) => fd.set(`q:${id}`, value));
      startTransition(async () => {
        await action(fd);
        setSavedAt(new Date().toLocaleTimeString());
      });
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [values, action, companyId, questionnaireId, stepId]);

  return (
    <form
      className="space-y-5"
      action={(fd) => {
        fd.set("companyId", companyId);
        fd.set("stepId", stepId);
        fd.set("questionnaireId", questionnaireId);
        fd.set("submit", "true");
        Object.entries(values).forEach(([id, value]) => fd.set(`q:${id}`, value));
        startTransition(async () => {
          await action(fd);
          setSavedAt(new Date().toLocaleTimeString());
        });
      }}
    >
      {questions.map((question) => (
        <label key={question.id} className="block">
          <span className="text-sm font-semibold">
            {question.prompt}
            {question.required ? " *" : ""}
          </span>
          {question.help_text ? (
            <span className="mt-1 block text-xs text-ob-ink-muted">
              {question.help_text}
            </span>
          ) : null}
          {question.question_type === "textarea" ? (
            <textarea
              className="mt-2 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
              rows={4}
              value={values[question.id] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [question.id]: e.target.value }))
              }
            />
          ) : (
            <input
              className="mt-2 w-full rounded-[10px] border border-ob-stone-300 px-3 py-2"
              value={values[question.id] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [question.id]: e.target.value }))
              }
            />
          )}
        </label>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          Submit answers
        </Button>
        <span className="text-xs text-ob-ink-muted">
          {pending
            ? "Saving…"
            : savedAt
              ? `Saved at ${savedAt}. You can leave and return anytime.`
              : "Changes autosave."}
        </span>
      </div>
    </form>
  );
}
