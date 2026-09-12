# Changelog

All notable user-facing changes to HomePrep are documented here.

HomePrep uses semantic versioning while it is in active `0.x` development. Patch releases contain fixes and refinements; minor releases may add or reshape features.

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
- Notification deduplication to avoid repeatedly sending the same event.

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
