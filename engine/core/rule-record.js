'use strict';
const STATUSES = Object.freeze(['verified', 'interpreted', 'unresolved']);
const REQUIRED = ['id', 'source', 'status', 'auctionPattern', 'conditions', 'bid', 'meaning', 'forcing'];
function validateRuleRecord(rule) {
  const errors = [];
  if (!rule || typeof rule !== 'object') return { valid: false, errors: ['Rule must be an object.'] };
  for (const key of REQUIRED) if (!(key in rule)) errors.push(`Missing required field: ${key}.`);
  if (rule.id && typeof rule.id !== 'string') errors.push('id must be a string.');
  if (rule.source && (!rule.source.document || !rule.source.page)) errors.push('source must identify document and page.');
  if (rule.status && !STATUSES.includes(rule.status)) errors.push(`Unknown status: ${rule.status}.`);
  if (rule.status === 'verified' && (!rule.source || !rule.source.box)) errors.push('Verified rule must identify a source box/heading.');
  if (rule.status === 'unresolved' && rule.bid !== null && rule.bid !== undefined) errors.push('Unresolved rule must not prescribe an executable bid.');
  if (rule.forcing && !['nonforcing','invitational','forcing','game-forcing','slam-interest'].includes(rule.forcing)) errors.push('Invalid forcing classification.');
  return { valid: errors.length === 0, errors };
}
module.exports = { STATUSES, validateRuleRecord };
