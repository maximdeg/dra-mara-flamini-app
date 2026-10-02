"use client";

import { useEffect, useRef, useState } from "react";
import {
  VISIT_KIND_GROUPS,
  VISIT_KINDS,
  type VisitKind,
} from "@/lib/appointments/visit-kind";
import {
  CONSULT_TYPE_LABELS,
  PRACTICE_TYPE_LABELS,
  VISIT_TYPE_LABELS,
} from "@/lib/appointments/visit-type";
import { Button } from "@/components/ui/button";
import styles from "./schedule-editor.module.css";

// Inside a group the Visit Type is already the heading, so each box shows
// only its sub-type.
const SUB_TYPE_LABELS: Record<VisitKind, string> = {
  ...CONSULT_TYPE_LABELS,
  ...PRACTICE_TYPE_LABELS,
};

/**
 * Which Visit Kinds a Work Schedule range accepts. A range open to every kind
 * (the default, and every range saved before kinds existed) collapses to
 * "Todos los tipos"; otherwise the kinds show grouped under Consulta and
 * Práctica, each group with a checkbox that ticks or clears it whole.
 */
export function KindPicker({
  kinds,
  onChange,
}: {
  kinds: VisitKind[];
  onChange: (kinds: VisitKind[]) => void;
}) {
  const all = kinds.length === VISIT_KINDS.length;
  const [expanded, setExpanded] = useState(!all);

  if (all && !expanded) {
    return (
      <div className={styles.kindsSummary}>
        <span>Todos los tipos</span>
        <Button variant="ghost" onClick={() => setExpanded(true)}>
          Elegir tipos
        </Button>
      </div>
    );
  }

  // Keep the canonical order whatever order boxes are ticked in.
  const set = (next: VisitKind[]) =>
    onChange(VISIT_KINDS.filter((kind) => next.includes(kind)));

  return (
    <div className={styles.kinds}>
      {VISIT_KIND_GROUPS.map((group) => (
        <fieldset key={group.visitType} className={styles.kindGroup}>
          <GroupToggle
            label={VISIT_TYPE_LABELS[group.visitType]}
            ticked={group.kinds.filter((kind) => kinds.includes(kind)).length}
            total={group.kinds.length}
            onToggle={(on) =>
              set(
                on
                  ? [...kinds, ...group.kinds]
                  : kinds.filter((kind) => !group.kinds.includes(kind)),
              )
            }
          />
          {group.kinds.map((kind) => (
            <label key={kind} className={styles.kindOption}>
              <input
                type="checkbox"
                checked={kinds.includes(kind)}
                onChange={(e) =>
                  set(
                    e.target.checked
                      ? [...kinds, kind]
                      : kinds.filter((k) => k !== kind),
                  )
                }
              />
              {SUB_TYPE_LABELS[kind]}
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}

/** A group's checkbox: ticked when all of it is, partly ticked when some is. */
function GroupToggle({
  label,
  ticked,
  total,
  onToggle,
}: {
  label: string;
  ticked: number;
  total: number;
  onToggle: (on: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const partial = ticked > 0 && ticked < total;
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = partial;
  }, [partial]);

  return (
    <legend className={styles.kindGroupTitle}>
      <label>
        <input
          ref={ref}
          type="checkbox"
          checked={ticked === total}
          onChange={() => onToggle(ticked < total)}
        />
        {label}
      </label>
    </legend>
  );
}
