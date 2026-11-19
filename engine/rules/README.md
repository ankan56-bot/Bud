# System rule modules

A system module represents one coherent bidding situation, not a PDF page and not an arbitrary suit. Examples: opening one of a major, responses to a minor opening, major-suit trump support, NT continuations, Stayman, transfers, competitive auctions, doubles.

## Module shape (planned executable modules)
- stable module id
- concise title and scope
- rules as provenance-bearing records
- exported evaluator/entry point with a documented context
- module-owned tests

## Rule data
Use `engine/core/rule-record.js` to validate each rule record. Verified rules must cite the source document, page, and box/heading. Interpreted rules remain visibly lower-confidence. Unresolved records must not contain an executable bid.

## Routing
The future router will dispatch by auction context to a small set of relevant modules. Modules do not import each other directly; conventions or continuation paths are invoked through the router. Shared core may never depend on system modules.

## Candidate resolution
`engine/core/decision.js` ranks verified above interpreted candidates, then uses explicit priority. Equal-ranked candidates that both match produce a conflict. File order is not a tiebreaker. No match is reported as `uncovered`.

## Template for new modules
1. Define the exact scope and out-of-scope auctions.
2. Extract rules from the PDF with source citations.
3. Record all suit/sequence variants explicitly and validate them.
4. Implement conditions as structured data/functions with traceable names.
5. Add positive, negative, boundary, overlap, forcing, and legality tests.
6. Run module and shared-core tests.
7. Keep module exports small and documented.
