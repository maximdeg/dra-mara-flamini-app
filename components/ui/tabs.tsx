"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "./cn";
import styles from "./tabs.module.css";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

/**
 * An accessible tab group: a `tablist` of `tab` buttons over `tabpanel`s.
 * Selection follows focus via the arrow keys (roving tabindex); Home/End jump to
 * the ends. All panels stay mounted (inactive ones are `hidden`) so form state
 * survives switching tabs.
 */
export function Tabs({
  tabs,
  defaultTabId,
  className,
}: {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
}) {
  const baseId = useId();
  const [active, setActive] = useState(defaultTabId ?? tabs[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = tabs.findIndex((t) => t.id === active);
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    const nextId = tabs[nextIndex].id;
    setActive(nextId);
    tabRefs.current[nextId]?.focus();
  }

  return (
    <div className={cn(styles.tabs, className)}>
      <div role="tablist" className={styles.tablist}>
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={cn(styles.tab, selected && styles.tabActive)}
              onClick={() => setActive(tab.id)}
              onKeyDown={onKeyDown}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className={styles.panel}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
