# Six local AI systems labs

These are small, working reference programs, not a hosted AI product. Inspect
them, change a rule, predict the result and explain what the test proves.
Every input is original synthetic teaching data. No model, network, account,
database, package installation or credential is used. Cost: $0 provider spend.

## Setup and evidence

Prerequisites: Node.js 22 or newer and a text editor. Commands below work in
PowerShell from this extracted folder. Check `node --version` first. The Node
runtime is the only dependency; there is no package manifest or SDK to install.

```powershell
node --test labs.test.js
node run.js contract
```

Expected baseline: six tests pass; the contract command prints `"errors": []`.
The code is a known-good reference, not a blank starter. Before reading the
solution, predict the result from `fixtures.json`; then inspect only the lab
file you need. Preserve a copy of this folder before experimenting.

For each lab, write a local `my-observations.md` with: your prediction, actual
output, changed input/rule, the test that detects a mistake, remaining limitation,
and what you can explain without an assistant. Do not copy model-generated text
as evidence of your understanding. No credential or private information belongs
in this file.

## 1. Task contract: valid JSON can still be wrong

Read `contract.js` and the `tickets`/`outputs` fixtures.

```powershell
node run.js contract
```

Expected: no contract errors. Change T2's category in `fixtures.json` from
`unknown` to `urgent`, then rerun. Expected failure report: `Invalid category`.
Delete the second output: expected `Missing ticket: T2`. Restore both edits.

Learner change: add a third synthetic ticket and output, then deliberately
duplicate an ID. Explain why parsing JSON did not validate the application
contract. Add a test for a new forbidden output field.

Verification: `node --test labs.test.js` catches missing/duplicate tickets and
invented categories. Limitation: this validates structure, not whether a real
ticket's category is semantically correct. A separate labeled dataset is needed.

## 2. Mock API client: choose which failures to retry

Read `mock-client.js` and the `client` command in `run.js`. The transport is a
local function returning a pretend HTTP response; no HTTP request is made.

```powershell
node run.js client
```

Expected: `calls: 2` and category `access`; the first fixture is a 429 rate-limit
response. Change the first fixture status to 401. Expected: terminal
`authentication failed; do not retry`, with a nonzero process exit.

Learner change: supply two 503 responses and explain the attempt budget. Add a
test for a successful response with malformed JSON. Restore the reference after
the experiment.

Verification: tests assert exact call counts, a recorded fake delay, terminal
authentication, malformed output and budget exhaustion. Limitation: real SDK
envelopes, retry headers, jitter, transport cancellation and provider access have
not been tested. This is not a production client.

## 3. Retrieval: find the first failing stage

Read `retrieval.js`. This is a transparent lexical word-match baseline, not
embeddings or an LLM. Access filtering happens before ranking.

```powershell
node run.js retrieval
```

Expected: document `policy`, diagnosis `supported`. Remove `policy` from the
documents fixture: the result contains `hours` and diagnosis `retrieval`.
Restore it and change the `diagnose` call's final argument in `run.js` to false:
expected `generation`. The flag is a supplied human judgment, not an automatic
truth detector.

Learner change: add a public loan-policy update. Compare fresh and stale evidence;
decide how a production index would identify its version. Try audience `public`
and confirm the staff-only fixture is absent.

Verification: tests cover missing evidence, evidence ignored by generation,
empty results and pre-ranking access filtering. Limitation: the audience string
is a mock identity, not authentication. Ranking needs evaluation on a larger,
representative set; do not call this implementation secure enterprise search.

## 4. Bounded tool: approval before side effects

Read `bounded-tool.js`. It writes only to an in-memory Map, never the filesystem.

```powershell
node run.js tool
```

Expected: a denied attempt, one saved record, and a replay marked true with still
one record. Change the approval's record ID to T2: the T1 write must fail before
changing state. Try reusing key `demo` with different text: it must conflict.

Learner change: add an action with a separate approval condition and a test proving
denial leaves state unchanged. Explain why an idempotency key prevents duplicate
execution but does not grant authorization.

Verification: tests cover absent/mismatched approval, invalid IDs, missing key,
safe repeat and conflicting repeat. Limitation: a caller-created approval object
is just a fixture. A real application must derive identity/approval from a trusted
boundary and protect durable idempotency records, expiry and concurrent writes.

## 5. Evaluation: prove the gate catches a bad change

Read `evaluation.js` and the two synthetic cases in `fixtures.json`. A slice is
a category of cases inspected separately rather than hidden in an average.

```powershell
node run.js evaluation
node run.js evaluation --regression
$LASTEXITCODE
```

Expected baseline: `passed: true`. Expected planted regression: `passed: false`,
failure `b`, one critical miss and exit code 1. This nonzero exit is intentional.
The tiny fixture gate requires both cases; it is not a recommended universal
production threshold or sufficient dataset.

Learner change: add five original cases across at least two failure categories.
Write expected labels before changing predictions. Reserve new cases unseen by
your tuning process. Explain why passing two examples says little about rare
failures.

Verification: tests prove the planted change and missing answer fail, while the
baseline passes. Limitation: exact-match labels do not measure free-form answer
quality; a model judge would need separate human calibration and uncertainty
analysis.

## 6. Observable assistant: timeout is not a successful answer

Read `observable-assistant.js`. Its pretend provider waits for cancellation.

```powershell
node run.js timeout
```

Expected: `ok: false`, `error: timeout`, events `request_started` and
`request_failed`, with no fabricated answer. Replace the mock provider in `run.js`
with `async () => 'synthetic draft'`: expect success and `request_completed`.
Restore it afterward.

Learner change: add a provider rejection case and assert that raw error text is
absent from events. Explain what you would need to distinguish a timeout from an
authentication problem in a real adapter without logging credentials or prompts.

Verification: tests observe cancellation, explicit failure, successful completion
and redacted failure events. Limitation: AbortSignal is cooperative; this does not
kill arbitrary code or prove an actual provider stopped billing. A real adapter
must honor cancellation and enforce server-side spend/time limits too.

## Cleanup and verification level

These programs create no persistent resource and start no server. When finished,
close the terminal and retain your observations. Delete only your specifically
named extracted practice folder if unwanted; do not delete the academy or parent
workspace. The source fixtures can be restored by extracting a fresh copy.

Verification level: local deterministic execution, Node standard library.
No provider, cloud, production security, screen-reader or learner-outcome
verification is implied. Version: `2026-11-local-labs-1`.
