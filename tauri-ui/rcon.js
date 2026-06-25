export function splitRconCommands(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((command) => command.trim())
    .filter(Boolean);
}

export function shouldSubmitRconCommand(event) {
  return event?.key === "Enter" && (event.ctrlKey || event.metaKey);
}
