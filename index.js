var _ = require('lodash');

module.exports = function mongomatch(query, record) {
  if (!_.isObject(query)) {
    throw new Error('query must be an object');
  }

  if (_.isEmpty(record)) {
    return true;
  }

  return _.every(_.pairs(query), function(prop) {
    var queryKey = prop[0],
      queryValue = prop[1];

    if (_.isRegExp(queryValue)) {
      return queryValue.test(record[queryKey]);
    }

    if (_.isFunction(queryValue)) {
      return queryValue.call(this, record[queryKey]);
    }

    // match exact array positions
    if (_.isArray(queryValue)) {
      return _.every(queryValue, function(val, index) {
        return record[queryKey][index] === val;
      });
    }

    if (_.isObject(queryValue)) {
      var specials = {
        '$gt': function(a, b) { return a > b; },
        '$gte': function(a, b) { return a >= b; },
        '$lt': function(a, b) { return a < b; },
        '$lte': function(a, b) { return a <= b; },
        // checks if query is a subset of the record value
        '$in': function(a, b) {
          return _.every(b, function(bElem) {
            return _.contains(a, bElem);
          });
        }
      };

      var hasSpecials = _.some(_.keys(queryValue), function(key) {
        return _.some(_.keys(specials), function(specialKey) {
          return key === specialKey;
        });
      });

      if (hasSpecials) {
        return _.every(_.keys(specials), function(specialKey) {
          if (_.has(queryValue, specialKey)) {
            return specials[specialKey](record[queryKey], queryValue[specialKey]);
          } else {
            return true;
          }
        });
      // recursive object match
      } else {
        return mongomatch(queryValue, record[queryKey]);
      }

    }

    if (_.isArray(record[queryKey])) {
      return _.contains(record[queryKey], queryValue);
    }

    return record[queryKey] === queryValue;
  });
};
