var mongomatch = require('./index.js');
var expect = require('chai').expect;

describe('mongomatch', function() {

  describe('empty query', function() {
    it('should match any number', function() {
      var query = {};

      var match = mongomatch(query, {
        a: 123
      });

      expect(match).to.be.true;
    });

    it('should match any string', function() {
      var query = {};

      var match = mongomatch(query, {
        a: 'blah blah blah'
      });

      expect(match).to.be.true;
    });

    it('should match any object', function() {
      var query = {};

      var match = mongomatch(query, {
        a: new Date()
      });

      expect(match).to.be.true;
    });
  });

  describe('regexp query', function() {
    it('should accept regex matches', function() {
      var query = {
        a: /^abc/
      };

      var match = mongomatch(query, {
        a: 'abcdef'
      });

      expect(match).to.be.true;
    });

    it('should reject bad regex matches', function() {
      var query = {
        a: /^abc$/
      };

      var match = mongomatch(query, {
        a: 'abcdef'
      });

      expect(match).to.be.false;
    });
  });

  describe('function query', function() {
    var startsWithA = function(str) { return str.substr(0, 1) === 'a'; };

    it('should accept function query', function() {
      var query = {
        a: startsWithA
      };

      var match = mongomatch(query, {
        a: 'abcdef'
      });

      expect(match).to.be.true;
    });

    it('should reject bad function query', function() {
      var query = {
        a: startsWithA
      };

      var match = mongomatch(query, {
        a: 'bcdef'
      });

      expect(match).to.be.false;
    });
  });

  describe('queries with single value against an array', function() {
    var query = {
      a: 5
    };

    it('should match values within an array if val is in array', function() {
      var match = mongomatch(query, {
        a: [1, 2, 3, 4, 5]
      });

      expect(match).to.be.true;
    });

    it('should not match values in array if not there', function() {
      var match = mongomatch(query, {
        a: [1, 2, 3, 4]
      });

      expect(match).to.be.false;
    });
  });

  describe('strict array queries against array', function() {
    var query = {
      a: [1, 2, 3]
    };

    it('should match when array positions match and array lengths are equal', function() {
      var match = mongomatch(query, {
        a: [1, 2, 3]
      });

      expect(match).to.be.true;
    });

    it('should match when array positions match and array lengths are not equal', function() {
      var match = mongomatch(query, {
        a: [1, 2, 3, 4]
      });

      expect(match).to.be.false;
    });

    it('should not match when array positions mismatch', function() {
      var match = mongomatch(query, {
        a: [1, 3, 2]
      });

      expect(match).to.be.false;
    });

    it('should not match when query is a superset of record', function() {
      var match = mongomatch(query, {
        a: [1, 2]
      });

      expect(match).to.be.false;
    });
  });

  describe('subset queries with array', function() {
    var query = {
      a: { $in: [1, 2, 3] }
    };

    it('should test for subset', function() {
      var match = mongomatch(query, {
        a: [1, 2, 3, 4, 5]
      });

      expect(match).to.be.true;
    });

    it('should not match when not a subset', function() {
      var match = mongomatch(query, {
        a: [1, 3, 5]
      });

      expect(match).to.be.false;
    });
  });

  describe('vanilla object queries', function() {
    var query = {
      a: 'a string',
      b: 'b string',
      c: 2
    };

    it('should match when record is the same', function() {
      var match = mongomatch(query, {
        a: 'a string',
        b: 'b string',
        c: 2
      });

      expect(match).to.be.true;
    });

    it('should not match when record is different', function() {
      var match = mongomatch(query, {
        a: 'a string',
        b: 'not a bstring'
      });

      expect(match).to.be.false;
    });

    it('should not match when record is a subset of query', function() {
      var match = mongomatch(query, {
        a: 'a string'
      });

      expect(match).to.be.false;
    });

    it('should match when query is a subset of record', function() {
      var match = mongomatch(query, {
        a: 'a string',
        b: 'b string',
        c: 2,
        d: 3
      });

      expect(match).to.be.true;
    });
  });

  describe('lt/gt query', function() {
    var lt = {
      a: { $lt: 5 }
    };

    it('should accept lesser values', function() {
      var query = lt;

      var match = mongomatch(query, {
        a: 4
      });

      expect(match).to.be.true;
    });

    it('should reject larger values', function() {
      var query = lt;

      var match = mongomatch(query, {
        a: 5
      });

      expect(match).to.be.false;
    });

    var gt = {
      a: { $gt: 5 }
    };

    it('should accept larger values', function() {
      var query = gt;

      var match = mongomatch(query, {
        a: 6
      });

      expect(match).to.be.true;
    });

    it('should reject smaller values', function() {
      var query = gt;

      var match = mongomatch(query, {
        a: 5
      });

      expect(match).to.be.false;
    });
  });

  describe('deep object query', function() {

    describe('deep object equality', function() {
      var query = {
        a: { b: 2 }
      };

      it('should match deep objects', function() {
        var match = mongomatch(query, {
          a: { b: 2 }
        });

        expect(match).to.be.true;
      });

      it('should not match when deep objects are not equivalent', function() {
        var match = mongomatch(query, {
          a: { b: 3 }
        });

        expect(match).to.be.false;
      });

    });

    describe('deep object regex', function() {
      var query = {
        a: { b: /abc/ }
      };

      it('should match when regex matches', function() {
        var match = mongomatch(query, {
          a: { b: 'abcdef' }
        });

        expect(match).to.be.true;
      });

      it('should not match when regex mismatches', function() {
        var match = mongomatch(query, {
          a: { b: 'absurprise!' }
        });

        expect(match).to.be.false;
      });

    });

    describe('deep array match', function() {

      it('should check for subset of an array with single value', function() {
        var query = {
          a: { e: 3 }
        };

        var match = mongomatch(query, {
          a: { e: [1, 2, 3] }
        });

        expect(match).to.be.true;
      });

      it('should check for subset of an array with multiple values', function() {
        var query = {
          a: { e: { $in: [2, 3] } }
        };

        var match = mongomatch(query, {
          a: { e: [1, 2, 3] }
        });

        expect(match).to.be.true;
      });

      it('should reject non-subsets of an array with single value', function() {
        var query = {
          a: { e: 25 }
        };

        var match = mongomatch(query, {
          a: { e: [1, 2, 3] }
        });

        expect(match).to.be.false;
      });

      it('should reject non-subsets of an array with multiple values', function() {
        var query = {
          a: { e: { $in: [2, 4] } }
        };

        var match = mongomatch(query, {
          a: { e: [1, 2, 3] }
        });

        expect(match).to.be.false;
      });
    });


  });

});
