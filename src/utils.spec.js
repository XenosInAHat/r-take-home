const assert = require('assert');
const utils = require('./utils.js');

describe('Utils', () => {
  describe('#getFilters', () => {
    it('should handle empty filters objects', () => {
      const filters = {};
      assert.deepStrictEqual(filters, utils.getFilters(filters));
    });

    it('should remove bad filters', () => {
      const filters = { badFilter: true, };
      assert.deepStrictEqual({}, utils.getFilters(filters));

      filters.age = '18-24';
      assert.deepStrictEqual({age: '18-24'}, utils.getFilters(filters));
    });

    it('should leave good filters alone', () => {
      const filters = { age: '18-24', sex: 'M' };
      assert.deepStrictEqual(filters, utils.getFilters(filters));
    });
  });

  describe('#validateFilters', () => {
    it('should return false for no value', () => {
      assert.strictEqual(false, utils.validateFilters({}));
    });

    it('should return true for good value', () => {
      assert.strictEqual(true, utils.validateFilters({age: '18-24'}));
    });

    it('should return false for bad value', () => {
      assert.strictEqual(false, utils.validateFilters({age: '$#$#@24'}));
    });
  });

  describe('#getSql', () => {
    it('should return an empty string for empty filters', () => {
      assert.strictEqual('', utils.getSql({}));
    });

    it('should build a SQL statement with a collection of filters', () => {
      const filters = {
        age: '65+',
        sex: 'F',
      };

      let expectedSql =
        `SELECT text
         FROM messages
         WHERE id IN
          (SELECT DISTINCT message_id
           FROM votes
           WHERE message_id NOT IN
             (SELECT DISTINCT message_id
              FROM votes
              WHERE user_id NOT IN
                (SELECT id
                 FROM users
                 WHERE age IN ('65+') AND sex IN ('F'))))`;

      // Replace all whitespace because they're formatted for readability
      assert.strictEqual(expectedSql.replace(/\s/g, ''),
        utils.getSql(filters).replace(/\s/g, ''));
    });
  });
});
