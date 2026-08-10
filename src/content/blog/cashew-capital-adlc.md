---
title: "Mapping a fake lending app to the Agentic Development Lifecycle"
date: "2026-08-08"
category: "sidequest"
excerpt: "Somewhere around the third or fourth session building Cashew Capital, I learned there's already a name for the process I'd been stumbling through: the ADLC. Here's how the work maps to it — and the gaps I'm leaving open on purpose."
draft: false
---

A few sessions into building [Cashew Capital](/entries/build-cashew-capital/),
I came across a term I hadn't heard before: the ADLC, or Agentic
Development Lifecycle. It's the AI-native answer to the Software
Development Lifecycle most engineers already know — plan, build, test,
deploy, monitor, improve but now, adapted for systems whose outputs are
non-deterministic, that reason across multiple steps, and that can
drift over time in ways a traditional deployed binary simply can't.

I hadn't built Cashew Capital *against* this framework. I'd built it by
following my own curiosity, one gap at a time, across several sessions —
[picking a model with evidence](/entries/cashew-capital-harness/),
then [adding RAG and tool calling](/entries/cachew-capital-rag-toolcall/).
What I found when I went back and mapped the work onto ADLC afterward
was genuinely useful: it showed me clearly which parts of the lifecycle
I'd actually covered, and — more usefully — which parts I'd skipped
entirely, on purpose or not. This post is that mapping, done honestly,
including the parts I'm choosing not to fix.

One caveat worth stating up front: Cashew Capital is a demo, not a
commercial product. Some of the gaps below are things a real production
lending assistant would need and I'm deliberately not building. I think
naming them anyway is worth doing — the point of this exercise was
understanding the lifecycle, not pretending a fictional lending
assistant needs enterprise-grade governance.

## The six phases, briefly

Most current descriptions of ADLC converge on a similar shape, even
across different vendors' framing of it: **Plan & Design**, **Build**,
**Test & Validate**, **Deploy & Release**, **Monitor & Operate**, and
**Continuous Improvement**, with the last two forming an ongoing outer
loop rather than a finish line. The core difference from traditional
SDLC is that testing and monitoring aren't optional-if-you-have-time
add-ons; they're load-bearing, because the system you're shipping can
give a different answer to the same question twice.

## Where the work actually lands

**Plan & Design.** This was the least formal part of the whole
exercise, and I'll be honest about that. Cashew Advisor's scope: loan
pre-qualification, repayment planning, credit education and nothing else 
was defined directly inside the system prompt, not in a separate design
document. For a solo demo, that was fine. For a real team, that's a
gap: the "spec" for what the agent should and shouldn't do lived in one
file, understood by exactly one person.

**Build.** This is where most of the actual engineering happened, and
it maps cleanly onto three distinct additions, each solving a different
problem: a harness for evidence-based model selection, RAG for factual
grounding against my own knowledge base, and tool calling for
guaranteed-correct math. Version control and CI/CD were in place from
the start, which meant every change to any of these three pieces went
through the same build-and-test gate as ordinary code.

**Test & Validate.** Partially covered, and covered by hand. I
red-teamed the system prompt manually — direct override attempts,
persona jailbreaks, casually-phrased extraction attempts — and later
folded those same attacks into the harness so every model comparison
gets tested against them too. What's missing is the difference between
*testing once* and *testing as a gate*: my harness is a script I run
when I remember to, not a check that blocks a bad prompt change from
shipping.

**Deploy & Release.** This is the most mature part of the whole
project, if I'm honest, mostly because it's the part closest to
ordinary software engineering. A real pipeline, Kubernetes health
checks that actually block a broken pod from taking traffic, OIDC
authentication instead of long-lived credentials. None of this is
AI-specific, it would look the same for any containerized app but
it's the foundation everything else sits on, and skipping it would have
undermined the AI-specific work built on top of it.

**Monitor & Operate.** Split cleanly into a "done" half and a "not
done" half, and this is the gap I'd flag as the most important one. I
built genuine infrastructure observability — metrics, logs, and
consistent `env`/`service`/`version` tagging, all flowing through an
OpenTelemetry Collector. That tells me if the *pod* is
healthy. It tells me nothing about whether the *agent* is healthy: is
retrieval quality holding up, is response latency or token cost
drifting, is the model ever slipping outside its intended scope in
front of a real user. Infrastructure observability and AI observability
are genuinely different disciplines, and I only built the first one. This
is where LLM Observability should come in.

**Continuous Improvement.** Not built at all, and worth naming plainly.
Nothing currently takes real usage and feeds it back into improving the
knowledge base or catching drift. Every improvement so far has come
from me manually testing something and noticing a gap. There's no loop
that surfaces "here's what's actually going wrong" on its own which for 
an Enterprise-grade commercial application is quintessential. 

## The gaps, and which ones I'm actually going to close

Being honest about a gap isn't the same as committing to fix it. Here's
how I'm actually thinking about each one:

**Worth closing, even for a demo:** wiring the harness into CI as an
automated gate. This is cheap, directly reuses work I've already done,
and teaches me something genuinely transferable — most real teams
running agents in production do exactly this, and I'd rather learn the
pattern here than for the first time on something that matters.

**Worth closing, partially:** Basic AI-specific observability. Logging
response latency and estimated token cost per request, even without a
full LLM-observability platform. I already have the pieces (the
harness's cost math, the OTel pipeline) sitting right next to each
other; connecting them is a natural next step rather than new work.

**Not worth closing, for this project:** a formal governance and
ownership layer, staged/canary rollouts specifically for prompt
changes, and a real continuous-improvement loop that learns from
production traffic. These are genuinely important for a commercial
agent handling real customer data and real financial decisions.
Building them here, for a fictional lending assistant, would be
performing rigor rather than needing it.

## What mapping this actually gave me

The useful part of this exercise wasn't the mapping itself - it was
seeing, clearly, that "I built an AI agent" and "I understand the
lifecycle an AI agent should go through" are different claims, and I'd
only fully earned the first one. Going through ADLC deliberately showed
me exactly where the second claim still has real, nameable gaps — not
vague ones, specific ones, with a specific reason for each one I'm
choosing to leave open.