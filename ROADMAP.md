# HomePrep Roadmap

HomePrep is under active development. This roadmap is a public direction board rather than a fixed promise or release schedule.

Ideas may move, change shape, or be dropped as HomePrep evolves and real-world feedback comes in.

## Current focus

- Finish the 0.6.1 multilingual UI pass and stabilize the current Home Assistant experience.
- Complete the HACS default-repository review process so HomePrep can be discovered directly in HACS.
- Keep HACS and Hassfest validation green across stable and prerelease channels.
- Polish the HomePrep sidebar app and Lovelace cards based on real usage feedback.

## Recently completed

- Proper GitHub release flow with semantic versions and HACS prerelease testing.
- Inventory images in the sidebar and applicable Lovelace/task views.
- Automatic Lovelace card registration and visual card editors.
- Recurring tasks, linked inventory inspections and Home Assistant notifications.
- Preparedness targets, household planning and country guidance profiles.
- Initial multilingual support with automatic Home Assistant language detection and optional HomePrep language override.
- English, Swedish, Norwegian Bokmål, Danish, Finnish, German and French language foundations.
- HomePrep and HomePrep Mini cards upgraded to summarize both Inventory and Tasks.

## Near term

### Inventory
- Better filtering, sorting and searching.
- Storage-location support, for example pantry, basement, garage or evacuation bag.
- Faster bulk editing for common inventory maintenance.
- Clearer expiry and rotation workflows.

### Tasks and notifications
- More actionable task notifications.
- Better links from notifications directly into the relevant HomePrep item/task.
- Optional notification milestones for expiring inventory.
- Improved task history and completion visibility.

### Lovelace and UI
- Continue refining visual editors and reusable display options while keeping the number of card types small.
- Further mobile-first improvements.
- Continue localization coverage across all card/editor subtexts and dynamic content.
- Improve summary cards and dashboard views without duplicating the detailed Inventory and Tasks cards.

### Guidance and preparedness planning
- Add more country-specific preparedness guidance from authoritative public sources.
- Improve explanation of why a recommendation exists and what counts as ready.
- Expand household-specific planning without silently changing personal targets.
- Continue localized presentation of curated guidance content.

## Medium term ideas

### Food and crisis cooking
- Build a recipe section focused on cooking during disruptions, outages and other crisis situations.
- Include recipes that work with long-life preparedness foods and limited fresh ingredients.
- Support filtering by available inventory so HomePrep can suggest meals based on what the household already has.
- Include low-energy and no-grid cooking options for situations with limited electricity or fuel.
- Support dietary preferences, serving sizes and simple substitution suggestions.

### Community and preparedness discussion
- Add an optional community discussion area to the standalone app for preparedness topics.
- Support topic-based discussions such as food storage, water, power outages, evacuation, communications and household planning.
- Allow useful guides, experiences and practical tips to be shared between HomePrep users.
- Design community features with clear moderation, reporting and safety controls from the beginning.
- Keep community participation optional and separate from private household preparedness data.

### Other ideas
- Import/export and backup-friendly HomePrep data formats.
- Barcode or QR-assisted inventory entry.
- Item templates for common preparedness supplies and equipment.
- Inventory history and change log.
- Better support for replacement cycles, maintenance intervals and consumable rotation.
- More flexible dashboards and preparedness summaries.
- Additional accessibility work.

## Longer-term product direction

These are larger product tracks HomePrep should stay technically ready for. They are intended directions, but no release dates are promised.

### Standalone HomePrep app
- Build a standalone HomePrep application that can be used without Home Assistant.
- Keep the app local-first, with useful offline capability.
- Reuse the same core HomePrep concepts for inventory, tasks, targets, guidance and household preparedness.
- Support shared household use across multiple people and devices.
- Provide access to crisis-cooking recipes and, when online, optional community features.

### HomePrep cloud service
- Build an optional HomePrep cloud service for synchronization between Home Assistant and standalone HomePrep clients.
- Support secure multi-device and multi-user household synchronization.
- Synchronize inventory, tasks, targets, household settings and other platform-neutral HomePrep data.
- Keep Home Assistant-specific settings, such as local notification targets, local to the Home Assistant installation.
- Preserve local-first operation so a HomePrep cloud account is not required for basic Home Assistant use.
- Support offline-first synchronization and safe conflict/deletion handling as the product matures.
- Provide the online services needed for optional community functionality without exposing private household data.

### Platform expansion
- Make Home Assistant one HomePrep client rather than the definition of HomePrep itself.
- Allow future clients to share a common HomePrep household while retaining platform-specific integrations and presentation.
- Explore secure APIs and integrations for other smart-home or preparedness platforms over time.

## Ideas welcome

If you have an idea that would make HomePrep more useful for real household preparedness, open a GitHub issue and describe the use case rather than only the feature.

That helps us understand what problem the feature should solve and how broadly useful it may be.
