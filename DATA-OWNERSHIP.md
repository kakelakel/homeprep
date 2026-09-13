# HomePrep Data Ownership

## Your preparedness. Your infrastructure. Your data.

HomePrep treats control of preparedness data as a permanent architectural commitment.

The Home Assistant integration stores HomePrep data locally in the user's own Home Assistant environment. Home Assistant-only operation remains a first-class mode and will not be replaced by a requirement to use centralized HomePrep-operated storage.

## Permanent project commitment

Core private household preparedness data will **not require centralized HomePrep-operated storage**.

Future clients and services must preserve a path where users can run HomePrep using infrastructure they control. Optional hosted services may be introduced later, but they must remain optional and must not become a prerequisite for the core HomePrep experience.

## Home Assistant mode

When HomePrep is used only through Home Assistant:

- operational HomePrep data stays in the user's Home Assistant installation
- HomePrep media stays local to that installation
- no HomePrep cloud account is required
- the user decides how Home Assistant itself is backed up, exposed remotely or isolated on the local network

## HomePrep Server

Users who want multiple HomePrep clients will be able to run their own HomePrep Server. The server is intended to provide a shared API, web client, backup/restore and synchronization while keeping the database under the user's control.

See [`kakelakel/homeprep-server`](https://github.com/kakelakel/homeprep-server) and its [data ownership policy](https://github.com/kakelakel/homeprep-server/blob/main/DATA-OWNERSHIP.md).

## Project rule

> Convenience may be centralized. Ownership must not be.

HomePrep may evolve. This principle is not intended to.
