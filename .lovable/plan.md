

## Mobile Design Fixes

### Issues Found

1. **Pricing grid breaks on small screens** -- 5 credit packages in a 2-column grid leaves an orphan card. On 375px width, the cards are too narrow for price text.
2. **"Why hosts are switching" comparison is cramped** -- `grid-cols-2` forces long text into ~170px columns on mobile, causing ugly wrapping.
3. **Language switcher missing from mobile nav** -- The hamburger menu sheet doesn't include the `LanguageSwitcher`, so mobile users on the landing page can't change language.

### Plan

**File: `src/pages/Landing.tsx`**

1. **Pricing grid (