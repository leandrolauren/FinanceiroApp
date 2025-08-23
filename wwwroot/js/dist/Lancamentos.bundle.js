/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./wwwroot/js/components/Lancamento/LancamentoForm.jsx":
/*!*************************************************************!*\
  !*** ./wwwroot/js/components/Lancamento/LancamentoForm.jsx ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ \"./node_modules/react/jsx-runtime.js\");\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }\nfunction _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }\nfunction _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\nfunction _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = \"function\" == typeof Symbol ? Symbol : {}, n = r.iterator || \"@@iterator\", o = r.toStringTag || \"@@toStringTag\"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, \"_invoke\", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError(\"Generator is already running\"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = \"next\"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError(\"iterator result is not an object\"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i[\"return\"]) && t.call(i), c < 2 && (u = TypeError(\"The iterator does not provide a '\" + o + \"' method\"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, \"GeneratorFunction\")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, \"constructor\", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, \"constructor\", GeneratorFunction), GeneratorFunction.displayName = \"GeneratorFunction\", _regeneratorDefine2(GeneratorFunctionPrototype, o, \"GeneratorFunction\"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, \"Generator\"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, \"toString\", function () { return \"[object Generator]\"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }\nfunction _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, \"\", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o(\"next\", 0), o(\"throw\", 1), o(\"return\", 2); } }, _regeneratorDefine2(e, r, n, t); }\nfunction asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }\nfunction _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, \"next\", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, \"throw\", n); } _next(void 0); }); }; }\nfunction _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\nfunction _unsupportedIterableToArray(r, a) { if (r) { if (\"string\" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return \"Object\" === t && r.constructor && (t = r.constructor.name), \"Map\" === t || \"Set\" === t ? Array.from(r) : \"Arguments\" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }\nfunction _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }\nfunction _iterableToArrayLimit(r, l) { var t = null == r ? null : \"undefined\" != typeof Symbol && r[Symbol.iterator] || r[\"@@iterator\"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t[\"return\"] && (u = t[\"return\"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }\nfunction _arrayWithHoles(r) { if (Array.isArray(r)) return r; }\n\n\nvar API_BASE_URL = '/api/Lancamentos';\nvar API_PESSOAS = '/api/Pessoas/GetPessoas';\nvar API_PLANOS_CONTAS = '/api/PlanoContas/GetPlanoContas';\nvar API_CONTAS_BANCARIAS = '/api/Contas/GetContas';\nvar LancamentoForm = function LancamentoForm(_ref) {\n  var lancamentoId = _ref.lancamentoId,\n    onSave = _ref.onSave;\n  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({\n      id: lancamentoId || 0,\n      descricao: '',\n      tipo: 'Receita',\n      valor: '',\n      dataCompetencia: '',\n      dataVencimento: '',\n      dataPagamento: '',\n      pago: false,\n      contaBancariaId: '',\n      planoContasId: '',\n      pessoaId: ''\n    }),\n    _useState2 = _slicedToArray(_useState, 2),\n    formData = _useState2[0],\n    setFormData = _useState2[1];\n  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),\n    _useState4 = _slicedToArray(_useState3, 2),\n    pessoas = _useState4[0],\n    setPessoas = _useState4[1];\n  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),\n    _useState6 = _slicedToArray(_useState5, 2),\n    planosContas = _useState6[0],\n    setPlanosContas = _useState6[1];\n  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),\n    _useState8 = _slicedToArray(_useState7, 2),\n    contasBancarias = _useState8[0],\n    setContasBancarias = _useState8[1];\n  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    var fetchDependencies = /*#__PURE__*/function () {\n      var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {\n        var _yield$Promise$all, _yield$Promise$all2, pessoasRes, planosRes, contasRes, _t;\n        return _regenerator().w(function (_context) {\n          while (1) switch (_context.n) {\n            case 0:\n              _context.p = 0;\n              _context.n = 1;\n              return Promise.all([fetch(API_PESSOAS).then(function (res) {\n                return res.json();\n              }), fetch(API_PLANOS_CONTAS).then(function (res) {\n                return res.json();\n              }), fetch(API_CONTAS_BANCARIAS).then(function (res) {\n                return res.json();\n              })]);\n            case 1:\n              _yield$Promise$all = _context.v;\n              _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 3);\n              pessoasRes = _yield$Promise$all2[0];\n              planosRes = _yield$Promise$all2[1];\n              contasRes = _yield$Promise$all2[2];\n              setPessoas(pessoasRes);\n              setPlanosContas(planosRes);\n              setContasBancarias(contasRes);\n              _context.n = 3;\n              break;\n            case 2:\n              _context.p = 2;\n              _t = _context.v;\n              console.error('Erro ao buscar dependências:', _t);\n              window.__notificacao_erro = 'Erro ao carregar dados. Tente novamente.';\n            case 3:\n              return _context.a(2);\n          }\n        }, _callee, null, [[0, 2]]);\n      }));\n      return function fetchDependencies() {\n        return _ref2.apply(this, arguments);\n      };\n    }();\n    var fetchLancamento = /*#__PURE__*/function () {\n      var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {\n        var response, data, _t2;\n        return _regenerator().w(function (_context2) {\n          while (1) switch (_context2.n) {\n            case 0:\n              if (!lancamentoId) {\n                _context2.n = 6;\n                break;\n              }\n              _context2.p = 1;\n              _context2.n = 2;\n              return fetch(\"\".concat(API_BASE_URL, \"/\").concat(lancamentoId));\n            case 2:\n              response = _context2.v;\n              if (response.ok) {\n                _context2.n = 3;\n                break;\n              }\n              throw new Error('Lançamento não encontrado.');\n            case 3:\n              _context2.n = 4;\n              return response.json();\n            case 4:\n              data = _context2.v;\n              setFormData(_objectSpread(_objectSpread({}, data), {}, {\n                dataCompetencia: new Date(data.dataCompetencia).toISOString().slice(0, 10),\n                dataVencimento: new Date(data.dataVencimento).toISOString().slice(0, 10),\n                dataPagamento: data.dataPagamento ? new Date(data.dataPagamento).toISOString().slice(0, 10) : '',\n                tipo: data.tipo\n              }));\n              _context2.n = 6;\n              break;\n            case 5:\n              _context2.p = 5;\n              _t2 = _context2.v;\n              window.notificacao_erro = 'Erro ao carregar lançamento.';\n            case 6:\n              return _context2.a(2);\n          }\n        }, _callee2, null, [[1, 5]]);\n      }));\n      return function fetchLancamento() {\n        return _ref3.apply(this, arguments);\n      };\n    }();\n    fetchDependencies();\n    fetchLancamento();\n  }, [lancamentoId]);\n  var handleChange = function handleChange(e) {\n    var _e$target = e.target,\n      name = _e$target.name,\n      value = _e$target.value,\n      type = _e$target.type,\n      checked = _e$target.checked;\n    setFormData(function (prev) {\n      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, name, type === 'checkbox' ? checked : value));\n    });\n  };\n  var handleSelectChange = function handleSelectChange(e) {\n    var _e$target2 = e.target,\n      name = _e$target2.name,\n      value = _e$target2.value;\n    setFormData(function (prev) {\n      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, name, parseInt(value)));\n    });\n  };\n  var handleSubmit = /*#__PURE__*/function () {\n    var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(e) {\n      var method, url, csrfToken, response, result, _t3;\n      return _regenerator().w(function (_context3) {\n        while (1) switch (_context3.n) {\n          case 0:\n            e.preventDefault();\n            method = lancamentoId ? 'PUT' : 'POST';\n            url = lancamentoId ? \"\".concat(API_BASE_URL, \"/\").concat(lancamentoId) : API_BASE_URL;\n            csrfToken = $('meta[name=\"csrf-token\"]').attr('content');\n            _context3.p = 1;\n            _context3.n = 2;\n            return fetch(url, {\n              method: method,\n              headers: {\n                'Content-Type': 'application/json',\n                RequestVerificationToken: csrfToken\n              },\n              body: JSON.stringify(formData)\n            });\n          case 2:\n            response = _context3.v;\n            _context3.n = 3;\n            return response.json();\n          case 3:\n            result = _context3.v;\n            if (response.ok) {\n              window.__notificacao_sucesso = 'Lançamento alterado';\n              onSave();\n            } else {\n              window.__notificacao_erro = 'Erro desconhecido.';\n            }\n            _context3.n = 5;\n            break;\n          case 4:\n            _context3.p = 4;\n            _t3 = _context3.v;\n            window.__notificacao_erro = 'Ocorreu um erro na requisição.';\n          case 5:\n            return _context3.a(2);\n        }\n      }, _callee3, null, [[1, 4]]);\n    }));\n    return function handleSubmit(_x) {\n      return _ref4.apply(this, arguments);\n    };\n  }();\n  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {\n    $('.select2').select2({\n      dropdownParent: $('.modal-content')\n    });\n    $('.select2').on('change', function (e) {\n      var name = e.target.name;\n      var value = $(e.target).val();\n      setFormData(function (prev) {\n        return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, name, parseInt(value)));\n      });\n    });\n  }, [pessoas, planosContas, contasBancarias]);\n  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"form\", {\n    onSubmit: handleSubmit,\n    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n      className: \"row mb-3\",\n      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-md-4\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"label\", {\n          className: \"form-label\",\n          children: \"Tipo\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"select\", {\n          name: \"tipo\",\n          className: \"form-select\",\n          value: formData.tipo,\n          onChange: handleChange,\n          disabled: !!lancamentoId,\n          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"option\", {\n            value: \"Receita\",\n            children: \"Receita\"\n          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"option\", {\n            value: \"Despesa\",\n            children: \"Despesa\"\n          })]\n        })]\n      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-md-4\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"label\", {\n          className: \"form-label\",\n          children: \"Valor R$\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"input\", {\n          type: \"number\",\n          step: \"0.01\",\n          name: \"valor\",\n          className: \"input\",\n          placeholder: \"0.00\",\n          value: formData.valor,\n          onChange: handleChange,\n          required: true\n        })]\n      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-md-4\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"label\", {\n          className: \"form-label\",\n          children: \"Descri\\xE7\\xE3o\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"input\", {\n          type: \"text\",\n          name: \"descricao\",\n          className: \"input\",\n          placeholder: \"Descri\\xE7\\xE3o\",\n          value: formData.descricao,\n          onChange: handleChange,\n          required: true\n        })]\n      })]\n    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n      className: \"row mb-3\",\n      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-md-4\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"label\", {\n          className: \"form-label\",\n          children: \"Pessoa\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"select\", {\n          name: \"pessoaId\",\n          className: \"form-select select2\",\n          value: formData.pessoaId,\n          onChange: handleSelectChange,\n          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"option\", {\n            value: \"\",\n            children: \"Selecione\"\n          }), pessoas.map(function (p) {\n            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"option\", {\n              value: p.id,\n              children: p.nome\n            }, p.id);\n          })]\n        })]\n      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-md-4\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"label\", {\n          className: \"form-label\",\n          children: \"Plano de Contas\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"select\", {\n          name: \"planoContasId\",\n          className: \"form-select select2\",\n          value: formData.planoContasId,\n          onChange: handleSelectChange,\n          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"option\", {\n            value: \"\",\n            children: \"Selecione\"\n          }), planosContas.map(function (pc) {\n            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"option\", {\n              value: pc.id,\n              children: pc.descricao\n            }, pc.id);\n          })]\n        })]\n      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-md-4\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"label\", {\n          className: \"form-label\",\n          children: \"Conta Banc\\xE1ria\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"select\", {\n          name: \"contaBancariaId\",\n          className: \"form-select select2\",\n          value: formData.contaBancariaId,\n          onChange: handleSelectChange,\n          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"option\", {\n            value: \"\",\n            children: \"Selecione\"\n          }), contasBancarias.map(function (cb) {\n            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"option\", {\n              value: cb.id,\n              children: cb.descricao\n            }, cb.id);\n          })]\n        })]\n      })]\n    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n      className: \"row mb-3\",\n      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-md-4\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"label\", {\n          className: \"form-label\",\n          children: \"Data de Compet\\xEAncia\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"input\", {\n          type: \"date\",\n          name: \"dataCompetencia\",\n          className: \"input\",\n          value: formData.dataCompetencia,\n          onChange: handleChange,\n          required: true\n        })]\n      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-md-4\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"label\", {\n          className: \"form-label\",\n          children: \"Data de Vencimento\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"input\", {\n          type: \"date\",\n          name: \"dataVencimento\",\n          className: \"input\",\n          value: formData.dataVencimento,\n          onChange: handleChange,\n          required: true\n        })]\n      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-md-4\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"label\", {\n          className: \"form-label\",\n          children: \"Pago\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"select\", {\n          name: \"pago\",\n          className: \"form-select\",\n          value: formData.pago.toString(),\n          onChange: handleChange,\n          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"option\", {\n            value: \"false\",\n            children: \"N\\xE3o\"\n          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"option\", {\n            value: \"true\",\n            children: \"Sim\"\n          })]\n        })]\n      })]\n    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"div\", {\n      className: \"row mb-3\",\n      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-md-4\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"label\", {\n          className: \"form-label\",\n          children: \"Data de Pagamento\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"input\", {\n          type: \"date\",\n          name: \"dataPagamento\",\n          className: \"input\",\n          value: formData.dataPagamento,\n          onChange: handleChange\n        })]\n      })\n    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"div\", {\n      className: \"row mt-4\",\n      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(\"div\", {\n        className: \"col-12\",\n        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"button\", {\n          type: \"submit\",\n          className: \"btn btn-success me-2\",\n          children: \"Salvar\"\n        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(\"a\", {\n          href: \"/Lancamentos\",\n          className: \"btn btn-secondary\",\n          children: \"Voltar\"\n        })]\n      })\n    })]\n  });\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LancamentoForm);\n\n//# sourceURL=webpack://financeiroapp/./wwwroot/js/components/Lancamento/LancamentoForm.jsx?");

/***/ }),

/***/ "./wwwroot/js/components/Lancamento/Lancamentos.jsx":
/*!**********************************************************!*\
  !*** ./wwwroot/js/components/Lancamento/Lancamentos.jsx ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom/client */ \"./node_modules/react-dom/client.js\");\n/* harmony import */ var _LancamentosDataGrid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./LancamentosDataGrid */ \"./wwwroot/js/components/Lancamento/LancamentosDataGrid.jsx\");\n/* harmony import */ var _LancamentoForm__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./LancamentoForm */ \"./wwwroot/js/components/Lancamento/LancamentoForm.jsx\");\n/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ \"./node_modules/react/jsx-runtime.js\");\nfunction _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); }\nfunction _unsupportedIterableToArray(r, a) { if (r) { if (\"string\" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return \"Object\" === t && r.constructor && (t = r.constructor.name), \"Map\" === t || \"Set\" === t ? Array.from(r) : \"Arguments\" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }\nfunction _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }\nfunction _iterableToArrayLimit(r, l) { var t = null == r ? null : \"undefined\" != typeof Symbol && r[Symbol.iterator] || r[\"@@iterator\"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t[\"return\"] && (u = t[\"return\"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }\nfunction _arrayWithHoles(r) { if (Array.isArray(r)) return r; }\n\n\n\n\n\nvar Lancamentos = function Lancamentos() {\n  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('list'),\n    _useState2 = _slicedToArray(_useState, 2),\n    view = _useState2[0],\n    setView = _useState2[1];\n  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),\n    _useState4 = _slicedToArray(_useState3, 2),\n    editId = _useState4[0],\n    setEditId = _useState4[1];\n  var handleNewClick = function handleNewClick() {\n    return setView('create');\n  };\n  var handleBackClick = function handleBackClick() {\n    setView('list');\n    setEditId(null);\n  };\n  var handleEditClick = function handleEditClick(id) {\n    setEditId(id);\n    setView('edit');\n  };\n  if (view === 'create') {\n    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(\"div\", {\n      className: \"card shadow mb-4\",\n      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(\"div\", {\n        className: \"card-header py-3\",\n        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(\"h6\", {\n          className: \"m-0 font-weight-bold text-primary\",\n          children: \"Novo Lan\\xE7amento\"\n        })\n      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(\"div\", {\n        className: \"card-body\",\n        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_LancamentoForm__WEBPACK_IMPORTED_MODULE_3__[\"default\"], {\n          onSave: handleBackClick\n        })\n      })]\n    });\n  }\n  if (view === 'edit') {\n    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(\"div\", {\n      className: \"card shadow mb-4\",\n      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(\"div\", {\n        className: \"card-header py-3\",\n        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(\"h6\", {\n          className: \"m-0 font-weight-bold text-primary\",\n          children: \"Editar Lan\\xE7amento\"\n        })\n      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(\"div\", {\n        className: \"card-body\",\n        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_LancamentoForm__WEBPACK_IMPORTED_MODULE_3__[\"default\"], {\n          lancamentoId: editId,\n          onSave: handleBackClick\n        })\n      })]\n    });\n  }\n  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_LancamentosDataGrid__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n    onNewClick: handleNewClick,\n    onEditClick: handleEditClick\n  });\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Lancamentos);\nif (document.getElementById('lancamentos-root')) {\n  var container = document.getElementById('lancamentos-root');\n  var root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot)(container);\n  root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(Lancamentos, {}));\n}\n\n//# sourceURL=webpack://financeiroapp/./wwwroot/js/components/Lancamento/Lancamentos.jsx?");

/***/ }),

/***/ "@emotion/react":
/*!*******************************!*\
  !*** external "emotionReact" ***!
  \*******************************/
/***/ ((module) => {

module.exports = emotionReact;

/***/ }),

/***/ "@emotion/styled":
/*!********************************!*\
  !*** external "emotionStyled" ***!
  \********************************/
/***/ ((module) => {

module.exports = emotionStyled;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = React;

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

module.exports = ReactDOM;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"Lancamentos": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkfinanceiroapp"] = self["webpackChunkfinanceiroapp"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors"], () => (__webpack_require__("./wwwroot/js/components/Lancamento/Lancamentos.jsx")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;