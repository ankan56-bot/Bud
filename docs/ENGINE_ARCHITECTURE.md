# Modular bidding engine — architecture (v2)

## Why this design
The engine is split by responsibility, not by arbitrary line count or PDF page. Small stable primitives are shared; system meanings live in isolated rule modules; analysis never changes the official rule result.

## Layers
- **Core primitives**: calls, auction state/legality, cards/hands, shape, raw high-card points.
- **Rule catalog**: provenance-bearing records (source page/box, verified/interpreted/unresolved).
- **System modules**: grouped by bidding situation (openings, responses, rebids, trump support, NT, Stayman, transfers, competitive auctions, doubles). Each module owns its rules and tests.
- **Decision pipeline**: legal auction context -> candidate rules -> conditions -> ranked applicable rules -> decision with trace. If no verified rule applies, return uncovered; never invent a bid.
- **Analysis layer**: missed opportunities/contract quality, and diagnostic explanations. It can suggest a complementary analysis but cannot override verified system rules.
- **Integration adapter**: UI/current engine connection is last and deliberately thin.

## Module boundaries
Modules should be sized around a coherent bidding situation, usually a group of related sequences—not one file per trivial helper and not one giant file. Each module exports a small interface and owns its rule IDs/tests. Shared helpers must not import system modules. System modules may depend on core only. Cross-module conventions are invoked through explicit routing/continuation, never hidden coupling.

## Rule record schema
Each rule has:
- stable `id`
- `source`: PDF page and box/heading
- `status`: `verified`, `interpreted`, or `unresolved`
- `auctionPattern` and explicit seat/turn assumptions
- `conditions` (structured, not executable prose)
- `bid` / allowed alternatives
- `meaning`, `notMeaning`, and `forcing`
- `priority`, `excludes`, and `notes` when needed
- test cases (positive, negative, boundary, overlap)

## Decision safety
- Verified system rules outrank interpreted rules.
- Unresolved rules are never executable.
- Conflicting verified rules are an error, not resolved by file order.
- A decision returns rule ID, source, status, matched conditions, rejected candidates and reason.
- No match returns `uncovered`; no fallback bidding logic may silently create a system meaning.

## Development cadence
Extract one section from the PDF -> formalize and validate variants -> implement a dedicated module -> positive/negative/boundary/overlap tests -> module tests -> regression -> only then integrate.
Color variants must be checked for level, order, forcing, jump/reverse, suit length and exceptions. No mechanical suit substitution.

## Current foundation
- `engine/core/calls.js`: canonical calls and contract ranking.
- `engine/core/auction.js`: auction legality and termination.
- `engine/core/cards.js`: card/suit/rank constants and validation.
- `engine/core/hand.js`: normalized hand parsing/shape/validation.
- `engine/core/points.js`: raw HCP only.
- `engine/core/rule-record.js`: rule record validation.
- `engine/core/decision.js`: deterministic rule selection, conflict detection and trace.
- HTP/trump-fit valuation is intentionally not implemented until the user's precise approved rules are formalized.
