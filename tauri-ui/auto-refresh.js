export function runAutoRefreshTick(
  state,
  { now, selectedServerSocket, activeServerSockets, refreshServers },
) {
  if (state.refreshInFlight) return { type: "skipped" };

  const selected = selectedServerSocket();
  const selectedDue = Boolean(
    selected && now - state.lastSelectedRefreshAt >= state.autoRefreshSelectedSecs * 1000,
  );
  const activeDue = now - state.lastActiveRefreshAt >= state.autoRefreshActiveSecs * 1000;
  const fullDue = now - state.lastFullRefreshAt >= state.autoRefreshEmptySecs * 1000;

  if (fullDue) {
    state.lastFullRefreshAt = now;
    state.lastActiveRefreshAt = now;
    state.lastSelectedRefreshAt = now;
    refreshServers({ silent: true });
    return { type: "full" };
  }

  if (activeDue) {
    const sockets = activeServerSockets();
    if (selectedDue && selected && !sockets.includes(selected)) sockets.push(selected);
    state.lastActiveRefreshAt = now;
    if (sockets.length > 0) {
      if (selectedDue) state.lastSelectedRefreshAt = now;
      refreshServers({ silent: true, sockets });
      return { type: "partial" };
    }
  }

  if (selectedDue) {
    state.lastSelectedRefreshAt = now;
    refreshServers({ silent: true, sockets: [selected] });
    return { type: "selected" };
  }

  return { type: "idle" };
}
