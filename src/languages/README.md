# Localization

## Overview

The Internationalization (i18next) is a feature that provides localizations of SPA pages.

i18next is integrated with [Locize.com](https://Locize.com) backend.

[Locize.com](https://Locize.com) backend plays a few roles:
1. It makes access to localizations resources easier for translators
1. Allow us implement side by side translation feature for translators
1. [Locize.com](https://Locize.com) is source of truth for localizations resources

If you need account in OraclyV1 Web Trader SPA [Locize.com](https://Locize.com) click [here]().

Join slack channel `#translations_reports` to be updated on missing translations through all OraclyV1 applications.

Join translators slack channels:
* `#translations`
* `#spanish-translations`

## Usage

### Steps

1. Add new text copy
1. Wrap copy in proper translation function ```{t('English text')}``` (see [Not Allowed Characters](#not-allowed-characters))
1. Restart project in LDE (`translation-scanner` pushes new translations to Locize on LDE start) (see [Translation Scanner](#translation-scanner))
1. Push your changes to GitLab branch (`translation-scanner` pushes new keys to Locize as part of CI/CD) (see [CI/CD Translation Scanner Synchronization](#cicd-translation-scanner-synchronization))
1. Ask translators in `#[lng]-translations` slack channel to translate your copies in [Locize.com](https://locize.io/p/qr8dk8l2/v/latest)
1. When your copies are translated in Locize run synchronization (see [Run Synchronization](#run-synchronization))
1. Review changes appeared in `src/languages/[lng].json` in order to avoid unexpected problems
1. Check logs `docker-compose up translation-scanner` for missing translations (see [Troubleshooting](#troubleshooting))
1. Push translation changes into your branch
1. After merge your branch into `master` check `#translations_reports` slack channel to see if `master` branch has any missing translations

*NOTE: Change of copy that wrapped in translation function is the same as add new copy*

### Not Allowed Characters

Ensure that there is no unencoded UTF-8 characters that Locize refuse to accept.

For example replace:
1. '—' (long dash) with `&mdash;`
2. '′' (prime & double prime) with `&prime;`
3. '¢' (cent) with `&cent;`
4. etc...

## Locize Synchronization

### Translation Scanner

[Translation Scanner](https://git.oracly.com/oracly/translation-scanner) is a mechanism with a few main functions:
1. It scans application source code for text copies that wrapped in translation function.
1. It downloads Locize translated text copies (keys) and compares them to source code text copies.
1. It pushes missing text copies to Locize and saves downloaded from Locize translated text copies.

Translation Scanner has translation reports builder that helps to track missing and exceed translations.

Missing translations: exist in JS source code, but not exist or not translated in Locize.

Exceed translations: not exist in JS source code, but exist in Locize.

*NOTE: OraclyV1 is paying per each word per month, so remove exceed translations from Locize.*

### LDE Translation Scanner Config

Project `docker-compose.yml` has `translation-scanner` service (see [Translation Scanner](#translation-scanner)):
1. Push missing keys to Locize
1. Download Locize resources and update `languages` folder
1. Build report and output it into `stdout`

If you want to push new keys to Locize from local environment set `PUBLISH_MISSED_KEYS` env var to `true` in your `docker-compose.yml`

If you want to turn on synchronization with latest translations from Locize set `SAVE_KEYS_LOCALLY` env var to `true` in your `docker-compose.yml`

here is `docker-compose.yml`
```yml
  oracly:
    repo: ssh://git@git.oracly.com/oracly/oracly-js
    path: '<path>/<to>/oracly'
    env_vars:
      - PUBLISH_MISSED_KEYS: 'true'
      - SAVE_KEYS_LOCALLY: 'true'
```

### Run Synchronization

Note that synchronization mechanism runs **only when container starts**, each time you want to sync with Locize you need to execute command
```bash
docker-compose start translation-scanner
```

### CI/CD Translation Scanner Synchronization

Project CI/CD config has `translation-scanner` job that runs on push to `development` and `master` branch:
1. Push missing keys to Locize
1. Build report and output it into artifacts (accessible under VPN)
1. It sends to slack channel `#translations_reports` notification with links to missed and exceed translations

## Troubleshooting

If you going throught [Steps](#steps) and nothing happening see [LDE Translation Scanner Config](#lde-translation-scanner-config)

In order to see logs from `translation-scanner` service you should execute
```bash
docker-compose up translation-scanner
```

Healthy logs example, they are means that you have untranslated copies in project `src`. (see [Steps](#steps))
```
translation-scanner_1  | i18next-scanner: Sync language: es
translation-scanner_1  | i18next-scanner: Downloading from http://api.locize.io/d4d8f91b-e133-4d4e-bd32-7e8ca649a919/latest/es/common
translation-scanner_1  | i18next-scanner: Saving translations locally
translation-scanner_1  | --------------------------------------
translation-scanner_1  | UNTRANSLATED KEYS in Locize for language es
translation-scanner_1  | --------------------------------------
translation-scanner_1  | {
translation-scanner_1  |   "Hi {{userFirstName}}! ": "Hi {{userFirstName}}! ",
translation-scanner_1  |   "Welcome to the Control Panel.": "Welcome to the Control Panel.",
translation-scanner_1  |   "Manage": "Manage",
translation-scanner_1  |   "My Websites": "My Websites",
translation-scanner_1  | }
translation-scanner_1  | --------------------------------------
translation-scanner_1  | i18next-scanner: UNTRANSLATED KEYS WAS FOUND!
translation-scanner_1  | /build/comparer.js:73
translation-scanner_1  |         throw new Error('i18next-scanner: UNTRANSLATED KEYS WAS FOUND!')
translation-scanner_1  |         ^
translation-scanner_1  |
translation-scanner_1  | Error: i18next-scanner: UNTRANSLATED KEYS WAS FOUND!
translation-scanner_1  | * * *
oracly_translation-scanner_1 exited with code 1
```

Unhealthy logs example, they are usually means that you have forbinned characters in translation copies. (see [Not Allowed Characters](#not-allowed-characters))
```
translation-scanner_1  | i18next-scanner: Saving translations locally
translation-scanner_1  | i18next-scanner: Uploading ns: common, keys: 134
translation-scanner_1  | i18next-scanner: Upload Error 400 {"name":"SyntaxError","message":"Unexpected end of JSON input"}
translation-scanner_1  | i18next-scanner: Upload Finished
```
