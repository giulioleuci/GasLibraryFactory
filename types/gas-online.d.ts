// Code.js flattens the public barrel exports onto the GAS global object.
// Native CacheService, PropertiesService, and LockService declarations stay native;
// online tests resolve their runtime wrapper constructors through local aliases.
declare const LoggerService: typeof import('@CoreUtilsLib').LoggerService;
declare const UtilsService: typeof import('@CoreUtilsLib').UtilsService;
declare const ExceptionService: typeof import('@GasResilienceLib').ExceptionService;
declare const UtilitiesService: typeof import('@GoogleApiWrapper').UtilitiesService;
declare const DocumentService: typeof import('@GoogleApiWrapper').DocumentService;
declare const DriveService: typeof import('@GoogleApiWrapper').DriveService;
declare const PermissionService: typeof import('@GoogleApiWrapper').PermissionService;
declare const SpreadsheetService: typeof import('@GoogleApiWrapper').SpreadsheetService;
declare const MailService: typeof import('@GoogleApiWrapper').MailService;
declare const TriggerService: typeof import('@GoogleApiWrapper').TriggerService;
declare const ServiceFactory: typeof import('@GoogleApiWrapper').ServiceFactory;
declare const runner: typeof import('@GasOnlineTestFramework').runner;
declare const SmartAssert: typeof import('@GasOnlineTestFramework').SmartAssert;
declare const testContext: typeof import('@GasOnlineTestFramework').testContext;
