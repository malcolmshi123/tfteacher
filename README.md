# TFTeacher

Round-by-round reviews of finished Teamfight Tactics games. A review shows the few decisions that cost you placements, and every claim points at the round it came from.

Status: web app with a sample game. The desktop recorder is planned, not built.

## Why

Match history only shows your final board. Most games are decided earlier: a loss streak held too long, a 2-star you scrolled past, gold you never spent. TFTeacher reviews the whole game, and the review rules work for any set.

## How it works

1. **Recording.** The planned Windows app saves one snapshot per round from the game's official event feed: gold, HP, level, every shop, board, bench, items, and the lobby's HP and boards. It uploads the recording only after the match ends and shows nothing during play. If the event feed is unavailable, a screen recording read by a vision model after the game is the fallback. Games that weren't recorded get a final-board review from the Riot match API, marked as lower confidence.
2. **Findings** (`lib/review/engine.ts`). Deterministic rules over the round timeline:
   - gold left when eliminated
   - loss streaks: what they paid and what they cost
   - fights lost at low HP with gold in the bank
   - 2-star upgrades seen in a shop and passed on
   - item components left on the bench
   - level and board strength against the lobby

   Each finding stores the rounds and numbers it used.
3. **Ask** (`lib/ask/`). Follow-up questions are answered from facts built from the recording:
   - Retrieval picks the most relevant facts.
   - The whole game is sent as a stable, cacheable prompt prefix, with the question last.
   - A claim check matches every number in the answer against the facts for the round each sentence names. Sentences that don't match are removed.

   With no API key set, answers come from the findings directly.
4. **Patch Radar** (`lib/patch/radar.ts`). Matches each patch-note line against the comps you actually play and labels each comp stronger, weaker or mixed, listing the lines behind the verdict.

Augment data is never stored or shown, per Riot's third-party rules.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000/review/sample.

To answer questions with a model, set `ANTHROPIC_API_KEY`. The default model is `claude-opus-5-5`; override it with `TFTEACHER_MODEL`.

```bash
npm test
```

The tests cover the sample game's economy, that every cited round exists and matches the recording, that boards never exceed the player's level, and the claim check.

## Notes

- The sample set (units, traits, items) is fictional. Real data would come from the live set's static data in the same shape.
- Units are drawn in code. No Riot art is included.
- TFTeacher isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
