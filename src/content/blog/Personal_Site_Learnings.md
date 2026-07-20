---
title: "How this site went from zero to live in one night"
date: "2026-07-21"
category: "sidequest"
excerpt: "Node, git, DNS, and a lot of trial and error — the real, unglamorous path from an empty folder to a working personal website."
draft: false
---

This site didn't start from a blank slate of "I don't know how to build
a website." I'd already built one before — a WordPress site hosted on
AWS Lightsail — so I knew that option, and knew it worked. What I wanted
this time was something different: full control over the design instead
of working within a theme, a real hands-on understanding of git, DNS,
and deployment instead of a platform handling all of that invisibly, and
something that would read as more credible to the technical audience I
was actually trying to reach. That narrowed it down fast: a static site,
built with Astro, deployed through GitHub Pages.

What followed was one long night that took me from an empty folder to an
actual live domain — with more detours than I expected for something
that, on paper, sounds simple.

## The part nobody warns you about: your own machine

The very first blocker had nothing to do with the site itself. My
Node.js version was too old for Astro to run, and installing a newer one
meant Homebrew — except my work laptop didn't have admin rights to
install Homebrew at all. The fix was nvm instead, which installs
entirely into your own home folder without needing admin access at all.
That one detour taught me more about how Node tooling actually works
than skipping straight to "it just works" ever would have.

## Git, and the auth wall everyone hits once

Getting the code onto GitHub meant learning `git init`, `add`, `commit`,
`push` — approachable enough. Then the actual push got rejected: GitHub
no longer accepts a plain password over the command line, so I needed a
personal access token instead. Then it got rejected a second time,
because my first token didn't have the right scope to let GitHub Actions
add its own workflow file. Two rounds of "generate a new token, try
again" later, it finally went through.

## DNS was familiar — GitHub Pages' specific wiring wasn't

DNS itself wasn't the hard part — a few years at Akamai means pointing a
domain somewhere is second nature. What actually took troubleshooting was
the GitHub Pages-specific side of it: four `A` records and a `CNAME`
aimed at GitHub's servers, plus a setting inside GitHub's own Pages
configuration that I'd completely missed, which meant the build
succeeded while the deploy silently failed behind it. Once that was
sorted, the site loaded with a broken certificate for a while, since
GitHub hadn't finished issuing one yet for the domain.

None of it was DNS being hard. It was learning one specific platform's
conventions for wiring a domain to it — which is a different kind of
problem than DNS itself, and one no amount of general DNS experience
skips past on the first try.

## What "one night" actually means

By the time the site was actually live at its own domain, showing a real
page instead of an error, it had been a couple of hours — Node, Homebrew, git auth,
DNS, and a certificate delay, stacked one after another. None of it was
hard in isolation. All of it, back to back, is a genuinely different
experience than "add a blog in five minutes," which is usually how these
things get pitched.

I don't think that's a mark against doing it this way. If anything, the
friction is most of what I actually learned from. A hosted platform would
have gotten me writing faster, but I wouldn't understand how the many pieces underneath actually work — and now, when something breaks, I atleast know where to start looking.