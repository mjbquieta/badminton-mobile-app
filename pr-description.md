## Add Feedback Page & Mobile UI Improvements

### Summary
- Add a Formspree-powered feedback page (`/feedback`) to the web app for users to submit bug reports, suggestions, and other concerns
- Add a feedback screen to the mobile app (accessible from Settings)
- Update mobile login/register button colors to match the web design
- Clean up the landing page navbar on mobile viewports

### Web Changes
- **New `/feedback` page** — Form with name (optional), email, type (Bug Report / Suggestion / Other), and message fields. POSTs to Formspree. Auto-populates and locks email when authenticated. Dynamic back link (dashboard vs landing) based on auth state.
- **Landing page navbar** — Added Feedback link for desktop; hidden entire nav links on mobile since the hero section already has Sign In and Get Started buttons.
- **Dashboard sidebar** — Added Feedback nav item with icon to both desktop sidebar and mobile bottom tab bar.

### Mobile Changes
- **Feedback screen** — New `FeedbackContent` component in Settings sub-menu. Same Formspree integration, auto-populated readonly email for authenticated users, segmented type selector, success state with "Send Another" option.
- **Login & Register buttons** — Changed from `bg-court-lime` (green) to `bg-accent` (yellow/gold) to match the web button style.
- **Settings menu** — Added Feedback item with valid `form` icon between Courts and About.

### Files Changed
| File | Change |
|------|--------|
| `apps/web/app/feedback/page.tsx` | New feedback form page |
| `apps/web/app/page.tsx` | Feedback link in navbar, hide nav on mobile |
| `apps/web/components/Sidebar.tsx` | Feedback nav item in sidebar |
| `apps/mobile/app/screens/feedback.tsx` | New mobile feedback form component |
| `apps/mobile/app/(tabs)/settings.tsx` | Feedback menu item + sub-view |
| `apps/mobile/app/(auth)/login.tsx` | Button color update |
| `apps/mobile/app/(auth)/register.tsx` | Button color update |

### Test Plan
- [ ] Navigate to `/feedback` on web — form renders, submits to Formspree, shows success
- [ ] Visit `/feedback` while authenticated — email auto-populated and readonly, back link goes to dashboard
- [ ] Visit `/feedback` while not authenticated — email editable, back link goes to landing
- [ ] Landing page mobile view — nav links hidden, hero buttons still accessible
- [ ] Dashboard sidebar — Feedback link visible on desktop and mobile bottom bar
- [ ] Mobile app Settings > Feedback — form renders, submits, shows toast and success state
- [ ] Mobile login/register — buttons are yellow/gold (`bg-accent`)
