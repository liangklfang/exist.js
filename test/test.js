'use strict';

const assert = require('assert');
const exist = require('..');

describe('exist', function() {
  it('should return `true` when property exists', function() {
    const company = {
      employees: [
        {
          name: 'Benjy',
        },
      ],
    };

    assert.strictEqual(exist(company.employees[0], 'name'), true);
    assert.strictEqual(exist(company.employees, '[0].name'), true);
    assert.strictEqual(exist(company, 'employees[0].name'), true);
  });

  it('should return `false` when property does not exist', function() {
    const company = {
      employees: [{}],
    };

    assert.strictEqual(exist(company.employees[0], 'name'), false);
    assert.strictEqual(exist(company.employees, '[1].name'), false);
    assert.strictEqual(exist(company, 'stockholders[0].name'), false);
  });

  it('should support Array as the second argument', function() {
    const company = {
      employees: [
        {
          name: 'Benjy',
        },
      ],
    };
    assert.strictEqual(exist(company, ['employees', '0', 'name']), true);
    assert.strictEqual(exist(company, ['stockholders', '0', 'name']), false);
  });
});

describe('exist#detect', function() {
  it('should return `true` when property exists', function() {
    const company = {
      employees: [
        {
          name: 'Benjy',
        },
      ],
    };

    assert.strictEqual(exist.detect(company.employees[0], 'name'), true);
    assert.strictEqual(exist.detect(company.employees, '[0].name'), true);
    assert.strictEqual(exist.detect(company, 'employees[0].name'), true);
  });

  it('should return `path` to the property which value is missing', function() {
    const company = {
      employees: [{}],
    };

    assert.deepEqual(exist.detect(company.employees[0], 'name'), ['name']);
    assert.deepEqual(exist.detect(company.employees, '[0].name'), ['0', 'name']);
    assert.deepEqual(exist.detect(company, 'stockholders[0].name'), ['stockholders']);
  });
});

describe('exist#get', function() {
  it('should return property when it exists', function() {
    const company = {
      employees: [
        {
          name: 'Benjy',
        },
      ],
    };

    assert.strictEqual(exist.get(company.employees[0], 'name'), 'Benjy');
    assert.strictEqual(exist.get(company.employees, '[0].name'), 'Benjy');
    assert.strictEqual(exist.get(company, 'employees[0].name'), 'Benjy');
  });

  it('should return `undefined` when property does not exist', function() {
    const company = {
      employees: [{}],
    };

    assert.strictEqual(exist.get(company.employees[0], 'name'), undefined);
    assert.strictEqual(exist.get(company.employees, '[1].name'), undefined);
    assert.strictEqual(exist.get(company, 'stockholders[0].name'), undefined);
  });

  it('should return default value when property does not exist and default value is provided', function() {
    const company = {
      employees: [{}],
    };

    assert.strictEqual(exist.get(company.employees[0], 'name', 'Baby'), 'Baby');
    assert.strictEqual(exist.get(company.employees, '[1].name', 'Baby'), 'Baby');
    assert.strictEqual(exist.get(company, 'stockholders[0].name', 'Baby'), 'Baby');
  });

  it('should support Array as the second argument', function() {
    const company = {
      employees: [
        {
          name: 'Benjy',
        },
      ],
    };
    assert.strictEqual(exist.get(company, ['employees', '0', 'name']), 'Benjy');
    assert.strictEqual(exist.get(company, ['stockholders', '0', 'name']), undefined);
    assert.strictEqual(exist.get(company, ['stockholders', '0', 'name'], 'Baby'), 'Baby');
  });
});

describe('exist#set', function() {
  it('should return `false` when property can not be set', function() {
    const company = {
      employees: [{}],
    };

    assert.strictEqual(exist.set(company.employees[1], 'name', 'Benjy'), false);
    assert.strictEqual(exist.set(company.stockholders, '[0].name', 'Benjy'), false);
  });

  it('should set value and return `true` when property was set', function() {
    const company = {
      employees: [{}],
    };

    assert.strictEqual(exist.set(company, 'employees[0].name', 'Benjy'), true);
    assert.strictEqual(company.employees[0].name, 'Benjy');
  });
  it('should support Array as the second argument', function() {
    const company = {
      employees: [{}],
    };
    assert.strictEqual(exist.set(company.stockholders, ['0', 'name'], 'Benjy'), false);
    assert.strictEqual(exist.set(company, ['employees', '0', 'name'], 'Benjy'), true);
    assert.strictEqual(company.employees[0].name, 'Benjy');
  });

  it('should create missing snippets while `createMissing=true`', function() {
    const company = {
      employees: [],
    };
    exist.set(company.employees, ['0', 'name'], 'Benjy', true);
    assert.strictEqual(company.employees[0].name, 'Benjy');

    const anotherCompany = {};
    exist.set(anotherCompany, ['stockholders', '0', 'name'], 'Benjy', true);
    assert.deepEqual(anotherCompany, {
      stockholders: {
        0: {
          name: 'Benjy',
        },
      },
    });
  });
});

describe('exist#invoke', function() {
  it('should return method when it exists', function() {
    const company = {
      employees: [
        {
          name: 'Benjy',
          getName: function() {
            return this.name;
          },
        },
      ],
    };

    assert.strictEqual(exist.invoke(company.employees[0], 'getName')(), 'Benjy');
    assert.strictEqual(exist.invoke(company.employees, '[0].getName')(), 'Benjy');
    assert.strictEqual(exist.invoke(company, 'employees[0].getName')(), 'Benjy');
  });

  it('should return `NOOP` when method does not exist', function() {
    const company = {
      employees: [{}],
    };
    const NOOP = function() {};

    assert.strictEqual(exist.invoke(company.employees[0], 'getName').toString(), NOOP.toString());
    assert.strictEqual(exist.invoke(company.employees, '[1].getName').toString(), NOOP.toString());
    assert.strictEqual(exist.invoke(company, 'stockholders[0].getName').toString(), NOOP.toString());
  });

  it('should return `NOOP` when property is not a function', function() {
    const company = {
      employees: [{
        getName: 'Benjy',
      }],
    };
    const NOOP = function() {};

    assert.strictEqual(exist.invoke(company.employees[0], 'getName').toString(), NOOP.toString());
    assert.strictEqual(exist.invoke(company.employees, '[1].getName').toString(), NOOP.toString());
    assert.strictEqual(exist.invoke(company, 'stockholders[0].getName').toString(), NOOP.toString());
  });

  it('should support Array as the second argument', function() {
    const company = {
      employees: [
        {
          name: 'Benjy',
          getName: function() {
            return this.name;
          },
        },
      ],
    };
    const NOOP = function() {};
    assert.strictEqual(exist.invoke(company, ['employees', '0', 'getName'])(), 'Benjy');
    assert.strictEqual(exist.invoke(company, ['stockholders', '0', 'getName']).toString(), NOOP.toString());
    assert.strictEqual(exist.invoke(company, ['employees', '0', 'name']).toString(), NOOP.toString());
  });
});
