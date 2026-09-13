# HomePrep Roadmap

HomePrep is under active development. This roadmap is a public direction board rather than a fixed promise or release schedule.

Ideas may move, change shape or be dropped as HomePrep evolves and real-world feedback comes in.

## Current focus after 0.8

- Refine the new **Household Assets**, **Shopping List**, readiness Overview and grouped navigation from real household use.
- Improve the end-to-end replacement workflow from expired Inventory → Shopping List → purchased replacement → refreshed Inventory.
- Continue improving recurring checks for Inventory, Containers and Assets using the shared Task scheduling model.
- Refine Plan templates and resource links so household procedures increasingly reflect real Inventory, Containers and Assets.
- Continue polishing the configurable HomePrep Lovelace summary experience.
- Complete the HACS default-repository review process so HomePrep can be discovered directly in HACS.
- Keep HACS and Hassfest validation green across stable and prerelease channels.

## Shipped in 0.8

- **Household Assets** for fixed or semi-permanent preparedness points such as water shutoffs, valves, drains, leak sensors, pumps, smoke alarms, extinguishers and electrical panels.
- Optional Asset images and instructions to help household members quickly find or identify important controls.
- **Shopping List** with manual entries plus automatic replacement entries for expired Inventory, including deduplication and purchased/ignored states.
- Preparedness Plans with richer checklist items and links to Inventory, Containers and Assets.
- Plan review intervals and review-required state.
- Recurring Asset and Container inspections backed by the same HomePrep Task system used by Inventory inspections.
- Automatic synchronization of last-check and next-check dates from linked recurring Tasks.
- Grouped horizontal navigation organized around Preparedness, Maintenance, Plans & Guidance and Household.
- Readiness Overview with area-level progress bars, overall readiness score, attention queue and next actions.
- Configurable standard HomePrep Lovelace card with show/hide and ordering controls for major HomePrep areas.
- Assets included in HomePrep and HomePrep Mini summary cards.
- Immediate Asset image preview in the editor.
- Desktop hover dropdown polish and touch/click fallback.

## Previously completed foundations

- Proper GitHub release flow with semantic versions and HACS prerelease testing.
- Inventory images in the sidebar and applicable Lovelace/task views.
- Automatic Lovelace card registration and visual card editors.
- Recurring tasks, linked Inventory inspections and Home Assistant notifications.
- Preparedness targets, household planning and country guidance profiles.
- Initial multilingual support with automatic Home Assistant language detection and optional HomePrep language override.
- English, Swedish, Norwegian Bokmål, Danish, Finnish, German and French language foundations.
- Preparedness Containers with inventory assignment, readiness status and recurring checks.
- Preparedness Plans with starter templates for fire safety, flood/water damage and rapid evacuation.
- Direct navigation from HomePrep Lovelace cards to the HomePrep sidebar application.
- Stable platform-neutral IDs and synchronization-oriented metadata foundations for future clients.

## Near term

### Inventory, Containers and Shopping
- Better filtering, sorting and searching.
- Faster bulk editing for common Inventory maintenance.
- Clearer expiry and rotation workflows.
- Improve Container readiness and maintenance workflows, including water rotation and go-bag review cycles.
- Expand Shopping List sources carefully beyond expired Inventory, such as personal Target shortages, Container requirements and selected Plan/Asset needs.
- Add a smoother replacement workflow from a purchased Shopping item back into Inventory.
- Explore optional nested storage/location modelling without making simple setups complicated.

### Household Assets and maintenance
- Refine the Asset taxonomy from real-world household use.
- Add richer maintenance history and completion visibility.
- Explore links between Asset maintenance, Tasks and Shopping List replacement parts without turning Assets into generic Inventory.
- Improve visual identification and instructions for critical controls such as shutoffs and panels.

### Plans and household resilience
- Refine fire-safety, flood/water-damage and evacuation templates from user feedback.
- Add more Plan templates such as power outage, communications and shelter-in-place.
- Expand links between checklist items, Inventory, Containers, Assets and Tasks so Plan readiness can increasingly be verified from real HomePrep data.
- Improve household meeting-point, evacuation-route and dependant/pet planning support.

### Tasks and notifications
- More actionable Task notifications.
- Better links from notifications directly into the relevant HomePrep resource.
- Optional notification milestones for expiring Inventory.
- Improved Task history and completion visibility.
- Connect Container, Asset, Shopping and Plan attention states to notifications where useful.

### Lovelace and UI
- Continue refining the grouped horizontal navigation on desktop and mobile.
- Continue improving visual editors and reusable display options while keeping the number of card types small.
- Add richer readiness visualizations where they are useful without duplicating the sidebar app.
- Further mobile-first improvements.
- Continue localization coverage across newer 0.8 areas, editor subtexts and dynamic content.

### Guidance and preparedness planning
- Add more country-specific preparedness guidance from authoritative public sources.
- Improve explanation of why a recommendation exists and what counts as ready.
- Expand household-specific planning without silently changing personal Targets.
- Explore guidance that can suggest relevant Plans, Assets or Container types without silently creating personal data.

## Medium term ideas

### Food and crisis cooking
- Build a recipe section focused on cooking during disruptions, outages and other crisis situations.
- Include recipes that work with long-life preparedness foods and limited fresh ingredients.
- Support filtering by available Inventory so HomePrep can suggest meals based on what the household already has.
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
- Barcode or QR-assisted Inventory entry.
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
- Reuse the same core HomePrep concepts for Inventory, Containers, Assets, Shopping, Tasks, Plans, Targets, Guidance and household preparedness.
- Support shared household use across multiple people and devices.
- Provide access to crisis-cooking recipes and, when online, optional community features.

### HomePrep cloud service
- Build an optional HomePrep cloud service for synchronization between Home Assistant and standalone HomePrep clients.
- Support secure multi-device and multi-user household synchronization.
- Synchronize platform-neutral HomePrep data while keeping Home Assistant-specific settings local to the Home Assistant installation.
- Preserve local-first operation so a HomePrep cloud account is not required for basic Home Assistant use.
- Support offline-first synchronization and safe conflict/deletion handling as the product matures.
- Provide online services needed for optional community functionality without exposing private household data.

### Platform expansion
- Make Home Assistant one HomePrep client rather than the definition of HomePrep itself.
- Allow future clients to share a common HomePrep household while retaining platform-specific integrations and presentation.
- Explore secure APIs and integrations for other smart-home or preparedness platforms over time.

## Ideas welcome

If you have an idea that would make HomePrep more useful for real household preparedness, open a GitHub issue and describe the use case rather than only the feature.

That helps us understand what problem the feature should solve and how broadly useful it may be.
