import { useState, type ReactNode } from "react";

type Props = {
  id: string;
  title: ReactNode;
  children: ReactNode;
  action?: ReactNode;
};

export function CollapsibleSection({ id, title, children, action }: Props) {
  const storageKey = `settings.collapsed.${id}`;
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(storageKey) === "true",
  );
  const contentId = `${id}-content`;
  const heading = (
    <h2 id={id}>
      <button
        type="button"
        className="settings-section-toggle"
        aria-expanded={!collapsed}
        aria-controls={contentId}
        onClick={() => {
          const next = !collapsed;
          setCollapsed(next);
          localStorage.setItem(storageKey, String(next));
        }}
      >
        <span className="settings-section-chevron" aria-hidden="true">
          {collapsed ? "▸" : "▾"}
        </span>
        <span>{title}</span>
      </button>
    </h2>
  );

  return (
    <div className="collapsible-settings-section">
      {action ? (
        <div className="section-heading">
          {heading}
          {action}
        </div>
      ) : (
        heading
      )}
      <section id={contentId} hidden={collapsed}>
        {children}
      </section>
    </div>
  );
}
