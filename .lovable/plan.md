

## Fix: SelectItem empty value crash on Marketplace Integration page

**Problem**: On line 255 of `MarketplaceIntegration.tsx`, there's a `<SelectItem value="">` which Radix UI Select explicitly forbids — it throws: *"A Select.Item must have a value prop that is not an empty string."* This causes a blank screen.

**Fix**: Change the empty-string value to a sentinel like `"none"`, and update the `onValueChange` handler and save logic to treat `"none"` as no template selected.

### Changes in `src/pages/MarketplaceIntegration.tsx`:
1. Replace `<SelectItem value="">` with `<SelectItem value="__none__">` 
2. Wrap `onValueChange` to convert `"__none__"` back to `""`
3. Wrap the `value` prop to convert `""` to `"__none__"` so the select stays in sync

