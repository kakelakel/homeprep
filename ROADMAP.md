# HomePrep Roadmap

HomePrep is under active development. This roadmap is a public direction board rather than a fixed promise or release schedule.

Ideas may move, change shape, or be dropped as HomePrep evolves and real-world feedback comes in.

## Current focus

- Prepare the first proper GitHub/HACS release flow.
- Verify inventory image support across sidebar views and linked inspection tasks.
- Keep HACS and Hassfest validation green.
- Improve clarity and polish in the HomePrep sidebar app.

## Near term

### Inventory
- Optional images for inventory items across more HomePrep views and Lovelace cards.
- Better filtering, sorting and searching.
- Storage-location support, for example pantry, basement, garage or evacuation bag.
- Faster bulk editing for common inventory maintenance.
- Clearer expiry and inspection workflows.

### Tasks and notifications
- More actionable task notifications.
- Better links from notifications directly into the relevant HomePrep item/task.
- Optional notification milestones for expiring inventory.
- Improved task history and completion visibility.

### Lovelace and UI
- Continue expanding visual editors for HomePrep cards.
- More reusable layout/display options while keeping the number of card types small.
- Further mobile-first improvements.
- Better use of inventory thumbnails where space allows.

### Guidance and preparedness planning
- Add more country-specific preparedness guidance from authoritative public sources.
- Improve explanation of why a recommendation exists and what counts as ready.
- Expand household-specific planning without silently changing personal targets.

## Medium term ideas

- Import/export and backup-friendly HomePrep data formats.
- Barcode or QR-assisted inventory entry.
- Item templates for common preparedness supplies and equipment.
- Inventory history and change log.
- Better support for replacement cycles, maintenance intervals and consumable rotation.
- More flexible dashboards and preparedness summaries.
- Additional accessibility and frontend localization work.

## Longer-term product direction

These are larger product tracks HomePrep should stay technically ready for. They are intended directions, but no release dates are promised.

### Standalone HomePrep app
- Build a standalone HomePrep application that can be used without Home Assistant.
- Keep the app local-first, with useful offline capability.
- Reuse the same core HomePrep concepts for inventory, tasks, targets, guidance and household preparedness.
- Support shared household use across multiple people and devices.

### HomePrep cloud service
- Build an optional HomePrep cloud service for synchronization between Home Assistant and standalone HomePrep clients.
- Support secure multi-device and multi-user household synchronization.
- Synchronize inventory, tasks, targets, household settings and other platform-neutral HomePrep data.
- Keep Home Assistant-specific settings, such as local notification targets, local to the Home Assistant installation.
- Preserve local-first operation so a HomePrep cloud account is not required for basic Home Assistant use.
- Support offline-first synchronization and safe conflict/deletion handling as the product matures.

### Platform expansion
- Make Home Assistant one HomePrep client rather than the definition of HomePrep itself.
- Allow future clients to share a common HomePrep household while retaining platform-specific integrations and presentation.
- Explore secure APIs and integrations for other smart-home or preparedness platforms over time.

## Ideas welcome

If you have an idea that would make HomePrep more useful for real household preparedness, open a GitHub issue and describe the use case rather than only the feature.

That helps us understand what problem the feature should solve and how broadly useful it may be.
