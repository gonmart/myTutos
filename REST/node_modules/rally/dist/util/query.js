'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.where = where;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _ref = require('./ref');

var _ref2 = _interopRequireDefault(_ref);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 @module Query

 This module contains utility methods for working with the Rally query syntax
 */

var Query = function () {
  function Query(left, op, right) {
    (0, _classCallCheck3.default)(this, Query);

    this.left = left;
    this.op = op;
    this.right = right;
  }

  (0, _createClass3.default)(Query, [{
    key: 'toQueryString',
    value: function toQueryString() {
      var left = this.left;
      var right = this.right;
      if (left.toQueryString) {
        left = left.toQueryString();
      }

      if (right === null) {
        right = 'null';
      } else if (right.toQueryString) {
        right = right.toQueryString();
      } else if (_ref2.default.isRef(right)) {
        right = _ref2.default.getRelative(right);
      } else if (_lodash2.default.isString(right) && right.indexOf(' ') >= 0) {
        right = '"' + right + '"';
      }

      return '(' + left + ' ' + this.op + ' ' + right + ')';
    }
  }, {
    key: 'and',
    value: function and(left, op, right) {
      return new Query(this, 'AND', left instanceof Query ? left : new Query(left, op, right));
    }
  }, {
    key: 'or',
    value: function or(left, op, right) {
      return new Query(this, 'OR', left instanceof Query ? left : new Query(left, op, right));
    }
  }]);
  return Query;
}();

exports.default = Query;
function where(left, op, right) {
  return new Query(left, op, right);
}