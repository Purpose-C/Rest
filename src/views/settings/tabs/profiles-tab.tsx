import { t } from "../../../lib/i18n";
import { CollapsibleSection } from "../components/collapsible-section";
import type { UseProfiles } from "../hooks/use-profiles";

export function ProfilesTab({ profiles }: { profiles: UseProfiles }) {
  return (
    <>
      <CollapsibleSection id="settings-profiles" title={t("profiles.title")}>
        <p className="placeholder">{t("profiles.desc")}</p>
        {profiles.profileError && (
          <p className="profile-error">{profiles.profileError}</p>
        )}
        <div className="profile-list">
          {profiles.profiles.map((name, idx) => {
            const isActive = name === profiles.activeProfile;
            const draft = profiles.renameDrafts[name];
            const isRenaming = draft !== undefined;
            const isDeleteCandidate = profiles.deleteCandidate === name;
            const isResetCandidate = profiles.resetCandidate === name;
            const canDelete = !isActive && profiles.profiles.length > 1;
            const canMoveUp = idx > 0;
            const canMoveDown = idx < profiles.profiles.length - 1;
            return (
              <div
                key={name}
                className={`profile-row${isActive ? " active" : ""}`}
              >
                <span className="profile-reorder">
                  <button
                    type="button"
                    className="reorder-btn"
                    aria-label={t("profiles.moveUpAria", { name })}
                    disabled={isRenaming || !canMoveUp}
                    onClick={() => profiles.move(name, -1)}
                  >
                    <span aria-hidden="true">▲</span>
                  </button>
                  <button
                    type="button"
                    className="reorder-btn"
                    aria-label={t("profiles.moveDownAria", { name })}
                    disabled={isRenaming || !canMoveDown}
                    onClick={() => profiles.move(name, 1)}
                  >
                    <span aria-hidden="true">▼</span>
                  </button>
                </span>
                {isRenaming ? (
                  <input
                    type="text"
                    aria-label={t("profiles.nameAria")}
                    value={draft}
                    // Autofocus is appropriate here: the field appears in
                    // response to a user clicking "rename", not on page
                    // load, so focusing it is expected, not disorienting.
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    onChange={(e) =>
                      profiles.setRenameDraft(name, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") profiles.rename(name);
                      if (e.key === "Escape")
                        profiles.setRenameDraft(name, null);
                    }}
                    onBlur={() => profiles.rename(name)}
                  />
                ) : (
                  <span className="profile-name">
                    {name}
                    {isActive && (
                      <span className="profile-badge">
                        {t("profiles.activeBadge")}
                      </span>
                    )}
                  </span>
                )}
                <span className="profile-actions">
                  {!isRenaming && !isActive && (
                    <button
                      type="button"
                      className="icon-action"
                      aria-label={t("profiles.useProfileAria", { name })}
                      title={t("profiles.useProfileTitle")}
                      onClick={() => profiles.switchTo(name)}
                    >
                      <span aria-hidden="true">○</span>
                    </button>
                  )}
                  {!isRenaming && (
                    <button
                      type="button"
                      className="icon-action"
                      aria-label={t("profiles.renameAria", { name })}
                      title={t("profiles.renameTitle")}
                      onClick={() => profiles.setRenameDraft(name, name)}
                    >
                      <span aria-hidden="true">✎</span>
                    </button>
                  )}
                  {!isRenaming && (
                    <button
                      type="button"
                      className="icon-action"
                      aria-label={t("profiles.duplicateAria", { name })}
                      title={t("profiles.duplicateTitle")}
                      onClick={() => profiles.duplicate(name)}
                    >
                      <span aria-hidden="true">⧉</span>
                    </button>
                  )}
                  {!isRenaming &&
                    (isResetCandidate ? (
                      <button
                        type="button"
                        className="link danger"
                        onClick={() => profiles.confirmReset(name)}
                      >
                        {t("profiles.confirmReset")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="icon-action icon-accent"
                        aria-label={t("profiles.resetAria", { name })}
                        title={t("profiles.resetTitle")}
                        onClick={() => profiles.requestReset(name)}
                      >
                        <span aria-hidden="true">↺</span>
                      </button>
                    ))}
                  {!isRenaming &&
                    canDelete &&
                    (isDeleteCandidate ? (
                      <button
                        type="button"
                        className="link danger"
                        onClick={() => profiles.confirmDelete(name)}
                      >
                        {t("profiles.confirmDelete")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="icon-action icon-pop"
                        aria-label={t("profiles.deleteAria", { name })}
                        title={t("profiles.deleteTitle")}
                        onClick={() => profiles.requestDelete(name)}
                      >
                        <span aria-hidden="true">✕</span>
                      </button>
                    ))}
                </span>
              </div>
            );
          })}
        </div>
        <div className="profile-add">
          <input
            type="text"
            placeholder={t("profiles.newPlaceholder")}
            value={profiles.newProfileName}
            onChange={(e) => profiles.setNewProfileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") profiles.create();
            }}
          />
          <button
            className="secondary"
            onClick={profiles.create}
            disabled={!profiles.newProfileName.trim()}
          >
            {t("profiles.add")}
          </button>
        </div>
      </CollapsibleSection>
    </>
  );
}
