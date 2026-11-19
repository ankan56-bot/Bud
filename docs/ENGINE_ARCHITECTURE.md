# Modular bidding engine — architecture

## Goal
Make development faster and safer by isolating bidding rules into small modules with explicit contracts and tests. This is a parallel foundation; the current trainer remains untouched until migration is deliberate.

## Source of truth
- The authoritative source is the current searchable PDF: `Helan_lathunden_AI_sokbar_under_10MB 2.pdf`.
- Existing user-approved Nordisk Standard rules and clarifications remain binding.
- Never infer a rule by mechanically swapping suits. Validate every color variant for auction order, level, forcing status, strength, length, reverses, jumps, and exceptions.
- Unclear cases are marked `unresolved`; they are not silently converted into rules.

## Proposed layers
1. **Core**: auction legality, seat/partnership helpers, hand parsing, point calculation.
2. **Rule modules**: opening, responses, rebids, trump support, NT, Stayman, transfers, competitive bidding, doubles.
3. **Source rule records**: individual rules carry source page/box, status, and tests.
4. **Analysis**: missed game/slam, wrong contract, unexplained/uncovered sequences. Analysis may not override a verified system rule.
5. **Integration adapter**: gradually connects new modules to the UI and existing trainer.

## Rule record contract
Each rule should be small and explicit:
- id
- source (PDF page/section)
- status: verified | interpreted | unresolved
- auction pattern
- hand conditions
- expected bid(s)
- meaning / what it does not promise
- forcing status
- priority and exclusions where needed
- tests

## Development workflow
1. Extract and formalize a source section.
2. Validate legal and color-equivalent auction variants.
3. Implement that section in a dedicated module.
4. Add boundary, overlap, negative, and regression tests.
5. Run module tests, then broader regression.
6. Only then integrate.

## First foundation module
`engine/core/auction.js` is deliberately independent of bridge-system meanings. It validates turn order, contract-bid order, doubles/redoubles, and auction termination. It must not decide what a bid means.
