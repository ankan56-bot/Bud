'use strict';
const STATUS_RANK = Object.freeze({ verified: 3, interpreted: 2, unresolved: 1 });
function chooseRule(candidates = []) {
  const executable = candidates.filter(c => c && c.status !== 'unresolved' && c.match === true);
  if (!executable.length) return { status: 'uncovered', rule: null, trace: candidates.map(c => ({ id: c && c.id, match: !!(c && c.match), status: c && c.status, reason: c && c.reason || 'Not applicable' })) };
  const maxStatus = Math.max(...executable.map(c => STATUS_RANK[c.status] || 0));
  const sameStatus = executable.filter(c => (STATUS_RANK[c.status] || 0) === maxStatus);
  const maxPriority = Math.max(...sameStatus.map(c => Number.isFinite(c.priority) ? c.priority : 0));
  const winners = sameStatus.filter(c => (Number.isFinite(c.priority) ? c.priority : 0) === maxPriority);
  if (winners.length > 1) return { status: 'conflict', rule: null, conflicts: winners.map(c => c.id), trace: candidates.map(c => ({ id: c.id, match: !!c.match, status: c.status, reason: c.reason || 'Candidate' })) };
  return { status: 'matched', rule: winners[0], trace: candidates.map(c => ({ id: c.id, match: !!c.match, status: c.status, reason: c.reason || (c.match ? 'Matched' : 'Conditions not met') })) };
}
module.exports = { chooseRule };
