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

HomePrep turns household preparedness into something you can actually maintain over time:

- **Inventory** — track food, water, medicine, equipment and other preparedness supplies.
- **Expiry awareness** — see what is expiring soon or has already expired.
- **Recurring checks** — schedule inspections for fire extinguishers, water storage, batteries and other equipment.
- **Tasks** — create recurring or standalone preparedness tasks with due dates and reminders.
- **Preparedness targets** — define what "ready" means for your household and follow your progress.
- **Guidance profiles** — adopt curated preparedness recommendations as editable personal targets.
- **Notifications** — send selected inventory and task alerts through Home Assistant notification targets, including the Companion App.
- **Sidebar app** — manage HomePrep without building a dashboard first.
- **Lovelace cards** — optional native HomePrep cards for your own dashboards.

HomePrep stores its operational data locally in Home Assistant.

## HomePrep sidebar app

After setup, HomePrep appears directly in the Home Assistant sidebar.

<img width="1353" height="558" alt="HomePrep sidebar overview" src="https://github.com/user-attachments/assets/bec7a76b-804b-48f7-8994-302329a1b9ad" />

The sidebar app includes:

- Overview
- Inventory
- Tasks
- Targets
- Guidance
- Household
- Settings
- Notification configuration

The Overview highlights items and tasks that need attention without requiring a separate dashboard.

## Setup wizard

New installations start with a guided setup flow covering:

1. household profile
2. preparedness horizon
3. available guidance profile
4. starter targets
5. review and setup

Guidance recommendations become editable **personal targets** when adopted. Later guidance changes do not silently overwrite your personal targets.

### Guidance currently included

- **Sweden** — MSB-based preparedness profile
- **Norway** — DSB-based preparedness profile
- **Other countries** — clearly labelled HomePrep general baseline, not presented as official government guidance

HomePrep is designed so additional country-specific profiles can be added over time using authoritative civil-protection guidance.

## Notifications

HomePrep can use Home Assistant's existing notification services. If the Home Assistant Companion App is connected, its mobile notification target can be selected directly in HomePrep.

You can choose recipients and enable notifications for:

- inventory expiring soon
- inventory expired
- task reminders
- tasks due today
- overdue tasks

A built-in **Send test notification** action makes it easy to verify delivery. HomePrep also remembers delivered events to avoid repeatedly sending the same notification.

## Lovelace cards

HomePrep ships its own configurable Lovelace cards and does **not** require Card Mod or third-party card dependencies.

Current cards cover status, inventory, categories/groups, attention items, inventory management and recurring tasks.

<p>
  <img width="300" alt="HomePrep Lovelace example" src="https://github.com/user-attachments/assets/57357c8f-73b0-4ea7-94df-9c71ac21586d" />
  <img width="300" alt="HomePrep Lovelace example" src="https://github.com/user-attachments/assets/48710544-30f4-4d37-976e-69e5cf9e859d" />
</p>
<p>
  <img width="300" alt="HomePrep Lovelace example" src="https://github.com/user-attachments/assets/24f00ae6-615d-4d65-a36f-fc5ce90f0aeb" />
  <img width="300" alt="HomePrep Lovelace example" src="https://github.com/user-attachments/assets/7d447eee-f52d-4b16-8602-fd6c7a41a2c4" />
</p>

## Installation with HACS

HomePrep currently installs as a **custom HACS repository**.

1. Open HACS in Home Assistant.
2. Open the menu and choose **Custom repositories**.
3. Add `https://github.com/kakelakel/homeprep` as an **Integration** repository.
4. Install HomePrep.
5. Restart Home Assistant.
6. Go to **Settings → Devices & services → Add integration** and search for **HomePrep**.
7. Complete the HomePrep setup wizard.

Minimum supported Home Assistant version: **2026.3.0**.

When HomePrep begins publishing GitHub Releases, HACS will use those releases as the stable update channel.

## Updating

HomePrep follows semantic versioning during active `0.x` development:

- `0.x.y` patch releases contain fixes and refinements.
- `0.x.0` minor releases introduce new functionality or larger changes.
- `1.0.0` will represent the first broadly stable release.

See [CHANGELOG.md](CHANGELOG.md) for user-facing changes.

## Data and privacy

HomePrep stores inventory, tasks, household planning and notification settings locally through Home Assistant's storage system. The integration does not require a HomePrep cloud account.

Notification delivery uses notification services already configured in your Home Assistant instance.

## Project status

HomePrep is actively developed and currently targets people who are comfortable testing an evolving Home Assistant custom integration.

Bug reports and feature requests are welcome through [GitHub Issues](https://github.com/kakelakel/homeprep/issues).

## License

HomePrep is released under the license included in this repository. See [LICENSE](LICENSE).
