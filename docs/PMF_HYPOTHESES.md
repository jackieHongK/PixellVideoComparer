# PMF Hypotheses And Validation Plan

## Goal

Find a repeatable user segment that uses Pixell Video Comparer frequently enough that the product becomes part of its review workflow, not a one-off utility.

## Main PMF Hypothesis

Teams that repeatedly compare original and processed video outputs will adopt a focused browser-based comparison tool if it saves time, reduces review friction, and makes evidence sharing easier than current workflows.

## Segment Hypotheses

### Segment 1: Video AI / enhancement teams

Problem:

- they compare many output variants
- they need visual proof quickly
- current workflows are fragmented

Signal of fit:

- repeated weekly usage
- requests for batch compare, annotations, session save, evidence export

### Segment 2: Streaming / playback QA teams

Problem:

- they need to inspect playback quality and buffering behavior
- they compare source, encoded, and served outputs

Signal of fit:

- requests for HLS-focused tools
- requests for monitoring overlays, timing sync, debug metadata

### Segment 3: Small studios / post-production reviewers

Problem:

- they need quick client-side visual comparison without heavy setup

Signal of fit:

- usage around approvals and review rounds
- requests for easier sharing and notes

## Value Hypotheses

### H1

Users care more about faster review setup than about advanced editing controls.

Validation:

- interview users about current setup time
- observe whether "open and compare" gets strong reaction

### H2

Built-in capture and shareable evidence increase perceived value more than additional player layouts.

Validation:

- test feedback on capture workflow vs extra layout requests

### H3

HLS and web-hosted accessibility matter more for team adoption than local-only single-file convenience.

Validation:

- compare demand from hosted users vs local single-file users

### H4

The strongest PMF wedge is not "comparison viewer" but "visual QA workspace."

Validation:

- test landing copy variants
- monitor which message gets more click-through and responses

## Validation Scenarios

### Scenario 1: Workflow interviews

Target:

- 10 to 15 people across likely segments

Questions:

- how do you compare outputs today
- what slows review down
- what evidence do you need to share
- how often does this happen
- what happens when bad quality slips through

Success criteria:

- at least 5 people describe recurring pain
- at least 3 say current setup is clumsy or slow

### Scenario 2: Concierge usage test

Approach:

- give selected users a dev build and a narrow task
- ask them to complete a real comparison job

Measure:

- time to first useful comparison
- whether they finish the task
- whether they request another use

Success criteria:

- user can load and compare without assistance
- user says this is faster than current flow

### Scenario 3: Landing page message test

Variants:

- speed-led
- QA-confidence-led
- browser/no-install-led

Measure:

- CTA click rate
- inbound feedback
- direct demo requests

Success criteria:

- one message clearly outperforms others

### Scenario 4: Retention test

Measure:

- did a tester come back within 7 days
- did a team use it for a second workflow

Success criteria:

- at least 30 percent of early testers return for another task

## Metrics That Matter

### Early discovery metrics

- landing page visits
- CTA clicks
- GitHub stars or saves
- feedback submissions

### Activation metrics

- successful first media load
- completed first comparison session
- first frame capture export

### Retention metrics

- repeat usage within 7 days
- repeat usage within 30 days
- number of comparisons per active user

### Qualitative metrics

- "faster than current method"
- "easier to share with team"
- "I would use this again next week"

## Kill Criteria

We should reframe or narrow the product if:

- interviews show the pain is rare, not recurring
- users see it as nice-to-have but not workflow-critical
- repeat usage is weak even after usability fixes
- strongest demand comes from a segment too small or too expensive to reach

## Current Best Bets

1. Lead with video AI / enhancement QA.
2. Describe the product as a visual QA workspace.
3. Prioritize evidence-sharing workflows over cosmetic feature expansion.
4. Treat hosted adoption as the main growth path.
