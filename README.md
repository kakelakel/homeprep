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

## Your preparedness. Your infrastructure. Your data.

Preparedness data can reveal a great deal about a household: what supplies exist, where important equipment is located, what plans are in place and where the weak points are.

For HomePrep, data ownership is therefore part of the security model itself.

**Core private HomePrep data will not require centralized HomePrep-operated storage.**

Home Assistant-only operation will remain a first-class mode. The broader HomePrep platform is being designed around self-hosted infrastructure controlled by the user. Future optional hosted services may exist, but they must remain optional and must not remove the ability to run HomePrep using infrastructure you control.

> **Convenience may be centralized. Ownership must not be.**

This is a permanent project principle, not a temporary limitation of the current version. See [DATA-OWNERSHIP.md](DATA-OWNERSHIP.md).

## The HomePrep project family

HomePrep is evolving into several cooperating clients around the same preparedness model:

- **HomePrep for Home Assistant** — this repository. The existing local-first Home Assistant integration.
- **[HomePrep Server](https://github.com/kakelakel/homeprep-server)** — an optional self-hosted server, API and web layer for users who want multiple HomePrep clients while retaining control of their own database and infrastructure.
- **[HomePrep Android](https://github.com/kakelakel/homeprep-android)** — the planned Android client for connecting to a user's own HomePrep Server.

The server is optional. HomePrep in Home Assistant will continue to work without it.

## Highlights in 0.8

HomePrep 0.8 brings together the major preparedness building blocks in one workflow:

- **Inventory** for supplies and movable preparedness equipment.
- **Containers** for where supplies are stored or what is packed together.
- **Household Assets** for fixed or semi-permanent preparedness points such as water shutoffs, floor drains, leak sensors, smoke alarms, extinguishers and electrical panels.
- **Shopping List** with manual entries and automatic replacement entries for expired inventory.
- **Preparedness Plans** with scenario checklists, review intervals and links to real Inventory, Containers and Assets.
- **Recurring checks** for Inventory, Containers and Assets, all backed by the same HomePrep Task scheduling system.
- **Readiness Overview** with per-area progress bars, an overall readiness score, an attention queue and next actions.
- **Grouped navigation** for Preparedness, Maintenance, Plans & Guidance and Household.
- **Configurable Lovelace summary card** with selectable sections and display order.
- **Asset and Inventory images** where a visual helps identify or act on something.

The goal is not just to tell you what you own. HomePrep helps answer: **What do we have? Where is it? What needs attention? What should we do in an incident?**

## Core HomePrep model

### Inventory
Use Inventory for supplies and movable equipment you store, consume, rotate or replace: food, drinking water, batteries, radios, first-aid supplies, hygiene items, flashlights and similar items.

Inventory supports quantities, units, categories, expiry dates, inspection dates, containers, notes and optional images.

### Containers
Containers describe **where things are stored or what belongs together**. Examples include an emergency box, family evacuation bag, vehicle kit, cabinet or water-storage area.

Inventory can be assigned to Containers. Containers can have their own recurring inspection task and readiness state.

### Household Assets
Assets describe important fixed or semi-permanent preparedness points in the home, such as:

- main water shutoff and isolation valves
- floor drains and leak sensors
- sump/drainage pumps
- smoke alarms and fire extinguishers
- electrical panels
- generators

Assets can store a location, description, operating instructions, notes, inspection schedule and optional image.

### Tasks and recurring checks
HomePrep Tasks handle both standalone preparedness work and linked recurring inspections.

Inventory, Containers and Assets can create recurring checks directly from their editors. The linked Task becomes the scheduling source for the next due date. Completing the check updates the resource and calculates the next date automatically.

### Shopping List
The Shopping List supports manual entries and automatically generated replacement entries. In 0.8, expired Inventory is the first automatic source.

### Preparedness Plans
Plans cover household procedures that cannot be represented by inventory alone. Starter templates include fire safety, flood/water damage and rapid evacuation.

Checklist items can link to actual Inventory, Containers and Household Assets.

### Targets and guidance
Personal Targets define what "ready" means for your household.

Current guidance profiles include Sweden (MSB-based), Norway (DSB-based) and a clearly labelled HomePrep general baseline for other countries.

Guidance can be adopted into editable personal Targets. HomePrep does not silently overwrite personal Targets when guidance changes.

## Readiness Overview

HomePrep calculates readiness across configured areas including Inventory, Containers, Tasks, Assets, Plans and Targets.

Empty areas are excluded from the overall average rather than counted as zero. A separate status layer can still show **Action required** or **Needs attention** when a critical issue exists, even when the numeric score remains high.

Shopping items do not directly lower the percentage today; they appear in the attention workflow and influence the overall attention state.

## Local storage and privacy

When HomePrep is used in Home Assistant-only mode, operational data and media stay in the user's own Home Assistant installation.

No HomePrep cloud account is required. No central HomePrep database is required. HomePrep does not need to know what you keep in your preparedness inventory.

Users who later want Web or Android access across multiple clients will be able to run their own **HomePrep Server**. The server is designed to provide synchronization, API access, backup/restore and a web interface while keeping the database under the user's control.

Local-network-only operation is a valid deployment choice. Remote access is something the infrastructure owner decides to provide and secure.

For the full project commitment, see [DATA-OWNERSHIP.md](DATA-OWNERSHIP.md).

## Images

HomePrep supports optional images for Inventory and Household Assets.

JPEG, PNG and WebP files up to 5 MB are stored separately from HomePrep's structured JSON data. Images are used where they help identify or act on something rather than as decoration.

## Notifications

HomePrep uses Home Assistant's existing notification services. Current notifications include inventory expiring soon, expired inventory, Task reminders, Tasks due today and overdue Tasks.

## Lovelace cards

HomePrep ships its own Lovelace cards and does **not** require Card Mod or third-party card dependencies.

The standard HomePrep summary card can be configured to show, hide and reorder Inventory, Containers, Shopping List, Tasks, Assets and Plans. The HomePrep Mini card provides a compact status view for dense dashboards.

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

HomePrep follows the active Home Assistant frontend language where supported. A HomePrep-specific language override is available in **HomePrep → Settings**.

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

## Releases and updating

HomePrep uses GitHub Releases as its HACS update channel.

- Stable users receive normal semantic-versioned releases such as `v0.8.0`.
- Opt-in testers can enable HACS prereleases when beta versions are available.
- Patch releases focus on fixes and refinements.
- Minor releases may add or reshape functionality while HomePrep remains in active `0.x` development.

See [CHANGELOG.md](CHANGELOG.md) for release details.

## Roadmaps

- **[HomePrep for Home Assistant](ROADMAP.md)**
- **[HomePrep Server](https://github.com/kakelakel/homeprep-server/blob/main/ROADMAP.md)**
- **[HomePrep Android](https://github.com/kakelakel/homeprep-android/blob/main/ROADMAP.md)**

The roadmaps are directional and not fixed release promises. The data-ownership principle above is an architectural constraint across those roadmaps.

## Project status

HomePrep is actively developed for people who want household preparedness to be maintained continuously rather than treated as a one-time checklist.

Bug reports and feature requests are welcome through [GitHub Issues](https://github.com/kakelakel/homeprep/issues).

## License

HomePrep is released under the license included in this repository. See [LICENSE](LICENSE).
