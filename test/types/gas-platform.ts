export {};

// @ts-expect-error The GAS runtime has no Node process global.
process.cwd();
// @ts-expect-error The GAS runtime has no browser DOM.
document.createElement('div');
