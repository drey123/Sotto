# Sotto Product Requirements Document

## 1. Product objective

Create a browser-native anonymous confession experience that makes discovering and reading human secrets unusually compelling through a spatial presentation layer and highly polished interaction design.

The first goal is not maximum feature count. The first goal is proving that the core discovery → curiosity → reading → reaction loop is compelling enough to repeat.

## 2. Core entities

### Confession

A user-created anonymous piece of content. Initial form:

- text
- optional image
- optional short video/audio only if the privacy and storage model supports it cleanly
- randomized public identifier
- aggregate reaction data
- creation/status information that does not expose author identity

### Discovery object

The visual/spatial representation through which a confession is encountered. Its exact geometry and interaction model remain open for design research.

### Reading state

A focused 2D reading interface for the selected confession. This is expected to be monochrome, highly polished, tactile and spatially consistent with the surrounding environment.

### Reaction

At minimum, positive and negative reactions are being considered. The exact reaction model remains an experiment.

### Unlock/access

An optional mechanism for paid access to content or an additional layer. Exact value proposition and payment flow are not yet fixed.

## 3. Entry experience

The initial concept is deliberately minimal: a dark/black environment with a single contribution action and almost no conventional application chrome.

Working principle:

> contribute → gain access to discovery

This should be tested against alternatives rather than treated as proven psychology.

## 4. Discovery experience

The user should not be presented with a conventional feed as the primary experience.

The current direction is a 3D spatial environment containing distinct rectangular/content objects. The user should be able to navigate, inspect and select objects using a natural desktop/mobile interaction model.

The exact navigation model must be determined through prototypes. Candidate mechanisms should be tested rather than assumed.

## 5. Selection and reading

Selecting an object should produce a continuous transition into a focused reading state rather than an abrupt modal/page change.

Requirements:

- preserve spatial continuity where possible
- maintain object identity during transition
- make the content immediately legible
- support progressive reveal/blur where applicable
- allow smooth expansion/collapse
- preserve a clear return path to discovery
- maintain high performance on ordinary devices

## 6. Content reveal

A confession may expose enough content to establish context while withholding some content through blur, cropping or another visual treatment.

The system must not assume that unfinished content always increases purchases. This is a testable product hypothesis.

## 7. Reactions and ranking

Users should be able to react to content. Aggregate reactions may contribute to discovery/ranking.

Ranking should initially remain simple and measurable. We should avoid building a complex recommendation system before we have behavioural data.

## 8. Analytics

Analytics should focus on aggregate product behaviour rather than identifying individual users.

Potential events:

- object encountered
- object selected
- reading state opened
- reading progress bucket
- content completed
- positive/negative reaction
- next discovery action
- return session
- paid-access interaction

The final event schema must be designed alongside the privacy architecture.

## 9. Media

Images and potentially short video/audio should be considered first-class confession attachments, subject to:

- upload limits
- client-side processing where practical
- metadata stripping
- encrypted storage if required by the privacy architecture
- safe browser rendering
- performance constraints

## 10. Payments

Payment is a product experiment, not a fixed implementation requirement yet.

The system must support a future payment/access layer without coupling the core confession model to one payment provider.

## 11. Non-functional requirements

### Performance

- Fast initial load.
- 3D rendering should degrade gracefully.
- Avoid unnecessary per-object DOM/JS overhead.
- Prefer instancing/procedural approaches where they materially reduce cost.
- Measure frame rate, memory and interaction latency.

### Privacy

- Minimize identity collection.
- Minimize retained network/device metadata.
- Strip unnecessary media metadata.
- Keep payment identity separate from confession identity where technically possible.
- Document exactly what every infrastructure provider can observe.

### Accessibility

The spatial interface must have a usable fallback interaction model. Important content and actions cannot depend solely on 3D perception or pointer hover.

## 12. MVP boundary

The first prototype should prove only:

1. enter
2. create a sample confession
3. navigate the spatial environment
4. select an object
5. transition to the reading UI
6. reveal/read content
7. react
8. return to discovery

No production payment system, large-scale recommendation system, sophisticated account system or extensive media infrastructure is required to validate this loop.
