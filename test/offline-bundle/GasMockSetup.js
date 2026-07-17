/**
 * GasMockSetup - GAS Global Mocks for Offline Test Bundle
 *
 * Port of test/setup.js but without jest.fn() dependency.
 * Uses the JestCompat mock function instead.
 *
 * Sets up all Google Apps Script global objects needed for
 * offline tests to run in the GAS V8 environment.
 */

import { jest } from './JestCompat.js';

// ─── Utilities ─────────────────────────────────────────────────────────────────

var uuidCounter = 0;

if (typeof global.Utilities === 'undefined') {
  global.Utilities = {
    sleep: jest.fn(function () {}),

    getUuid: jest.fn(function () {
      uuidCounter++;
      return 'test-uuid-' + String(uuidCounter).padStart(4, '0');
    }),

    formatDate: jest.fn(function (date, timezone, format) {
      if (!(date instanceof Date)) throw new Error('Invalid date');
      if (!format) format = 'yyyy-MM-dd';
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, '0');
      var day = String(date.getDate()).padStart(2, '0');
      var hours = String(date.getHours()).padStart(2, '0');
      var minutes = String(date.getMinutes()).padStart(2, '0');
      var seconds = String(date.getSeconds()).padStart(2, '0');
      return format
        .replace('yyyy', year)
        .replace('MM', month)
        .replace('dd', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    }),

    base64Encode: jest.fn(function (data) {
      if (typeof data === 'string') {
        if (typeof btoa === 'function') return btoa(data);
        return data;
      }
      return String(data);
    }),

    base64Decode: jest.fn(function (encoded) {
      if (typeof atob === 'function') return atob(encoded);
      return encoded;
    }),

    parseCsv: jest.fn(function (csvString) {
      if (!csvString) return [];
      return csvString.split('\n').map(function (line) {
        return line.split(',');
      });
    }),

    computeDigest: jest.fn(function (algorithm, value) {
      var hash = 0;
      for (var i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
      }
      var bytes = [hash & 0xff, (hash >> 8) & 0xff, (hash >> 16) & 0xff, (hash >> 24) & 0xff];
      // Simulate longer hashes for SHA-256 by padding with zeros if needed
      if (algorithm === 'SHA_256') {
        while (bytes.length < 32) bytes.push(0);
      }
      return bytes;
    }),

    DigestAlgorithm: {
      MD5: 'MD5',
      SHA_1: 'SHA_1',
      SHA_256: 'SHA_256',
      SHA_384: 'SHA_384',
      SHA_512: 'SHA_512'
    },

    Charset: {
      UTF_8: 'UTF_8',
      US_ASCII: 'US_ASCII'
    }
  };
}

// ─── Session ───────────────────────────────────────────────────────────────────

if (typeof global.Session === 'undefined') {
  global.Session = {
    getActiveUser: jest.fn(function () {
      return {
        getEmail: function () {
          return 'test@example.com';
        }
      };
    }),
    getEffectiveUser: jest.fn(function () {
      return {
        getEmail: function () {
          return 'test@example.com';
        }
      };
    }),
    getScriptTimeZone: jest.fn(function () {
      return 'Europe/Rome';
    }),
    getTemporaryActiveUserKey: jest.fn(function () {
      return 'temp-user-key-123';
    })
  };
}

// ─── Logger ────────────────────────────────────────────────────────────────────

if (typeof global.Logger === 'undefined') {
  global.Logger = {
    log: function (msg) {
      if (typeof console !== 'undefined') {
        console.log(msg);
      }
    },
    clear: function () {}
  };
}

// ─── CacheService ──────────────────────────────────────────────────────────────

if (typeof global.CacheService === 'undefined') {
  var cacheStores = {};

  function createCacheStore(name) {
    if (!cacheStores[name]) cacheStores[name] = {};
    var store = cacheStores[name];
    return {
      get: jest.fn(function (key) {
        return store[key] || null;
      }),
      put: jest.fn(function (key, value) {
        store[key] = String(value);
      }),
      remove: jest.fn(function (key) {
        delete store[key];
      }),
      removeAll: jest.fn(function (keys) {
        if (keys)
          keys.forEach(function (k) {
            delete store[k];
          });
      }),
      getAll: jest.fn(function (keys) {
        var result = {};
        keys.forEach(function (k) {
          if (store[k]) result[k] = store[k];
        });
        return result;
      }),
      putAll: jest.fn(function (values) {
        Object.keys(values).forEach(function (k) {
          store[k] = String(values[k]);
        });
      })
    };
  }

  global.CacheService = {
    getScriptCache: jest.fn(function () {
      return createCacheStore('script');
    }),
    getUserCache: jest.fn(function () {
      return createCacheStore('user');
    }),
    getDocumentCache: jest.fn(function () {
      return createCacheStore('document');
    })
  };
}

// ─── PropertiesService ─────────────────────────────────────────────────────────

if (typeof global.PropertiesService === 'undefined') {
  var propStores = {};

  function createPropertyStore(name) {
    if (!propStores[name]) propStores[name] = {};
    var store = propStores[name];
    return {
      getProperty: jest.fn(function (key) {
        return store[key] || null;
      }),
      setProperty: jest.fn(function (key, value) {
        store[key] = String(value);
      }),
      deleteProperty: jest.fn(function (key) {
        delete store[key];
      }),
      getProperties: jest.fn(function () {
        return Object.assign({}, store);
      }),
      setProperties: jest.fn(function (props) {
        Object.keys(props).forEach(function (k) {
          store[k] = String(props[k]);
        });
      }),
      deleteAllProperties: jest.fn(function () {
        Object.keys(store).forEach(function (k) {
          delete store[k];
        });
      })
    };
  }

  global.PropertiesService = {
    getScriptProperties: jest.fn(function () {
      return createPropertyStore('script');
    }),
    getUserProperties: jest.fn(function () {
      return createPropertyStore('user');
    }),
    getDocumentProperties: jest.fn(function () {
      return createPropertyStore('document');
    })
  };
}

// ─── LockService ───────────────────────────────────────────────────────────────

if (typeof global.LockService === 'undefined') {
  function createLock() {
    var locked = false;
    return {
      tryLock: jest.fn(function () {
        if (!locked) {
          locked = true;
          return true;
        }
        return false;
      }),
      waitLock: jest.fn(function () {
        locked = true;
      }),
      releaseLock: jest.fn(function () {
        locked = false;
      }),
      hasLock: jest.fn(function () {
        return locked;
      })
    };
  }

  global.LockService = {
    getScriptLock: jest.fn(createLock),
    getUserLock: jest.fn(createLock),
    getDocumentLock: jest.fn(createLock)
  };
}

// ─── ScriptApp ─────────────────────────────────────────────────────────────────

if (typeof global.ScriptApp === 'undefined') {
  var triggers = [];

  global.ScriptApp = {
    newTrigger: jest.fn(function (functionName) {
      var trigger = {
        _functionName: functionName,
        _type: 'timeBased',
        timeBased: function () {
          return trigger;
        },
        everyMinutes: function () {
          return trigger;
        },
        everyHours: function () {
          return trigger;
        },
        atHour: function () {
          return trigger;
        },
        nearMinute: function () {
          return trigger;
        },
        everyDays: function () {
          return trigger;
        },
        everyWeeks: function () {
          return trigger;
        },
        onWeekDay: function () {
          return trigger;
        },
        at: function () {
          return trigger;
        },
        after: function () {
          return trigger;
        },
        create: function () {
          var t = {
            getUniqueId: function () {
              return 'trigger-' + triggers.length;
            },
            getHandlerFunction: function () {
              return functionName;
            },
            getTriggerSource: function () {
              return ScriptApp.TriggerSource.CLOCK;
            },
            getEventType: function () {
              return ScriptApp.EventType.CLOCK;
            }
          };
          triggers.push(t);
          return t;
        }
      };
      return trigger;
    }),
    deleteTrigger: jest.fn(function (trigger) {
      var idx = triggers.indexOf(trigger);
      if (idx !== -1) triggers.splice(idx, 1);
    }),
    getProjectTriggers: jest.fn(function () {
      return triggers.slice();
    }),
    EventType: {
      CLOCK: 'CLOCK',
      ON_OPEN: 'ON_OPEN',
      ON_EDIT: 'ON_EDIT',
      ON_FORM_SUBMIT: 'ON_FORM_SUBMIT'
    },
    TriggerSource: { SPREADSHEETS: 'SPREADSHEETS', CLOCK: 'CLOCK', FORMS: 'FORMS' },
    WeekDay: {
      SUNDAY: 1,
      MONDAY: 2,
      TUESDAY: 3,
      WEDNESDAY: 4,
      THURSDAY: 5,
      FRIDAY: 6,
      SATURDAY: 7
    },
    getScriptId: jest.fn(function () {
      return 'test-script-id';
    })
  };
}

// ─── SpreadsheetApp ────────────────────────────────────────────────────────────

if (typeof global.SpreadsheetApp === 'undefined') {
  global.SpreadsheetApp = {
    getActiveSpreadsheet: jest.fn(function () {
      return null;
    }),
    openById: jest.fn(function () {
      return null;
    }),
    getUi: jest.fn(function () {
      return {
        createMenu: jest.fn(function () {
          return {
            addItem: jest.fn().mockReturnThis(),
            addSeparator: jest.fn().mockReturnThis(),
            addSubMenu: jest.fn().mockReturnThis(),
            addToUi: jest.fn()
          };
        }),
        showSidebar: jest.fn(),
        showModalDialog: jest.fn(),
        showModelessDialog: jest.fn(),
        alert: jest.fn(),
        prompt: jest.fn()
      };
    }),
    create: jest.fn(function (name) {
      return {
        getId: function () {
          return 'ss-' + name;
        },
        getName: function () {
          return name;
        }
      };
    })
  };
}

// ─── Sheets API (Advanced Service) ─────────────────────────────────────────────

if (typeof global.Sheets === 'undefined') {
  global.Sheets = {
    Spreadsheets: {
      Values: {
        batchGet: jest.fn(function () {
          return { valueRanges: [] };
        }),
        batchUpdate: jest.fn(function () {
          return { responses: [] };
        }),
        get: jest.fn(function () {
          return { values: [] };
        }),
        update: jest.fn(function () {
          return {};
        }),
        append: jest.fn(function () {
          return {};
        }),
        clear: jest.fn(function () {
          return {};
        })
      },
      get: jest.fn(function () {
        return { sheets: [] };
      }),
      batchUpdate: jest.fn(function () {
        return { replies: [] };
      })
    }
  };
}

// ─── DriveApp ──────────────────────────────────────────────────────────────────

if (typeof global.DriveApp === 'undefined') {
  global.DriveApp = {
    getFileById: jest.fn(function () {
      return {
        getId: jest.fn(function () {
          return 'file-id';
        }),
        getName: jest.fn(function () {
          return 'test-file';
        }),
        setTrashed: jest.fn(),
        getBlob: jest.fn(function () {
          return {
            getDataAsString: function () {
              return '';
            }
          };
        }),
        makeCopy: jest.fn()
      };
    }),
    getFolderById: jest.fn(function () {
      return {
        getId: jest.fn(function () {
          return 'folder-id';
        }),
        getName: jest.fn(function () {
          return 'test-folder';
        }),
        setTrashed: jest.fn(),
        createFolder: jest.fn(),
        getFiles: jest.fn(function () {
          return {
            hasNext: function () {
              return false;
            }
          };
        })
      };
    }),
    createFolder: jest.fn(function (name) {
      return {
        getId: function () {
          return 'folder-' + name;
        },
        getName: function () {
          return name;
        }
      };
    }),
    Access: {
      ANYONE: 'ANYONE',
      ANYONE_WITH_LINK: 'ANYONE_WITH_LINK',
      DOMAIN: 'DOMAIN',
      PRIVATE: 'PRIVATE'
    },
    Permission: {
      VIEW: 'VIEW',
      COMMENT: 'COMMENT',
      EDIT: 'EDIT',
      OWNER: 'OWNER',
      ORGANIZER: 'ORGANIZER',
      NONE: 'NONE'
    }
  };
}

// ─── Drive API (Advanced Service) ──────────────────────────────────────────────

if (typeof global.Drive === 'undefined') {
  global.Drive = {
    Files: {
      get: jest.fn(function () {
        return {};
      }),
      list: jest.fn(function () {
        return { items: [], files: [] };
      }),
      insert: jest.fn(function () {
        return { id: 'new-file-id' };
      }),
      update: jest.fn(function () {
        return {};
      }),
      remove: jest.fn(),
      copy: jest.fn(function () {
        return { id: 'copy-id' };
      })
    },
    Permissions: {
      insert: jest.fn(),
      list: jest.fn(function () {
        return { items: [] };
      }),
      remove: jest.fn()
    }
  };
}

// ─── DocumentApp ───────────────────────────────────────────────────────────────

if (typeof global.DocumentApp === 'undefined') {
  global.DocumentApp = {
    openById: jest.fn(function () {
      return null;
    }),
    create: jest.fn(function (name) {
      return {
        getId: function () {
          return 'doc-' + name;
        },
        getName: function () {
          return name;
        },
        getBody: function () {
          return {
            getText: function () {
              return '';
            }
          };
        }
      };
    }),
    ElementType: {
      BODY_SECTION: 'BODY_SECTION',
      PARAGRAPH: 'PARAGRAPH',
      TEXT: 'TEXT',
      TABLE: 'TABLE',
      TABLE_ROW: 'TABLE_ROW',
      TABLE_CELL: 'TABLE_CELL',
      LIST_ITEM: 'LIST_ITEM',
      INLINE_IMAGE: 'INLINE_IMAGE',
      HORIZONTAL_RULE: 'HORIZONTAL_RULE',
      PAGE_BREAK: 'PAGE_BREAK'
    },
    GlyphType: {
      BULLET: 'BULLET',
      HOLLOW_BULLET: 'HOLLOW_BULLET',
      SQUARE_BULLET: 'SQUARE_BULLET',
      NUMBER: 'NUMBER',
      LATIN_UPPER: 'LATIN_UPPER',
      LATIN_LOWER: 'LATIN_LOWER',
      ROMAN_UPPER: 'ROMAN_UPPER',
      ROMAN_LOWER: 'ROMAN_LOWER'
    }
  };
}

// ─── GmailApp ──────────────────────────────────────────────────────────────────

if (typeof global.GmailApp === 'undefined') {
  global.GmailApp = {
    sendEmail: jest.fn(),
    createDraft: jest.fn(function () {
      return {
        getId: function () {
          return 'draft-id';
        }
      };
    }),
    search: jest.fn(function () {
      return [];
    }),
    getRemainingDailyQuota: jest.fn(function () {
      return 100;
    })
  };
}

// ─── Gmail API (Advanced Service) ──────────────────────────────────────────────

if (typeof global.Gmail === 'undefined') {
  global.Gmail = {
    Users: {
      Messages: {
        send: jest.fn(function () {
          return { id: 'msg-id' };
        }),
        get: jest.fn(function () {
          return {};
        }),
        list: jest.fn(function () {
          return { messages: [] };
        })
      },
      Drafts: {
        create: jest.fn(function () {
          return { id: 'draft-id' };
        }),
        get: jest.fn(function () {
          return {};
        }),
        list: jest.fn(function () {
          return { drafts: [] };
        })
      },
      Labels: {
        list: jest.fn(function () {
          return { labels: [] };
        }),
        get: jest.fn(function () {
          return {};
        }),
        create: jest.fn(function () {
          return { id: 'label-id' };
        })
      },
      Threads: {
        list: jest.fn(function () {
          return { threads: [] };
        }),
        get: jest.fn(function () {
          return {};
        })
      }
    }
  };
}

// ─── UrlFetchApp ───────────────────────────────────────────────────────────────

if (typeof global.UrlFetchApp === 'undefined') {
  global.UrlFetchApp = {
    fetch: jest.fn(function () {
      return {
        getContentText: function () {
          return '{}';
        },
        getResponseCode: function () {
          return 200;
        },
        getHeaders: function () {
          return {};
        }
      };
    }),
    fetchAll: jest.fn(function (requests) {
      return requests.map(function () {
        return {
          getContentText: function () {
            return '{}';
          },
          getResponseCode: function () {
            return 200;
          },
          getHeaders: function () {
            return {};
          }
        };
      });
    })
  };
}

// ─── HtmlService ───────────────────────────────────────────────────────────────

if (typeof global.HtmlService === 'undefined') {
  global.HtmlService = {
    createHtmlOutput: jest.fn(function (html) {
      return {
        setTitle: function () {
          return this;
        },
        setWidth: function () {
          return this;
        },
        setHeight: function () {
          return this;
        },
        getContent: function () {
          return html || '';
        }
      };
    }),
    createTemplateFromFile: jest.fn(function () {
      return {
        evaluate: function () {
          return HtmlService.createHtmlOutput('');
        }
      };
    })
  };
}

// ─── ContentService ────────────────────────────────────────────────────────────

if (typeof global.ContentService === 'undefined') {
  global.ContentService = {
    MimeType: { JSON: 'application/json', TEXT: 'text/plain' },
    createTextOutput: jest.fn(function (text) {
      return {
        setMimeType: function () {
          return this;
        },
        getContent: function () {
          return text || '';
        }
      };
    })
  };
}

// ─── Reset Helper ──────────────────────────────────────────────────────────────

/**
 * Resets all GAS mocks to a clean state.
 * Call between test files to prevent state leakage.
 */
export function resetGasMocks() {
  uuidCounter = 0;
  cacheStores = {};
  propStores = {};
  triggers = [];
  jest.clearAllMocks();
}

global.resetGasMocks = resetGasMocks;
