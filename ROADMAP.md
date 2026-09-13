# HomePrep Roadmap

HomePrep is under active development. This roadmap is a public direction board rather than a fixed promise or release schedule.

Ideas may move, change shape, or be dropped as HomePrep evolves and real-world feedback comes in.

## Current focus

- Test the new Containers and Preparedness Plans foundations introduced in the 0.7 beta line.
- Refine go-bag, preparedness-crate, water-storage and evacuation workflows from real-world feedback.
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
- Preparedness Containers that can represent go bags, preparedness crates, water containers, first-aid kits, vehicle kits and storage locations.
- Inventory-to-container assignment and readiness status based on container checks plus the inventory inside.
- Preparedness Plans with reusable checklists and starter templates for fire safety, flood/water damage and rapid evacuation.
- Direct navigation from HomePrep Lovelace cards to the HomePrep sidebar application.

## Near term

### Inventory and containers
- Better filtering, sorting and searching.
- Faster bulk editing for common inventory maintenance.
- Clearer expiry and rotation workflows.
- Improve container readiness and maintenance workflows, including water rotation and go-bag review cycles.
- Explore optional nested storage/location modelling without making simple setups complicated.

### Plans and household resilience
- Refine fire-safety, flood/water-damage and evacuation checklist templates from user feedback.
- Add more plan templates such as power outage, communications and shelter-in-place.
- Explore links between checklist items and inventory/tasks so plan readiness can increasingly be verified automatically.
- Improve household meeting-point, evacuation-route and dependant/pet planning support.

### Tasks and notifications
- More actionable task notifications.
- Better links from notifications directly into the relevant HomePrep item/task.
- Optional notification milestones for expiring inventory.
- Improved task history and completion visibility.
- Connect container/plan attention states to notifications where useful.

### Lovelace and UI
- Continue refining visual editors and reusable display options while keeping the number of card types small.
- Further mobile-first improvements.
- Continue localization coverage across all card/editor subtexts and dynamic content.
- Improve summary cards and dashboard views without duplicating the detailed HomePrep sidebar experience.

### Guidance and preparedness planning
- Add more country-specific preparedness guidance from authoritative public sources.
- Improve explanation of why a recommendation exists and what counts as ready.
- Expand household-specific planning without silently changing personal targets.
- Continue localized presentation of curated guidance content.
- Explore guidance that can suggest relevant preparedness plans or container types without silently creating personal data.

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
- Reuse the same core HomePrep concepts for inventory, containers, tasks, plans, targets, guidance and household preparedness.
- Support shared household use across multiple people and devices.
- Provide access to crisis-cooking recipes and, when online, optional community features.

### HomePrep cloud service
- Build an optional HomePrep cloud service for synchronization between Home Assistant and standalone HomePrep clients.
- Support secure multi-device and multi-user household synchronization.
- Synchronize inventory, containers, tasks, plans, targets, household settings and other platform-neutral HomePrep data.
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
