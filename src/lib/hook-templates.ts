import { t } from "./i18n";
import type { HookEvent } from "../views/settings/types";

// Starter command templates the user can insert and then edit. These are
// plain local shell commands — Entracte ships no bundled service
// integrations, so anything touching a service (Slack, Home Assistant) is a
// visible `curl` the user fills in with their own token/URL. Hooks run via
// shell-words with no shell, so anything needing pipes, redirects, env
// expansion or quoting is wrapped in `sh -c`.
export type HookTemplate = {
  id: string;
  readonly label: string;
  // A sensible default event to pair with the command; the user can change it.
  event: HookEvent;
  command: string;
};

export const HOOK_TEMPLATES: HookTemplate[] = [
  {
    id: "log-to-file",
    get label() {
      return t("hookTemplate.log-to-file");
    },
    event: "break_start",
    command:
      'sh -c "echo \\"$(date) $ENTRACTE_EVENT $ENTRACTE_KIND\\" >> ~/entracte-hooks.log"',
  },
  {
    id: "pause-music-macos",
    get label() {
      return t("hookTemplate.pause-music-macos");
    },
    event: "break_start",
    command: 'sh -c "osascript -e \'tell application \\"Music\\" to pause\'"',
  },
  {
    id: "resume-music-macos",
    get label() {
      return t("hookTemplate.resume-music-macos");
    },
    event: "break_end",
    command: 'sh -c "osascript -e \'tell application \\"Music\\" to play\'"',
  },
  {
    id: "notify-linux",
    get label() {
      return t("hookTemplate.notify-linux");
    },
    event: "break_start",
    command: 'sh -c "notify-send Entracte \\"Break: $ENTRACTE_KIND\\""',
  },
  {
    id: "slack-status",
    get label() {
      return t("hookTemplate.slack-status");
    },
    event: "break_start",
    command:
      'sh -c "curl -s -X POST -H \'Authorization: Bearer xoxp-YOUR-TOKEN\' -H \'Content-type: application/json\' https://slack.com/api/users.profile.set -d \'{\\"profile\\":{\\"status_text\\":\\"On a break\\",\\"status_emoji\\":\\":coffee:\\"}}\'"',
  },
  {
    id: "home-assistant-scene",
    get label() {
      return t("hookTemplate.home-assistant-scene");
    },
    event: "break_start",
    command:
      "sh -c \"curl -s -X POST -H 'Authorization: Bearer YOUR-TOKEN' -H 'Content-type: application/json' http://homeassistant.local:8123/api/services/scene/turn_on -d '{\\\"entity_id\\\":\\\"scene.focus\\\"}'\"",
  },
];
