---
title: "Hardening a fake lending assistant: RAG and tool calls"
date: "2026-08-07"
category: "sidequest"
excerpt: "Cashew Advisor could talk convincingly about loans. It couldn't guarantee its facts or its math were actually right — until I added retrieval and tool calling to fix both, in that order."
draft: false
---

With the [model question settled](/entries/cashew-capital-harness/), two problems remained: Cashew Advisor
could confidently improvise loan terms that didn't match my own site,
and it did amortization math in its head with no guarantee it was
right. This post is about closing both gaps: retrieval-augmented
generation (RAG) for the facts, tool calling for the math. The
moment they worked together in a single response, which is when this
stopped feeling like a demo and started feeling like a small, real
system.

## RAG: making the chatbot tell the truth

Cashew Advisor's system prompt kept it *scoped* to lending topics, but
scope isn't the same as accuracy. Nothing stopped it from stating a
plausible-sounding interest rate that didn't match the numbers on my
own marketing site. That's the actual failure mode RAG exists to fix:
giving the model real facts to retrieve and cite, rather than trusting
its own generated numbers.

I deliberately built the lightest version of RAG that's still a
*correct* implementation, rather than reaching for a managed vector
database I didn't need at this scale. A handful of markdown documents
(rates, terms, an FAQ) get chunked, embedded once via Bedrock's Titan
embedding model, and saved as a flat JSON file. At query time, the
user's question gets embedded the same way, compared against every
stored chunk with plain cosine similarity, and the top few matches get
injected into the prompt as grounding context. No database, no
infrastructure, just an array in memory — genuinely sufficient for a
knowledge base this size, and a good reminder that "the correct
architecture" and "the biggest architecture" aren't the same thing.

The actual hurdle here wasn't the RAG logic itself, it was a build
pipeline bug I wouldn't have predicted. TypeScript's compiler only
compiles `.ts` files into the output folder; it has no idea a plain
`embeddings.json` file sitting next to the source code needs to come
along for the ride. The result was a backend that worked perfectly
until it hit production, where it crash-looped on startup with a file
genuinely missing from the built container — an easy, one-line fix once
diagnosed, but a good example of the class of bug that only shows up
once code leaves your laptop.

I also picked, entirely by accident, the worst possible week to ship
this. A real, hours-long GitHub Actions platform outage landed right
in the middle of deploying the RAG changes, and I spent a genuinely
frustrating stretch ruling out my own account, billing, and
configuration before finding GitHub's own status page confirming it
wasn't me. Worth naming honestly: the instinct to distrust your own
setup first is usually right, but it's also worth knowing when to stop
and check whether the platform itself is having a bad day.

The proof RAG actually worked came down to one clean test: asking for
the exact dollar range on a debt consolidation loan, and getting back
"$2,000 to $75,000" — the precise figures from my own fictional
document, not a plausible-sounding guess. A model improvising doesn't
land on your exact made-up numbers by coincidence.

## Tool calling: making the chatbot's math actually correct

RAG fixes facts. It does nothing for arithmetic. Ask a language model to
compute a loan's amortization schedule in its head, and it's doing
multi-step math via next-token prediction. It's often close, not guaranteed
exact. Tool calling closes that gap by letting Claude request a real
function call instead of estimating: it names the function, I run the
actual deterministic code, and I hand the real result back for it to
incorporate into its answer.

I built one tool: a standard amortization calculator, and had Cursor
implement both the tool schema and the multi-turn request loop that
handles it (detect a tool request, execute the real function, send the
result back, get the final answer). The mechanics of that loop are easy
to get subtly wrong — Anthropic's API requires the original tool
request and its result to be paired correctly across two messages.
Cursor got that part right on the first pass.

What it didn't get right the first time was the math itself: the
standard amortization formula divides by zero when the interest rate is
exactly 0%. JavaScript doesn't throw an error there instead it silently
returns `NaN`, which is worse than a crash, because a `NaN` dressed up
in a friendly sentence looks exactly like a real answer. Catching that
before it shipped was a small, plain reminder that AI-generated code
reads as confident and complete whether or not it's actually handled
every case. The review habit doesn't get to relax just because the
code looks right.

## A single response, annotated

Here's an actual exchange with Cashew Advisor that exercises both
systems at once, with the source of each piece of information marked:

> **User:** If I borrow $10,000 at 6.99% APR for 36 months, what would
> my monthly payment be?

> **Cashew Advisor:**
> Great question! Here's what a $10,000 loan at 6.99% APR for 36 months
> would look like:
>
> - **Monthly Payment:** $308.73 *← tool call*
> - **Total Interest:** $1,114.11 *← tool call*
> - **Total Repayment:** $11,114.11 *← tool call*
>
> This is a demo illustration — remember, no real loan or credit
> decision is involved here.
>
> If you're thinking about a personal loan, rates start at 6.99% APR
> for qualified applicants with strong credit *(typically 720+)* *← RAG*.
> The actual rate depends on your credit score, income, and the amount
> you request.
>
> Would you like to explore different loan amounts or terms, or do you
> have questions about whether a personal loan might be right for you?

Two independent systems produced that one response, and neither is
visible to the user as a separate step. The RAG lookup surfaced the
6.99% rate and the 720+ credit guidance straight from my own fictional
rates document — not generated. Claude separately recognized the
question also needed real math, called a `calculate_loan_payment` tool
with the parsed inputs, got back an exact result from my own backend,
and folded both pieces into one answer. Grounded facts and exact
computation, working together instead of sitting side by side as two
disconnected demos.

## What actually changed my thinking

Going into this, I expected the AI-coding side to be the easy part and
the "make it correct" side to be tedious plumbing. It was closer to the
opposite. Cursor and Claude wrote genuinely solid first drafts of the
RAG service and the tool-calling loop, both on the first or second
pass. What they didn't do, and what I don't think any current AI coding
tool reliably does unprompted, is anticipate the narrow edge case that
only bites in production: the 0% APR divide-by-zero, the data file a
compiler silently drops. Those needed a human actually running the
thing, reading the actual error, and asking "wait, what happens if—"
before shipping.

That's the honest shape of where I am with this now: the AI tooling
collapses the distance between "I have an idea" and "I have working
code" to almost nothing. It does not collapse the distance between
"working" and "correct" — and closing that second gap, one specific
piece at a time, with a test that proves it, is most of what this round
of work actually was.