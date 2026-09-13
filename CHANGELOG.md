# Changelog

All notable user-facing changes to HomePrep are documented here.

HomePrep uses semantic versioning while it is in active `0.x` development. Patch releases contain fixes and refinements; minor releases may add or reshape features.

## [0.8.0b1] - 2026-09-13

### Added
- **Household Assets** for important fixed or semi-permanent preparedness points such as main water shutoffs, isolation valves, floor drains, leak sensors, sump pumps, smoke alarms, fire extinguishers and electrical panels.
- Asset location, instructions, notes and optional last/next check dates.
- **Shopping List** with manual entries plus automatic replacement entries for inventory whose expiry date has passed.
- Automatic shopping entries carry quantity, unit, category, container reference and the originating inventory item without creating duplicates.
- Shopping-list states for pending, purchased and ignored items.
- Preparedness plan checklist items can store links to household assets alongside inventory and containers.
- Grouped, collapsible sidebar navigation replacing the increasingly crowded horizontal tab row.

### Improved
- HomePrep navigation is now organized into Preparedness, Maintenance, Plans & Guidance and Household families while Overview remains directly accessible.
- The Overview includes Assets and Shopping List readiness alongside Inventory, Containers, Tasks, Plans, Targets and Guidance.
- HomePrep Lovelace summary cards now include household assets and pending shopping-list replacements in the combined preparedness status.
- Deleted automatically generated shopping entries remain deduplicated and are not recreated repeatedly for the same expired inventory item.

### Notes
- This is the first beta of the 0.8 line and focuses on validating the new Assets, Shopping List and grouped-navigation model before stable release.
- Automatic shopping-list generation currently starts with expired inventory. The source model is designed so future releases can also add shortages from targets, containers, plans and asset maintenance.

## [0.7.0b3] - 2026-09-13

### Fixed
- HomePrep Mini no longer shows duplicate Containers and Plans chips when those areas need attention.
- Frontend cache versioning was bumped so the corrected Mini card is fetched reliably after upgrading.

## [0.7.0b2] - 2026-09-13

### Added
- Generic container types such as bags, boxes/crates, water containers, cabinet/storage and vehicle storage so the container name can describe the actual use case without repeating the type.
- Optional recurring container inspections backed by HomePrep Tasks, including cadence, reminders and automatic next-check scheduling.
- Rich preparedness checklist items with descriptions/instructions and links to specific inventory items and containers.
- Native HomePrep checklist-item editor instead of browser prompt dialogs.
- Preparedness-plan review intervals with last-review, next-review and review-required state.
- Plan review and container/plan readiness information on the HomePrep Overview.
- Containers and Plans are now included in the HomePrep, HomePrep Mini and HomePrep Status Lovelace summaries.
- Container selection in the Lovelace inventory management editor.

### Improved
- Existing beta container types are migrated to the new generic type model automatically.
- Container status badges are displayed as properly aligned pills rather than oversized circular badges.
- Marking a container checked completes its linked recurring container task when one exists.
- Deleting a container also removes its linked recurring inspection task while preserving contained inventory items.
- Plan checklist completion keeps the last confirmation timestamp so future review workflows can distinguish historic confirmation from current readiness.
- HomePrep Lovelace summary spacing was adjusted so section icons and labels have clearer separation.

### Notes
- Checklist links currently support Inventory and Containers. Assets are intentionally planned as the next HomePrep building block rather than being folded into this beta prematurely.
- Plan review expiry marks the plan as requiring review but does not silently erase previous checklist confirmations.

## [0.7.0b1] - 2026-09-13

### Added
- **Containers** as a new HomePrep building block for organizing preparedness supplies by where they are stored or what they are packed for.
- Container types for go bags, preparedness crates, water containers, first-aid kits, vehicle kits, general storage and other use cases.
- Container location, description, notes and optional last/next check dates.
- Inventory items can now be assigned to a container.
- Container readiness is calculated from both the container's own check date and the status of the inventory stored inside it.
- New **Plans** area with household preparedness checklists.
- Starter templates for fire safety, flood/water damage and rapid evacuation planning.
- Checklist completion tracking, custom checklist items, meeting-point information and plan readiness status.
- Swedish UI labels for the new Containers and Plans views.
- All HomePrep Lovelace cards can now be clicked to open the HomePrep sidebar application directly.

### Improved
- Preparedness is no longer limited to supplies, tasks and numeric targets; HomePrep can now model where critical supplies are kept and whether household emergency procedures are actually prepared.
- Deleting a container keeps its inventory items and safely removes their container assignment.
- Lovelace navigation ignores interactive controls such as buttons, forms and task actions, so existing card controls remain usable.

### Notes
- This is the first beta of the 0.7 line. Containers and Plans are intentionally being tested before the next stable release.

## [0.6.1] - 2026-09-12

### Added
- Multilingual frontend foundation with automatic Home Assistant language detection and an optional HomePrep language override.
- Initial language support for English, Swedish, Norwegian Bokmål, Danish, Finnish, German and French.
- Translation coverage across the setup wizard, sidebar navigation, inventory, tasks, targets, household, settings, notifications, categories, common units, status labels and Lovelace UI.
- Swedish localization for the Swedish MSB guidance shown in HomePrep, including recommendation titles, readiness requirements, descriptions and advisory notes.
- Pattern-aware localization for dynamic values such as item counts, readiness counts, days, due dates and inspection metadata.

### Improved
- The **HomePrep** summary card now combines Inventory and Tasks and reflects the most important overall status.
- **HomePrep Mini** now provides a compact combined Inventory + Tasks summary.
- Summary cards refresh automatically so inventory and task changes are reflected without reloading the dashboard.
- Swedish UI polish for remaining mixed-language strings in Tasks, Inventory, Personal targets and guidance-related metadata.
- Composite metadata such as category, target type, guidance origin and linked-task state now localizes more cleanly.
- Singular/plural handling was tightened for inventory counts and simple quantity labels.
- The language selector is integrated into the Settings view.
- English remains the canonical source language and fallback when a translated string is unavailable.
- Public README and roadmap documentation were refreshed to match the current feature set, release workflow and localization support.
- Frontend cache versioning was bumped where needed so updated localization and Lovelace modules are fetched reliably after upgrades.

## [0.6.1b3] - 2026-09-12

### Added
- Much broader Swedish translation coverage for sidebar subtexts, notification descriptions, overview summaries, task metadata, inventory counts and Lovelace card copy.
- Swedish localization for the full Swedish MSB guidance profile shown in HomePrep, including recommendation titles, readiness requirements, descriptions and advisory notes.
- Pattern-aware translation for dynamic values such as item counts, readiness counts, days, inspection metadata and due-date text.

### Improved
- Guidance and adopted personal targets now present far less mixed English/Swedish content when HomePrep is set to Swedish.
- Lovelace cards use the same extra localization pass as the sidebar panel.
- The **HomePrep** summary card now combines Inventory and Tasks, including separate metrics for inventory attention and task status.
- **HomePrep Mini** now provides a compact combined Inventory + Tasks summary and reflects whichever area needs the most attention.
- Summary cards refresh HomePrep data automatically so task and inventory changes are reflected without a dashboard reload.
- Public README and roadmap documentation were refreshed to match the current release, localization, HACS and Lovelace feature set.
- Sidebar frontend cache versioning was bumped again so the new translation bundle is fetched after upgrade.

### Notes
- This beta focuses on closing the largest remaining Swedish translation gaps identified during real UI testing and validating the revised HomePrep summary cards before stable 0.6.1.
- The same translation architecture remains in place for Norwegian Bokmål, Danish, Finnish, German and French.

## [0.6.1b2] - 2026-09-12

### Added
- Expanded frontend translations for English, Swedish, Norwegian Bokmål, Danish, Finnish, German and French.
- Translation coverage for sidebar navigation, inventory, tasks, targets, household, settings, notifications, categories, common units and status labels.
- Dynamic translation handling for inventory counts, attention counts, expiry dates and inspection dates.
- Lovelace localization layer for HomePrep cards and visual editors.

### Improved
- The language selector now appears inside the Settings view below the Settings heading instead of above it.
- Frontend translation helpers can now localize rendered elements as well as raw HTML.
- English remains the canonical source language and fallback for untranslated strings.

### Notes
- This is a beta release intended for opt-in testing through HACS prerelease updates before the stable 0.6.1 release.

## [0.6.1b1] - 2026-09-12

### Added
- First beta of HomePrep's multilingual frontend foundation.
- Automatic language selection based on the active Home Assistant frontend language.
- Optional HomePrep language override in the sidebar Settings view.
- Initial support for English, Swedish, Norwegian Bokmål, Danish, Finnish, German and French.
- Home Assistant setup-wizard translations for the supported languages.

### Improved
- English remains the canonical source language and fallback when an translated frontend string is unavailable.
- Sidebar frontend cache versioning was bumped so updated frontend modules are fetched reliably after upgrades.

### Notes
- This is a beta release intended for opt-in testing through HACS prerelease updates before the stable 0.6.1 release.
- Translation coverage is being expanded across the sidebar panel, Lovelace cards and visual editors during the 0.6.1 beta cycle.

## [0.6.0] - 2026-09-12

### Added
- Optional image support for inventory items.
- JPEG, PNG and WebP uploads up to 5 MB from the HomePrep sidebar editor and Lovelace inventory management card.
- Inventory thumbnails that replace category icons where a useful visual can be shown.
- Linked inspection tasks can reuse the inventory item's thumbnail in both the sidebar and Lovelace task views.
- Separate image-file storage so binary image data is not embedded in HomePrep's inventory JSON.
- Replace and remove controls for existing inventory images.
- Automatic loading and registration of HomePrep Lovelace cards so they appear in Home Assistant's card picker.

### Improved
- Linked inspection tasks now show that they are managed from Inventory and provide a direct **Manage item** action.
- Action buttons now use a consistent HomePrep visual language: blue with white text for normal actions and red for destructive actions.

### Fixed
- Editing a linked inspection task now preserves its inspection type, linked inventory item and enabled state.
- Inventory images now render in applicable Lovelace inventory and task cards instead of only in the sidebar app.

## [0.5.0] - 2026-09-12

### Added
- Stable platform-neutral household identity for HomePrep data.
- `household_id` metadata on inventory items, tasks and preparedness targets.
- `deleted_at` tombstones for inventory, tasks and targets so future sync can distinguish deletion from missing data.
- Consistent sync-oriented metadata foundations using stable IDs, timestamps, revisions and schema versions.

### Improved
- Existing stored data is normalized forward automatically while remaining local to Home Assistant.
- Deleted records remain hidden from HomePrep UI/API while being retained internally for future synchronization support.

## [0.4.1] - 2026-09-12

### Improved
- Notification settings now show clear save progress and confirmation.
- Test notifications show visible sending and success feedback.

## [0.4.0] - 2026-09-12

### Added
- Native Home Assistant notifications for inventory and tasks.
- Dynamic selection of available Home Assistant notification targets, including Companion App devices.
- Inventory notifications for items expiring soon or already expired.
- Task notifications for reminders, due-today events and overdue tasks.
- Configurable expiry warning window.
- Test notification action in HomePrep settings.
- Notification deduplication to avoid repeatedly sending the same notification.

## [0.3.3] - 2026-09-12

### Added
- Inventory status indicators for expiring, expired and due-for-check items.
- HomePrep branding in the sidebar panel header.

### Improved
- Sidebar frontend registration now refreshes correctly when the panel module changes.

## [0.3.2] - 2026-09-12

### Fixed
- Restored category-aware unit suggestions in the sidebar inventory editor and Lovelace management card.

## [0.3.1] - 2026-09-12

### Added
- Full inventory create, edit and delete controls in the HomePrep sidebar app.
- Full standalone task create, edit and delete controls in the sidebar app.

### Improved
- Overview status now communicates state through icon and value colors while keeping card borders neutral.

## [0.3.0] - 2026-09-12

### Added
- HomePrep sidebar application with Overview, Inventory, Tasks, Targets, Guidance, Household and Settings views.
- First-run setup wizard for household details and starter preparedness targets.
- Personal preparedness targets with clearer readiness requirements instead of abstract boolean values.
- Official Swedish MSB and Norwegian DSB guidance profiles.
- Unofficial HomePrep general baseline for countries without a curated official profile.

### Improved
- Guidance changes recalculate recommendations without silently changing adopted personal targets.

## Earlier development

Earlier `0.x` builds established the HomePrep inventory, recurring-task, planning, recommendation and Lovelace-card foundations.
