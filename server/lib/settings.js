import { readFileSync, writeFileSync, existsSync } from "fs";
import yaml from "js-yaml";

const SETTINGS_PATH = process.env.SETTINGS_PATH ?? "./settings.yml";

export function loadSettings() {
  if (!existsSync(SETTINGS_PATH)) {
    return { writable_calendar_id: [] };
  }
  return yaml.load(readFileSync(SETTINGS_PATH, "utf-8")) ?? { writable_calendar_id: [] };
}

export function saveSettings(settings) {
  writeFileSync(SETTINGS_PATH, yaml.dump(settings));
}