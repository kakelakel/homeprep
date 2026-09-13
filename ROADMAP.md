# HomePrep Roadmap

HomePrep is under active development. This roadmap covers the **Home Assistant integration** in this repository. HomePrep Server and HomePrep Android have their own roadmaps and release lifecycles.

Ideas may move, change shape or be dropped as HomePrep evolves and real-world feedback comes in.

## Permanent project principle

**Your preparedness. Your infrastructure. Your data.**

Core private household preparedness data will not require centralized HomePrep-operated storage.

Home Assistant-only operation will remain a first-class mode. Future optional managed services may exist elsewhere in the HomePrep ecosystem, but they must remain optional and must not remove the user's ability to run core HomePrep functionality using infrastructure they control.

> **Convenience may be centralized. Ownership must not be.**

This principle is an architectural constraint across the HomePrep project family. See [DATA-OWNERSHIP.md](DATA-OWNERSHIP.md).

## Project family

- [`kakelakel/homeprep`](https://github.com/kakelakel/homeprep) — Home Assistant integration
- [`kakelakel/homeprep-server`](https://github.com/kakelakel/homeprep-server) — optional self-hosted server, API and web client
- [`kakelakel/homeprep-android`](https://github.com/kakelakel/homeprep-android) — planned Android client

## Current focus after 0.8

- Use HomePrep 0.8 in real household workflows and refine what actually matters day to day.
- Refine **Household Assets**, **Shopping List**, readiness Overview and grouped navigation from real use.
- Improve the end-to-end replacement workflow from expired Inventory → Shopping List → purchased replacement → refreshed Inventory.
- Continue improving recurring checks for Inventory, Containers and Assets using the shared Task scheduling model.
- Refine Plan templates and resource links so household procedures increasingly reflect real Inventory, Containers and Assets.
- Continue polishing the configurable HomePrep Lovelace summary experience.
- Keep local Home Assistant-only operation strong while preparing an optional future HomePrep Server mode.
- Preserve local storage and avoid introducing dependencies on HomePrep-operated infrastructure into the Home Assistant-only path.
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
- Recurring Tasks, linked Inventory inspections and Home Assistant notifications.
- Preparedness Targets, household planning and country guidance profiles.
- Initial multilingual support with automatic Home Assistant language detection and optional HomePrep language override.
- English, Swedish, Norwegian Bokmål, Danish, Finnish, German and French language foundations.
- Preparedness Containers with Inventory assignment, readiness status and recurring checks.
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
- Continue refining grouped horizontal navigation on desktop and mobile.
- Continue improving visual editors and reusable display options while keeping the number of card types small.
- Add richer readiness visualizations where useful without duplicating the sidebar app.
- Further mobile-first improvements.
- Continue localization coverage across newer 0.8 areas, editor subtexts and dynamic content.

### Guidance and preparedness planning
- Add more country-specific preparedness guidance from authoritative public sources.
- Improve explanation of why a recommendation exists and what counts as ready.
- Expand household-specific planning without silently changing personal Targets.
- Explore guidance that can suggest relevant Plans, Assets or Container types without silently creating personal data.

## HomePrep Server integration track

The self-hosted server itself is developed in [`homeprep-server`](https://github.com/kakelakel/homeprep-server). This repository will later focus on the **Home Assistant client side** of that integration.

Planned Home Assistant work includes:

- optional Server mode alongside the existing local-only mode
- import/migration of existing HomePrep household data to a user's own HomePrep Server
- secure server pairing/configuration
- preserving Home Assistant-specific notification and Lovelace functionality
- clear connection/synchronization status
- compatibility across Home Assistant and Server versions

The existing local Home Assistant storage model will not be removed merely because Server mode exists.

## Architecture constraints for the Home Assistant client

- Home Assistant-only operation remains supported.
- No mandatory HomePrep account for core functionality.
- No mandatory central HomePrep database.
- No hidden upload of household preparedness data to HomePrep-operated infrastructure.
- No mandatory telemetry for core operation.
- Any future Server mode must clearly show which user-controlled server is connected.
- Migration to Server mode must be explicit rather than automatic.

## Medium term ideas for the Home Assistant client

- Import/export and backup-friendly HomePrep data formats.
- Barcode or QR-assisted Inventory entry.
- Item templates for common preparedness supplies and equipment.
- Inventory history and change log.
- Better support for replacement cycles, maintenance intervals and consumable rotation.
- More flexible dashboards and preparedness summaries.
- Additional accessibility work.
- Useful links/actions between Home Assistant automations and HomePrep resources.

## Separate product roadmaps

### HomePrep Server
The self-hosted backend, API, Web UI, synchronization and backup/restore roadmap lives here:

**[HomePrep Server Roadmap](https://github.com/kakelakel/homeprep-server/blob/main/ROADMAP.md)**

### HomePrep Android
The Android client, pairing, offline behaviour and mobile-native workflow roadmap lives here:

**[HomePrep Android Roadmap](https://github.com/kakelakel/homeprep-android/blob/main/ROADMAP.md)**

## Ideas welcome

If you have an idea that would make HomePrep more useful for real household preparedness, open a GitHub issue and describe the use case rather than only the feature.

That helps us understand what problem the feature should solve and which HomePrep repository it belongs in.
