"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _Symbol$iterator;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Root = require("ndtreejs").ndcls.Root;

var fac_bsc = require("nv-facutil-basic");

var _require = require("nv-facutil-cfg"),
    Cfg = _require.Cfg,
    load_to_sdfs = _require.load_to_sdfs;

var STATE_DICT = {
  init: "init",
  pending: "pending",
  resolved: "resolved",
  rejected: "rejected",
  impossible: "impossible",
  paused: "paused",
  stopped: "stopped"
};
/*
class Init { [util.inspect.custom] () { return("<init>")}}
const INIT = new Init();
class Pending { [util.inspect.custom] () { return("<pending>")}}
const PENDING = new Pending();
*/

var ERROR_DICT = {
  resolved: new Error("use-rslt-or-final"),
  rejected: new Error("use-rejected-or-final"),
  in_executing: new Error("still-in-executing-use-force-reset"),
  need_reset: new Error("reset-before-relaunch"),
  must_set_controller: new Error("(rs,rj,sdfs)=>{...}")
};
var DFLT_OPTIONS = {
  ignore_error: false
};

var DFLT_EXEC = function DFLT_EXEC(rs, rj, that) {};

var SYM_EXEC = Symbol("exec");
var SYM_TASK_NAME = Symbol("task_name");
var SYM_TYPE = Symbol("type");
var SYM_PROMISE = Symbol("promise");
var TYPE_DICT = {
  root: "root",
  nonroot: "nonroot"
};
var SYM_CONTROLLER = Symbol("controller");
var SYM_RESET = Symbol("reset");
var SYM_RESET_EXEC = Symbol("reset_exec"); //with controller ,this is NOT needed
//const SYM_READY = Symbol("ready")
//[SYM_READY]() {this.#state = "pending"}

var SYM_IMPOSSIBLE = Symbol("impossible");
var SYM_SET_IMPOSSIBLE = Symbol("set_impossible");
var SYM_UNSET_IMPOSSIBLE = Symbol("unset_impossible");

function _set_impossible(nd) {
  var sdfs = nd.$sdfs();
  sdfs.forEach(function (nd) {
    return nd[SYM_SET_IMPOSSIBLE]();
  });
}

function _run_children(that) {
  if (that.options.ignore_error || that.is_resolved()) {
    var children = that.$children();
    children.forEach(function (child) {
      child[SYM_EXEC]();
    });
  } else {
    var sdfs = that.$sdfs();
    sdfs = sdfs.slice(1); //not include self

    sdfs.forEach(function (des) {
      _set_impossible(des);
    }); //通知controller 检查

    that[SYM_CONTROLLER][SYM_RECV_FROM](that);
  }
}

function _is_in_executing(sdfs) {
  var _iterator = _createForOfIteratorHelper(sdfs),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var nd = _step.value;

      if (nd.state === 'pending') {
        return true;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return false;
}

function _check_one_state(nd) {
  var name = nd[SYM_TASK_NAME];
  var state = nd.state;
  var indent = "    ".repeat(nd.$depth());
  var data;

  if (state === "resolved") {
    data = nd.rslt;
  } else if (state === "rejected") {
    data = nd.exception;
  } else {
    data = "";
  }

  var tem = "".concat(indent).concat(name, "[").concat(data, "] Promise { <").concat(state, "> } ");
  return tem;
}

function _get_cfg(cfg) {
  var handler = cfg.handler === undefined ? DFLT_EXEC : cfg.handler;
  var options = JSON.parse(JSON.stringify(DFLT_OPTIONS));
  Object.assign(options, cfg.options);
  var d = {
    handler: handler,
    options: options
  };
  return d;
}

var _type = new WeakMap();

var _tag = new WeakMap();

var _controller = new WeakMap();

var _p = new WeakMap();

var _rs = new WeakMap();

var _rj = new WeakMap();

var _exec = new WeakMap();

var _state = new WeakMap();

var _rslt = new WeakMap();

var _exception = new WeakMap();

var _opt = new WeakMap();

var _FPromise = /*#__PURE__*/function (_Root) {
  _inherits(_FPromise, _Root);

  var _super = _createSuper(_FPromise);

  function _FPromise(tag, cfg, controller) {
    var _this;

    _classCallCheck(this, _FPromise);

    var _get_cfg2 = _get_cfg(cfg),
        handler = _get_cfg2.handler,
        options = _get_cfg2.options;

    _this = _super.call(this);

    _type.set(_assertThisInitialized(_this), {
      writable: true,
      value: "root"
    });

    _tag.set(_assertThisInitialized(_this), {
      writable: true,
      value: ""
    });

    _controller.set(_assertThisInitialized(_this), {
      writable: true,
      value: void 0
    });

    _p.set(_assertThisInitialized(_this), {
      writable: true,
      value: void 0
    });

    _rs.set(_assertThisInitialized(_this), {
      writable: true,
      value: void 0
    });

    _rj.set(_assertThisInitialized(_this), {
      writable: true,
      value: void 0
    });

    _exec.set(_assertThisInitialized(_this), {
      writable: true,
      value: void 0
    });

    _state.set(_assertThisInitialized(_this), {
      writable: true,
      value: "init"
    });

    _rslt.set(_assertThisInitialized(_this), {
      writable: true,
      value: void 0
    });

    _exception.set(_assertThisInitialized(_this), {
      writable: true,
      value: void 0
    });

    _opt.set(_assertThisInitialized(_this), {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(_assertThisInitialized(_this), _exec, handler);

    _classPrivateFieldSet(_assertThisInitialized(_this), _opt, options);

    _classPrivateFieldSet(_assertThisInitialized(_this), _p, new Promise(function (rs, rj) {
      _classPrivateFieldSet(_assertThisInitialized(_this), _rs, rs);

      _classPrivateFieldSet(_assertThisInitialized(_this), _rj, rj);
    }));

    _classPrivateFieldSet(_assertThisInitialized(_this), _controller, controller);

    _classPrivateFieldSet(_assertThisInitialized(_this), _tag, tag);

    return _this;
  }

  _createClass(_FPromise, [{
    key: SYM_CONTROLLER,
    get: function get() {
      return _classPrivateFieldGet(this, _controller);
    }
  }, {
    key: SYM_PROMISE,
    get: function get() {
      return _classPrivateFieldGet(this, _p);
    }
  }, {
    key: SYM_RESET_EXEC,
    value: function value(f) {
      _classPrivateFieldSet(this, _exec, f);
    }
  }, {
    key: SYM_RESET,
    value: function value() {
      var _this2 = this;

      _classPrivateFieldSet(this, _p, new Promise(function (rs, rj) {
        _classPrivateFieldSet(_this2, _rs, rs);

        _classPrivateFieldSet(_this2, _rj, rj);
      }));

      _classPrivateFieldSet(this, _rslt, undefined);

      _classPrivateFieldSet(this, _exception, undefined);

      _classPrivateFieldSet(this, _state, "init");

      delete _classPrivateFieldGet(this, _p)[SYM_IMPOSSIBLE];
    }
  }, {
    key: SYM_TYPE,
    set: function set(typ) {
      _classPrivateFieldSet(this, _type, typ);
    }
  }, {
    key: SYM_TYPE,
    get: function get() {
      return _classPrivateFieldGet(this, _type);
    }
  }, {
    key: SYM_SET_IMPOSSIBLE,
    value: function value() {
      _classPrivateFieldGet(this, _p)[SYM_IMPOSSIBLE] = true;

      _classPrivateFieldSet(this, _state, "impossible");
    }
  }, {
    key: SYM_UNSET_IMPOSSIBLE,
    value: function value() {
      delete _classPrivateFieldGet(this, _p)[SYM_IMPOSSIBLE];

      _classPrivateFieldSet(this, _state, "init");
    }
  }, {
    key: "options",
    set: function set(opt) {
      Object.assign(_classPrivateFieldGet(this, _opt), opt);
    }
  }, {
    key: "options",
    get: function get() {
      return _classPrivateFieldGet(this, _opt);
    }
  }, {
    key: "task",
    set: function set(f) {
      this[SYM_RESET]();
      this[SYM_RESET_EXEC](f);
    }
  }, {
    key: "task",
    get: function get() {
      return _classPrivateFieldGet(this, _exec);
    }
  }, {
    key: "finally",
    value: function _finally(f) {
      _classPrivateFieldGet(this, _p)["finally"](f);
    }
  }, {
    key: SYM_TASK_NAME,
    get: function get() {
      return _classPrivateFieldGet(this, _tag) === "" ? _classPrivateFieldGet(this, _exec).name : _classPrivateFieldGet(this, _tag);
    }
  }, {
    key: SYM_EXEC,
    value: function value() {
      var _this3 = this;

      if (_classPrivateFieldGet(this, _state) === 'init') {
        _classPrivateFieldSet(this, _state, 'pending');

        _classPrivateFieldGet(this, _exec).call(this, _classPrivateFieldGet(this, _rs), _classPrivateFieldGet(this, _rj), this);

        _classPrivateFieldGet(this, _p).then(function (r) {
          _classPrivateFieldSet(_this3, _state, "resolved");

          _classPrivateFieldSet(_this3, _rslt, r);

          _classPrivateFieldGet(_this3, _controller)[SYM_RECV_FROM](_this3);

          _run_children(_this3);
        })["catch"](function (err) {
          _classPrivateFieldSet(_this3, _state, "rejected");

          _classPrivateFieldSet(_this3, _exception, err);

          _classPrivateFieldGet(_this3, _controller)[SYM_RECV_FROM](_this3);

          _run_children(_this3);
        });
      } else {//pending,resolved,rejected,impossible
      }
    }
  }, {
    key: "rslt",
    get: function get() {
      if (_classPrivateFieldGet(this, _state) === "resolved") {
        return _classPrivateFieldGet(this, _rslt);
      } else if (_classPrivateFieldGet(this, _state) === "rejected") {
        throw ERROR_DICT.rejected;
      } else {}
    }
  }, {
    key: "exception",
    get: function get() {
      if (_classPrivateFieldGet(this, _state) === "rejected") {
        return _classPrivateFieldGet(this, _exception);
      } else if (_classPrivateFieldGet(this, _state) === "resolved") {
        throw ERROR_DICT.resolved;
      } else {}
    }
  }, {
    key: "final",
    get: function get() {
      if (_classPrivateFieldGet(this, _state) === "resolved") {
        return _classPrivateFieldGet(this, _rslt);
      } else if (_classPrivateFieldGet(this, _state) === "rejected") {
        return _classPrivateFieldGet(this, _exception);
      } else {}
    }
  }, {
    key: "state",
    get: function get() {
      return _classPrivateFieldGet(this, _state);
    }
  }, {
    key: "is_settled",
    value: function is_settled() {
      return _classPrivateFieldGet(this, _state) !== "pending";
    }
  }, {
    key: "is_pending",
    value: function is_pending() {
      return _classPrivateFieldGet(this, _state) === "pending";
    }
  }, {
    key: "is_resolved",
    value: function is_resolved() {
      return _classPrivateFieldGet(this, _state) === "resolved";
    }
  }, {
    key: "is_rejected",
    value: function is_rejected() {
      return _classPrivateFieldGet(this, _state) === "rejected";
    }
  }, {
    key: "disconn",
    value: function disconn() {
      this.$disconn();
    }
  }, {
    key: "append_child",
    value: function append_child(tag, cfg) {
      cfg = _get_cfg(cfg);
      var child = new _FPromise(tag, cfg, _classPrivateFieldGet(this, _controller));
      child[SYM_TYPE] = 'nonroot';
      this.$append_child(child);
      return child;
    }
  }, {
    key: "insert_child",
    value: function insert_child(tag, index, cfg) {
      cfg = _get_cfg(cfg);
      var child = new _FPromise(tag, cfg, _classPrivateFieldGet(this, _controller));
      child[SYM_TYPE] = 'nonroot';
      this.$insert_child(index, child);
      return child;
    }
  }]);

  return _FPromise;
}(Root);

function _repr(that) {
  return {
    promise: that[SYM_PROMISE],
    task: that[SYM_TASK_NAME]
  };
}

fac_bsc.add_repr(_FPromise, _repr);

function _construct_from_sdfs_cfg(that, sdfs) {
  var cfgrt = sdfs[0];
  var mp = new Map();
  var rt = new _FPromise(cfgrt.key, cfgrt.val, that);
  mp.set(cfgrt, rt);
  var cfgnd = cfgrt.$sdfs_next();

  while (cfgnd !== null) {
    var cfgp = cfgnd.$parent();
    var p = mp.get(cfgp);
    var nd = p.append_child(cfgnd.key, cfgnd.val);
    mp.set(cfgnd, nd);
    cfgnd = cfgnd.$sdfs_next();
  }

  mp = null;
  return rt;
}

var SYM_RECV_FROM = Symbol("recv-from");

function _check_controller(cexec) {
  if (typeof cexec !== 'function') {
    throw ERROR_DICT.must_set_controller;
  }
}

function _cfg_to_sdfs(cfg) {
  if (cfg instanceof Cfg) {
    return cfg.sdfs();
  } else {
    return load_to_sdfs(cfg);
  }
}

var _rt = new WeakMap();

var _p2 = new WeakMap();

var _crs = new WeakMap();

var _crj = new WeakMap();

var _cexec = new WeakMap();

_Symbol$iterator = Symbol.iterator;

var FPromise = /*#__PURE__*/function () {
  function FPromise(cexec, cfg) {
    var _this4 = this;

    _classCallCheck(this, FPromise);

    _rt.set(this, {
      writable: true,
      value: void 0
    });

    _p2.set(this, {
      writable: true,
      value: void 0
    });

    _crs.set(this, {
      writable: true,
      value: void 0
    });

    _crj.set(this, {
      writable: true,
      value: void 0
    });

    _cexec.set(this, {
      writable: true,
      value: void 0
    });

    _check_controller(cexec);

    var sdfs = _cfg_to_sdfs(cfg);

    _classPrivateFieldSet(this, _rt, _construct_from_sdfs_cfg(this, sdfs));

    _classPrivateFieldSet(this, _p2, new Promise(function (rs, rj) {
      _classPrivateFieldSet(_this4, _crs, rs);

      _classPrivateFieldSet(_this4, _crj, rj);
    }));

    _classPrivateFieldSet(this, _cexec, cexec);
  }

  _createClass(FPromise, [{
    key: "launch",
    value: function launch() {
      var _this5 = this;

      if (!_is_in_executing(_classPrivateFieldGet(this, _rt).$sdfs())) {
        var sdfs = _classPrivateFieldGet(this, _rt).$sdfs();

        sdfs.forEach(function (nd) {
          return nd[SYM_RESET]();
        });

        _classPrivateFieldSet(this, _p2, new Promise(function (rs, rj) {
          _classPrivateFieldSet(_this5, _crs, rs);

          _classPrivateFieldSet(_this5, _crj, rj);
        }));

        _classPrivateFieldGet(this, _rt)[SYM_EXEC]();
      } else {
        throw ERROR_DICT.need_reset;
      }
    }
  }, {
    key: "reset",
    value: function reset() {
      var _this6 = this;

      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var sdfs = _classPrivateFieldGet(this, _rt).$sdfs();

      if (force) {
        sdfs.forEach(function (nd) {
          return nd[SYM_RESET]();
        });

        _classPrivateFieldSet(this, _p2, new Promise(function (rs, rj) {
          _classPrivateFieldSet(_this6, _crs, rs);

          _classPrivateFieldSet(_this6, _crj, rj);
        }));
      } else {
        var cond = _is_in_executing(sdfs);

        if (cond) {
          throw ERROR_DICT.in_executing;
        } else {
          sdfs.forEach(function (nd) {
            return nd[SYM_RESET]();
          });

          _classPrivateFieldSet(this, _p2, new Promise(function (rs, rj) {
            _classPrivateFieldSet(_this6, _crs, rs);

            _classPrivateFieldSet(_this6, _crj, rj);
          }));
        }
      }
    }
  }, {
    key: "is_in_executing",
    value: function is_in_executing() {
      return _is_in_executing(_classPrivateFieldGet(this, _rt).$sdfs());
    }
  }, {
    key: "check_state",
    value: function check_state() {
      var sdfs = _classPrivateFieldGet(this, _rt).$sdfs();

      for (var i = 0; i < sdfs.length; i++) {
        console.log(_check_one_state(sdfs[i]));
      }
    }
  }, {
    key: "exec_routes",
    get: function get() {
      var sdfs = _classPrivateFieldGet(this, _rt).$sdfs();

      sdfs = sdfs.filter(function (nd) {
        return nd.state !== "impossible";
      });
      sdfs = sdfs.filter(function (nd) {
        return nd.$is_leaf();
      });
      var routes = sdfs.map(function (nd) {
        var route = nd.$ances(true);
        route.reverse();
        return route;
      });
      return routes;
    }
  }, {
    key: _Symbol$iterator,
    value: function value() {
      return _classPrivateFieldGet(this, _rt).$sdfs()[Symbol.iterator]();
    }
  }, {
    key: SYM_RECV_FROM,
    value: function value(src, data) {
      var sdfs = _classPrivateFieldGet(this, _rt).$sdfs();

      var lefted = sdfs.filter(function (r) {
        return r.state === "pending" || r.state === "init";
      });

      if (lefted.length === 0) {
        _classPrivateFieldGet(this, _cexec).call(this, _classPrivateFieldGet(this, _crs), _classPrivateFieldGet(this, _crj), sdfs);
      }
    }
  }, {
    key: "controller",
    get: function get() {
      return _classPrivateFieldGet(this, _p2);
    }
  }, {
    key: "controller",
    set: function set(cexec) {
      var _this7 = this;

      var sdfs = _classPrivateFieldGet(this, _rt).$sdfs();

      var cond = _is_in_executing(sdfs);

      if (cond) {
        throw ERROR_DICT.in_executing;
      } else {
        _check_controller(cexec);

        sdfs.forEach(function (nd) {
          return nd[SYM_RESET]();
        });

        _classPrivateFieldSet(this, _p2, new Promise(function (rs, rj) {
          _classPrivateFieldSet(_this7, _crs, rs);

          _classPrivateFieldSet(_this7, _crj, rj);
        }));

        _classPrivateFieldSet(this, _cexec, cexec);
      }
    }
  }, {
    key: "then",
    value: function then(f) {
      return _classPrivateFieldGet(this, _p2).then(function (r) {
        return f(r);
      });
    }
  }, {
    key: "catch",
    value: function _catch(f) {
      return _classPrivateFieldGet(this, _p2)["catch"](function (err) {
        return f(err);
      });
    }
  }, {
    key: "finally",
    value: function _finally(f) {
      return _classPrivateFieldGet(this, _p2)["finally"](function (r) {
        return f(r);
      });
    }
  }]);

  return FPromise;
}();

function repr(that) {
  return that.controller;
}

fac_bsc.add_repr(FPromise, repr);
var DFLT_CFG = {
  handler: DFLT_EXEC,
  options: DFLT_OPTIONS
};
module.exports = {
  FPromise: FPromise,
  ERROR_DICT: ERROR_DICT,
  STATE_DICT: STATE_DICT,
  DFLT_CFG: DFLT_CFG,
  Cfg: Cfg
};