---
title: "Building a fake fintech company to learn AI-assisted infrastructure work"
date: "2026-07-29"
category: "sidequest"
excerpt: "I'm a sales engineer, not a developer. Over a few sessions with Cursor and Claude, I stood up a fictional AI lending platform on real AWS infrastructure — and learned more from what broke than from what worked."
draft: false
---

I'm a Senior Strategic Sales Engineer in observability, not a developer.
I want to be upfront about that, because it's the whole premise of this
one: I wanted to get genuinely hands-on with AI-assisted coding tools —
Cursor and Claude, specifically — and I picked a project deliberately
overscoped for my actual skill level, on purpose, to force real learning
instead of a tutorial-shaped one.

The project: **Cashew Capital**, https://cashew.shreyasramakrishna.dev/
a fictional AI-powered lending
platform. It has a marketing site, a chatbot called "Cashew Advisor"
that handles loan pre-qualification and credit questions, and it's
fully live — running on Kubernetes on EC2, the chatbot backed by Claude
on Amazon Bedrock, deployed through a real CI/CD pipeline. None of it
came from a tutorial. All of it came from describing what I wanted and
iterating with an AI pair.

Here's where I started, where I ended up, and — more usefully — the
handful of things that broke along the way that taught me more than
anything that worked cleanly the first time.

## The starting point: vibe-coding a fake company

The idea was simple: describe a fictional fintech company to Cursor, and
let it build the actual application — a Next.js frontend, an Express
backend, a chatbot interface. I didn't write a line of that code myself.
I described the product, the pages, the API shape, and reviewed what
came back.

This part genuinely worked the way the AI-coding hype suggests it
should. Within an afternoon I had a working local app, mock chatbot
responses included, running via Docker Compose. The gap between "I have
an idea" and "I have a clickable thing" collapsed to almost nothing.

But a working local app isn't a live product, and that's where the real
learning started — because everything after this point required me to
actually understand what the AI had built, not just accept it.

## Standing up infrastructure I'd never touched before

I made a deliberate choice early on: build the AWS infrastructure by
hand first, and codify it as Terraform later, rather than starting with
Terraform. I wanted to understand every resource I was creating — the
EC2 instance, the security group, the Kubernetes cluster — rather than
trust a generated `.tf` file I couldn't fully reason about yet.

That paid off almost immediately. My first EC2 instance — a t3.micro,
chosen to stay near $0 in AWS costs — couldn't run k3s without grinding
to a halt. `kubectl get nodes` just hung. Watching `top` while it
happened taught me something no sizing guide had made click before: a
lightweight Kubernetes control plane still needs real headroom, before
a single application pod even runs. Bumping to a t3.small fixed it
instantly. I now have first-hand intuition for a decision I'd only ever
seen as a recommendation on a pricing page.

Building it by hand first meant that when I finally looked at the
infrastructure-as-code version, I was reading something I already
understood — not trusting something I didn't.

## Two bugs that taught me more than the rest of the build combined

Most of the debugging was ordinary — typos, wrong ports, missing
environment variables. Two problems were genuinely instructive, because
they stayed invisible until I went looking with the right tool.

**The chatbot connected to nothing, silently.** After wiring it to
Claude on Bedrock, every message returned a graceful fallback — no
crash, no visible error. The app was doing exactly what it was told:
catch the error, log it, show something polite. The real problem only
showed up in the pod's logs: some newer Bedrock models can't be invoked
by their base model ID at all — they need a separate *inference
profile* ID instead, a routing concept I hadn't run into before. The
fix was one line, once I found it. Finding it meant going past the
polished user-facing error and reading raw logs directly.

**An AWS authentication failure that only CloudTrail could explain.**
Later, wiring up OIDC so GitHub Actions could authenticate to AWS
without long-lived credentials, I hit a wall: AWS refused to let GitHub
assume the role, with nothing more specific than "not authorized." I
checked the trust policy character by character against the docs.
Everything matched. The actual answer only showed up in CloudTrail,
which revealed the *exact* identity token GitHub had sent — GitHub now
appends numeric IDs after the org and repo name in that token, a
security change most tutorials still circulating haven't caught up
with. No amount of re-reading my own config would have surfaced that;
only looking at the actual request AWS received did.

The throughline in both: the AI tools I was using are excellent at
writing plausible code and reasonable configuration. Neither replaces
reading the actual logs, the actual request, the actual error — the
unglamorous debugging instinct that doesn't go away just because an AI
wrote the code you're debugging.

## What this changed about how I think about AI-assisted infrastructure

I went in expecting the AI tooling to be the interesting part and the
AWS/Kubernetes plumbing to be the tedious part I'd muscle through. It
was closer to the opposite. Cursor and Claude made the *application*
layer nearly frictionless — describing intent and getting working code
back is genuinely as good as advertised. But every piece of real
infrastructure — sizing a node correctly, reading a trust policy
against an actual identity token — required me to build real
understanding, not prompt my way past it. The AI was a very fast typist
and a decent first-pass debugger. It wasn't a substitute for knowing
what question to ask next.

## Where this goes next

The app is live, the chatbot is real, and the pipeline actually gates
deployments on passing tests rather than just running on a schedule.
But this was always meant to be a running start, not a finished
project. Next up: wiring in an OpenTelemetry Collector now that there's
real traffic to observe, and experimenting with swapping which model
powers the chatbot rather than treating that as a one-time decision.

I don't have a grand thesis about AI-assisted development yet. What I
have is a live, slightly ridiculous fake lending company, a much better
intuition for where these tools genuinely accelerate work versus where
they just move the bottleneck somewhere less visible, and a clear sense
of what's next. That feels like an honest place to be, three build
sessions in.