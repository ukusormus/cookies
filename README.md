# Cookies Security Research

[![Build & deploy site](https://github.com/ukusormus/cookies/actions/workflows/build-deploy.yaml/badge.svg)](https://github.com/ukusormus/cookies/actions/workflows/build-deploy.yaml)

🔗 **<https://ukusormus.github.io/cookies/site-origin-cookie-scopes-visualizer/>**

### Intro

Cookies! 🍪 Seemingly simple, but with many intertwined complexities...

The interactive tool linked above can help web pentesters, bug bounty hunters, security researchers and curious developers alike more intuitively understand the scopes of different cookie actions and related attacks, depending on the user's situation (**attacker-target URLs** and **cookie settings**).

Main features:

- Categorizes and dynamically displays available **cookie scopes** - what action (read, overwrite, delete, shadow, evict, attach, ...) can be taken from where, and what edge cases to note
- Visualizes the definitions of **origin** & **site** (both _schemeful_ and _schemeless_)
  - Always uses the latest [Public Suffix List](https://github.com/publicsuffix/list)
- Linkable / **shareable** - input is saved in URL hash, which is loaded on web app load

Can help answer questions like:

- _If this session cookie used the `__Host-` name prefix, what attack vectors would exactly disappear and remain?_
- _Okay, I have found a bug in `http://dev.example.com:8080/xss`, how can it impact `https://bank.site.example/`?_

Based on [RFC6265bis-20](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-20) and (currently) manual testing of Google Chromium and Mozilla Firefox (May, 2025).

### Future developments

To gather feedback, individual think-aloud testing of the tool was conducted with 7 web pentesters from [Clarified Security](https://clarifiedsecurity.com/).

Planned UI/UX improvements and features will appear in the Issues list in due time.

### Repo overview

- [tools/](tools/)
  - [site-origin-cookie-scopes-visualizer/](tools/site-origin-cookie-scopes-visualizer/) - currently the main "juice" of the project
- [mkdocs/](mkdocs/) - WIP: supporting docs, proofs of concept, etc.


### Background

This project was started as part of a bachelor's thesis in Tallinn University of Technology (TalTech), 2025.
Author: Uku Sõrmus. Supervisors: Sten Mäses (PhD), Elar Lang (MSc).

As a side result, multiple security issues relating to cookies were found, including in major browsers. _TBA._
