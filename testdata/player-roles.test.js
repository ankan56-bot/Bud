"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { getSeatRole, getDefaultTableRoles } = require("../player-roles.js");

test("default table has human North, AI partner South and AI opponents East/West", () => {
  const roles = getDefaultTableRoles();
  assert.deepEqual(roles.N, { controller: "human", relationship: "human_player" });
  assert.deepEqual(roles.S, { controller: "ai", relationship: "partner" });
  assert.deepEqual(roles.E, { controller: "ai", relationship: "opponent" });
  assert.deepEqual(roles.W, { controller: "ai", relationship: "opponent" });
});

test("seat roles can be overridden without changing defaults", () => {
  const override = { N: { controller: "ai", relationship: "partner" } };
  assert.deepEqual(getSeatRole("N", override), { controller: "ai", relationship: "partner" });
  assert.deepEqual(getSeatRole("N"), { controller: "human", relationship: "human_player" });
});

test("invalid seat and invalid role are rejected", () => {
  assert.throws(() => getSeatRole("X"), /Unknown bridge seat/);
  assert.throws(() => getSeatRole("S", { S: { controller: "ai", relationship: "spectator" } }), /AI relationship/);
  assert.throws(() => getSeatRole("N", { N: { controller: "robot" } }), /controller/);
});
