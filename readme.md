# mongomatch

`mongomatch` is a Javascript utility that allows for Mongo-like querying on Javascript objects. With it, you can create underscore/lodash's `findWhere` on steroids:

```javascript
// this is like underscore/lodash's _.findWhere, but does deep object
// querying, with support for matching using regex, arrays, functions,
// and (some of) mongo's special operators. see below for supported queries
var findWhereOnSteroids = function(list, query) {
  return list.filter(mongomatch.bind(null, query));
};
```

A contrived example:

```javascript
// An array of information about a bunch of siblings
var childrenRecords = [{
  name: 'Charles',
  age: 12,
  favorites: ['ice cream', 'candy', 'pokemon'],
  favoriteParent: {
    name: 'Mary',
    age: 29
  }
}, {
  name: 'May',
  age: 14,
  favorites: ['Javascript', 'programming'],
  favoriteParent: {
    name: 'Mary',
    age: 29
  }
}, {
  name: 'Barry',
  age: 18,
  favorites: ['ice cream', 'programming'],
  favoriteParent: {
    name: 'John',
    age: 32
  }
}];

// query for every child with a favorite parent whose
// name ends with the letter "y"
var query = {
  favoriteParent: {
    name: /y$/
  }
};

var results = findWhereOnSteroids(childrenRecords, query);
console.log(results.length); // 2
console.log(results); // [{ name: 'Charles', ... }, { name: 'May', ... }]
```

## Function Signature

`mongomatch` is simply a predicate function with the following signature:

```javascript
mongomatch(query, record)
```

where `query` is a Mongo-like query object and `record` is a Javascript object. Calling `mongomatch` returns a boolean indicating whether the record matches the query.

## Supported Queries

### Exact Match

```javascript
// matches "May"
// simply matches a child with name field equal to "May"
var query = {
  name: 'May'
};
```

### Regex

```javascript
// matches "May" and "Barry"
// matches a child with name ending in "y"
var query = {
  name: /y$/
};
```

### Exact match on an array

```javascript
// matches "May"
// note that "Javascript" must be the first element, and "programming" must be
// the second element for it to be a match
var query = {
  favorites: ['Javascript', 'programming']
};
```

### Match an array element

```javascript
// matches "Charles" and "Barry"
// this simply checks if the element "ice cream" is in the `favorites` array
var query = {
  favorites: 'ice cream'
};
```

### Function

```javascript
// matches "Barry"
// this matches any child whose favorite parent has an age that is even
var query = {
  favoriteParent: {
    age: function(age) {
      return age % 2 === 0;
    }
  }
};
```

### Special mongo operators ($gt, $gte, $lt, $lte, $in)

```javascript
// matches "May" and "Barry"
// this matches any child whose age is greater than 12 (not inclusive)
var query = {
  age: { $gt: 12 }
};

// matches "May"
// this matches any child whose age is greater than or equal to 14
// AND less than 18
var query = {
  age: { $gte: 14, $lt: 18 }
};

// matches "Charles"
// this matches a child whose favorites include "ice cream" and "pokemon"
// order does NOT matter within the array
var query = {
  favorites: { $in: ['pokemon', 'ice cream'] }
};
```

## Project Goals

The goal of this project is **not** to reach feature parity with MongoDB's rich querying language. Some of Mongo's more commonly used special operators are included as useful shortcuts when doing deep object pattern matching. More complex cases involving `$and` or `$or` can be more succinctly expressed as function queries.
