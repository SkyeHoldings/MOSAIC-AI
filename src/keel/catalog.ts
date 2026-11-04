export const PAGES = [
  { path: '/', group: 'Pacing', name: 'Command Center', job: 'Live store-by-channel pace. Shadow read of the warehouse pacing engine.' },
  { path: '/channels', group: 'Pacing', name: 'Channel Board', job: 'Same pace, rolled up by channel.' },
  { path: '/stores', group: 'Pacing', name: 'Store Detail', job: 'One store across every channel for the active period.' },
  { path: '/settings', group: 'Pacing', name: 'Pacing Settings', job: 'Switchboard for Observe, Pilot, and Live. Gates every write.' },
  { path: '/analysis', group: 'Analysis', name: 'Reporting', job: 'Media performance versus the prior period.' },
  { path: '/map', group: 'Analysis', name: 'Fleet Map', job: 'Store fleet on a map.' },
  { path: '/actuation', group: 'Actuation', name: 'Budget Actuation', job: 'Engine proposal, human review, then a gated write. Verify is a dry-run.' },
  { path: '/pmax-review', group: 'Actuation', name: 'PMAX Read/Action', job: 'Diagnostic read can unblock. Budget action stays blocked pending POS and cross-channel review.' },
  { path: '/lost-is', group: 'Actuation', name: 'PMAX Lost-IS', job: 'Lost impression share for Performance Max.' },
  { path: '/meta-frequency', group: 'Actuation', name: 'Meta Frequency', job: 'Meta frequency review.' },
  { path: '/geo', group: 'Actuation', name: 'Geo targeting', job: 'Geo targeting review.' },
  { path: '/creative', group: 'Creative', name: 'Creative Builder', job: 'Assemble a Meta creative, save a blueprint, then deploy across units.' },
  { path: '/audiences', group: 'Creative', name: 'Audiences', job: 'Audience edits. Cohort membership is readable from the labels route.' },
  { path: '/assetgroups', group: 'Creative', name: 'Asset Groups', job: 'Asset-group deploy.' },
  { path: '/cohorts', group: 'Settings', name: 'Cohorts', job: 'Static and pasted store groups.' },
  { path: '/health', group: 'Settings', name: 'Health', job: 'Snapshot freshness plus the warehouse check for auth, freshness, period, and schema.' },
  { path: '/team', group: 'Settings', name: 'Team', job: 'Memberships. Settings management requires an admin role.' },
  { path: '/audit', group: 'Settings', name: 'Audit Log', job: 'Durable audit log. Read requires admin authority.' },
] as const

export const APIS = [
  { path: '/api/labels', kind: 'read', role: 'trader', note: 'Cohorts and store membership. Returned 200.' },
  { path: '/api/trend', kind: 'read', role: 'trader', note: 'Weekly series. Returned 200.' },
  { path: '/api/clients', kind: 'read', role: 'trader', note: 'Client list. Returned 503 when checked.' },
  { path: '/api/validation/budget', kind: 'read', role: 'trader', note: 'Returned 409, tenant validation unavailable.' },
  { path: '/api/audit', kind: 'read', role: 'admin', note: 'Refused for a trader. Needs audit-read.' },
  { path: '/api/team/memberships', kind: 'read', role: 'admin', note: 'Refused for a trader. Needs settings-manage.' },
  { path: '/api/config/mode', kind: 'write', role: 'admin', note: 'GET returned 405.' },
  { path: '/api/actuation/budgets', kind: 'read', role: 'trader', note: 'Budget proposals. Not called.' },
  { path: '/api/actuation/apply', kind: 'write', role: 'admin', note: 'Applies platform writes. Not called.' },
  { path: '/api/creative/blueprint', kind: 'write', role: 'trader', note: 'Save a creative blueprint. Not called.' },
  { path: '/api/audience-edit', kind: 'write', role: 'trader', note: 'Audience mutation. Not called.' },
] as const

export const MODES = [
  { id: 'observe', name: 'Observe-only', writes: 'No platform writes.' },
  { id: 'pilot', name: 'Pilot', writes: 'Only store and channel pairs on the allowlist.' },
  { id: 'live', name: 'Live', writes: 'All units.' },
] as const

export const SAMPLE_ROWS = [
  { storeId: '1', storeName: 'Sample North', channel: 'PMAX', budget: 2800, actual: 140, conversions: 4 },
  { storeId: '1', storeName: 'Sample North', channel: 'Meta', budget: 900, actual: 10, conversions: 0 },
  { storeId: '2', storeName: 'Sample South', channel: 'TTD', budget: 0, actual: 25, conversions: 0 },
]
