# Spot the phish — demo course content

**Audience:** All employees (general workforce, no prior security training assumed)
**Objective:** Recognize the core red flags of a phishing email and know the correct response.
**Language:** English (demo) — toggle to show multilingual on the published version
**Voice:** Default female (nova / priya), calm and direct, slightly wry
**Runtime:** ~3 minutes

---

## Slide 1 — Title slide

**Title:** Spot the phish
**Subtitle:** Three minutes. One email. Every red flag you need to know.
**Background:** Soft-blurred inbox graphic, dark overlay (use a stock/library image, not a real screenshot)

**Narration:**
"Welcome to Spot the phish. By the end of this, you'll catch the email that almost got someone else fired."

---

## Slide 2 — Big statement

**Headline:** 1 in 3 data breaches starts with a single email.
**Subtext:** Not a hacked server. Not a stolen password. One click, on one bad morning.

**Narration:**
"One in three breaches doesn't start with a hack — it starts with someone just like you, clicking without thinking. That's the whole game."

---

## Slide 3 — Image explore

**Background image:** mock phishing email (build as a static graphic or real screenshot mockup)

```
From:    PayPal Security <support@paypa1-secure.com>
Subject: ⚠ Urgent: Your account will be suspended in 24 hours

Dear Customer,

We've detected unusual activity on your account. To avoid
suspension, please verify your identity immediately by
clicking the link below. Failure to do so within 24 hours
will result in permanent account closure.

[ Verify My Account ]

Thank you,
PayPal Security Team

📎 Account_Verification_Form.zip
```

**Hotspots:**

1. **Sender address** (`paypa1-secure.com`)
   - Card: "Look closely at the domain" — "That's a lowercase L replaced with the number 1 — paypa1, not paypal. Real companies don't send mail from lookalike domains."
   - Narration: "Zoom in on the sender's address. See it? That's not an L, it's the number one. A lookalike domain is the single biggest tell in phishing."

2. **Subject line** ("suspended in 24 hours")
   - Card: "Manufactured urgency" — "Phishing relies on panic. Real security teams rarely give you a 24-hour countdown to act."
   - Narration: "Notice the countdown. Urgency is the oldest trick in the book — it's designed to make you click before you think."

3. **Greeting** ("Dear Customer")
   - Card: "No name, no personalization" — "Your real bank or vendor already knows your name. 'Dear Customer' is a mass-mail giveaway."
   - Narration: "'Dear Customer' — not your name. Institutions that already have your account know exactly who you are."

4. **The button** ("Verify My Account")
   - Card: "Where does this actually go?" — "Hover before you click. The visible text says one thing; the underlying URL often points somewhere completely different."
   - Narration: "Before you ever click a button like this, hover over it. The link underneath rarely matches what it claims to be."

5. *(optional 5th hotspot)* **Attachment** (`.zip`)
   - Card: "Unexpected attachment" — "A zip file you didn't request, from a sender you can't verify, is one of the most common malware delivery methods."
   - Narration: "An unexpected zip file is a payload waiting to be opened. When in doubt, don't."

---

## Slide 4 — Comparison side-by-side

**Left — "The real one"**
```
From:    PayPal <service@paypal.com>
Subject: Your January statement is ready

Hi Yasha, your statement is now available in your
account. No action needed.

[ View statement ]
```
Annotations: correct domain · uses your real name · no threat · no urgency · low-key tone

**Right — "The fake one"** *(reuse slide 3's email)*
Annotations: lookalike domain · generic greeting · manufactured urgency · demands immediate action

**Narration:**
"Side by side, the pattern is obvious. The real email uses your name, your actual statement date, and asks for nothing. The fake one wants you to panic and click — now."

---

## Slide 5 — Scenario challenge

**Setup:** "You open your inbox Monday morning and find this:" *(condensed version of the slide-3 email)*
**Question:** What's your first move?

| Option | Feedback |
|---|---|
| A. Click the link to see what it wants | Wrong move. Clicking confirms your email is active and may install malware before you even land on a page. |
| B. Reply asking them to confirm who they are | Risky. Replying tells the attacker your inbox is monitored — it often increases targeting, not decreases it. |
| **C. Forward it to IT/security and use "Report phishing"** | **Correct.** Reporting gets the email blocked org-wide and protects everyone else who got the same message. |
| D. Delete it and move on | Better than clicking, but it misses one thing — if you got it, so did your coworkers. Reporting protects them too. |

**Narration (intro):** "Here's where it gets real. You've got the email in front of you — what do you actually do?"
*(Per-option feedback above is read aloud on selection.)*

---

## Slide 6 — True/false quick-fire + completion

| Statement | Answer | Explanation |
|---|---|---|
| If an email looks like it's from your bank, it's always safe to click the link. | **False** | Looks can be faked. Always verify the sender's actual domain first. |
| Hovering over a link before clicking can reveal where it really leads. | **True** | It's the fastest gut-check you have — use it every time. |
| Phishing emails are always full of spelling mistakes. | **False** | Today's phishing is often well-written. Don't rely on typos to catch it. |

**Narration:** "Three quick statements. True or false — you already know more than you think."

**Completion screen:**
- Pass mark: score 2 of 3 or higher
- Closing line: "You spotted it. Now go spot the next one."

---

## Build notes

- Slides 3 and 5 should be set to "learner clicks each segment" (click mode) — these are the two slides doing the heaviest interactivity demo work.
- Gate slides 5 and 6 (scenario + true/false) so the quiz-logic and scoring features are visible in the completion screen.
- Slide 4 can reuse the slide-3 email asset on the "fake" side to save build time.
- For the published demo, generate a second-language voiceover (e.g. Hindi or French) on at least slide 1 and 2 so the language toggle has something to show.
