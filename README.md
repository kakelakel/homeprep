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
  Inventory, containers, household assets, recurring checks, preparedness plans, shopping, guidance and readiness in one local-first integration.
</p>

> HomePrep is actively developed. Version 0.8 expands HomePrep from inventory tracking into a broader household preparedness system while remaining local-first and usable without a cloud account.

## The HomePrep project family

HomePrep is evolving into several cooperating clients around the same preparedness model:

- **HomePrep for Home Assistant** — this repository. The existing local-first Home Assistant integration.
- **[HomePrep Server](https://github.com/kakelakel/homeprep-server)** — an optional self-hosted server, API and web layer for users who want multiple HomePrep clients while retaining control of their own data.
- **[HomePrep Android](https://github.com/kakelakel/homeprep-android)** — the planned Android client for connecting to a user's own HomePrep Server.

The guiding direction is simple: **Your preparedness. Your server. Your data.**

Home Assistant-only operation remains a first-class mode. HomePrep Server will be optional rather than a replacement requirement.

## Highlights in 0.8

HomePrep 0.8 brings together the major preparedness building blocks in one workflow:

- **Inventory** for supplies and movable preparedness equipment.
- **Containers** for where supplies are stored or what is packed together.
- **Household Assets** for fixed or semi-permanent preparedness points such as water shutoffs, floor drains, leak sensors, smoke alarms, extinguishers and electrical panels.
- **Shopping List** with automatic replacement entries for expired inventory plus manual entries.
- **Preparedness Plans** with scenario checklists, review intervals and links to real Inventory, Containers and Assets.
- **Recurring checks** for Inventory, Containers and Assets, all backed by the same HomePrep Task scheduling system.
- **Readiness Overview** with per-area progress bars, an overall readiness score, an attention queue and next actions.
- **Grouped horizontal navigation** for Preparedness, Maintenance, Plans & Guidance and Household.
- **Configurable HomePrep Lovelace summary card** with selectable sections and display order.
- **Asset images** to help household members quickly identify important controls or locations.

The goal is not just to tell you what you own. HomePrep helps answer: **What do we have? Where is it? What needs attention? What should we do in an incident?**

## Core HomePrep model

### Inventory
Use Inventory for supplies and movable equipment you store, consume, rotate or replace: food, drinking water, batteries, radios, first-aid supplies, hygiene items, flashlights and similar items.

Inventory supports quantities, units, categories, expiry dates, inspection dates, containers, notes and optional images. Expired inventory can automatically create replacement entries in the Shopping List.

### Containers
Containers describe **where things are stored or what belongs together**. Examples include a hallway emergency box, family evacuation bag, vehicle kit, cabinet or water-storage area.

Inventory can be assigned to Containers. Containers can have their own recurring inspection task and readiness state, while still reflecting problems with inventory stored inside them.

### Household Assets
Assets describe **important fixed or semi-permanent points in the home**, not normal supplies. Examples include:

- main water shutoff
- isolation valves
- floor drains
- leak sensors
- backflow valves
- sump/drainage pumps
- smoke alarms
- fire extinguishers
- electrical panels
- generators

Assets can store a location, description, operating instructions, notes, check dates and an optional image. Images are particularly useful for helping another household member quickly find the correct valve, panel or control.

Assets can also have recurring inspection Tasks. Completing the linked Task updates the Asset's last-check date and calculates the next check automatically.

### Tasks and recurring checks
HomePrep Tasks handle both standalone preparedness work and linked recurring inspections.

Inventory, Containers and Assets can create recurring checks directly from their editors. The linked Task becomes the scheduling source for the next due date. Completing a recurring check updates the linked resource and calculates the next date from the selected cadence.

Supported recurrence periods include days, weeks, months and years, with reminder lead time and a choice between maintaining planned cadence or scheduling from completion.

### Shopping List
The Shopping List can contain manual entries and automatically generated replacement entries.

In 0.8, expired Inventory is the first automatic source. HomePrep carries over useful context such as item name, quantity, unit, category and Container and avoids repeatedly creating duplicate shopping entries for the same expired item.

Shopping entries can be pending, purchased or ignored.

### Preparedness Plans
Plans cover procedures and household readiness that cannot be represented by inventory alone.

Starter templates include:

- fire safety
- flood / water damage
- rapid evacuation

Plans support checklists, descriptions/instructions, meeting points, review intervals and readiness state. Checklist items can link to actual Inventory, Containers and Household Assets so plans increasingly reflect real household data rather than isolated tick boxes.

### Targets and guidance
Personal Targets define what "ready" means for your household. HomePrep can evaluate quantity, count, coverage and checklist-style readiness goals.

Current guidance profiles include:

- **Sweden** — MSB-based preparedness profile
- **Norway** — DSB-based preparedness profile
- **Other countries** — clearly labelled HomePrep general baseline

Guidance can be adopted into editable personal Targets. HomePrep does not silently overwrite personal Targets when guidance or household settings later change.

## Readiness Overview

The Overview is designed to give a fast preparedness picture without forcing every issue into a large alert tile.

HomePrep currently calculates readiness across:

- Inventory
- Containers
- Tasks
- Assets
- Plans
- Targets

Each configured area receives a readiness percentage based on tracked items versus items needing attention. Empty areas are excluded from the overall average rather than counted as zero.

The **overall readiness score** is the average of the configured area scores. A separate status layer can still show **Action required** or **Needs attention** when a critical or attention-level issue exists, even when the numeric score remains high.

Shopping items do not directly lower the percentage today; they appear in the attention workflow and influence the overall attention state.

## Sidebar app and navigation

After setup, HomePrep appears directly in the Home Assistant sidebar.

The app uses grouped horizontal navigation:

- **Overview**
- **Preparedness** — Inventory, Containers, Shopping List, Targets
- **Maintenance** — Tasks, Assets
- **Plans & Guidance** — Plans, Guidance
- **Household** — Household, Settings

Desktop pointer devices support hover-open dropdown menus, while click/tap remains available for touch and fallback use.

## Images

HomePrep currently supports optional images for Inventory and Household Assets.

JPEG, PNG and WebP files up to 5 MB are stored separately from HomePrep's structured JSON data. Records contain only media references and metadata. Images appear where they help identify or act on something rather than as decoration.

## Notifications

HomePrep uses Home Assistant's existing notification services. Available recipients can include Home Assistant Companion App devices.

Current notifications include inventory expiring soon, expired inventory, Task reminders, Tasks due today and overdue Tasks. A built-in test action verifies delivery and persisted deduplication avoids repeatedly sending the same event.

## Lovelace cards

HomePrep ships its own Lovelace cards and does **not** require Card Mod or third-party card dependencies. Cards register automatically with Home Assistant.

The standard **HomePrep** summary card can now be configured in its visual editor to show or hide and reorder sections for:

- Inventory
- Containers
- Shopping List
- Tasks
- Assets
- Plans

The **HomePrep Mini** card provides a compact status view for dense dashboards. Detailed Inventory, Task, category/group, attention and management cards remain available where more information or actions are useful.

HomePrep cards can navigate directly to the HomePrep sidebar application while preserving normal interaction with buttons, forms and task controls.

Most cards share the same appearance system, including presets, custom colors/HEX values, status colors, radius, density, shadow and border options.

## Languages

English is HomePrep's canonical source and fallback language.

The localization foundation currently supports:

- English
- Swedish
- Norwegian Bokmål
- Danish
- Finnish
- German
- French

HomePrep follows the active Home Assistant frontend language where supported. A HomePrep-specific language override is available in **HomePrep → Settings**. Translation coverage continues to expand as new areas mature.

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

HomePrep stores its operational data locally through Home Assistant, including Inventory, Containers, Assets, Shopping List, Tasks, Plans, household planning, Targets, image references and notification settings. HomePrep media files are also stored locally.

A HomePrep cloud account is **not required**. The project is now exploring an optional self-hosted **HomePrep Server** so multi-client use can be added without requiring households to place preparedness data in a central HomePrep-operated database.

## Releases and updating

HomePrep uses GitHub Releases as its HACS update channel.

- Stable users receive normal semantic-versioned releases such as `v0.8.0`.
- Opt-in testers can enable HACS prereleases when beta versions are available.
- Patch releases focus on fixes and refinements.
- Minor releases may add or reshape functionality while HomePrep remains in active `0.x` development.

See **[CHANGELOG.md](CHANGELOG.md)** for release details.

## Roadmap

See **[ROADMAP.md](ROADMAP.md)** for the Home Assistant integration roadmap.

Server and Android development now have their own roadmaps:

- **[HomePrep Server roadmap](https://github.com/kakelakel/homeprep-server/blob/main/ROADMAP.md)**
- **[HomePrep Android roadmap](https://github.com/kakelakel/homeprep-android/blob/main/ROADMAP.md)**

The roadmaps are directional and not fixed release promises.

## Project status

HomePrep is actively developed for people who want household preparedness to be maintained continuously rather than treated as a one-time checklist.

Bug reports and feature requests are welcome through [GitHub Issues](https://github.com/kakelakel/homeprep/issues).

## License

HomePrep is released under the license included in this repository. See [LICENSE](LICENSE).
