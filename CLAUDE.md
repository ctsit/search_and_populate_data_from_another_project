# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A REDCap External Module ("Search and Populate Data From Another Project"). It embeds REDCap's built-in Search Query autocomplete into a data entry page, letting a user search a *different* ("source") REDCap project and copy field values from a matched record into the current ("target") form via a confirmation modal. There is no build system, package manager, or test suite — this is plain PHP + jQuery that runs inside a live REDCap instance (REDCap is not part of this repo; it's the host application that loads this module).

Because there's no local runtime, verifying changes generally means reasoning through the code paths and REDCap API usage carefully, or asking the user to test in a real REDCap instance.

## Architecture

**Server side (`ExternalModule.php`)** — a single `STPipe\ExternalModule\ExternalModule` class with two REDCap hook entry points:
- `redcap_every_page_top($project_id)` — on the module's own config page (`ExternalModules/manager/project.php`), injects JS settings and loads `js/config_menu.js` to enhance the admin configuration UI (codebook shortcut links, JSON validation before save).
- `redcap_data_entry_form_top(...)` — on a data entry form that's been enabled for this module, optionally fetches source-project field labels (for the "limit fields" dropdown), determines which REDCap search-UI code path applies (see version check below), sets JS settings (`window.STPipe = {...}`), includes `js/custom_data_search.js`, calls REDCap core's `DataEntry::renderSearchUtility()` to render the native search box, and includes `data_confirm_modal.html`.

Other key server methods:
- `getPersonInfo($record_id, $instrument)` — called via AJAX (`ajaxpage.php`) after a user picks a search result. Loads the matched record's data from the source project with `REDCap::getData()`, remaps `source_field => target_field` names per the configured mapping, and reformats date fields to match the target field's validation type (`convertDateFormat()` — ported from REDCap core's `DataQuality` class since it's private there).
- `fetchMappings($instrument)` — resolves which `mapping` JSON blob (from project settings) applies to a given instrument by matching against the parallel `show_on_form` list. The two are configured as a repeatable `sub_settings` block in `config.json`, so they're index-aligned arrays, not a keyed map.
- `digNestedData()` — when the "current" event/instance value for a field is empty, recursively searches all events/repeat instances in the source record for a non-null value (arrays and stdClass objects).

**REDCap version branching**: `redcap_data_entry_form_top` computes `version_support` based on `REDCAP_VERSION` (true for `14.5.35 <= v < 14.6.0` or `v > 15.0.1`). `js/custom_data_search.js` uses this flag to pick between two nearly-duplicate overrides of REDCap core's `enableDataSearchAutocomplete()` — the URL structure and `data_arr` field count returned by `DataEntry/search.php` differ between REDCap versions. When touching search behavior, both branches usually need parallel updates.

**Client side (`js/custom_data_search.js`)**:
- Overrides REDCap core's `enableDataSearchAutocomplete()` so that selecting a search result doesn't navigate away — it instead calls `ajaxGet()`, which posts to `ajaxpage.php` and opens the confirmation modal (`data_confirm_modal.html`) via `showDataConfirmModal()`.
- On confirm, `pasteValues()` writes each mapped value into the current form: text inputs by `name`, radios via `.hiddenradio` sibling `[class*="choice"]` elements, checkboxes via `handleCheckboxGroup()` (REDCap names checkbox inputs `__chkn__<field>`, 1-indexed by position), and dropdowns/autocomplete fields via `selectFromDropdown()` (handles both coded values and displayed-label values, including the `rc-autocomplete` widget class).

**`js/config_menu.js`** only runs on the module's own configuration modal in the External Modules manager. It adds "Source codebook" / "Target codebook" quick links (tracking the currently-hovered project in the source-project `select2` dropdown, since the native `change` event fires before the DOM reflects the new selection) and wires JSON validation into the config Save button.

## Configuration model (`config.json`)

Per-project settings, editable from **Manage External Modules**:
- `target_pid` — the source project to search.
- `limit_fields` — when checked, restricts the search field dropdown to only the fields present in the mapping (looked up via `MetaData::getDataDictionary`, an intentional workaround noted in code since direct field-list queries didn't work with the framework's `query()` helper).
- `enabled_forms` (repeatable): pairs of `show_on_form` (target instrument name) + `mapping` (JSON `{source_field: target_field}`), index-aligned per `fetchMappings()`.

`examples/*.json` holds real-world sample mappings for reference when writing documentation or test mappings.

## Conventions specific to this repo

- **Single-arm limitation**: source-project queries always run against arm 1; this is a known, documented limitation, not a bug to silently "fix" without discussion.
- **No user-permission enforcement on source data**: by design, once a source project is mapped, its mapped field data is exposed to *everyone* with access to the target form, regardless of their permissions on the source project. This is called out explicitly in the README — preserve that warning if you touch the config UI or docs.
- Version/release metadata lives in three places that must stay in sync on a release: `config.json` (`framework-version`, `compatibility`), `CHANGELOG.md`, and `CITATION.cff`. `README.md`'s "Prerequisites" section also mirrors the REDCap version requirements.
- Commit messages in `CHANGELOG.md` follow `- <summary> (@author, #issue, #PR)`; each release starts with `# <module-name> <version> (released <date>)`. Git tags mirror the version (e.g. `0.7.2`).
