# Stenberg 2NT – implementation status

Source: **Nordisk standard, 2012-08-22**, pages 2–3 (user-provided PDF in the Library).
No external web sources are used.

## Scope
- 1♥/1♠ – 2NT: at least 13 htp and at least four-card support; game forcing.
- 1♣/1♦ – 2NT: same requirement, with the source's priority rule: show a four-card major before supporting a minor.
- Opener's first rebid after Stenberg:
  - 3 in the opened suit: 15+ htp, no singleton.
  - 3 in a side suit: singleton in the bid suit, with the exact suit mapping from the PDF.
  - 3NT: 12–14 hp, balanced.
- The source's general definitions of htp and balanced hands are reused from the scoring module.

## Endpoints
- 4♥/4♠: major-game endpoint.
- 5♣/5♦: minor-game endpoint.
- 4NT: handed to the existing slam/RKC module only when the public auction establishes a trump suit and the RKC recognizer confirms the sequence.

The endpoint contract checks use the project's established game thresholds: 26 partnership playing points in a major and 28 in a minor, with at least eight-card fit.

## Explicit source gaps
The PDF does not specify the responder's full continuation after opener's Stenberg rebid, nor the choice between multiple singletons or a void. These cases return exp:null, carry sourceGap:true, and are recorded in the uncovered-sequence log. No conventional meanings are invented.

## Validation
tests/stenberg-2nt.test.js covers major/minor response eligibility, major-priority after minor opening, singleton mapping, balanced 12–14, 15+ without singleton, and explicit uncovered cases.
