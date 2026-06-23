// ===================================================================
// FILE: DomainRepositoryLib/src/__tests__/integration/EntityValueObjectMapping.test.js
// ===================================================================
// Integration Test 10: Entity-ValueObject Mapping
// Verifies that EntityMapper serializes nested ValueObjects to flat primitives
// ===================================================================

import { Entity } from '../../Entity.js';
import { ValueObject } from '../../ValueObject.js';
import { EntityMapper } from '../../internal/mapping/EntityMapper.js';

/**
 * Test Scenario: Entity-ValueObject Mapping
 *
 * Layers Involved:
 * - Application: DomainRepositoryLib (EntityMapper, ValueObject)
 * - Persistence: SheetDBLib (DatabaseService)
 *
 * Objective:
 * Verify that when persisting Entities with nested ValueObjects,
 * the EntityMapper correctly flattens them into primitive fields
 * that SheetDBLib can store in spreadsheet columns.
 */

describe('Integration Test 10: Entity-ValueObject Mapping', () => {
  let entityMapper;
  let mockLogger;

  // Test ValueObjects
  class Address extends ValueObject {
    constructor(street, city, zip) {
      super();
      this.street = street;
      this.city = city;
      this.zip = zip;
      this._freeze();
    }

    getValue() {
      return { street: this.street, city: this.city, zip: this.zip };
    }

    equals(other) {
      return this.street === other.street && this.city === other.city && this.zip === other.zip;
    }
  }

  class ContactInfo extends ValueObject {
    constructor(phone, fax) {
      super();
      this.phone = phone;
      this.fax = fax;
      this._freeze();
    }

    getValue() {
      return { phone: this.phone, fax: this.fax };
    }

    equals(other) {
      return this.phone === other.phone && this.fax === other.fax;
    }
  }

  // Test Entity
  class Company extends Entity {
    constructor(data = {}) {
      super(data);
      this.name = data.name || null;
      this.address = data.address || null;
      this.contactInfo = data.contactInfo || null;
    }

    toData() {
      const data = {
        id: this.id,
        name: this.name,
        createdAt: this.createdAt.toISOString(),
        updatedAt: this.updatedAt.toISOString()
      };

      // Flatten Address ValueObject
      if (this.address) {
        data.address_street = this.address.street;
        data.address_city = this.address.city;
        data.address_zip = this.address.zip;
      } else {
        data.address_street = null;
        data.address_city = null;
        data.address_zip = null;
      }

      // Flatten ContactInfo ValueObject
      if (this.contactInfo) {
        data.contactInfo_phone = this.contactInfo.phone;
        data.contactInfo_fax = this.contactInfo.fax;
      } else {
        data.contactInfo_phone = null;
        data.contactInfo_fax = null;
      }

      return data;
    }

    static fromData(data) {
      const companyData = { ...data };

      // Reconstruct Address ValueObject
      if (data.address_street || data.address_city || data.address_zip) {
        companyData.address = new Address(data.address_street, data.address_city, data.address_zip);
      }

      // Reconstruct ContactInfo ValueObject
      if (data.contactInfo_phone || data.contactInfo_fax) {
        companyData.contactInfo = new ContactInfo(data.contactInfo_phone, data.contactInfo_fax);
      }

      return new Company(companyData);
    }
  }

  beforeEach(() => {
    mockLogger = global.mockLoggerService();
    entityMapper = new EntityMapper(mockLogger);
  });

  describe('ValueObject Serialization', () => {
    test('should flatten nested ValueObject to prefixed columns', () => {
      // Arrange: Entity with Address ValueObject
      const address = new Address('123 Business Ave', 'Metro City', '99999');
      const company = new Company({
        id: 'comp_1',
        name: 'Acme Corp',
        address: address
      });

      // Act: Serialize Entity
      const data = entityMapper.toData(company);

      // Assert: Verify output has address_street, address_city, address_zip
      expect(data.address_street).toBe('123 Business Ave');
      expect(data.address_city).toBe('Metro City');
      expect(data.address_zip).toBe('99999');
      expect(data.address).toBeUndefined(); // Not a flat primitive
    });

    test('should handle multiple nested ValueObjects', () => {
      // Arrange: Entity with Address and ContactInfo ValueObjects
      const address = new Address('456 Corporate Blvd', 'Tech City', '88888');
      const contactInfo = new ContactInfo('555-1234', '555-5678');
      const company = new Company({
        id: 'comp_2',
        name: 'TechCo',
        address: address,
        contactInfo: contactInfo
      });

      // Act: Serialize Entity
      const data = entityMapper.toData(company);

      // Assert: Verify both are flattened correctly
      expect(data.address_street).toBe('456 Corporate Blvd');
      expect(data.address_city).toBe('Tech City');
      expect(data.address_zip).toBe('88888');
      expect(data.contactInfo_phone).toBe('555-1234');
      expect(data.contactInfo_fax).toBe('555-5678');
    });

    test('should preserve primitive fields during flattening', () => {
      // Arrange
      const company = new Company({
        id: 'comp_3',
        name: 'Simple Corp'
      });

      // Act: Serialize Entity
      const data = entityMapper.toData(company);

      // Assert: Verify non-ValueObject fields remain unchanged
      expect(data.id).toBe('comp_3');
      expect(data.name).toBe('Simple Corp');
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });
  });

  describe('ValueObject Deserialization', () => {
    test('should reconstruct ValueObject from flat columns', () => {
      // Arrange: Load flat data
      const flatData = {
        id: 'comp_4',
        name: 'Rebuild Corp',
        address_street: '789 Main St',
        address_city: 'Old Town',
        address_zip: '11111',
        contactInfo_phone: null,
        contactInfo_fax: null,
        createdAt: '2025-01-20T00:00:00Z',
        updatedAt: '2025-01-20T00:00:00Z'
      };

      // Act: Deserialize to Entity
      const company = entityMapper.fromData(flatData, Company);

      // Assert: Verify ValueObject is reconstructed
      expect(company).toBeInstanceOf(Company);
      expect(company.address).toBeInstanceOf(Address);
      expect(company.address.street).toBe('789 Main St');
      expect(company.address.city).toBe('Old Town');
      expect(company.address.zip).toBe('11111');
    });

    test('should handle null ValueObjects', () => {
      // Arrange: Flat data with null ValueObject fields
      const flatData = {
        id: 'comp_5',
        name: 'No Address Corp',
        address_street: null,
        address_city: null,
        address_zip: null,
        contactInfo_phone: null,
        contactInfo_fax: null,
        createdAt: '2025-01-20T00:00:00Z',
        updatedAt: '2025-01-20T00:00:00Z'
      };

      // Act: Deserialize
      const company = entityMapper.fromData(flatData, Company);

      // Assert: Verify null handling
      expect(company.address).toBeNull();
      expect(company.contactInfo).toBeNull();
    });
  });

  describe('Round-Trip Serialization', () => {
    test('should maintain data integrity through serialize-deserialize cycle', () => {
      // Arrange: Original entity
      const address = new Address('Original St', 'Original City', '00000');
      const contactInfo = new ContactInfo('111-2222', '333-4444');
      const originalCompany = new Company({
        id: 'comp_6',
        name: 'Round Trip Corp',
        address: address,
        contactInfo: contactInfo
      });

      // Act: Serialize then deserialize
      const serialized = entityMapper.toData(originalCompany);
      const deserialized = entityMapper.fromData(serialized, Company);

      // Assert: Verify data integrity
      expect(deserialized.id).toBe(originalCompany.id);
      expect(deserialized.name).toBe(originalCompany.name);
      expect(deserialized.address.street).toBe(address.street);
      expect(deserialized.address.city).toBe(address.city);
      expect(deserialized.address.zip).toBe(address.zip);
      expect(deserialized.contactInfo.phone).toBe(contactInfo.phone);
      expect(deserialized.contactInfo.fax).toBe(contactInfo.fax);
    });
  });

  describe('ValueObject Equality', () => {
    test('should correctly compare ValueObjects using equals()', () => {
      // Arrange
      const address1 = new Address('Same St', 'Same City', '12345');
      const address2 = new Address('Same St', 'Same City', '12345');
      const address3 = new Address('Different St', 'Same City', '12345');

      // Act & Assert
      expect(address1.equals(address2)).toBe(true);
      expect(address1.equals(address3)).toBe(false);
    });

    test('should verify ValueObject immutability', () => {
      // Arrange
      const address = new Address('Frozen St', 'Frozen City', '99999');

      // Act & Assert: Verify object is frozen
      expect(Object.isFrozen(address)).toBe(true);

      // Attempt to modify frozen object should throw in strict mode
      expect(() => {
        'use strict';
        address.street = 'Modified St';
      }).toThrow(TypeError);

      // Verify value did not change
      expect(address.street).toBe('Frozen St');
    });
  });
});
