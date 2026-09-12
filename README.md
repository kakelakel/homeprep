<img width="653" height="651" alt="HomePrep" src="https://github.com/user-attachments/assets/409999f6-2183-4f14-a362-a01fe2331dca" />

# HomePrep

Home Assistant integration for managing household emergency preparedness.

HomePrep helps you keep track of:

- emergency inventory and expiry dates
- recurring preparedness checks and inspections
- personal preparedness targets
- official preparedness guidance
- household-specific preparedness planning

## Getting started

When HomePrep is added to Home Assistant, the setup wizard guides you through:

1. your household profile
2. preparedness horizon
3. official guidance available for your country
4. starter targets you want to adopt
5. final review

The selected official recommendations become editable **personal targets**. Updating official guidance never silently overwrites your personal targets.

## HomePrep sidebar app

After setup, HomePrep is available directly from the Home Assistant sidebar.

The built-in HomePrep app provides:

- Overview
- Inventory
- Tasks
- Targets
- Official guidance
- Household settings
- Panel appearance settings

Lovelace cards remain optional and can be used to place HomePrep information and actions on your own dashboards.

## Lovelace cards

HomePrep ships its own configurable Lovelace cards and does not require Card Mod or third-party card dependencies.

Current cards include inventory, status, category/group views, attention items, management and recurring tasks.

## Data

HomePrep stores data locally in Home Assistant using Home Assistant's storage system.

## Status

HomePrep is currently under active development.
