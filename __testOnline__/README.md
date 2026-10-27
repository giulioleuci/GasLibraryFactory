# Online Google API boundary tests

Online tests cover the lowest layer that talks to real Google services. They run
in Google Apps Script against the compiled bundle. Unit tests and integration
tests of the libraries run locally with Jest, mocks, and fakes.

## What belongs online

Keep a test online when its result depends on Google behavior that a fake cannot
establish: API request/response contracts, real persistence, server-side formula
evaluation, document structure and formatting, permissions, trigger creation,
locks, or native Utilities behavior.

Creating a real spreadsheet or document does not by itself justify an online
test. If the assertion concerns application logic built on an already tested API
boundary, exercise that logic offline with a mock or fake.

The remaining suite contains **28 tests**:

| Service                          | Tests | Google behavior checked                                                               |
| -------------------------------- | ----: | ------------------------------------------------------------------------------------- |
| DriveService / PermissionService |     7 | Native app access, file and folder lifecycle, searches, metadata, permissions         |
| DocumentService                  |     2 | Content, tables, headers, footers, lists, images, and clearing content                |
| SpreadsheetService               |     8 | Sheet lifecycle, formulas, formatting, protections, native range and sheet operations |
| MailService                      |     3 | Draft creation, sending with attachments, remaining quota                             |
| PropertiesService                |     2 | Script, user, and container-bound document property storage                           |
| CacheService                     |     3 | Script and user caches, bulk operations, larger values, expiration                    |
| UtilitiesService                 |     1 | Native UUID generation, date and string formatting                                    |
| TriggerService                   |     1 | Creating, listing, and deleting triggers                                              |
| LockService                      |     1 | Acquiring and releasing a script lock                                                 |

Native operations reached through `getStandardApp()` or `openStandard()` remain
online too: these escape hatches expose Google objects whose behavior matters to
the libraries using them.

## What belongs offline

The following need no real Google interaction once the underlying API boundary
has been checked:

- Logging, validation, parsing, serialization, and error classification.
- Expressions, templates, composition, role resolution, and context assembly.
- SheetDB queries, repositories, entity mapping, and import transformations.
- Job and pipeline orchestration, retry decisions, and cross-library scenarios.

These are covered by the libraries' `__tests__/` directories and
[`test/__tests__/integration/`](../test/__tests__/integration/).

Two redundant online cases were removed:

| Removed online case                            | Existing offline coverage                                                                                                                                                                                      |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GoogleApiWrapper/LoggerService/BasicLogging`  | [`LoggerService.test.js`](../CoreUtilsLib/src/__tests__/LoggerService.test.js) checks all log levels and emitted messages                                                                                      |
| `GoogleApiWrapper/PropertiesService/DataTypes` | [`PropertiesService.test.js`](../GoogleApiWrapper/src/services/__tests__/PropertiesService.test.js) checks string storage, JSON serialization, nested objects, and complex preferences with an in-memory store |

The script-property round trip remains online in `BasicOperations`; repeating
that round trip with a JSON string adds serialization checks that belong offline.

## Files

```text
GoogleApiWrapper/__testOnline__/
  GoogleApiWrapperTests.gs             Registration and dependency setup
  GoogleApiWrapperTests_Drive.gs       Drive and permission API tests
  GoogleApiWrapperTests_Docs.gs        Docs API tests
  GoogleApiWrapperTests_Sheets.gs      Sheets API tests
  GoogleApiWrapperTests_Gmail.gs       Gmail and Mail API tests
  GoogleApiWrapperTests_Services.gs    Properties, cache, Utilities, triggers, locks
__testOnline__/
  MasterTestRunner.gs                  GAS entry points
```

`runner`, `SmartAssert`, and `testContext` come from the bundled
[`GasOnlineTestFramework`](../GasOnlineTestFramework/README.md). The old shared
helpers and the documentation for the removed online integration suites have
been removed because the remaining tests do not use them.

## Run locally

```bash
npm test                       # Unit and integration tests with mocks/fakes
npm run test:integration        # Integration subset
npm run build:testoffline      # Build, source tests, and compiled-bundle checks
```

The bundle checks require a built `dist/Code.js`. `build:testoffline` rebuilds it
and applies the GAS compatibility patches before running those checks. They
verify loading, exports, smoke cases, and compatibility patches locally; they do
not execute the Google APIs.

## Run in Google Apps Script

```bash
npm run push:testing            # Build the bundle and copy/deploy the .gs tests
clasp open
```

Run one of these functions in the Apps Script editor:

```javascript
runAllOnlineTests();
runTests('GoogleApiWrapper/DriveService');
runTests('GoogleApiWrapper/SpreadsheetService');
runTests('GoogleApiWrapper/CacheService');
listAvailableTestRunners();
```

The build copies six GoogleApiWrapper test files plus the master runner to
`dist/`. No manual copying is needed. Keep the required advanced Google services
and OAuth scopes enabled as configured by `appsscript.json`.

The tests use a persistent `GAS_TEST_ROOT_PERSISTENT` folder and spreadsheet
managed by `testContext`, plus temporary files. The mail tests send a message to
the effective user and create a draft; the permission test temporarily enables
link sharing on its test file. Document properties are exercised only when the
script is container-bound.

Passing this suite establishes the real API behavior on which offline mocks and
fakes rely. Library logic must still pass its offline tests. When a wrapper or
its Google contract changes, update both the boundary test and the corresponding
offline doubles.
