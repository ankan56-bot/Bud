#!/usr/bin/env node
"use strict";

// Structural audit for analysbibliotek.json.
// This tool deliberately reports legacy gaps; it does not rewrite or infer rules.
const fs = require("fs");
const path = require("path");

const COMPETITIVE_TREE_IDS = new Set([
  "T29", "T30", "T31", "T32", "T33"
]);

function treeNumber(id) {
  const match = String(id || "").match(/^(T\\d+)(?:_|$)/);
  return match ? match[1] : null;
}

function isCompetitiveTree(tree) {
  return COMPETITIVE_TREE_IDS.has(treeNumber(tree && tree.id));
}

function auditLibrary(library) {
  const errors = [];
  const warnings = [];
  if (!library || !Array.isArray(library.trees)) {
    return { errors: ["Library must contain a trees array"], warnings, metrics: {} };
  }

  const allTrees = library.trees;
  const trees = allTrees.filter(tree => !isCompetitiveTree(tree));
  const treeIds = new Set();
  const nodeIds = new Map();
  const duplicateSequences = new Map();
  const branchTargets = [];
  let branchEntries = 0;
  let linkedBranches = 0;
  let unlinkedBranches = 0;
  let nodesWithoutOutgoing = 0;
  let nodesWithoutHandProfile = 0;

  for (const tree of allTrees) {
    if (!tree || typeof tree.id !== "string" || !tree.id) {
      errors.push("Tree without a stable id");
      continue;
    }
    if (treeIds.has(tree.id)) errors.push("Duplicate tree id: " + tree.id);
    treeIds.add(tree.id);
  }

  for (const tree of trees) {
    const localNodes = Array.isArray(tree.nodes) ? tree.nodes : [];
    if (!Array.isArray(tree.nodes)) errors.push(tree.id + ": nodes must be an array");

    if (typeof tree.root !== "string" || !localNodes.some(node => node.id === tree.root)) {
      warnings.push({ type: "invalid-root", tree: tree.id, root: tree.root });
    }

    for (const node of localNodes) {
      if (!node || typeof node.id !== "string" || !node.id) {
        errors.push(tree.id + ": node without stable id");
        continue;
      }
      if (nodeIds.has(node.id)) errors.push("Duplicate node id: " + node.id);
      else nodeIds.set(node.id, tree.id);

      if (!Array.isArray(node.sequence) || node.sequence.length === 0 ||
          node.sequence.some(call => typeof call !== "string" || !call.trim())) {
        errors.push(tree.id + "/" + node.id + ": invalid or empty sequence");
      } else {
        const key = node.sequence.join(" | ");
        if (!duplicateSequences.has(key)) duplicateSequences.set(key, []);
        duplicateSequences.get(key).push({ tree: tree.id, node: node.id });
      }

      if (!node.handProfile || typeof node.handProfile !== "object") {
        nodesWithoutHandProfile++;
        warnings.push({ type: "missing-hand-profile", tree: tree.id, node: node.id });
      }

      if (!Array.isArray(node.branches) || node.branches.length === 0) {
        nodesWithoutOutgoing++;
      }
      for (const branch of node.branches || []) {
        branchEntries++;
        if (!branch || typeof branch.call !== "string" || !branch.call.trim()) {
          errors.push(tree.id + "/" + node.id + ": branch without call");
          continue;
        }
        if (branch.next == null || branch.next === "") {
          unlinkedBranches++;
          warnings.push({
            type: "branch-without-target",
            tree: tree.id,
            node: node.id,
            call: branch.call,
            label: branch.label || ""
          });
        } else {
          linkedBranches++;
          branchTargets.push({ tree: tree.id, node: node.id, call: branch.call, target: branch.next });
        }
      }
    }
  }

  let invalidTargets = 0;
  let crossTreeLinks = 0;
  for (const edge of branchTargets) {
    const targetTree = nodeIds.get(edge.target);
    if (!targetTree) {
      invalidTargets++;
      errors.push(edge.tree + "/" + edge.node + " " + edge.call +
        ": dangling target " + edge.target);
    } else if (targetTree !== edge.tree) {
      crossTreeLinks++;
    }
  }

  const duplicateGroups = [...duplicateSequences.entries()].filter(([, refs]) => refs.length > 1);
  const duplicateExtraOccurrences = duplicateGroups.reduce((sum, [, refs]) => sum + refs.length - 1, 0);
  for (const [sequence, refs] of duplicateGroups) {
    warnings.push({ type: "duplicate-sequence", sequence, refs });
  }

  const metrics = {
    libraryVersion: library.version || null,
    totalTrees: allTrees.length,
    competitiveTreesExcluded: allTrees.length - trees.length,
    undisturbedTrees: trees.length,
    undisturbedNodes: [...nodeIds.keys()].length,
    branchEntries,
    linkedBranches,
    unlinkedBranches,
    nodesWithoutOutgoing,
    nodesWithoutHandProfile,
    invalidRootTrees: warnings.filter(item => item.type === "invalid-root").length,
    invalidBranchTargets: invalidTargets,
    crossTreeLinks,
    duplicateSequenceGroups: duplicateGroups.length,
    duplicateSequenceExtraOccurrences: duplicateExtraOccurrences
  };

  return { errors, warnings, metrics };
}

if (require.main === module) {
  const file = process.argv[2] || path.join(__dirname, "..", "analysbibliotek.json");
  const library = JSON.parse(fs.readFileSync(file, "utf8"));
  const result = auditLibrary(library);
  console.log("Analysis library structural audit");
  console.log(JSON.stringify(result.metrics, null, 2));
  console.log("Errors: " + result.errors.length + "; documented warnings: " + result.warnings.length);
  if (result.errors.length) {
    result.errors.forEach(error => console.error("ERROR: " + error));
    process.exitCode = 1;
  }
}

module.exports = { auditLibrary, isCompetitiveTree };
