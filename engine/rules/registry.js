'use strict';
const { validateRuleRecord } = require('../core/rule-record');

class RuleRegistry {
  constructor() {
    this.modules = new Map();
    this.rules = new Map();
  }
  register(moduleDef) {
    const errors = [];
    if (!moduleDef || typeof moduleDef !== 'object') return { registered:false, errors:['Module definition must be an object.'] };
    if (!moduleDef.id || typeof moduleDef.id !== 'string') errors.push('Module must have a stable string id.');
    if (!Array.isArray(moduleDef.rules)) errors.push('Module rules must be an array.');
    if (errors.length) return { registered:false, errors };
    if (this.modules.has(moduleDef.id)) errors.push(`Duplicate module id: ${moduleDef.id}.`);
    for (const rule of moduleDef.rules) {
      const validation = validateRuleRecord(rule);
      errors.push(...validation.errors.map(e => `${rule && rule.id || '(unnamed rule)'}: ${e}`));
      if (rule && this.rules.has(rule.id)) errors.push(`Duplicate rule id: ${rule.id}.`);
    }
    if (errors.length) return { registered:false, errors };
    this.modules.set(moduleDef.id, Object.freeze({ id:moduleDef.id, title:moduleDef.title || moduleDef.id, rules:Object.freeze(moduleDef.rules.slice()) }));
    for (const rule of moduleDef.rules) this.rules.set(rule.id, rule);
    return { registered:true, moduleId:moduleDef.id, count:moduleDef.rules.length, errors:[] };
  }
  getRule(id) { return this.rules.get(id) || null; }
  getModule(id) { return this.modules.get(id) || null; }
  listRules({ status } = {}) {
    const all = [...this.rules.values()];
    return status ? all.filter(r => r.status === status) : all;
  }
  audit() {
    return {
      moduleCount:this.modules.size,
      ruleCount:this.rules.size,
      verified:this.listRules({status:'verified'}).length,
      interpreted:this.listRules({status:'interpreted'}).length,
      unresolved:this.listRules({status:'unresolved'}).length,
      moduleIds:[...this.modules.keys()]
    };
  }
}
module.exports = { RuleRegistry };
