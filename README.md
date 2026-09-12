<p align="center">
  <img width="320" alt="HomePrep" src="https://github.com/user-attachments/assets/409999f6-2183-4f14-a362-a01fe2331dca" />
</p>

<h1 align="center">HomePrep</h1>

<p align="center"><strong>PREPARE · MONITOR · BE READY</strong></p>

<p align="center">
  <a href="https://www.hacs.xyz/"><img alt="HACS" src="https://img.shields.io/badge/HACS-Custom-41BDF5.svg"></a>
  <a href="https://www.home-assistant.io/"><img alt="Home Assistant 2026.3+" src="https://img.shields.io/badge/Home%20Assistant-2026.3%2B-41BDF5.svg"></a>
  <a href="https://github.com/kakelakel/homeprep/releases"><img alt="Latest release" src="https://img.shields.io/github/v/release/kakelakel/homeprep?display_name=tag&sort=semver"></a>
  <a href="https://github.com/kakelakel/homeprep/actions/workflows/validate.yml"><img alt="HACS and Hassfest validation" src="https://img.shields.io/github/actions/workflow/status/kakelakel/homeprep/validate.yml?branch=main&label=HACS%20%2B%20Hassfest"></a>
  <a href="https://github.com/kakelakel/homeprep/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/kakelakel/homeprep"></a>
</p>

<p align="center">
  Household emergency preparedness for Home Assistant.<br>
  Track supplies, inspections, preparedness goals and reminders in one local-first integration.
</p>

> HomePrep is under active development. The project is usable today, but features and data models may still evolve before 1.0.

## What HomePrep does

HomePrep turns household preparedness into something you can maintain over time:

- **Inventory** — track food, water, medicine, equipment and other preparedness supplies.
- **Inventory images** — attach an optional image and use thumbnails throughout applicable views.
- **Expiry awareness** — see what is expiring soon or has already expired.
- **Recurring inspections** — schedule checks for equipment, water storage, batteries and other supplies.
- **Tasks** — create recurring or standalone preparedness tasks with due dates and reminders.
- **Preparedness targets** — define what "ready" means for your household and follow progress.
- **Guidance profiles** — adopt curated preparedness recommendations as editable personal targets.
- **Notifications** — send selected inventory and task alerts through Home Assistant notification targets.
- **Sidebar app** — manage HomePrep without first building a dashboard.
- **Lovelace cards** — configurable cards with visual editors and shared appearance controls.
- **Multilingual UI** — automatic Home Assistant language detection plus an optional HomePrep override.

HomePrep stores its operational data locally in Home Assistant.

## HomePrep sidebar app

After setup, HomePrep appears directly in the Home Assistant sidebar.

<img width="1353" height="558" alt="HomePrep sidebar overview" src="https://github.com/user-attachments/assets/bec7a76b-804b-48f7-8994-302329a1b9ad" />

The sidebar app includes Overview, Inventory, Tasks, Targets, Guidance, Household and Settings. The Overview combines inventory, recurring checks and preparedness goals so important issues are visible without building a separate dashboard.

## Inventory images

Inventory items can optionally have their own image. Current support includes JPEG, PNG and WebP uploads up to 5 MB, replacement/removal, thumbnails in inventory views and linked inspection tasks, plus automatic fallback to the normal category icon.

Images are stored separately from HomePrep's inventory JSON; item records keep only image metadata and references.

## Setup wizard and guidance

New installations start with a guided setup flow covering household profile, preparedness horizon, guidance profile, starter targets and review.

Guidance recommendations become editable **personal targets** when adopted. Later guidance changes do not silently overwrite your personal targets.

Current guidance profiles include:

- **Sweden** — MSB-based preparedness profile
- **Norway** — DSB-based preparedness profile
- **Other countries** — clearly labelled HomePrep general baseline, not presented as official government guidance

Additional country-specific profiles can be added over time using authoritative civil-protection guidance.

## Languages

English is HomePrep's canonical source language and fallback language.

The current localization foundation supports:

- English
- Swedish
- Norwegian Bokmål
- Danish
- Finnish
- German
- French

HomePrep follows the active Home Assistant frontend language automatically where supported. A language override is also available in **HomePrep → Settings**.

Translation coverage is being expanded across sidebar text, guidance content, Lovelace cards and visual editors during the 0.6.1 beta cycle.

## Notifications

HomePrep uses Home Assistant's existing notification services. Available recipients can include Home Assistant Companion App devices.

Notifications can be enabled for inventory expiring soon, expired inventory, task reminders, tasks due today and overdue tasks. A built-in **Send test notification** action verifies delivery, while persisted deduplication avoids repeatedly sending the same event.

## Lovelace cards

HomePrep ships its own configurable Lovelace cards and does **not** require Card Mod or third-party card dependencies. Cards are registered automatically by the integration.

The card family covers overall HomePrep status, Inventory, Tasks, categories/groups, attention items and inventory management.

The two summary cards have distinct roles:

- **HomePrep** — combines Inventory and Tasks into one status card with separate summary metrics for both.
- **HomePrep Mini** — a compact combined Inventory + Tasks summary for dense dashboards.

Detailed Inventory and Tasks cards remain available when more information or actions are needed.

Most HomePrep cards use the same visual editor and appearance system, including presets, custom colors/HEX values, status colors, radius, density, shadow and border options.

<p>
  <img width="300" alt="HomePrep Lovelace example" src="https://github.com/user-attachments/assets/57357c8f-73b0-4ea7-94df-9c71ac21586d" />
  <img width="300" alt="HomePrep Lovelace example" src="https://github.com/user-attachments/assets/48710544-30f4-4d37-976e-69e5cf9e859d" />
</p>

## Releases and updating

HomePrep uses GitHub Releases as its HACS update channel.

Stable users receive normal semantic-versioned releases such as `v0.6.0` and future stable updates. Opt-in testers can enable HACS prereleases to test beta versions such as `v0.6.1b1`, `v0.6.1b2` and later prereleases before they become stable.

During active `0.x` development:

- patch releases contain fixes and refinements
- minor releases may add or reshape functionality
- prereleases are used for controlled testing before a stable release
- `1.0.0` will represent the first broadly stable release

See [CHANGELOG.md](CHANGELOG.md) for user-facing changes.

## Installation with HACS

HomePrep currently installs as a **custom HACS repository** while inclusion in the HACS default repository list is under review.

1. Open HACS in Home Assistant.
2. Open the menu and choose **Custom repositories**.
3. Add `https://github.com/kakelakel/homeprep` as an **Integration** repository.
4. Install HomePrep.
5. Restart Home Assistant.
6. Go to **Settings → Devices & services → Add integration** and search for **HomePrep**.
7. Complete the HomePrep setup wizard.

Minimum supported Home Assistant version: **2026.3.0**.

## Data and privacy

HomePrep stores inventory, tasks, household planning, targets, image references and notification settings locally through Home Assistant. Inventory image files are also kept locally by HomePrep.

The integration does not require a HomePrep cloud account. Notification delivery uses services already configured in the Home Assistant instance.

## Roadmap

See **[ROADMAP.md](ROADMAP.md)** for current priorities, near-term features and longer-term plans including the standalone HomePrep app and optional HomePrep cloud service.

The roadmap is intentionally flexible and is not a fixed release promise.

## Project status

HomePrep is actively developed and currently targets people who are comfortable testing an evolving Home Assistant custom integration.

Bug reports and feature requests are welcome through [GitHub Issues](https://github.com/kakelakel/homeprep/issues).

## License

HomePrep is released under the license included in this repository. See [LICENSE](LICENSE).
