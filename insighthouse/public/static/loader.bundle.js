(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // scripts/capture-filtros-inline.js
  var init_capture_filtros_inline = __esm({
    "scripts/capture-filtros-inline.js"() {
      (function() {
        (() => {
          var PH = typeof window !== "undefined" ? window.posthog : void 0;
          var MyAnalytics = window.MyAnalytics || (window.MyAnalytics = {});
          MyAnalytics.debug = false;
          var log = function() {
            if (MyAnalytics.debug)
              console.log.apply(
                console,
                ["[MyAnalytics]"].concat(Array.from(arguments))
              );
          };
          var safeOn = function(el, ev, fn) {
            if (el) el.addEventListener(ev, fn, { passive: true });
          };
          var capture = function(event, props) {
            try {
              PH && PH.capture && PH.capture(event, props);
              log("capture", event, props);
            } catch (e) {
            }
          };
          var byId = function(id) {
            return document.getElementById(id);
          };
          var bySelAll = function(sel) {
            return Array.prototype.slice.call(document.querySelectorAll(sel));
          };
          var onChange = function(el, field) {
            if (!el) return;
            safeOn(el, "change", function(e) {
              var value = (e.target && e.target.value || "").toString();
              capture("search_filter_changed", { field, value });
            });
          };
          var onReady = function(fn) {
            if (document.readyState === "loading")
              document.addEventListener("DOMContentLoaded", fn, { once: true });
            else fn();
          };
          onReady(function() {
            onChange(byId("property-status"), "finalidade");
            bySelAll(".finalidade-alias-button[data-value]").forEach(function(btn) {
              safeOn(btn, "click", function() {
                capture("search_filter_changed", {
                  field: "finalidade",
                  value: btn.getAttribute("data-value")
                });
              });
            });
            onChange(byId("residencial-property-type"), "tipo");
            var city = byId("search-field-cidade");
            onChange(city, "cidade");
            safeOn(city, "change", function() {
              var v = city && city.value ? city.value.toString() : "";
              if (v) capture("search_filter_city", { cidade: v });
            });
            var bairro = byId("search-field-cidadebairro");
            onChange(bairro, "bairro");
            safeOn(bairro, "change", function() {
              var v = bairro && bairro.value ? bairro.value.toString() : "";
              if (v) capture("search_filter_bairro", { bairro: v });
            });
            [
              "input-slider-valor-venda",
              "input-slider-valor-aluguel",
              "input-slider-area"
            ].forEach(function(id) {
              onChange(byId(id), id);
            });
            ["dormitorios[]", "suites[]", "banheiros[]", "vagas[]"].forEach(function(name) {
              bySelAll('input[name="' + name + '"]').forEach(function(el) {
                onChange(el, name);
              });
            });
            [
              "filtermobiliado",
              "filterpromocao",
              "filternovo",
              "filternaplanta",
              "filterconstrucao",
              "filterpermuta",
              "filterpet",
              "filtersegfianca",
              "filterproposta"
            ].forEach(function(id) {
              onChange(byId(id), id);
            });
          });
          document.addEventListener(
            "change",
            function(e) {
              var t = e.target || {};
              var id = t.id || "";
              var name = t.name || "";
              if (id === "property-status")
                capture("search_filter_changed", {
                  field: "finalidade",
                  value: t.value
                });
              if (id === "residencial-property-type")
                capture("search_filter_changed", { field: "tipo", value: t.value });
              if (id === "search-field-cidade") {
                var v1 = t && t.value ? t.value.toString() : "";
                if (v1) capture("search_filter_city", { cidade: v1 });
              }
              if (id === "search-field-cidadebairro") {
                var v2 = t && t.value ? t.value.toString() : "";
                if (v2) capture("search_filter_bairro", { bairro: v2 });
              }
              if (id === "input-slider-valor-venda" || id === "input-slider-valor-aluguel" || id === "input-slider-area")
                capture("search_filter_changed", { field: id, value: t.value });
              if (name === "dormitorios[]" || name === "suites[]" || name === "banheiros[]" || name === "vagas[]")
                capture("search_filter_changed", { field: name, value: t.value });
            },
            { passive: true }
          );
          var submit = byId("submit-main-search-form");
          var submitCode = byId("submit-main-search-form-codigo");
          var captureSubmit = function(source) {
            var getVal = function(id) {
              var el = byId(id);
              return el && el.value ? el.value : "";
            };
            capture("search_submit", {
              source,
              finalidade: function() {
                var el = byId("property-status");
                return el && el.value ? el.value : "";
              }(),
              preco_min: getVal("input-slider-valor-venda") || getVal("input-slider-valor-aluguel"),
              preco_max: "",
              area_min: getVal("input-slider-area"),
              area_max: ""
            });
          };
          safeOn(submit, "click", function() {
            captureSubmit("main");
          });
          safeOn(submitCode, "click", function() {
            captureSubmit("codigo");
          });
          document.addEventListener(
            "click",
            function(e) {
              var a = e.target && e.target.closest ? e.target.closest("a") : null;
              if (!a) return;
              var href = (a.getAttribute("href") || "").toString();
              if (!href) return;
              if (href.indexOf("/imovel/") !== -1)
                capture("results_item_click", { target: href, kind: "imovel" });
              else if (href.indexOf("/condominio/") !== -1)
                capture("results_item_click", { target: href, kind: "condominio" });
            },
            { passive: true }
          );
          var conv = function(sel, name) {
            bySelAll(sel).forEach(function(el) {
              safeOn(el, "click", function() {
                capture(name, {});
              });
            });
          };
          conv(
            'a[href^="https://wa.me"],a[href*="api.whatsapp.com"]',
            "conversion_whatsapp_click"
          );
          conv('a[href^="tel:"]', "conversion_phone_click");
          conv('a[href^="mailto:"]', "conversion_email_click");
        })();
      })();
    }
  });

  // node_modules/.pnpm/posthog-js@1.275.1/node_modules/posthog-js/dist/main.js
  var require_main = __commonJS({
    "node_modules/.pnpm/posthog-js@1.275.1/node_modules/posthog-js/dist/main.js"(exports) {
      "use strict";
      init_capture_filtros_inline();
      Object.defineProperty(exports, "__esModule", { value: true });
      var t = "undefined" != typeof window ? window : void 0;
      var i = "undefined" != typeof globalThis ? globalThis : t;
      var e = Array.prototype;
      var r = e.forEach;
      var s = e.indexOf;
      var n = null == i ? void 0 : i.navigator;
      var o = null == i ? void 0 : i.document;
      var a = null == i ? void 0 : i.location;
      var l = null == i ? void 0 : i.fetch;
      var u = null != i && i.XMLHttpRequest && "withCredentials" in new i.XMLHttpRequest() ? i.XMLHttpRequest : void 0;
      var h = null == i ? void 0 : i.AbortController;
      var d = null == n ? void 0 : n.userAgent;
      var v = null != t ? t : {};
      var c = { DEBUG: false, LIB_VERSION: "1.275.1" };
      function f(t2, i2, e2, r2, s2, n2, o2) {
        try {
          var a2 = t2[n2](o2), l2 = a2.value;
        } catch (t3) {
          return void e2(t3);
        }
        a2.done ? i2(l2) : Promise.resolve(l2).then(r2, s2);
      }
      function p(t2) {
        return function() {
          var i2 = this, e2 = arguments;
          return new Promise(function(r2, s2) {
            var n2 = t2.apply(i2, e2);
            function o2(t3) {
              f(n2, r2, s2, o2, a2, "next", t3);
            }
            function a2(t3) {
              f(n2, r2, s2, o2, a2, "throw", t3);
            }
            o2(void 0);
          });
        };
      }
      function g() {
        return g = Object.assign ? Object.assign.bind() : function(t2) {
          for (var i2 = 1; i2 < arguments.length; i2++) {
            var e2 = arguments[i2];
            for (var r2 in e2) ({}).hasOwnProperty.call(e2, r2) && (t2[r2] = e2[r2]);
          }
          return t2;
        }, g.apply(null, arguments);
      }
      function _(t2, i2) {
        if (null == t2) return {};
        var e2 = {};
        for (var r2 in t2) if ({}.hasOwnProperty.call(t2, r2)) {
          if (-1 !== i2.indexOf(r2)) continue;
          e2[r2] = t2[r2];
        }
        return e2;
      }
      var m = ["$snapshot", "$pageview", "$pageleave", "$set", "survey dismissed", "survey sent", "survey shown", "$identify", "$groupidentify", "$create_alias", "$$client_ingestion_warning", "$web_experiment_applied", "$feature_enrollment_update", "$feature_flag_called"];
      function y(t2, i2) {
        return -1 !== t2.indexOf(i2);
      }
      var b = function(t2) {
        return t2.trim();
      };
      var w = function(t2) {
        return t2.replace(/^\$/, "");
      };
      var x = Array.isArray;
      var S = Object.prototype;
      var E = S.hasOwnProperty;
      var k = S.toString;
      var P = x || function(t2) {
        return "[object Array]" === k.call(t2);
      };
      var T = (t2) => "function" == typeof t2;
      var I = (t2) => t2 === Object(t2) && !P(t2);
      var R = (t2) => {
        if (I(t2)) {
          for (var i2 in t2) if (E.call(t2, i2)) return false;
          return true;
        }
        return false;
      };
      var O = (t2) => void 0 === t2;
      var C = (t2) => "[object String]" == k.call(t2);
      var F = (t2) => C(t2) && 0 === t2.trim().length;
      var M = (t2) => null === t2;
      var A = (t2) => O(t2) || M(t2);
      var j = (t2) => "[object Number]" == k.call(t2);
      var D = (t2) => "[object Boolean]" === k.call(t2);
      var L = (t2) => t2 instanceof FormData;
      var N = (t2) => y(m, t2);
      function U(t2) {
        return null === t2 || "object" != typeof t2;
      }
      function z(t2, i2) {
        return Object.prototype.toString.call(t2) === "[object " + i2 + "]";
      }
      function H(t2) {
        return !O(Event) && function(t3, i2) {
          try {
            return t3 instanceof i2;
          } catch (t4) {
            return false;
          }
        }(t2, Event);
      }
      var B = [true, "true", 1, "1", "yes"];
      var q = (t2) => y(B, t2);
      var W = [false, "false", 0, "0", "no"];
      function G(t2, i2, e2, r2, s2) {
        return i2 > e2 && (r2.warn("min cannot be greater than max."), i2 = e2), j(t2) ? t2 > e2 ? (r2.warn(" cannot be  greater than max: " + e2 + ". Using max value instead."), e2) : t2 < i2 ? (r2.warn(" cannot be less than min: " + i2 + ". Using min value instead."), i2) : t2 : (r2.warn(" must be a number. using max or fallback. max: " + e2 + ", fallback: " + s2), G(s2 || e2, i2, e2, r2));
      }
      var V = class {
        constructor(t2) {
          this.t = t2, this.i = {}, this.o = () => {
            Object.keys(this.i).forEach((t3) => {
              var i2 = this.h(t3) + this.m;
              i2 >= this.S ? delete this.i[t3] : this.$(t3, i2);
            });
          }, this.h = (t3) => this.i[String(t3)], this.$ = (t3, i2) => {
            this.i[String(t3)] = i2;
          }, this.consumeRateLimit = (t3) => {
            var i2, e2, r2 = null !== (i2 = this.h(t3)) && void 0 !== i2 ? i2 : this.S;
            if (0 === (r2 = Math.max(r2 - 1, 0))) return true;
            this.$(t3, r2);
            var s2 = 0 === r2;
            return s2 && (null == (e2 = this.k) || e2.call(this, t3)), s2;
          }, this.k = this.t.k, this.S = G(this.t.bucketSize, 0, 100, this.t.P), this.m = G(this.t.refillRate, 0, this.S, this.t.P), this.T = G(this.t.refillInterval, 0, 864e5, this.t.P), this.I = setInterval(() => {
            this.o();
          }, this.T);
        }
        stop() {
          this.I && (clearInterval(this.I), this.I = void 0);
        }
      };
      var J;
      var K;
      var Y;
      var X = (t2) => t2 instanceof Error;
      function Q(t2) {
        var i2 = globalThis._posthogChunkIds;
        if (i2) {
          var e2 = Object.keys(i2);
          return Y && e2.length === K || (K = e2.length, Y = e2.reduce((e3, r2) => {
            J || (J = {});
            var s2 = J[r2];
            if (s2) e3[s2[0]] = s2[1];
            else for (var n2 = t2(r2), o2 = n2.length - 1; o2 >= 0; o2--) {
              var a2 = n2[o2], l2 = null == a2 ? void 0 : a2.filename, u2 = i2[r2];
              if (l2 && u2) {
                e3[l2] = u2, J[r2] = [l2, u2];
                break;
              }
            }
            return e3;
          }, {})), Y;
        }
      }
      var Z = "?";
      function tt(t2, i2, e2, r2) {
        var s2 = { platform: "web:javascript", filename: t2, function: "<anonymous>" === i2 ? Z : i2, in_app: true };
        return O(e2) || (s2.lineno = e2), O(r2) || (s2.colno = r2), s2;
      }
      var it = (t2, i2) => {
        var e2 = -1 !== t2.indexOf("safari-extension"), r2 = -1 !== t2.indexOf("safari-web-extension");
        return e2 || r2 ? [-1 !== t2.indexOf("@") ? t2.split("@")[0] : Z, e2 ? "safari-extension:" + i2 : "safari-web-extension:" + i2] : [t2, i2];
      };
      var et = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i;
      var rt = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
      var st = /\((\S*)(?::(\d+))(?::(\d+))\)/;
      var nt = (t2) => {
        var i2 = et.exec(t2);
        if (i2) {
          var [, e2, r2, s2] = i2;
          return tt(e2, Z, +r2, +s2);
        }
        var n2 = rt.exec(t2);
        if (n2) {
          if (n2[2] && 0 === n2[2].indexOf("eval")) {
            var o2 = st.exec(n2[2]);
            o2 && (n2[2] = o2[1], n2[3] = o2[2], n2[4] = o2[3]);
          }
          var [a2, l2] = it(n2[1] || Z, n2[2]);
          return tt(l2, a2, n2[3] ? +n2[3] : void 0, n2[4] ? +n2[4] : void 0);
        }
      };
      var ot = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
      var at = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
      var lt = (t2) => {
        var i2 = ot.exec(t2);
        if (i2) {
          if (i2[3] && i2[3].indexOf(" > eval") > -1) {
            var e2 = at.exec(i2[3]);
            e2 && (i2[1] = i2[1] || "eval", i2[3] = e2[1], i2[4] = e2[2], i2[5] = "");
          }
          var r2 = i2[3], s2 = i2[1] || Z;
          return [s2, r2] = it(s2, r2), tt(r2, s2, i2[4] ? +i2[4] : void 0, i2[5] ? +i2[5] : void 0);
        }
      };
      var ut = /\(error: (.*)\)/;
      var ht = 50;
      function dt() {
        for (var t2 = arguments.length, i2 = new Array(t2), e2 = 0; e2 < t2; e2++) i2[e2] = arguments[e2];
        return function(t3, e3) {
          void 0 === e3 && (e3 = 0);
          for (var r2 = [], s2 = t3.split("\n"), n2 = e3; n2 < s2.length; n2++) {
            var o2 = s2[n2];
            if (!(o2.length > 1024)) {
              var a2 = ut.test(o2) ? o2.replace(ut, "$1") : o2;
              if (!a2.match(/\S*Error: /)) {
                for (var l2 of i2) {
                  var u2 = l2(a2);
                  if (u2) {
                    r2.push(u2);
                    break;
                  }
                }
                if (r2.length >= ht) break;
              }
            }
          }
          return function(t4) {
            if (!t4.length) return [];
            var i3 = Array.from(t4);
            return i3.reverse(), i3.slice(0, ht).map((t5) => {
              return g({}, t5, { filename: t5.filename || (e4 = i3, e4[e4.length - 1] || {}).filename, function: t5.function || Z });
              var e4;
            });
          }(r2);
        };
      }
      var vt = class {
        constructor(t2, i2, e2) {
          void 0 === t2 && (t2 = []), void 0 === i2 && (i2 = []), void 0 === e2 && (e2 = []), this.coercers = t2, this.modifiers = e2, this.stackParser = dt(...i2);
        }
        buildFromUnknown(t2, i2) {
          void 0 === i2 && (i2 = {});
          var e2 = i2 && i2.mechanism || { handled: true, type: "generic" }, r2 = this.buildCoercingContext(e2, i2, 0).apply(t2), s2 = this.buildParsingContext(), n2 = this.parseStacktrace(r2, s2);
          return { $exception_list: this.convertToExceptionList(n2, e2), $exception_level: "error" };
        }
        modifyFrames(t2) {
          var i2 = this;
          return p(function* () {
            for (var e2 of t2) e2.stacktrace && e2.stacktrace.frames && P(e2.stacktrace.frames) && (e2.stacktrace.frames = yield i2.applyModifiers(e2.stacktrace.frames));
            return t2;
          })();
        }
        coerceFallback(t2) {
          var i2;
          return { type: "Error", value: "Unknown error", stack: null == (i2 = t2.syntheticException) ? void 0 : i2.stack, synthetic: true };
        }
        parseStacktrace(t2, i2) {
          var e2, r2;
          return null != t2.cause && (e2 = this.parseStacktrace(t2.cause, i2)), "" != t2.stack && null != t2.stack && (r2 = this.applyChunkIds(this.stackParser(t2.stack, t2.synthetic ? 1 : 0), i2.chunkIdMap)), g({}, t2, { cause: e2, stack: r2 });
        }
        applyChunkIds(t2, i2) {
          return t2.map((t3) => (t3.filename && i2 && (t3.chunk_id = i2[t3.filename]), t3));
        }
        applyCoercers(t2, i2) {
          for (var e2 of this.coercers) if (e2.match(t2)) return e2.coerce(t2, i2);
          return this.coerceFallback(i2);
        }
        applyModifiers(t2) {
          var i2 = this;
          return p(function* () {
            var e2 = t2;
            for (var r2 of i2.modifiers) e2 = yield r2(e2);
            return e2;
          })();
        }
        convertToExceptionList(t2, i2) {
          var e2, r2, s2, n2 = { type: t2.type, value: t2.value, mechanism: { type: null !== (e2 = i2.type) && void 0 !== e2 ? e2 : "generic", handled: null === (r2 = i2.handled) || void 0 === r2 || r2, synthetic: null !== (s2 = t2.synthetic) && void 0 !== s2 && s2 } };
          t2.stack && (n2.stacktrace = { type: "raw", frames: t2.stack });
          var o2 = [n2];
          return null != t2.cause && o2.push(...this.convertToExceptionList(t2.cause, g({}, i2, { handled: true }))), o2;
        }
        buildParsingContext() {
          return { chunkIdMap: Q(this.stackParser) };
        }
        buildCoercingContext(t2, i2, e2) {
          void 0 === e2 && (e2 = 0);
          var r2 = (e3, r3) => {
            if (r3 <= 4) {
              var s2 = this.buildCoercingContext(t2, i2, r3);
              return this.applyCoercers(e3, s2);
            }
          };
          return g({}, i2, { syntheticException: 0 == e2 ? i2.syntheticException : void 0, mechanism: t2, apply: (t3) => r2(t3, e2), next: (t3) => r2(t3, e2 + 1) });
        }
      };
      var ct = class {
        match(t2) {
          return this.isDOMException(t2) || this.isDOMError(t2);
        }
        coerce(t2, i2) {
          var e2 = C(t2.stack);
          return { type: this.getType(t2), value: this.getValue(t2), stack: e2 ? t2.stack : void 0, cause: t2.cause ? i2.next(t2.cause) : void 0, synthetic: false };
        }
        getType(t2) {
          return this.isDOMError(t2) ? "DOMError" : "DOMException";
        }
        getValue(t2) {
          var i2 = t2.name || (this.isDOMError(t2) ? "DOMError" : "DOMException");
          return t2.message ? i2 + ": " + t2.message : i2;
        }
        isDOMException(t2) {
          return z(t2, "DOMException");
        }
        isDOMError(t2) {
          return z(t2, "DOMError");
        }
      };
      var ft = class {
        match(t2) {
          return ((t3) => t3 instanceof Error)(t2);
        }
        coerce(t2, i2) {
          return { type: this.getType(t2), value: this.getMessage(t2, i2), stack: this.getStack(t2), cause: t2.cause ? i2.next(t2.cause) : void 0, synthetic: false };
        }
        getType(t2) {
          return t2.name || t2.constructor.name;
        }
        getMessage(t2, i2) {
          var e2 = t2.message;
          return e2.error && "string" == typeof e2.error.message ? String(e2.error.message) : String(e2);
        }
        getStack(t2) {
          return t2.stacktrace || t2.stack || void 0;
        }
      };
      var pt = class {
        constructor() {
        }
        match(t2) {
          return z(t2, "ErrorEvent") && null != t2.error;
        }
        coerce(t2, i2) {
          var e2, r2 = i2.apply(t2.error);
          return r2 || { type: "ErrorEvent", value: t2.message, stack: null == (e2 = i2.syntheticException) ? void 0 : e2.stack, synthetic: true };
        }
      };
      var gt = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;
      var _t = class {
        match(t2) {
          return "string" == typeof t2;
        }
        coerce(t2, i2) {
          var e2, [r2, s2] = this.getInfos(t2);
          return { type: null != r2 ? r2 : "Error", value: null != s2 ? s2 : t2, stack: null == (e2 = i2.syntheticException) ? void 0 : e2.stack, synthetic: true };
        }
        getInfos(t2) {
          var i2 = "Error", e2 = t2, r2 = t2.match(gt);
          return r2 && (i2 = r2[1], e2 = r2[2]), [i2, e2];
        }
      };
      var mt = ["fatal", "error", "warning", "log", "info", "debug"];
      function yt(t2, i2) {
        void 0 === i2 && (i2 = 40);
        var e2 = Object.keys(t2);
        if (e2.sort(), !e2.length) return "[object has no keys]";
        for (var r2 = e2.length; r2 > 0; r2--) {
          var s2 = e2.slice(0, r2).join(", ");
          if (!(s2.length > i2)) return r2 === e2.length || s2.length <= i2 ? s2 : s2.slice(0, i2) + "...";
        }
        return "";
      }
      var bt = class {
        match(t2) {
          return "object" == typeof t2 && null !== t2;
        }
        coerce(t2, i2) {
          var e2, r2 = this.getErrorPropertyFromObject(t2);
          return r2 ? i2.apply(r2) : { type: this.getType(t2), value: this.getValue(t2), stack: null == (e2 = i2.syntheticException) ? void 0 : e2.stack, level: this.isSeverityLevel(t2.level) ? t2.level : "error", synthetic: true };
        }
        getType(t2) {
          return H(t2) ? t2.constructor.name : "Error";
        }
        getValue(t2) {
          if ("name" in t2 && "string" == typeof t2.name) {
            var i2 = "'" + t2.name + "' captured as exception";
            return "message" in t2 && "string" == typeof t2.message && (i2 += " with message: '" + t2.message + "'"), i2;
          }
          if ("message" in t2 && "string" == typeof t2.message) return t2.message;
          var e2 = this.getObjectClassName(t2);
          return (e2 && "Object" !== e2 ? "'" + e2 + "'" : "Object") + " captured as exception with keys: " + yt(t2);
        }
        isSeverityLevel(t2) {
          return C(t2) && !F(t2) && mt.indexOf(t2) >= 0;
        }
        getErrorPropertyFromObject(t2) {
          for (var i2 in t2) if (Object.prototype.hasOwnProperty.call(t2, i2)) {
            var e2 = t2[i2];
            if (X(e2)) return e2;
          }
        }
        getObjectClassName(t2) {
          try {
            var i2 = Object.getPrototypeOf(t2);
            return i2 ? i2.constructor.name : void 0;
          } catch (t3) {
            return;
          }
        }
      };
      var wt = class {
        match(t2) {
          return H(t2);
        }
        coerce(t2, i2) {
          var e2, r2 = t2.constructor.name;
          return { type: r2, value: r2 + " captured as exception with keys: " + yt(t2), stack: null == (e2 = i2.syntheticException) ? void 0 : e2.stack, synthetic: true };
        }
      };
      var xt = class {
        match(t2) {
          return U(t2);
        }
        coerce(t2, i2) {
          var e2;
          return { type: "Error", value: "Primitive value captured as exception: " + String(t2), stack: null == (e2 = i2.syntheticException) ? void 0 : e2.stack, synthetic: true };
        }
      };
      var St = class {
        match(t2) {
          return z(t2, "PromiseRejectionEvent");
        }
        coerce(t2, i2) {
          var e2, r2 = this.getUnhandledRejectionReason(t2);
          return U(r2) ? { type: "UnhandledRejection", value: "Non-Error promise rejection captured with value: " + String(r2), stack: null == (e2 = i2.syntheticException) ? void 0 : e2.stack, synthetic: true } : i2.apply(r2);
        }
        getUnhandledRejectionReason(t2) {
          if (U(t2)) return t2;
          try {
            if ("reason" in t2) return t2.reason;
            if ("detail" in t2 && "reason" in t2.detail) return t2.detail.reason;
          } catch (t3) {
          }
          return t2;
        }
      };
      var Et = (i2) => {
        var e2 = { R: function(e3) {
          if (t && (c.DEBUG || v.POSTHOG_DEBUG) && !O(t.console) && t.console) {
            for (var r2 = ("__rrweb_original__" in t.console[e3]) ? t.console[e3].__rrweb_original__ : t.console[e3], s2 = arguments.length, n2 = new Array(s2 > 1 ? s2 - 1 : 0), o2 = 1; o2 < s2; o2++) n2[o2 - 1] = arguments[o2];
            r2(i2, ...n2);
          }
        }, info: function() {
          for (var t2 = arguments.length, i3 = new Array(t2), r2 = 0; r2 < t2; r2++) i3[r2] = arguments[r2];
          e2.R("log", ...i3);
        }, warn: function() {
          for (var t2 = arguments.length, i3 = new Array(t2), r2 = 0; r2 < t2; r2++) i3[r2] = arguments[r2];
          e2.R("warn", ...i3);
        }, error: function() {
          for (var t2 = arguments.length, i3 = new Array(t2), r2 = 0; r2 < t2; r2++) i3[r2] = arguments[r2];
          e2.R("error", ...i3);
        }, critical: function() {
          for (var t2 = arguments.length, e3 = new Array(t2), r2 = 0; r2 < t2; r2++) e3[r2] = arguments[r2];
          console.error(i2, ...e3);
        }, uninitializedWarning: (t2) => {
          e2.error("You must initialize PostHog before calling " + t2);
        }, createLogger: (t2) => Et(i2 + " " + t2) };
        return e2;
      };
      var $t = Et("[PostHog.js]");
      var kt = $t.createLogger;
      var Pt = kt("[ExternalScriptsLoader]");
      var Tt = (t2, i2, e2) => {
        if (t2.config.disable_external_dependency_loading) return Pt.warn(i2 + " was requested but loading of external scripts is disabled."), e2("Loading of external scripts is disabled");
        var r2 = null == o ? void 0 : o.querySelectorAll("script");
        if (r2) {
          for (var s2, n2 = function() {
            if (r2[a2].src === i2) {
              var t3 = r2[a2];
              return t3.__posthog_loading_callback_fired ? { v: e2() } : (t3.addEventListener("load", (i3) => {
                t3.__posthog_loading_callback_fired = true, e2(void 0, i3);
              }), t3.onerror = (t4) => e2(t4), { v: void 0 });
            }
          }, a2 = 0; a2 < r2.length; a2++) if (s2 = n2()) return s2.v;
        }
        var l2 = () => {
          if (!o) return e2("document not found");
          var r3 = o.createElement("script");
          if (r3.type = "text/javascript", r3.crossOrigin = "anonymous", r3.src = i2, r3.onload = (t3) => {
            r3.__posthog_loading_callback_fired = true, e2(void 0, t3);
          }, r3.onerror = (t3) => e2(t3), t2.config.prepare_external_dependency_script && (r3 = t2.config.prepare_external_dependency_script(r3)), !r3) return e2("prepare_external_dependency_script returned null");
          var s3, n3 = o.querySelectorAll("body > script");
          n3.length > 0 ? null == (s3 = n3[0].parentNode) || s3.insertBefore(r3, n3[0]) : o.body.appendChild(r3);
        };
        null != o && o.body ? l2() : null == o || o.addEventListener("DOMContentLoaded", l2);
      };
      v.__PosthogExtensions__ = v.__PosthogExtensions__ || {}, v.__PosthogExtensions__.loadExternalDependency = (t2, i2, e2) => {
        var r2 = "/static/" + i2 + ".js?v=" + t2.version;
        if ("remote-config" === i2 && (r2 = "/array/" + t2.config.token + "/config.js"), "toolbar" === i2) {
          var s2 = 3e5;
          r2 = r2 + "&t=" + Math.floor(Date.now() / s2) * s2;
        }
        var n2 = t2.requestRouter.endpointFor("assets", r2);
        Tt(t2, n2, e2);
      }, v.__PosthogExtensions__.loadSiteApp = (t2, i2, e2) => {
        var r2 = t2.requestRouter.endpointFor("api", i2);
        Tt(t2, r2, e2);
      };
      var It = {};
      function Rt(t2, i2, e2) {
        if (P(t2)) {
          if (r && t2.forEach === r) t2.forEach(i2, e2);
          else if ("length" in t2 && t2.length === +t2.length) {
            for (var s2 = 0, n2 = t2.length; s2 < n2; s2++) if (s2 in t2 && i2.call(e2, t2[s2], s2) === It) return;
          }
        }
      }
      function Ot(t2, i2, e2) {
        if (!A(t2)) {
          if (P(t2)) return Rt(t2, i2, e2);
          if (L(t2)) {
            for (var r2 of t2.entries()) if (i2.call(e2, r2[1], r2[0]) === It) return;
          } else for (var s2 in t2) if (E.call(t2, s2) && i2.call(e2, t2[s2], s2) === It) return;
        }
      }
      var Ct = function(t2) {
        for (var i2 = arguments.length, e2 = new Array(i2 > 1 ? i2 - 1 : 0), r2 = 1; r2 < i2; r2++) e2[r2 - 1] = arguments[r2];
        return Rt(e2, function(i3) {
          for (var e3 in i3) void 0 !== i3[e3] && (t2[e3] = i3[e3]);
        }), t2;
      };
      var Ft = function(t2) {
        for (var i2 = arguments.length, e2 = new Array(i2 > 1 ? i2 - 1 : 0), r2 = 1; r2 < i2; r2++) e2[r2 - 1] = arguments[r2];
        return Rt(e2, function(i3) {
          Rt(i3, function(i4) {
            t2.push(i4);
          });
        }), t2;
      };
      function Mt(t2) {
        for (var i2 = Object.keys(t2), e2 = i2.length, r2 = new Array(e2); e2--; ) r2[e2] = [i2[e2], t2[i2[e2]]];
        return r2;
      }
      var At = function(t2) {
        try {
          return t2();
        } catch (t3) {
          return;
        }
      };
      var jt = function(t2) {
        return function() {
          try {
            for (var i2 = arguments.length, e2 = new Array(i2), r2 = 0; r2 < i2; r2++) e2[r2] = arguments[r2];
            return t2.apply(this, e2);
          } catch (t3) {
            $t.critical("Implementation error. Please turn on debug mode and open a ticket on https://app.posthog.com/home#panel=support%3Asupport%3A."), $t.critical(t3);
          }
        };
      };
      var Dt = function(t2) {
        var i2 = {};
        return Ot(t2, function(t3, e2) {
          (C(t3) && t3.length > 0 || j(t3)) && (i2[e2] = t3);
        }), i2;
      };
      function Lt(t2, i2) {
        return e2 = t2, r2 = (t3) => C(t3) && !M(i2) ? t3.slice(0, i2) : t3, s2 = /* @__PURE__ */ new Set(), function t3(i3, e3) {
          return i3 !== Object(i3) ? r2 ? r2(i3, e3) : i3 : s2.has(i3) ? void 0 : (s2.add(i3), P(i3) ? (n2 = [], Rt(i3, (i4) => {
            n2.push(t3(i4));
          })) : (n2 = {}, Ot(i3, (i4, e4) => {
            s2.has(i4) || (n2[e4] = t3(i4, e4));
          })), n2);
          var n2;
        }(e2);
        var e2, r2, s2;
      }
      var Nt = ["herokuapp.com", "vercel.app", "netlify.app"];
      function Ut(t2) {
        var i2 = null == t2 ? void 0 : t2.hostname;
        if (!C(i2)) return false;
        var e2 = i2.split(".").slice(-2).join(".");
        for (var r2 of Nt) if (e2 === r2) return false;
        return true;
      }
      function zt(t2, i2) {
        for (var e2 = 0; e2 < t2.length; e2++) if (i2(t2[e2])) return t2[e2];
      }
      function Ht(t2, i2, e2, r2) {
        var { capture: s2 = false, passive: n2 = true } = null != r2 ? r2 : {};
        null == t2 || t2.addEventListener(i2, e2, { capture: s2, passive: n2 });
      }
      var Bt = "$people_distinct_id";
      var qt = "__alias";
      var Wt = "__timers";
      var Gt = "$autocapture_disabled_server_side";
      var Vt = "$heatmaps_enabled_server_side";
      var Jt = "$exception_capture_enabled_server_side";
      var Kt = "$error_tracking_suppression_rules";
      var Yt = "$error_tracking_capture_extension_exceptions";
      var Xt = "$web_vitals_enabled_server_side";
      var Qt = "$dead_clicks_enabled_server_side";
      var Zt = "$web_vitals_allowed_metrics";
      var ti = "$session_recording_remote_config";
      var ii = "$sesid";
      var ei = "$session_is_sampled";
      var ri = "$enabled_feature_flags";
      var si = "$early_access_features";
      var ni = "$feature_flag_details";
      var oi = "$stored_person_properties";
      var ai = "$stored_group_properties";
      var li = "$surveys";
      var ui = "$surveys_activated";
      var hi = "$flag_call_reported";
      var di = "$user_state";
      var vi = "$client_session_props";
      var ci = "$capture_rate_limit";
      var fi = "$initial_campaign_params";
      var pi = "$initial_referrer_info";
      var gi = "$initial_person_info";
      var _i = "$epp";
      var mi = "__POSTHOG_TOOLBAR__";
      var yi = "$posthog_cookieless";
      var bi = [Bt, qt, "__cmpns", Wt, "$session_recording_enabled_server_side", Vt, ii, ri, Kt, di, si, ni, ai, oi, li, hi, vi, ci, fi, pi, _i, gi];
      function wi(t2) {
        return t2 instanceof Element && (t2.id === mi || !(null == t2.closest || !t2.closest(".toolbar-global-fade-container")));
      }
      function xi(t2) {
        return !!t2 && 1 === t2.nodeType;
      }
      function Si(t2, i2) {
        return !!t2 && !!t2.tagName && t2.tagName.toLowerCase() === i2.toLowerCase();
      }
      function Ei(t2) {
        return !!t2 && 3 === t2.nodeType;
      }
      function $i(t2) {
        return !!t2 && 11 === t2.nodeType;
      }
      function ki(t2) {
        return t2 ? b(t2).split(/\s+/) : [];
      }
      function Pi(i2) {
        var e2 = null == t ? void 0 : t.location.href;
        return !!(e2 && i2 && i2.some((t2) => e2.match(t2)));
      }
      function Ti(t2) {
        var i2 = "";
        switch (typeof t2.className) {
          case "string":
            i2 = t2.className;
            break;
          case "object":
            i2 = (t2.className && "baseVal" in t2.className ? t2.className.baseVal : null) || t2.getAttribute("class") || "";
            break;
          default:
            i2 = "";
        }
        return ki(i2);
      }
      function Ii(t2) {
        return A(t2) ? null : b(t2).split(/(\s+)/).filter((t3) => Vi(t3)).join("").replace(/[\r\n]/g, " ").replace(/[ ]+/g, " ").substring(0, 255);
      }
      function Ri(t2) {
        var i2 = "";
        return Ni(t2) && !Ui(t2) && t2.childNodes && t2.childNodes.length && Ot(t2.childNodes, function(t3) {
          var e2;
          Ei(t3) && t3.textContent && (i2 += null !== (e2 = Ii(t3.textContent)) && void 0 !== e2 ? e2 : "");
        }), b(i2);
      }
      function Oi(t2) {
        return O(t2.target) ? t2.srcElement || null : null != (i2 = t2.target) && i2.shadowRoot ? t2.composedPath()[0] || null : t2.target || null;
        var i2;
      }
      var Ci = ["a", "button", "form", "input", "select", "textarea", "label"];
      function Fi(t2, i2) {
        if (O(i2)) return true;
        var e2, r2 = function(t3) {
          if (i2.some((i3) => t3.matches(i3))) return { v: true };
        };
        for (var s2 of t2) if (e2 = r2(s2)) return e2.v;
        return false;
      }
      function Mi(t2) {
        var i2 = t2.parentNode;
        return !(!i2 || !xi(i2)) && i2;
      }
      var Ai = [".ph-no-rageclick", ".ph-no-capture"];
      var ji = (t2) => !t2 || Si(t2, "html") || !xi(t2);
      var Di = (i2, e2) => {
        if (!t || ji(i2)) return { parentIsUsefulElement: false, targetElementList: [] };
        for (var r2 = false, s2 = [i2], n2 = i2; n2.parentNode && !Si(n2, "body"); ) if ($i(n2.parentNode)) s2.push(n2.parentNode.host), n2 = n2.parentNode.host;
        else {
          var o2 = Mi(n2);
          if (!o2) break;
          if (e2 || Ci.indexOf(o2.tagName.toLowerCase()) > -1) r2 = true;
          else {
            var a2 = t.getComputedStyle(o2);
            a2 && "pointer" === a2.getPropertyValue("cursor") && (r2 = true);
          }
          s2.push(o2), n2 = o2;
        }
        return { parentIsUsefulElement: r2, targetElementList: s2 };
      };
      function Li(i2, e2, r2, s2, n2) {
        var o2, a2, l2, u2;
        if (void 0 === r2 && (r2 = void 0), !t || ji(i2)) return false;
        if (null != (o2 = r2) && o2.url_allowlist && !Pi(r2.url_allowlist)) return false;
        if (null != (a2 = r2) && a2.url_ignorelist && Pi(r2.url_ignorelist)) return false;
        if (null != (l2 = r2) && l2.dom_event_allowlist) {
          var h2 = r2.dom_event_allowlist;
          if (h2 && !h2.some((t2) => e2.type === t2)) return false;
        }
        var { parentIsUsefulElement: d2, targetElementList: v2 } = Di(i2, s2);
        if (!function(t2, i3) {
          var e3 = null == i3 ? void 0 : i3.element_allowlist;
          if (O(e3)) return true;
          var r3, s3 = function(t3) {
            if (e3.some((i4) => t3.tagName.toLowerCase() === i4)) return { v: true };
          };
          for (var n3 of t2) if (r3 = s3(n3)) return r3.v;
          return false;
        }(v2, r2)) return false;
        if (!Fi(v2, null == (u2 = r2) ? void 0 : u2.css_selector_allowlist)) return false;
        var c2 = t.getComputedStyle(i2);
        if (c2 && "pointer" === c2.getPropertyValue("cursor") && "click" === e2.type) return true;
        var f2 = i2.tagName.toLowerCase();
        switch (f2) {
          case "html":
            return false;
          case "form":
            return (n2 || ["submit"]).indexOf(e2.type) >= 0;
          case "input":
          case "select":
          case "textarea":
            return (n2 || ["change", "click"]).indexOf(e2.type) >= 0;
          default:
            return d2 ? (n2 || ["click"]).indexOf(e2.type) >= 0 : (n2 || ["click"]).indexOf(e2.type) >= 0 && (Ci.indexOf(f2) > -1 || "true" === i2.getAttribute("contenteditable"));
        }
      }
      function Ni(t2) {
        for (var i2 = t2; i2.parentNode && !Si(i2, "body"); i2 = i2.parentNode) {
          var e2 = Ti(i2);
          if (y(e2, "ph-sensitive") || y(e2, "ph-no-capture")) return false;
        }
        if (y(Ti(t2), "ph-include")) return true;
        var r2 = t2.type || "";
        if (C(r2)) switch (r2.toLowerCase()) {
          case "hidden":
          case "password":
            return false;
        }
        var s2 = t2.name || t2.id || "";
        if (C(s2)) {
          if (/^cc|cardnum|ccnum|creditcard|csc|cvc|cvv|exp|pass|pwd|routing|seccode|securitycode|securitynum|socialsec|socsec|ssn/i.test(s2.replace(/[^a-zA-Z0-9]/g, ""))) return false;
        }
        return true;
      }
      function Ui(t2) {
        return !!(Si(t2, "input") && !["button", "checkbox", "submit", "reset"].includes(t2.type) || Si(t2, "select") || Si(t2, "textarea") || "true" === t2.getAttribute("contenteditable"));
      }
      var zi = "(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11})";
      var Hi = new RegExp("^(?:" + zi + ")$");
      var Bi = new RegExp(zi);
      var qi = "\\d{3}-?\\d{2}-?\\d{4}";
      var Wi = new RegExp("^(" + qi + ")$");
      var Gi = new RegExp("(" + qi + ")");
      function Vi(t2, i2) {
        if (void 0 === i2 && (i2 = true), A(t2)) return false;
        if (C(t2)) {
          if (t2 = b(t2), (i2 ? Hi : Bi).test((t2 || "").replace(/[- ]/g, ""))) return false;
          if ((i2 ? Wi : Gi).test(t2)) return false;
        }
        return true;
      }
      function Ji(t2) {
        var i2 = Ri(t2);
        return Vi(i2 = (i2 + " " + Ki(t2)).trim()) ? i2 : "";
      }
      function Ki(t2) {
        var i2 = "";
        return t2 && t2.childNodes && t2.childNodes.length && Ot(t2.childNodes, function(t3) {
          var e2;
          if (t3 && "span" === (null == (e2 = t3.tagName) ? void 0 : e2.toLowerCase())) try {
            var r2 = Ri(t3);
            i2 = (i2 + " " + r2).trim(), t3.childNodes && t3.childNodes.length && (i2 = (i2 + " " + Ki(t3)).trim());
          } catch (t4) {
            $t.error("[AutoCapture]", t4);
          }
        }), i2;
      }
      function Yi(t2) {
        return function(t3) {
          var i2 = t3.map((t4) => {
            var i3, e2, r2 = "";
            if (t4.tag_name && (r2 += t4.tag_name), t4.attr_class) for (var s2 of (t4.attr_class.sort(), t4.attr_class)) r2 += "." + s2.replace(/"/g, "");
            var n2 = g({}, t4.text ? { text: t4.text } : {}, { "nth-child": null !== (i3 = t4.nth_child) && void 0 !== i3 ? i3 : 0, "nth-of-type": null !== (e2 = t4.nth_of_type) && void 0 !== e2 ? e2 : 0 }, t4.href ? { href: t4.href } : {}, t4.attr_id ? { attr_id: t4.attr_id } : {}, t4.attributes), o2 = {};
            return Mt(n2).sort((t5, i4) => {
              var [e3] = t5, [r3] = i4;
              return e3.localeCompare(r3);
            }).forEach((t5) => {
              var [i4, e3] = t5;
              return o2[Xi(i4.toString())] = Xi(e3.toString());
            }), r2 += ":", r2 += Mt(o2).map((t5) => {
              var [i4, e3] = t5;
              return i4 + '="' + e3 + '"';
            }).join("");
          });
          return i2.join(";");
        }(function(t3) {
          return t3.map((t4) => {
            var i2, e2, r2 = { text: null == (i2 = t4.$el_text) ? void 0 : i2.slice(0, 400), tag_name: t4.tag_name, href: null == (e2 = t4.attr__href) ? void 0 : e2.slice(0, 2048), attr_class: Qi(t4), attr_id: t4.attr__id, nth_child: t4.nth_child, nth_of_type: t4.nth_of_type, attributes: {} };
            return Mt(t4).filter((t5) => {
              var [i3] = t5;
              return 0 === i3.indexOf("attr__");
            }).forEach((t5) => {
              var [i3, e3] = t5;
              return r2.attributes[i3] = e3;
            }), r2;
          });
        }(t2));
      }
      function Xi(t2) {
        return t2.replace(/"|\\"/g, '\\"');
      }
      function Qi(t2) {
        var i2 = t2.attr__class;
        return i2 ? P(i2) ? i2 : ki(i2) : void 0;
      }
      var Zi = class {
        constructor() {
          this.clicks = [];
        }
        isRageClick(t2, i2, e2) {
          var r2 = this.clicks[this.clicks.length - 1];
          if (r2 && Math.abs(t2 - r2.x) + Math.abs(i2 - r2.y) < 30 && e2 - r2.timestamp < 1e3) {
            if (this.clicks.push({ x: t2, y: i2, timestamp: e2 }), 3 === this.clicks.length) return true;
          } else this.clicks = [{ x: t2, y: i2, timestamp: e2 }];
          return false;
        }
      };
      var te = "$copy_autocapture";
      var ie = function(t2) {
        return t2.GZipJS = "gzip-js", t2.Base64 = "base64", t2;
      }({});
      var ee = (t2) => {
        var i2 = null == o ? void 0 : o.createElement("a");
        return O(i2) ? null : (i2.href = t2, i2);
      };
      var re = function(t2, i2) {
        var e2, r2;
        void 0 === i2 && (i2 = "&");
        var s2 = [];
        return Ot(t2, function(t3, i3) {
          O(t3) || O(i3) || "undefined" === i3 || (e2 = encodeURIComponent(((t4) => t4 instanceof File)(t3) ? t3.name : t3.toString()), r2 = encodeURIComponent(i3), s2[s2.length] = r2 + "=" + e2);
        }), s2.join(i2);
      };
      var se = function(t2, i2) {
        for (var e2, r2 = ((t2.split("#")[0] || "").split(/\?(.*)/)[1] || "").replace(/^\?+/g, "").split("&"), s2 = 0; s2 < r2.length; s2++) {
          var n2 = r2[s2].split("=");
          if (n2[0] === i2) {
            e2 = n2;
            break;
          }
        }
        if (!P(e2) || e2.length < 2) return "";
        var o2 = e2[1];
        try {
          o2 = decodeURIComponent(o2);
        } catch (t3) {
          $t.error("Skipping decoding for malformed query param: " + o2);
        }
        return o2.replace(/\+/g, " ");
      };
      var ne = function(t2, i2, e2) {
        if (!t2 || !i2 || !i2.length) return t2;
        for (var r2 = t2.split("#"), s2 = r2[0] || "", n2 = r2[1], o2 = s2.split("?"), a2 = o2[1], l2 = o2[0], u2 = (a2 || "").split("&"), h2 = [], d2 = 0; d2 < u2.length; d2++) {
          var v2 = u2[d2].split("=");
          P(v2) && (i2.includes(v2[0]) ? h2.push(v2[0] + "=" + e2) : h2.push(u2[d2]));
        }
        var c2 = l2;
        return null != a2 && (c2 += "?" + h2.join("&")), null != n2 && (c2 += "#" + n2), c2;
      };
      var oe = function(t2, i2) {
        var e2 = t2.match(new RegExp(i2 + "=([^&]*)"));
        return e2 ? e2[1] : null;
      };
      var ae = kt("[AutoCapture]");
      function le(t2, i2) {
        return i2.length > t2 ? i2.slice(0, t2) + "..." : i2;
      }
      function ue(t2) {
        if (t2.previousElementSibling) return t2.previousElementSibling;
        var i2 = t2;
        do {
          i2 = i2.previousSibling;
        } while (i2 && !xi(i2));
        return i2;
      }
      function he(t2, i2, e2, r2) {
        var s2 = t2.tagName.toLowerCase(), n2 = { tag_name: s2 };
        Ci.indexOf(s2) > -1 && !e2 && ("a" === s2.toLowerCase() || "button" === s2.toLowerCase() ? n2.$el_text = le(1024, Ji(t2)) : n2.$el_text = le(1024, Ri(t2)));
        var o2 = Ti(t2);
        o2.length > 0 && (n2.classes = o2.filter(function(t3) {
          return "" !== t3;
        })), Ot(t2.attributes, function(e3) {
          var s3;
          if ((!Ui(t2) || -1 !== ["name", "id", "class", "aria-label"].indexOf(e3.name)) && ((null == r2 || !r2.includes(e3.name)) && !i2 && Vi(e3.value) && (s3 = e3.name, !C(s3) || "_ngcontent" !== s3.substring(0, 10) && "_nghost" !== s3.substring(0, 7)))) {
            var o3 = e3.value;
            "class" === e3.name && (o3 = ki(o3).join(" ")), n2["attr__" + e3.name] = le(1024, o3);
          }
        });
        for (var a2 = 1, l2 = 1, u2 = t2; u2 = ue(u2); ) a2++, u2.tagName === t2.tagName && l2++;
        return n2.nth_child = a2, n2.nth_of_type = l2, n2;
      }
      function de(i2, e2) {
        for (var r2, s2, { e: n2, maskAllElementAttributes: o2, maskAllText: a2, elementAttributeIgnoreList: l2, elementsChainAsString: u2 } = e2, h2 = [i2], d2 = i2; d2.parentNode && !Si(d2, "body"); ) $i(d2.parentNode) ? (h2.push(d2.parentNode.host), d2 = d2.parentNode.host) : (h2.push(d2.parentNode), d2 = d2.parentNode);
        var v2, c2 = [], f2 = {}, p2 = false, g2 = false;
        if (Ot(h2, (t2) => {
          var i3 = Ni(t2);
          "a" === t2.tagName.toLowerCase() && (p2 = t2.getAttribute("href"), p2 = i3 && p2 && Vi(p2) && p2), y(Ti(t2), "ph-no-capture") && (g2 = true), c2.push(he(t2, o2, a2, l2));
          var e3 = function(t3) {
            if (!Ni(t3)) return {};
            var i4 = {};
            return Ot(t3.attributes, function(t4) {
              if (t4.name && 0 === t4.name.indexOf("data-ph-capture-attribute")) {
                var e4 = t4.name.replace("data-ph-capture-attribute-", ""), r3 = t4.value;
                e4 && r3 && Vi(r3) && (i4[e4] = r3);
              }
            }), i4;
          }(t2);
          Ct(f2, e3);
        }), g2) return { props: {}, explicitNoCapture: g2 };
        if (a2 || ("a" === i2.tagName.toLowerCase() || "button" === i2.tagName.toLowerCase() ? c2[0].$el_text = Ji(i2) : c2[0].$el_text = Ri(i2)), p2) {
          var _2, m2;
          c2[0].attr__href = p2;
          var b2 = null == (_2 = ee(p2)) ? void 0 : _2.host, w2 = null == t || null == (m2 = t.location) ? void 0 : m2.host;
          b2 && w2 && b2 !== w2 && (v2 = p2);
        }
        return { props: Ct({ $event_type: n2.type, $ce_version: 1 }, u2 ? {} : { $elements: c2 }, { $elements_chain: Yi(c2) }, null != (r2 = c2[0]) && r2.$el_text ? { $el_text: null == (s2 = c2[0]) ? void 0 : s2.$el_text } : {}, v2 && "click" === n2.type ? { $external_click_url: v2 } : {}, f2) };
      }
      var ve = class {
        constructor(t2) {
          this.O = false, this.C = null, this.rageclicks = new Zi(), this.F = false, this.instance = t2, this.M = null;
        }
        get A() {
          var t2, i2, e2 = I(this.instance.config.autocapture) ? this.instance.config.autocapture : {};
          return e2.url_allowlist = null == (t2 = e2.url_allowlist) ? void 0 : t2.map((t3) => new RegExp(t3)), e2.url_ignorelist = null == (i2 = e2.url_ignorelist) ? void 0 : i2.map((t3) => new RegExp(t3)), e2;
        }
        j() {
          if (this.isBrowserSupported()) {
            if (t && o) {
              var i2 = (i3) => {
                i3 = i3 || (null == t ? void 0 : t.event);
                try {
                  this.D(i3);
                } catch (t2) {
                  ae.error("Failed to capture event", t2);
                }
              };
              if (Ht(o, "submit", i2, { capture: true }), Ht(o, "change", i2, { capture: true }), Ht(o, "click", i2, { capture: true }), this.A.capture_copied_text) {
                var e2 = (i3) => {
                  i3 = i3 || (null == t ? void 0 : t.event), this.D(i3, te);
                };
                Ht(o, "copy", e2, { capture: true }), Ht(o, "cut", e2, { capture: true });
              }
            }
          } else ae.info("Disabling Automatic Event Collection because this browser is not supported");
        }
        startIfEnabled() {
          this.isEnabled && !this.O && (this.j(), this.O = true);
        }
        onRemoteConfig(t2) {
          t2.elementsChainAsString && (this.F = t2.elementsChainAsString), this.instance.persistence && this.instance.persistence.register({ [Gt]: !!t2.autocapture_opt_out }), this.C = !!t2.autocapture_opt_out, this.startIfEnabled();
        }
        setElementSelectors(t2) {
          this.M = t2;
        }
        getElementSelectors(t2) {
          var i2, e2 = [];
          return null == (i2 = this.M) || i2.forEach((i3) => {
            var r2 = null == o ? void 0 : o.querySelectorAll(i3);
            null == r2 || r2.forEach((r3) => {
              t2 === r3 && e2.push(i3);
            });
          }), e2;
        }
        get isEnabled() {
          var t2, i2, e2 = null == (t2 = this.instance.persistence) ? void 0 : t2.props[Gt], r2 = this.C;
          if (M(r2) && !D(e2) && !this.instance.L()) return false;
          var s2 = null !== (i2 = this.C) && void 0 !== i2 ? i2 : !!e2;
          return !!this.instance.config.autocapture && !s2;
        }
        D(i2, e2) {
          if (void 0 === e2 && (e2 = "$autocapture"), this.isEnabled) {
            var r2, s2 = Oi(i2);
            if (Ei(s2) && (s2 = s2.parentNode || null), "$autocapture" === e2 && "click" === i2.type && i2 instanceof MouseEvent) this.instance.config.rageclick && null != (r2 = this.rageclicks) && r2.isRageClick(i2.clientX, i2.clientY, (/* @__PURE__ */ new Date()).getTime()) && function(i3, e3) {
              if (!t || ji(i3)) return false;
              var r3, s3;
              if (false === (r3 = D(e3) ? !!e3 && Ai : null !== (s3 = null == e3 ? void 0 : e3.css_selector_ignorelist) && void 0 !== s3 ? s3 : Ai)) return false;
              var { targetElementList: n3 } = Di(i3, false);
              return !Fi(n3, r3);
            }(s2, this.instance.config.rageclick) && this.D(i2, "$rageclick");
            var n2 = e2 === te;
            if (s2 && Li(s2, i2, this.A, n2, n2 ? ["copy", "cut"] : void 0)) {
              var { props: o2, explicitNoCapture: a2 } = de(s2, { e: i2, maskAllElementAttributes: this.instance.config.mask_all_element_attributes, maskAllText: this.instance.config.mask_all_text, elementAttributeIgnoreList: this.A.element_attribute_ignorelist, elementsChainAsString: this.F });
              if (a2) return false;
              var l2 = this.getElementSelectors(s2);
              if (l2 && l2.length > 0 && (o2.$element_selectors = l2), e2 === te) {
                var u2, h2 = Ii(null == t || null == (u2 = t.getSelection()) ? void 0 : u2.toString()), d2 = i2.type || "clipboard";
                if (!h2) return false;
                o2.$selected_content = h2, o2.$copy_type = d2;
              }
              return this.instance.capture(e2, o2), true;
            }
          }
        }
        isBrowserSupported() {
          return T(null == o ? void 0 : o.querySelectorAll);
        }
      };
      Math.trunc || (Math.trunc = function(t2) {
        return t2 < 0 ? Math.ceil(t2) : Math.floor(t2);
      }), Number.isInteger || (Number.isInteger = function(t2) {
        return j(t2) && isFinite(t2) && Math.floor(t2) === t2;
      });
      var ce = "0123456789abcdef";
      var fe = class _fe {
        constructor(t2) {
          if (this.bytes = t2, 16 !== t2.length) throw new TypeError("not 128-bit length");
        }
        static fromFieldsV7(t2, i2, e2, r2) {
          if (!Number.isInteger(t2) || !Number.isInteger(i2) || !Number.isInteger(e2) || !Number.isInteger(r2) || t2 < 0 || i2 < 0 || e2 < 0 || r2 < 0 || t2 > 281474976710655 || i2 > 4095 || e2 > 1073741823 || r2 > 4294967295) throw new RangeError("invalid field value");
          var s2 = new Uint8Array(16);
          return s2[0] = t2 / Math.pow(2, 40), s2[1] = t2 / Math.pow(2, 32), s2[2] = t2 / Math.pow(2, 24), s2[3] = t2 / Math.pow(2, 16), s2[4] = t2 / Math.pow(2, 8), s2[5] = t2, s2[6] = 112 | i2 >>> 8, s2[7] = i2, s2[8] = 128 | e2 >>> 24, s2[9] = e2 >>> 16, s2[10] = e2 >>> 8, s2[11] = e2, s2[12] = r2 >>> 24, s2[13] = r2 >>> 16, s2[14] = r2 >>> 8, s2[15] = r2, new _fe(s2);
        }
        toString() {
          for (var t2 = "", i2 = 0; i2 < this.bytes.length; i2++) t2 = t2 + ce.charAt(this.bytes[i2] >>> 4) + ce.charAt(15 & this.bytes[i2]), 3 !== i2 && 5 !== i2 && 7 !== i2 && 9 !== i2 || (t2 += "-");
          if (36 !== t2.length) throw new Error("Invalid UUIDv7 was generated");
          return t2;
        }
        clone() {
          return new _fe(this.bytes.slice(0));
        }
        equals(t2) {
          return 0 === this.compareTo(t2);
        }
        compareTo(t2) {
          for (var i2 = 0; i2 < 16; i2++) {
            var e2 = this.bytes[i2] - t2.bytes[i2];
            if (0 !== e2) return Math.sign(e2);
          }
          return 0;
        }
      };
      var pe = class {
        constructor() {
          this.N = 0, this.U = 0, this.H = new me();
        }
        generate() {
          var t2 = this.generateOrAbort();
          if (O(t2)) {
            this.N = 0;
            var i2 = this.generateOrAbort();
            if (O(i2)) throw new Error("Could not generate UUID after timestamp reset");
            return i2;
          }
          return t2;
        }
        generateOrAbort() {
          var t2 = Date.now();
          if (t2 > this.N) this.N = t2, this.B();
          else {
            if (!(t2 + 1e4 > this.N)) return;
            this.U++, this.U > 4398046511103 && (this.N++, this.B());
          }
          return fe.fromFieldsV7(this.N, Math.trunc(this.U / Math.pow(2, 30)), this.U & Math.pow(2, 30) - 1, this.H.nextUint32());
        }
        B() {
          this.U = 1024 * this.H.nextUint32() + (1023 & this.H.nextUint32());
        }
      };
      var ge;
      var _e = (t2) => {
        if ("undefined" != typeof UUIDV7_DENY_WEAK_RNG && UUIDV7_DENY_WEAK_RNG) throw new Error("no cryptographically strong RNG available");
        for (var i2 = 0; i2 < t2.length; i2++) t2[i2] = 65536 * Math.trunc(65536 * Math.random()) + Math.trunc(65536 * Math.random());
        return t2;
      };
      t && !O(t.crypto) && crypto.getRandomValues && (_e = (t2) => crypto.getRandomValues(t2));
      var me = class {
        constructor() {
          this.q = new Uint32Array(8), this.W = 1 / 0;
        }
        nextUint32() {
          return this.W >= this.q.length && (_e(this.q), this.W = 0), this.q[this.W++];
        }
      };
      var ye = () => be().toString();
      var be = () => (ge || (ge = new pe())).generate();
      var we = "";
      var xe = /[a-z0-9][a-z0-9-]+\.[a-z]{2,}$/i;
      function Se(t2, i2) {
        if (i2) {
          var e2 = function(t3, i3) {
            if (void 0 === i3 && (i3 = o), we) return we;
            if (!i3) return "";
            if (["localhost", "127.0.0.1"].includes(t3)) return "";
            for (var e3 = t3.split("."), r3 = Math.min(e3.length, 8), s2 = "dmn_chk_" + ye(); !we && r3--; ) {
              var n2 = e3.slice(r3).join("."), a2 = s2 + "=1;domain=." + n2 + ";path=/";
              i3.cookie = a2 + ";max-age=3", i3.cookie.includes(s2) && (i3.cookie = a2 + ";max-age=0", we = n2);
            }
            return we;
          }(t2);
          if (!e2) {
            var r2 = ((t3) => {
              var i3 = t3.match(xe);
              return i3 ? i3[0] : "";
            })(t2);
            r2 !== e2 && $t.info("Warning: cookie subdomain discovery mismatch", r2, e2), e2 = r2;
          }
          return e2 ? "; domain=." + e2 : "";
        }
        return "";
      }
      var Ee = { G: () => !!o, V: function(t2) {
        $t.error("cookieStore error: " + t2);
      }, J: function(t2) {
        if (o) {
          try {
            for (var i2 = t2 + "=", e2 = o.cookie.split(";").filter((t3) => t3.length), r2 = 0; r2 < e2.length; r2++) {
              for (var s2 = e2[r2]; " " == s2.charAt(0); ) s2 = s2.substring(1, s2.length);
              if (0 === s2.indexOf(i2)) return decodeURIComponent(s2.substring(i2.length, s2.length));
            }
          } catch (t3) {
          }
          return null;
        }
      }, K: function(t2) {
        var i2;
        try {
          i2 = JSON.parse(Ee.J(t2)) || {};
        } catch (t3) {
        }
        return i2;
      }, Y: function(t2, i2, e2, r2, s2) {
        if (o) try {
          var n2 = "", a2 = "", l2 = Se(o.location.hostname, r2);
          if (e2) {
            var u2 = /* @__PURE__ */ new Date();
            u2.setTime(u2.getTime() + 24 * e2 * 60 * 60 * 1e3), n2 = "; expires=" + u2.toUTCString();
          }
          s2 && (a2 = "; secure");
          var h2 = t2 + "=" + encodeURIComponent(JSON.stringify(i2)) + n2 + "; SameSite=Lax; path=/" + l2 + a2;
          return h2.length > 3686.4 && $t.warn("cookieStore warning: large cookie, len=" + h2.length), o.cookie = h2, h2;
        } catch (t3) {
          return;
        }
      }, X: function(t2, i2) {
        if (null != o && o.cookie) try {
          Ee.Y(t2, "", -1, i2);
        } catch (t3) {
          return;
        }
      } };
      var $e = null;
      var ke = { G: function() {
        if (!M($e)) return $e;
        var i2 = true;
        if (O(t)) i2 = false;
        else try {
          var e2 = "__mplssupport__";
          ke.Y(e2, "xyz"), '"xyz"' !== ke.J(e2) && (i2 = false), ke.X(e2);
        } catch (t2) {
          i2 = false;
        }
        return i2 || $t.error("localStorage unsupported; falling back to cookie store"), $e = i2, i2;
      }, V: function(t2) {
        $t.error("localStorage error: " + t2);
      }, J: function(i2) {
        try {
          return null == t ? void 0 : t.localStorage.getItem(i2);
        } catch (t2) {
          ke.V(t2);
        }
        return null;
      }, K: function(t2) {
        try {
          return JSON.parse(ke.J(t2)) || {};
        } catch (t3) {
        }
        return null;
      }, Y: function(i2, e2) {
        try {
          null == t || t.localStorage.setItem(i2, JSON.stringify(e2));
        } catch (t2) {
          ke.V(t2);
        }
      }, X: function(i2) {
        try {
          null == t || t.localStorage.removeItem(i2);
        } catch (t2) {
          ke.V(t2);
        }
      } };
      var Pe = ["distinct_id", ii, ei, _i, gi];
      var Te = g({}, ke, { K: function(t2) {
        try {
          var i2 = {};
          try {
            i2 = Ee.K(t2) || {};
          } catch (t3) {
          }
          var e2 = Ct(i2, JSON.parse(ke.J(t2) || "{}"));
          return ke.Y(t2, e2), e2;
        } catch (t3) {
        }
        return null;
      }, Y: function(t2, i2, e2, r2, s2, n2) {
        try {
          ke.Y(t2, i2, void 0, void 0, n2);
          var o2 = {};
          Pe.forEach((t3) => {
            i2[t3] && (o2[t3] = i2[t3]);
          }), Object.keys(o2).length && Ee.Y(t2, o2, e2, r2, s2, n2);
        } catch (t3) {
          ke.V(t3);
        }
      }, X: function(i2, e2) {
        try {
          null == t || t.localStorage.removeItem(i2), Ee.X(i2, e2);
        } catch (t2) {
          ke.V(t2);
        }
      } });
      var Ie = {};
      var Re = { G: function() {
        return true;
      }, V: function(t2) {
        $t.error("memoryStorage error: " + t2);
      }, J: function(t2) {
        return Ie[t2] || null;
      }, K: function(t2) {
        return Ie[t2] || null;
      }, Y: function(t2, i2) {
        Ie[t2] = i2;
      }, X: function(t2) {
        delete Ie[t2];
      } };
      var Oe = null;
      var Ce = { G: function() {
        if (!M(Oe)) return Oe;
        if (Oe = true, O(t)) Oe = false;
        else try {
          var i2 = "__support__";
          Ce.Y(i2, "xyz"), '"xyz"' !== Ce.J(i2) && (Oe = false), Ce.X(i2);
        } catch (t2) {
          Oe = false;
        }
        return Oe;
      }, V: function(t2) {
        $t.error("sessionStorage error: ", t2);
      }, J: function(i2) {
        try {
          return null == t ? void 0 : t.sessionStorage.getItem(i2);
        } catch (t2) {
          Ce.V(t2);
        }
        return null;
      }, K: function(t2) {
        try {
          return JSON.parse(Ce.J(t2)) || null;
        } catch (t3) {
        }
        return null;
      }, Y: function(i2, e2) {
        try {
          null == t || t.sessionStorage.setItem(i2, JSON.stringify(e2));
        } catch (t2) {
          Ce.V(t2);
        }
      }, X: function(i2) {
        try {
          null == t || t.sessionStorage.removeItem(i2);
        } catch (t2) {
          Ce.V(t2);
        }
      } };
      var Fe = function(t2) {
        return t2[t2.PENDING = -1] = "PENDING", t2[t2.DENIED = 0] = "DENIED", t2[t2.GRANTED = 1] = "GRANTED", t2;
      }({});
      var Me = class {
        constructor(t2) {
          this._instance = t2;
        }
        get A() {
          return this._instance.config;
        }
        get consent() {
          return this.Z() ? Fe.DENIED : this.tt;
        }
        isOptedOut() {
          return "always" === this.A.cookieless_mode || (this.consent === Fe.DENIED || this.consent === Fe.PENDING && (this.A.opt_out_capturing_by_default || "on_reject" === this.A.cookieless_mode));
        }
        isOptedIn() {
          return !this.isOptedOut();
        }
        isExplicitlyOptedOut() {
          return this.consent === Fe.DENIED;
        }
        optInOut(t2) {
          this.it.Y(this.et, t2 ? 1 : 0, this.A.cookie_expiration, this.A.cross_subdomain_cookie, this.A.secure_cookie);
        }
        reset() {
          this.it.X(this.et, this.A.cross_subdomain_cookie);
        }
        get et() {
          var { token: t2, opt_out_capturing_cookie_prefix: i2, consent_persistence_name: e2 } = this._instance.config;
          return e2 || (i2 ? i2 + t2 : "__ph_opt_in_out_" + t2);
        }
        get tt() {
          var t2 = this.it.J(this.et);
          return q(t2) ? Fe.GRANTED : y(W, t2) ? Fe.DENIED : Fe.PENDING;
        }
        get it() {
          if (!this.rt) {
            var t2 = this.A.opt_out_capturing_persistence_type;
            this.rt = "localStorage" === t2 ? ke : Ee;
            var i2 = "localStorage" === t2 ? Ee : ke;
            i2.J(this.et) && (this.rt.J(this.et) || this.optInOut(q(i2.J(this.et))), i2.X(this.et, this.A.cross_subdomain_cookie));
          }
          return this.rt;
        }
        Z() {
          return !!this.A.respect_dnt && !!zt([null == n ? void 0 : n.doNotTrack, null == n ? void 0 : n.msDoNotTrack, v.doNotTrack], (t2) => q(t2));
        }
      };
      var Ae = kt("[Dead Clicks]");
      var je = () => true;
      var De = (t2) => {
        var i2, e2 = !(null == (i2 = t2.instance.persistence) || !i2.get_property(Qt)), r2 = t2.instance.config.capture_dead_clicks;
        return D(r2) ? r2 : e2;
      };
      var Le = class {
        get lazyLoadedDeadClicksAutocapture() {
          return this.st;
        }
        constructor(t2, i2, e2) {
          this.instance = t2, this.isEnabled = i2, this.onCapture = e2, this.startIfEnabled();
        }
        onRemoteConfig(t2) {
          this.instance.persistence && this.instance.persistence.register({ [Qt]: null == t2 ? void 0 : t2.captureDeadClicks }), this.startIfEnabled();
        }
        startIfEnabled() {
          this.isEnabled(this) && this.nt(() => {
            this.ot();
          });
        }
        nt(t2) {
          var i2, e2;
          null != (i2 = v.__PosthogExtensions__) && i2.initDeadClicksAutocapture && t2(), null == (e2 = v.__PosthogExtensions__) || null == e2.loadExternalDependency || e2.loadExternalDependency(this.instance, "dead-clicks-autocapture", (i3) => {
            i3 ? Ae.error("failed to load script", i3) : t2();
          });
        }
        ot() {
          var t2;
          if (o) {
            if (!this.st && null != (t2 = v.__PosthogExtensions__) && t2.initDeadClicksAutocapture) {
              var i2 = I(this.instance.config.capture_dead_clicks) ? this.instance.config.capture_dead_clicks : {};
              i2.__onCapture = this.onCapture, this.st = v.__PosthogExtensions__.initDeadClicksAutocapture(this.instance, i2), this.st.start(o), Ae.info("starting...");
            }
          } else Ae.error("`document` not found. Cannot start.");
        }
        stop() {
          this.st && (this.st.stop(), this.st = void 0, Ae.info("stopping..."));
        }
      };
      var Ne = kt("[ExceptionAutocapture]");
      var Ue = class {
        constructor(i2) {
          var e2, r2, s2;
          this.lt = () => {
            var i3;
            if (t && this.isEnabled && null != (i3 = v.__PosthogExtensions__) && i3.errorWrappingFunctions) {
              var e3 = v.__PosthogExtensions__.errorWrappingFunctions.wrapOnError, r3 = v.__PosthogExtensions__.errorWrappingFunctions.wrapUnhandledRejection, s3 = v.__PosthogExtensions__.errorWrappingFunctions.wrapConsoleError;
              try {
                !this.ut && this.A.capture_unhandled_errors && (this.ut = e3(this.captureException.bind(this))), !this.ht && this.A.capture_unhandled_rejections && (this.ht = r3(this.captureException.bind(this))), !this.dt && this.A.capture_console_errors && (this.dt = s3(this.captureException.bind(this)));
              } catch (t2) {
                Ne.error("failed to start", t2), this.vt();
              }
            }
          }, this._instance = i2, this.ct = !(null == (e2 = this._instance.persistence) || !e2.props[Jt]), this.A = this.ft(), this.gt = new V({ refillRate: null !== (r2 = this._instance.config.error_tracking.__exceptionRateLimiterRefillRate) && void 0 !== r2 ? r2 : 1, bucketSize: null !== (s2 = this._instance.config.error_tracking.__exceptionRateLimiterBucketSize) && void 0 !== s2 ? s2 : 10, refillInterval: 1e4, P: Ne }), this.startIfEnabled();
        }
        ft() {
          var t2 = this._instance.config.capture_exceptions, i2 = { capture_unhandled_errors: false, capture_unhandled_rejections: false, capture_console_errors: false };
          return I(t2) ? i2 = g({}, i2, t2) : (O(t2) ? this.ct : t2) && (i2 = g({}, i2, { capture_unhandled_errors: true, capture_unhandled_rejections: true })), i2;
        }
        get isEnabled() {
          return this.A.capture_console_errors || this.A.capture_unhandled_errors || this.A.capture_unhandled_rejections;
        }
        startIfEnabled() {
          this.isEnabled && (Ne.info("enabled"), this.nt(this.lt));
        }
        nt(t2) {
          var i2, e2;
          null != (i2 = v.__PosthogExtensions__) && i2.errorWrappingFunctions && t2(), null == (e2 = v.__PosthogExtensions__) || null == e2.loadExternalDependency || e2.loadExternalDependency(this._instance, "exception-autocapture", (i3) => {
            if (i3) return Ne.error("failed to load script", i3);
            t2();
          });
        }
        vt() {
          var t2, i2, e2;
          null == (t2 = this.ut) || t2.call(this), this.ut = void 0, null == (i2 = this.ht) || i2.call(this), this.ht = void 0, null == (e2 = this.dt) || e2.call(this), this.dt = void 0;
        }
        onRemoteConfig(t2) {
          var i2 = t2.autocaptureExceptions;
          this.ct = !!i2 || false, this.A = this.ft(), this._instance.persistence && this._instance.persistence.register({ [Jt]: this.ct }), this.startIfEnabled();
        }
        captureException(t2) {
          var i2, e2, r2 = null !== (i2 = null == t2 || null == (e2 = t2.$exception_list) || null == (e2 = e2[0]) ? void 0 : e2.type) && void 0 !== i2 ? i2 : "Exception";
          this.gt.consumeRateLimit(r2) ? Ne.info("Skipping exception capture because of client rate limiting.", { exception: r2 }) : this._instance.exceptions.sendExceptionEvent(t2);
        }
      };
      function ze(t2, i2, e2) {
        try {
          if (!(i2 in t2)) return () => {
          };
          var r2 = t2[i2], s2 = e2(r2);
          return T(s2) && (s2.prototype = s2.prototype || {}, Object.defineProperties(s2, { __posthog_wrapped__: { enumerable: false, value: true } })), t2[i2] = s2, () => {
            t2[i2] = r2;
          };
        } catch (t3) {
          return () => {
          };
        }
      }
      var He = class {
        constructor(i2) {
          var e2;
          this._instance = i2, this._t = (null == t || null == (e2 = t.location) ? void 0 : e2.pathname) || "";
        }
        get isEnabled() {
          return "history_change" === this._instance.config.capture_pageview;
        }
        startIfEnabled() {
          this.isEnabled && ($t.info("History API monitoring enabled, starting..."), this.monitorHistoryChanges());
        }
        stop() {
          this.yt && this.yt(), this.yt = void 0, $t.info("History API monitoring stopped");
        }
        monitorHistoryChanges() {
          var i2, e2;
          if (t && t.history) {
            var r2 = this;
            null != (i2 = t.history.pushState) && i2.__posthog_wrapped__ || ze(t.history, "pushState", (t2) => function(i3, e3, s2) {
              t2.call(this, i3, e3, s2), r2.bt("pushState");
            }), null != (e2 = t.history.replaceState) && e2.__posthog_wrapped__ || ze(t.history, "replaceState", (t2) => function(i3, e3, s2) {
              t2.call(this, i3, e3, s2), r2.bt("replaceState");
            }), this.wt();
          }
        }
        bt(i2) {
          try {
            var e2, r2 = null == t || null == (e2 = t.location) ? void 0 : e2.pathname;
            if (!r2) return;
            r2 !== this._t && this.isEnabled && this._instance.capture("$pageview", { navigation_type: i2 }), this._t = r2;
          } catch (t2) {
            $t.error("Error capturing " + i2 + " pageview", t2);
          }
        }
        wt() {
          if (!this.yt) {
            var i2 = () => {
              this.bt("popstate");
            };
            Ht(t, "popstate", i2), this.yt = () => {
              t && t.removeEventListener("popstate", i2);
            };
          }
        }
      };
      var Be = kt("[SegmentIntegration]");
      function qe(t2, i2) {
        var e2 = t2.config.segment;
        if (!e2) return i2();
        !function(t3, i3) {
          var e3 = t3.config.segment;
          if (!e3) return i3();
          var r2 = (e4) => {
            var r3 = () => e4.anonymousId() || ye();
            t3.config.get_device_id = r3, e4.id() && (t3.register({ distinct_id: e4.id(), $device_id: r3() }), t3.persistence.set_property(di, "identified")), i3();
          }, s2 = e3.user();
          "then" in s2 && T(s2.then) ? s2.then((t4) => r2(t4)) : r2(s2);
        }(t2, () => {
          e2.register(((t3) => {
            Promise && Promise.resolve || Be.warn("This browser does not have Promise support, and can not use the segment integration");
            var i3 = (i4, e3) => {
              if (!e3) return i4;
              i4.event.userId || i4.event.anonymousId === t3.get_distinct_id() || (Be.info("No userId set, resetting PostHog"), t3.reset()), i4.event.userId && i4.event.userId !== t3.get_distinct_id() && (Be.info("UserId set, identifying with PostHog"), t3.identify(i4.event.userId));
              var r2 = t3.calculateEventProperties(e3, i4.event.properties);
              return i4.event.properties = Object.assign({}, r2, i4.event.properties), i4;
            };
            return { name: "PostHog JS", type: "enrichment", version: "1.0.0", isLoaded: () => true, load: () => Promise.resolve(), track: (t4) => i3(t4, t4.event.event), page: (t4) => i3(t4, "$pageview"), identify: (t4) => i3(t4, "$identify"), screen: (t4) => i3(t4, "$screen") };
          })(t2)).then(() => {
            i2();
          });
        });
      }
      var We = "posthog-js";
      function Ge(t2, i2) {
        var { organization: e2, projectId: r2, prefix: s2, severityAllowList: n2 = ["error"], sendExceptionsToPostHog: o2 = true } = void 0 === i2 ? {} : i2;
        return (i3) => {
          var a2, l2, u2, h2, d2;
          if (!("*" === n2 || n2.includes(i3.level)) || !t2.__loaded) return i3;
          i3.tags || (i3.tags = {});
          var v2 = t2.requestRouter.endpointFor("ui", "/project/" + t2.config.token + "/person/" + t2.get_distinct_id());
          i3.tags["PostHog Person URL"] = v2, t2.sessionRecordingStarted() && (i3.tags["PostHog Recording URL"] = t2.get_session_replay_url({ withTimestamp: true }));
          var c2 = (null == (a2 = i3.exception) ? void 0 : a2.values) || [], f2 = c2.map((t3) => g({}, t3, { stacktrace: t3.stacktrace ? g({}, t3.stacktrace, { type: "raw", frames: (t3.stacktrace.frames || []).map((t4) => g({}, t4, { platform: "web:javascript" })) }) : void 0 })), p2 = { $exception_message: (null == (l2 = c2[0]) ? void 0 : l2.value) || i3.message, $exception_type: null == (u2 = c2[0]) ? void 0 : u2.type, $exception_personURL: v2, $exception_level: i3.level, $exception_list: f2, $sentry_event_id: i3.event_id, $sentry_exception: i3.exception, $sentry_exception_message: (null == (h2 = c2[0]) ? void 0 : h2.value) || i3.message, $sentry_exception_type: null == (d2 = c2[0]) ? void 0 : d2.type, $sentry_tags: i3.tags };
          return e2 && r2 && (p2.$sentry_url = (s2 || "https://sentry.io/organizations/") + e2 + "/issues/?project=" + r2 + "&query=" + i3.event_id), o2 && t2.exceptions.sendExceptionEvent(p2), i3;
        };
      }
      var Ve = class {
        constructor(t2, i2, e2, r2, s2, n2) {
          this.name = We, this.setupOnce = function(o2) {
            o2(Ge(t2, { organization: i2, projectId: e2, prefix: r2, severityAllowList: s2, sendExceptionsToPostHog: null == n2 || n2 }));
          };
        }
      };
      var Je = null != t && t.location ? oe(t.location.hash, "__posthog") || oe(location.hash, "state") : null;
      var Ke = "_postHogToolbarParams";
      var Ye = kt("[Toolbar]");
      var Xe = function(t2) {
        return t2[t2.UNINITIALIZED = 0] = "UNINITIALIZED", t2[t2.LOADING = 1] = "LOADING", t2[t2.LOADED = 2] = "LOADED", t2;
      }(Xe || {});
      var Qe = class {
        constructor(t2) {
          this.instance = t2;
        }
        xt(t2) {
          v.ph_toolbar_state = t2;
        }
        St() {
          var t2;
          return null !== (t2 = v.ph_toolbar_state) && void 0 !== t2 ? t2 : Xe.UNINITIALIZED;
        }
        maybeLoadToolbar(i2, e2, r2) {
          if (void 0 === i2 && (i2 = void 0), void 0 === e2 && (e2 = void 0), void 0 === r2 && (r2 = void 0), !t || !o) return false;
          i2 = null != i2 ? i2 : t.location, r2 = null != r2 ? r2 : t.history;
          try {
            if (!e2) {
              try {
                t.localStorage.setItem("test", "test"), t.localStorage.removeItem("test");
              } catch (t2) {
                return false;
              }
              e2 = null == t ? void 0 : t.localStorage;
            }
            var s2, n2 = Je || oe(i2.hash, "__posthog") || oe(i2.hash, "state"), a2 = n2 ? At(() => JSON.parse(atob(decodeURIComponent(n2)))) || At(() => JSON.parse(decodeURIComponent(n2))) : null;
            return a2 && "ph_authorize" === a2.action ? ((s2 = a2).source = "url", s2 && Object.keys(s2).length > 0 && (a2.desiredHash ? i2.hash = a2.desiredHash : r2 ? r2.replaceState(r2.state, "", i2.pathname + i2.search) : i2.hash = "")) : ((s2 = JSON.parse(e2.getItem(Ke) || "{}")).source = "localstorage", delete s2.userIntent), !(!s2.token || this.instance.config.token !== s2.token) && (this.loadToolbar(s2), true);
          } catch (t2) {
            return false;
          }
        }
        Et(t2) {
          var i2 = v.ph_load_toolbar || v.ph_load_editor;
          !A(i2) && T(i2) ? i2(t2, this.instance) : Ye.warn("No toolbar load function found");
        }
        loadToolbar(i2) {
          var e2 = !(null == o || !o.getElementById(mi));
          if (!t || e2) return false;
          var r2 = "custom" === this.instance.requestRouter.region && this.instance.config.advanced_disable_toolbar_metrics, s2 = g({ token: this.instance.config.token }, i2, { apiURL: this.instance.requestRouter.endpointFor("ui") }, r2 ? { instrument: false } : {});
          if (t.localStorage.setItem(Ke, JSON.stringify(g({}, s2, { source: void 0 }))), this.St() === Xe.LOADED) this.Et(s2);
          else if (this.St() === Xe.UNINITIALIZED) {
            var n2;
            this.xt(Xe.LOADING), null == (n2 = v.__PosthogExtensions__) || null == n2.loadExternalDependency || n2.loadExternalDependency(this.instance, "toolbar", (t2) => {
              if (t2) return Ye.error("[Toolbar] Failed to load", t2), void this.xt(Xe.UNINITIALIZED);
              this.xt(Xe.LOADED), this.Et(s2);
            }), Ht(t, "turbolinks:load", () => {
              this.xt(Xe.UNINITIALIZED), this.loadToolbar(s2);
            });
          }
          return true;
        }
        $t(t2) {
          return this.loadToolbar(t2);
        }
        maybeLoadEditor(t2, i2, e2) {
          return void 0 === t2 && (t2 = void 0), void 0 === i2 && (i2 = void 0), void 0 === e2 && (e2 = void 0), this.maybeLoadToolbar(t2, i2, e2);
        }
      };
      var Ze = kt("[TracingHeaders]");
      var tr = class {
        constructor(t2) {
          this.kt = void 0, this.Pt = void 0, this.lt = () => {
            var t3, i2;
            O(this.kt) && (null == (t3 = v.__PosthogExtensions__) || null == (t3 = t3.tracingHeadersPatchFns) || t3._patchXHR(this._instance.config.__add_tracing_headers || [], this._instance.get_distinct_id(), this._instance.sessionManager));
            O(this.Pt) && (null == (i2 = v.__PosthogExtensions__) || null == (i2 = i2.tracingHeadersPatchFns) || i2._patchFetch(this._instance.config.__add_tracing_headers || [], this._instance.get_distinct_id(), this._instance.sessionManager));
          }, this._instance = t2;
        }
        nt(t2) {
          var i2, e2;
          null != (i2 = v.__PosthogExtensions__) && i2.tracingHeadersPatchFns && t2(), null == (e2 = v.__PosthogExtensions__) || null == e2.loadExternalDependency || e2.loadExternalDependency(this._instance, "tracing-headers", (i3) => {
            if (i3) return Ze.error("failed to load script", i3);
            t2();
          });
        }
        startIfEnabledOrStop() {
          var t2, i2;
          this._instance.config.__add_tracing_headers ? this.nt(this.lt) : (null == (t2 = this.kt) || t2.call(this), null == (i2 = this.Pt) || i2.call(this), this.kt = void 0, this.Pt = void 0);
        }
      };
      var ir = "Mobile";
      var er = "iOS";
      var rr = "Android";
      var sr = "Tablet";
      var nr = rr + " " + sr;
      var or = "iPad";
      var ar = "Apple";
      var lr = ar + " Watch";
      var ur = "Safari";
      var hr = "BlackBerry";
      var dr = "Samsung";
      var vr = dr + "Browser";
      var cr = dr + " Internet";
      var fr = "Chrome";
      var pr = fr + " OS";
      var gr = fr + " " + er;
      var _r = "Internet Explorer";
      var mr = _r + " " + ir;
      var yr = "Opera";
      var br = yr + " Mini";
      var wr = "Edge";
      var xr = "Microsoft " + wr;
      var Sr = "Firefox";
      var Er = Sr + " " + er;
      var $r = "Nintendo";
      var kr = "PlayStation";
      var Pr = "Xbox";
      var Tr = rr + " " + ir;
      var Ir = ir + " " + ur;
      var Rr = "Windows";
      var Or = Rr + " Phone";
      var Cr = "Nokia";
      var Fr = "Ouya";
      var Mr = "Generic";
      var Ar = Mr + " " + ir.toLowerCase();
      var jr = Mr + " " + sr.toLowerCase();
      var Dr = "Konqueror";
      var Lr = "(\\d+(\\.\\d+)?)";
      var Nr = new RegExp("Version/" + Lr);
      var Ur = new RegExp(Pr, "i");
      var zr = new RegExp(kr + " \\w+", "i");
      var Hr = new RegExp($r + " \\w+", "i");
      var Br = new RegExp(hr + "|PlayBook|BB10", "i");
      var qr = { "NT3.51": "NT 3.11", "NT4.0": "NT 4.0", "5.0": "2000", 5.1: "XP", 5.2: "XP", "6.0": "Vista", 6.1: "7", 6.2: "8", 6.3: "8.1", 6.4: "10", "10.0": "10" };
      var Wr = (t2, i2) => i2 && y(i2, ar) || function(t3) {
        return y(t3, ur) && !y(t3, fr) && !y(t3, rr);
      }(t2);
      var Gr = function(t2, i2) {
        return i2 = i2 || "", y(t2, " OPR/") && y(t2, "Mini") ? br : y(t2, " OPR/") ? yr : Br.test(t2) ? hr : y(t2, "IE" + ir) || y(t2, "WPDesktop") ? mr : y(t2, vr) ? cr : y(t2, wr) || y(t2, "Edg/") ? xr : y(t2, "FBIOS") ? "Facebook " + ir : y(t2, "UCWEB") || y(t2, "UCBrowser") ? "UC Browser" : y(t2, "CriOS") ? gr : y(t2, "CrMo") || y(t2, fr) ? fr : y(t2, rr) && y(t2, ur) ? Tr : y(t2, "FxiOS") ? Er : y(t2.toLowerCase(), Dr.toLowerCase()) ? Dr : Wr(t2, i2) ? y(t2, ir) ? Ir : ur : y(t2, Sr) ? Sr : y(t2, "MSIE") || y(t2, "Trident/") ? _r : y(t2, "Gecko") ? Sr : "";
      };
      var Vr = { [mr]: [new RegExp("rv:" + Lr)], [xr]: [new RegExp(wr + "?\\/" + Lr)], [fr]: [new RegExp("(" + fr + "|CrMo)\\/" + Lr)], [gr]: [new RegExp("CriOS\\/" + Lr)], "UC Browser": [new RegExp("(UCBrowser|UCWEB)\\/" + Lr)], [ur]: [Nr], [Ir]: [Nr], [yr]: [new RegExp("(Opera|OPR)\\/" + Lr)], [Sr]: [new RegExp(Sr + "\\/" + Lr)], [Er]: [new RegExp("FxiOS\\/" + Lr)], [Dr]: [new RegExp("Konqueror[:/]?" + Lr, "i")], [hr]: [new RegExp(hr + " " + Lr), Nr], [Tr]: [new RegExp("android\\s" + Lr, "i")], [cr]: [new RegExp(vr + "\\/" + Lr)], [_r]: [new RegExp("(rv:|MSIE )" + Lr)], Mozilla: [new RegExp("rv:" + Lr)] };
      var Jr = function(t2, i2) {
        var e2 = Gr(t2, i2), r2 = Vr[e2];
        if (O(r2)) return null;
        for (var s2 = 0; s2 < r2.length; s2++) {
          var n2 = r2[s2], o2 = t2.match(n2);
          if (o2) return parseFloat(o2[o2.length - 2]);
        }
        return null;
      };
      var Kr = [[new RegExp(Pr + "; " + Pr + " (.*?)[);]", "i"), (t2) => [Pr, t2 && t2[1] || ""]], [new RegExp($r, "i"), [$r, ""]], [new RegExp(kr, "i"), [kr, ""]], [Br, [hr, ""]], [new RegExp(Rr, "i"), (t2, i2) => {
        if (/Phone/.test(i2) || /WPDesktop/.test(i2)) return [Or, ""];
        if (new RegExp(ir).test(i2) && !/IEMobile\b/.test(i2)) return [Rr + " " + ir, ""];
        var e2 = /Windows NT ([0-9.]+)/i.exec(i2);
        if (e2 && e2[1]) {
          var r2 = e2[1], s2 = qr[r2] || "";
          return /arm/i.test(i2) && (s2 = "RT"), [Rr, s2];
        }
        return [Rr, ""];
      }], [/((iPhone|iPad|iPod).*?OS (\d+)_(\d+)_?(\d+)?|iPhone)/, (t2) => {
        if (t2 && t2[3]) {
          var i2 = [t2[3], t2[4], t2[5] || "0"];
          return [er, i2.join(".")];
        }
        return [er, ""];
      }], [/(watch.*\/(\d+\.\d+\.\d+)|watch os,(\d+\.\d+),)/i, (t2) => {
        var i2 = "";
        return t2 && t2.length >= 3 && (i2 = O(t2[2]) ? t2[3] : t2[2]), ["watchOS", i2];
      }], [new RegExp("(" + rr + " (\\d+)\\.(\\d+)\\.?(\\d+)?|" + rr + ")", "i"), (t2) => {
        if (t2 && t2[2]) {
          var i2 = [t2[2], t2[3], t2[4] || "0"];
          return [rr, i2.join(".")];
        }
        return [rr, ""];
      }], [/Mac OS X (\d+)[_.](\d+)[_.]?(\d+)?/i, (t2) => {
        var i2 = ["Mac OS X", ""];
        if (t2 && t2[1]) {
          var e2 = [t2[1], t2[2], t2[3] || "0"];
          i2[1] = e2.join(".");
        }
        return i2;
      }], [/Mac/i, ["Mac OS X", ""]], [/CrOS/, [pr, ""]], [/Linux|debian/i, ["Linux", ""]]];
      var Yr = function(t2) {
        return Hr.test(t2) ? $r : zr.test(t2) ? kr : Ur.test(t2) ? Pr : new RegExp(Fr, "i").test(t2) ? Fr : new RegExp("(" + Or + "|WPDesktop)", "i").test(t2) ? Or : /iPad/.test(t2) ? or : /iPod/.test(t2) ? "iPod Touch" : /iPhone/.test(t2) ? "iPhone" : /(watch)(?: ?os[,/]|\d,\d\/)[\d.]+/i.test(t2) ? lr : Br.test(t2) ? hr : /(kobo)\s(ereader|touch)/i.test(t2) ? "Kobo" : new RegExp(Cr, "i").test(t2) ? Cr : /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i.test(t2) || /(kf[a-z]+)( bui|\)).+silk\//i.test(t2) ? "Kindle Fire" : /(Android|ZTE)/i.test(t2) ? !new RegExp(ir).test(t2) || /(9138B|TB782B|Nexus [97]|pixel c|HUAWEISHT|BTV|noble nook|smart ultra 6)/i.test(t2) ? /pixel[\daxl ]{1,6}/i.test(t2) && !/pixel c/i.test(t2) || /(huaweimed-al00|tah-|APA|SM-G92|i980|zte|U304AA)/i.test(t2) || /lmy47v/i.test(t2) && !/QTAQZ3/i.test(t2) ? rr : nr : rr : new RegExp("(pda|" + ir + ")", "i").test(t2) ? Ar : new RegExp(sr, "i").test(t2) && !new RegExp(sr + " pc", "i").test(t2) ? jr : "";
      };
      var Xr = "https?://(.*)";
      var Qr = ["gclid", "gclsrc", "dclid", "gbraid", "wbraid", "fbclid", "msclkid", "twclid", "li_fat_id", "igshid", "ttclid", "rdt_cid", "epik", "qclid", "sccid", "irclid", "_kx"];
      var Zr = Ft(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gad_source", "mc_cid"], Qr);
      var ts = "<masked>";
      var is = ["li_fat_id"];
      function es(t2, i2, e2) {
        if (!o) return {};
        var r2, s2 = i2 ? Ft([], Qr, e2 || []) : [], n2 = rs(ne(o.URL, s2, ts), t2), a2 = (r2 = {}, Ot(is, function(t3) {
          var i3 = Ee.J(t3);
          r2[t3] = i3 || null;
        }), r2);
        return Ct(a2, n2);
      }
      function rs(t2, i2) {
        var e2 = Zr.concat(i2 || []), r2 = {};
        return Ot(e2, function(i3) {
          var e3 = se(t2, i3);
          r2[i3] = e3 || null;
        }), r2;
      }
      function ss(t2) {
        var i2 = function(t3) {
          return t3 ? 0 === t3.search(Xr + "google.([^/?]*)") ? "google" : 0 === t3.search(Xr + "bing.com") ? "bing" : 0 === t3.search(Xr + "yahoo.com") ? "yahoo" : 0 === t3.search(Xr + "duckduckgo.com") ? "duckduckgo" : null : null;
        }(t2), e2 = "yahoo" != i2 ? "q" : "p", r2 = {};
        if (!M(i2)) {
          r2.$search_engine = i2;
          var s2 = o ? se(o.referrer, e2) : "";
          s2.length && (r2.ph_keyword = s2);
        }
        return r2;
      }
      function ns() {
        return navigator.language || navigator.userLanguage;
      }
      function os() {
        return (null == o ? void 0 : o.referrer) || "$direct";
      }
      function as(t2, i2) {
        var e2 = t2 ? Ft([], Qr, i2 || []) : [], r2 = null == a ? void 0 : a.href.substring(0, 1e3);
        return { r: os().substring(0, 1e3), u: r2 ? ne(r2, e2, ts) : void 0 };
      }
      function ls(t2) {
        var i2, { r: e2, u: r2 } = t2, s2 = { $referrer: e2, $referring_domain: null == e2 ? void 0 : "$direct" == e2 ? "$direct" : null == (i2 = ee(e2)) ? void 0 : i2.host };
        if (r2) {
          s2.$current_url = r2;
          var n2 = ee(r2);
          s2.$host = null == n2 ? void 0 : n2.host, s2.$pathname = null == n2 ? void 0 : n2.pathname;
          var o2 = rs(r2);
          Ct(s2, o2);
        }
        if (e2) {
          var a2 = ss(e2);
          Ct(s2, a2);
        }
        return s2;
      }
      function us() {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (t2) {
          return;
        }
      }
      function hs() {
        try {
          return (/* @__PURE__ */ new Date()).getTimezoneOffset();
        } catch (t2) {
          return;
        }
      }
      function ds(i2, e2) {
        if (!d) return {};
        var r2, s2, n2, o2 = i2 ? Ft([], Qr, e2 || []) : [], [l2, u2] = function(t2) {
          for (var i3 = 0; i3 < Kr.length; i3++) {
            var [e3, r3] = Kr[i3], s3 = e3.exec(t2), n3 = s3 && (T(r3) ? r3(s3, t2) : r3);
            if (n3) return n3;
          }
          return ["", ""];
        }(d);
        return Ct(Dt({ $os: l2, $os_version: u2, $browser: Gr(d, navigator.vendor), $device: Yr(d), $device_type: (s2 = d, n2 = Yr(s2), n2 === or || n2 === nr || "Kobo" === n2 || "Kindle Fire" === n2 || n2 === jr ? sr : n2 === $r || n2 === Pr || n2 === kr || n2 === Fr ? "Console" : n2 === lr ? "Wearable" : n2 ? ir : "Desktop"), $timezone: us(), $timezone_offset: hs() }), { $current_url: ne(null == a ? void 0 : a.href, o2, ts), $host: null == a ? void 0 : a.host, $pathname: null == a ? void 0 : a.pathname, $raw_user_agent: d.length > 1e3 ? d.substring(0, 997) + "..." : d, $browser_version: Jr(d, navigator.vendor), $browser_language: ns(), $browser_language_prefix: (r2 = ns(), "string" == typeof r2 ? r2.split("-")[0] : void 0), $screen_height: null == t ? void 0 : t.screen.height, $screen_width: null == t ? void 0 : t.screen.width, $viewport_height: null == t ? void 0 : t.innerHeight, $viewport_width: null == t ? void 0 : t.innerWidth, $lib: "web", $lib_version: c.LIB_VERSION, $insert_id: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10), $time: Date.now() / 1e3 });
      }
      var vs = kt("[Web Vitals]");
      var cs = 9e5;
      var fs = class {
        constructor(t2) {
          var i2;
          this.Tt = false, this.O = false, this.q = { url: void 0, metrics: [], firstMetricTimestamp: void 0 }, this.It = () => {
            clearTimeout(this.Rt), 0 !== this.q.metrics.length && (this._instance.capture("$web_vitals", this.q.metrics.reduce((t3, i3) => g({}, t3, { ["$web_vitals_" + i3.name + "_event"]: g({}, i3), ["$web_vitals_" + i3.name + "_value"]: i3.value }), {})), this.q = { url: void 0, metrics: [], firstMetricTimestamp: void 0 });
          }, this.Ot = (t3) => {
            var i3, e2 = null == (i3 = this._instance.sessionManager) ? void 0 : i3.checkAndGetSessionAndWindowId(true);
            if (O(e2)) vs.error("Could not read session ID. Dropping metrics!");
            else {
              this.q = this.q || { url: void 0, metrics: [], firstMetricTimestamp: void 0 };
              var r2 = this.Ct();
              if (!O(r2)) if (A(null == t3 ? void 0 : t3.name) || A(null == t3 ? void 0 : t3.value)) vs.error("Invalid metric received", t3);
              else if (this.Ft && t3.value >= this.Ft) vs.error("Ignoring metric with value >= " + this.Ft, t3);
              else this.q.url !== r2 && (this.It(), this.Rt = setTimeout(this.It, this.flushToCaptureTimeoutMs)), O(this.q.url) && (this.q.url = r2), this.q.firstMetricTimestamp = O(this.q.firstMetricTimestamp) ? Date.now() : this.q.firstMetricTimestamp, t3.attribution && t3.attribution.interactionTargetElement && (t3.attribution.interactionTargetElement = void 0), this.q.metrics.push(g({}, t3, { $current_url: r2, $session_id: e2.sessionId, $window_id: e2.windowId, timestamp: Date.now() })), this.q.metrics.length === this.allowedMetrics.length && this.It();
            }
          }, this.lt = () => {
            var t3, i3, e2, r2, s2 = v.__PosthogExtensions__;
            O(s2) || O(s2.postHogWebVitalsCallbacks) || ({ onLCP: t3, onCLS: i3, onFCP: e2, onINP: r2 } = s2.postHogWebVitalsCallbacks), t3 && i3 && e2 && r2 ? (this.allowedMetrics.indexOf("LCP") > -1 && t3(this.Ot.bind(this)), this.allowedMetrics.indexOf("CLS") > -1 && i3(this.Ot.bind(this)), this.allowedMetrics.indexOf("FCP") > -1 && e2(this.Ot.bind(this)), this.allowedMetrics.indexOf("INP") > -1 && r2(this.Ot.bind(this)), this.O = true) : vs.error("web vitals callbacks not loaded - not starting");
          }, this._instance = t2, this.Tt = !(null == (i2 = this._instance.persistence) || !i2.props[Xt]), this.startIfEnabled();
        }
        get allowedMetrics() {
          var t2, i2, e2 = I(this._instance.config.capture_performance) ? null == (t2 = this._instance.config.capture_performance) ? void 0 : t2.web_vitals_allowed_metrics : void 0;
          return O(e2) ? (null == (i2 = this._instance.persistence) ? void 0 : i2.props[Zt]) || ["CLS", "FCP", "INP", "LCP"] : e2;
        }
        get flushToCaptureTimeoutMs() {
          return (I(this._instance.config.capture_performance) ? this._instance.config.capture_performance.web_vitals_delayed_flush_ms : void 0) || 5e3;
        }
        get Ft() {
          var t2 = I(this._instance.config.capture_performance) && j(this._instance.config.capture_performance.__web_vitals_max_value) ? this._instance.config.capture_performance.__web_vitals_max_value : cs;
          return 0 < t2 && t2 <= 6e4 ? cs : t2;
        }
        get isEnabled() {
          var t2 = null == a ? void 0 : a.protocol;
          if ("http:" !== t2 && "https:" !== t2) return vs.info("Web Vitals are disabled on non-http/https protocols"), false;
          var i2 = I(this._instance.config.capture_performance) ? this._instance.config.capture_performance.web_vitals : D(this._instance.config.capture_performance) ? this._instance.config.capture_performance : void 0;
          return D(i2) ? i2 : this.Tt;
        }
        startIfEnabled() {
          this.isEnabled && !this.O && (vs.info("enabled, starting..."), this.nt(this.lt));
        }
        onRemoteConfig(t2) {
          var i2 = I(t2.capturePerformance) && !!t2.capturePerformance.web_vitals, e2 = I(t2.capturePerformance) ? t2.capturePerformance.web_vitals_allowed_metrics : void 0;
          this._instance.persistence && (this._instance.persistence.register({ [Xt]: i2 }), this._instance.persistence.register({ [Zt]: e2 })), this.Tt = i2, this.startIfEnabled();
        }
        nt(t2) {
          var i2, e2;
          null != (i2 = v.__PosthogExtensions__) && i2.postHogWebVitalsCallbacks && t2(), null == (e2 = v.__PosthogExtensions__) || null == e2.loadExternalDependency || e2.loadExternalDependency(this._instance, "web-vitals", (i3) => {
            i3 ? vs.error("failed to load script", i3) : t2();
          });
        }
        Ct() {
          var i2 = t ? t.location.href : void 0;
          if (i2) {
            var e2 = this._instance.config.mask_personal_data_properties, r2 = this._instance.config.custom_personal_data_properties, s2 = e2 ? Ft([], Qr, r2 || []) : [];
            return ne(i2, s2, ts);
          }
          vs.error("Could not determine current URL");
        }
      };
      var ps = kt("[Heatmaps]");
      function gs(t2) {
        return I(t2) && "clientX" in t2 && "clientY" in t2 && j(t2.clientX) && j(t2.clientY);
      }
      var _s = class {
        constructor(t2) {
          var i2;
          this.rageclicks = new Zi(), this.Tt = false, this.O = false, this.Mt = null, this.instance = t2, this.Tt = !(null == (i2 = this.instance.persistence) || !i2.props[Vt]);
        }
        get flushIntervalMilliseconds() {
          var t2 = 5e3;
          return I(this.instance.config.capture_heatmaps) && this.instance.config.capture_heatmaps.flush_interval_milliseconds && (t2 = this.instance.config.capture_heatmaps.flush_interval_milliseconds), t2;
        }
        get isEnabled() {
          return O(this.instance.config.capture_heatmaps) ? O(this.instance.config.enable_heatmaps) ? this.Tt : this.instance.config.enable_heatmaps : false !== this.instance.config.capture_heatmaps;
        }
        startIfEnabled() {
          if (this.isEnabled) {
            if (this.O) return;
            ps.info("starting..."), this.At(), this.Mt = setInterval(this.jt.bind(this), this.flushIntervalMilliseconds);
          } else {
            var t2, i2;
            clearInterval(null !== (t2 = this.Mt) && void 0 !== t2 ? t2 : void 0), null == (i2 = this.Dt) || i2.stop(), this.getAndClearBuffer();
          }
        }
        onRemoteConfig(t2) {
          var i2 = !!t2.heatmaps;
          this.instance.persistence && this.instance.persistence.register({ [Vt]: i2 }), this.Tt = i2, this.startIfEnabled();
        }
        getAndClearBuffer() {
          var t2 = this.q;
          return this.q = void 0, t2;
        }
        Lt(t2) {
          this.Nt(t2.originalEvent, "deadclick");
        }
        At() {
          t && o && (Ht(t, "beforeunload", this.jt.bind(this)), Ht(o, "click", (i2) => this.Nt(i2 || (null == t ? void 0 : t.event)), { capture: true }), Ht(o, "mousemove", (i2) => this.Ut(i2 || (null == t ? void 0 : t.event)), { capture: true }), this.Dt = new Le(this.instance, je, this.Lt.bind(this)), this.Dt.startIfEnabled(), this.O = true);
        }
        zt(i2, e2) {
          var r2 = this.instance.scrollManager.scrollY(), s2 = this.instance.scrollManager.scrollX(), n2 = this.instance.scrollManager.scrollElement(), o2 = function(i3, e3, r3) {
            for (var s3 = i3; s3 && xi(s3) && !Si(s3, "body"); ) {
              if (s3 === r3) return false;
              if (y(e3, null == t ? void 0 : t.getComputedStyle(s3).position)) return true;
              s3 = Mi(s3);
            }
            return false;
          }(Oi(i2), ["fixed", "sticky"], n2);
          return { x: i2.clientX + (o2 ? 0 : s2), y: i2.clientY + (o2 ? 0 : r2), target_fixed: o2, type: e2 };
        }
        Nt(t2, i2) {
          var e2;
          if (void 0 === i2 && (i2 = "click"), !wi(t2.target) && gs(t2)) {
            var r2 = this.zt(t2, i2);
            null != (e2 = this.rageclicks) && e2.isRageClick(t2.clientX, t2.clientY, (/* @__PURE__ */ new Date()).getTime()) && this.Ht(g({}, r2, { type: "rageclick" })), this.Ht(r2);
          }
        }
        Ut(t2) {
          !wi(t2.target) && gs(t2) && (clearTimeout(this.Bt), this.Bt = setTimeout(() => {
            this.Ht(this.zt(t2, "mousemove"));
          }, 500));
        }
        Ht(i2) {
          if (t) {
            var e2 = t.location.href, r2 = this.instance.config.mask_personal_data_properties, s2 = this.instance.config.custom_personal_data_properties, n2 = r2 ? Ft([], Qr, s2 || []) : [], o2 = ne(e2, n2, ts);
            this.q = this.q || {}, this.q[o2] || (this.q[o2] = []), this.q[o2].push(i2);
          }
        }
        jt() {
          this.q && !R(this.q) && this.instance.capture("$$heatmap", { $heatmap_data: this.getAndClearBuffer() });
        }
      };
      var ms = class {
        constructor(t2) {
          this._instance = t2;
        }
        doPageView(i2, e2) {
          var r2, s2 = this.qt(i2, e2);
          return this.Wt = { pathname: null !== (r2 = null == t ? void 0 : t.location.pathname) && void 0 !== r2 ? r2 : "", pageViewId: e2, timestamp: i2 }, this._instance.scrollManager.resetContext(), s2;
        }
        doPageLeave(t2) {
          var i2;
          return this.qt(t2, null == (i2 = this.Wt) ? void 0 : i2.pageViewId);
        }
        doEvent() {
          var t2;
          return { $pageview_id: null == (t2 = this.Wt) ? void 0 : t2.pageViewId };
        }
        qt(t2, i2) {
          var e2 = this.Wt;
          if (!e2) return { $pageview_id: i2 };
          var r2 = { $pageview_id: i2, $prev_pageview_id: e2.pageViewId }, s2 = this._instance.scrollManager.getContext();
          if (s2 && !this._instance.config.disable_scroll_properties) {
            var { maxScrollHeight: n2, lastScrollY: o2, maxScrollY: a2, maxContentHeight: l2, lastContentY: u2, maxContentY: h2 } = s2;
            if (!(O(n2) || O(o2) || O(a2) || O(l2) || O(u2) || O(h2))) {
              n2 = Math.ceil(n2), o2 = Math.ceil(o2), a2 = Math.ceil(a2), l2 = Math.ceil(l2), u2 = Math.ceil(u2), h2 = Math.ceil(h2);
              var d2 = n2 <= 1 ? 1 : G(o2 / n2, 0, 1, $t), v2 = n2 <= 1 ? 1 : G(a2 / n2, 0, 1, $t), c2 = l2 <= 1 ? 1 : G(u2 / l2, 0, 1, $t), f2 = l2 <= 1 ? 1 : G(h2 / l2, 0, 1, $t);
              r2 = Ct(r2, { $prev_pageview_last_scroll: o2, $prev_pageview_last_scroll_percentage: d2, $prev_pageview_max_scroll: a2, $prev_pageview_max_scroll_percentage: v2, $prev_pageview_last_content: u2, $prev_pageview_last_content_percentage: c2, $prev_pageview_max_content: h2, $prev_pageview_max_content_percentage: f2 });
            }
          }
          return e2.pathname && (r2.$prev_pageview_pathname = e2.pathname), e2.timestamp && (r2.$prev_pageview_duration = (t2.getTime() - e2.timestamp.getTime()) / 1e3), r2;
        }
      };
      var ys = Uint8Array;
      var bs = Uint16Array;
      var ws = Uint32Array;
      var xs = new ys([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]);
      var Ss = new ys([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]);
      var Es = new ys([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
      var $s = function(t2, i2) {
        for (var e2 = new bs(31), r2 = 0; r2 < 31; ++r2) e2[r2] = i2 += 1 << t2[r2 - 1];
        var s2 = new ws(e2[30]);
        for (r2 = 1; r2 < 30; ++r2) for (var n2 = e2[r2]; n2 < e2[r2 + 1]; ++n2) s2[n2] = n2 - e2[r2] << 5 | r2;
        return [e2, s2];
      };
      var ks = $s(xs, 2);
      var Ps = ks[0];
      var Ts = ks[1];
      Ps[28] = 258, Ts[258] = 28;
      for (Is = $s(Ss, 0)[1], Rs = new bs(32768), Os = 0; Os < 32768; ++Os) {
        Cs = (43690 & Os) >>> 1 | (21845 & Os) << 1;
        Cs = (61680 & (Cs = (52428 & Cs) >>> 2 | (13107 & Cs) << 2)) >>> 4 | (3855 & Cs) << 4, Rs[Os] = ((65280 & Cs) >>> 8 | (255 & Cs) << 8) >>> 1;
      }
      var Cs;
      var Is;
      var Rs;
      var Os;
      var Fs = function(t2, i2, e2) {
        for (var r2 = t2.length, s2 = 0, n2 = new bs(i2); s2 < r2; ++s2) ++n2[t2[s2] - 1];
        var o2, a2 = new bs(i2);
        for (s2 = 0; s2 < i2; ++s2) a2[s2] = a2[s2 - 1] + n2[s2 - 1] << 1;
        if (e2) {
          o2 = new bs(1 << i2);
          var l2 = 15 - i2;
          for (s2 = 0; s2 < r2; ++s2) if (t2[s2]) for (var u2 = s2 << 4 | t2[s2], h2 = i2 - t2[s2], d2 = a2[t2[s2] - 1]++ << h2, v2 = d2 | (1 << h2) - 1; d2 <= v2; ++d2) o2[Rs[d2] >>> l2] = u2;
        } else for (o2 = new bs(r2), s2 = 0; s2 < r2; ++s2) o2[s2] = Rs[a2[t2[s2] - 1]++] >>> 15 - t2[s2];
        return o2;
      };
      var Ms = new ys(288);
      for (Os = 0; Os < 144; ++Os) Ms[Os] = 8;
      for (Os = 144; Os < 256; ++Os) Ms[Os] = 9;
      for (Os = 256; Os < 280; ++Os) Ms[Os] = 7;
      for (Os = 280; Os < 288; ++Os) Ms[Os] = 8;
      var As = new ys(32);
      for (Os = 0; Os < 32; ++Os) As[Os] = 5;
      var js = Fs(Ms, 9, 0);
      var Ds = Fs(As, 5, 0);
      var Ls = function(t2) {
        return (t2 / 8 >> 0) + (7 & t2 && 1);
      };
      var Ns = function(t2, i2, e2) {
        (null == e2 || e2 > t2.length) && (e2 = t2.length);
        var r2 = new (t2 instanceof bs ? bs : t2 instanceof ws ? ws : ys)(e2 - i2);
        return r2.set(t2.subarray(i2, e2)), r2;
      };
      var Us = function(t2, i2, e2) {
        e2 <<= 7 & i2;
        var r2 = i2 / 8 >> 0;
        t2[r2] |= e2, t2[r2 + 1] |= e2 >>> 8;
      };
      var zs = function(t2, i2, e2) {
        e2 <<= 7 & i2;
        var r2 = i2 / 8 >> 0;
        t2[r2] |= e2, t2[r2 + 1] |= e2 >>> 8, t2[r2 + 2] |= e2 >>> 16;
      };
      var Hs = function(t2, i2) {
        for (var e2 = [], r2 = 0; r2 < t2.length; ++r2) t2[r2] && e2.push({ s: r2, f: t2[r2] });
        var s2 = e2.length, n2 = e2.slice();
        if (!s2) return [new ys(0), 0];
        if (1 == s2) {
          var o2 = new ys(e2[0].s + 1);
          return o2[e2[0].s] = 1, [o2, 1];
        }
        e2.sort(function(t3, i3) {
          return t3.f - i3.f;
        }), e2.push({ s: -1, f: 25001 });
        var a2 = e2[0], l2 = e2[1], u2 = 0, h2 = 1, d2 = 2;
        for (e2[0] = { s: -1, f: a2.f + l2.f, l: a2, r: l2 }; h2 != s2 - 1; ) a2 = e2[e2[u2].f < e2[d2].f ? u2++ : d2++], l2 = e2[u2 != h2 && e2[u2].f < e2[d2].f ? u2++ : d2++], e2[h2++] = { s: -1, f: a2.f + l2.f, l: a2, r: l2 };
        var v2 = n2[0].s;
        for (r2 = 1; r2 < s2; ++r2) n2[r2].s > v2 && (v2 = n2[r2].s);
        var c2 = new bs(v2 + 1), f2 = Bs(e2[h2 - 1], c2, 0);
        if (f2 > i2) {
          r2 = 0;
          var p2 = 0, g2 = f2 - i2, _2 = 1 << g2;
          for (n2.sort(function(t3, i3) {
            return c2[i3.s] - c2[t3.s] || t3.f - i3.f;
          }); r2 < s2; ++r2) {
            var m2 = n2[r2].s;
            if (!(c2[m2] > i2)) break;
            p2 += _2 - (1 << f2 - c2[m2]), c2[m2] = i2;
          }
          for (p2 >>>= g2; p2 > 0; ) {
            var y2 = n2[r2].s;
            c2[y2] < i2 ? p2 -= 1 << i2 - c2[y2]++ - 1 : ++r2;
          }
          for (; r2 >= 0 && p2; --r2) {
            var b2 = n2[r2].s;
            c2[b2] == i2 && (--c2[b2], ++p2);
          }
          f2 = i2;
        }
        return [new ys(c2), f2];
      };
      var Bs = function(t2, i2, e2) {
        return -1 == t2.s ? Math.max(Bs(t2.l, i2, e2 + 1), Bs(t2.r, i2, e2 + 1)) : i2[t2.s] = e2;
      };
      var qs = function(t2) {
        for (var i2 = t2.length; i2 && !t2[--i2]; ) ;
        for (var e2 = new bs(++i2), r2 = 0, s2 = t2[0], n2 = 1, o2 = function(t3) {
          e2[r2++] = t3;
        }, a2 = 1; a2 <= i2; ++a2) if (t2[a2] == s2 && a2 != i2) ++n2;
        else {
          if (!s2 && n2 > 2) {
            for (; n2 > 138; n2 -= 138) o2(32754);
            n2 > 2 && (o2(n2 > 10 ? n2 - 11 << 5 | 28690 : n2 - 3 << 5 | 12305), n2 = 0);
          } else if (n2 > 3) {
            for (o2(s2), --n2; n2 > 6; n2 -= 6) o2(8304);
            n2 > 2 && (o2(n2 - 3 << 5 | 8208), n2 = 0);
          }
          for (; n2--; ) o2(s2);
          n2 = 1, s2 = t2[a2];
        }
        return [e2.subarray(0, r2), i2];
      };
      var Ws = function(t2, i2) {
        for (var e2 = 0, r2 = 0; r2 < i2.length; ++r2) e2 += t2[r2] * i2[r2];
        return e2;
      };
      var Gs = function(t2, i2, e2) {
        var r2 = e2.length, s2 = Ls(i2 + 2);
        t2[s2] = 255 & r2, t2[s2 + 1] = r2 >>> 8, t2[s2 + 2] = 255 ^ t2[s2], t2[s2 + 3] = 255 ^ t2[s2 + 1];
        for (var n2 = 0; n2 < r2; ++n2) t2[s2 + n2 + 4] = e2[n2];
        return 8 * (s2 + 4 + r2);
      };
      var Vs = function(t2, i2, e2, r2, s2, n2, o2, a2, l2, u2, h2) {
        Us(i2, h2++, e2), ++s2[256];
        for (var d2 = Hs(s2, 15), v2 = d2[0], c2 = d2[1], f2 = Hs(n2, 15), p2 = f2[0], g2 = f2[1], _2 = qs(v2), m2 = _2[0], y2 = _2[1], b2 = qs(p2), w2 = b2[0], x2 = b2[1], S2 = new bs(19), E2 = 0; E2 < m2.length; ++E2) S2[31 & m2[E2]]++;
        for (E2 = 0; E2 < w2.length; ++E2) S2[31 & w2[E2]]++;
        for (var k2 = Hs(S2, 7), P2 = k2[0], T2 = k2[1], I2 = 19; I2 > 4 && !P2[Es[I2 - 1]]; --I2) ;
        var R2, O2, C2, F2, M2 = u2 + 5 << 3, A2 = Ws(s2, Ms) + Ws(n2, As) + o2, j2 = Ws(s2, v2) + Ws(n2, p2) + o2 + 14 + 3 * I2 + Ws(S2, P2) + (2 * S2[16] + 3 * S2[17] + 7 * S2[18]);
        if (M2 <= A2 && M2 <= j2) return Gs(i2, h2, t2.subarray(l2, l2 + u2));
        if (Us(i2, h2, 1 + (j2 < A2)), h2 += 2, j2 < A2) {
          R2 = Fs(v2, c2, 0), O2 = v2, C2 = Fs(p2, g2, 0), F2 = p2;
          var D2 = Fs(P2, T2, 0);
          Us(i2, h2, y2 - 257), Us(i2, h2 + 5, x2 - 1), Us(i2, h2 + 10, I2 - 4), h2 += 14;
          for (E2 = 0; E2 < I2; ++E2) Us(i2, h2 + 3 * E2, P2[Es[E2]]);
          h2 += 3 * I2;
          for (var L2 = [m2, w2], N2 = 0; N2 < 2; ++N2) {
            var U2 = L2[N2];
            for (E2 = 0; E2 < U2.length; ++E2) {
              var z2 = 31 & U2[E2];
              Us(i2, h2, D2[z2]), h2 += P2[z2], z2 > 15 && (Us(i2, h2, U2[E2] >>> 5 & 127), h2 += U2[E2] >>> 12);
            }
          }
        } else R2 = js, O2 = Ms, C2 = Ds, F2 = As;
        for (E2 = 0; E2 < a2; ++E2) if (r2[E2] > 255) {
          z2 = r2[E2] >>> 18 & 31;
          zs(i2, h2, R2[z2 + 257]), h2 += O2[z2 + 257], z2 > 7 && (Us(i2, h2, r2[E2] >>> 23 & 31), h2 += xs[z2]);
          var H2 = 31 & r2[E2];
          zs(i2, h2, C2[H2]), h2 += F2[H2], H2 > 3 && (zs(i2, h2, r2[E2] >>> 5 & 8191), h2 += Ss[H2]);
        } else zs(i2, h2, R2[r2[E2]]), h2 += O2[r2[E2]];
        return zs(i2, h2, R2[256]), h2 + O2[256];
      };
      var Js = new ws([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
      var Ks = function() {
        for (var t2 = new ws(256), i2 = 0; i2 < 256; ++i2) {
          for (var e2 = i2, r2 = 9; --r2; ) e2 = (1 & e2 && 3988292384) ^ e2 >>> 1;
          t2[i2] = e2;
        }
        return t2;
      }();
      var Ys = function(t2, i2, e2, r2, s2) {
        return function(t3, i3, e3, r3, s3, n2) {
          var o2 = t3.length, a2 = new ys(r3 + o2 + 5 * (1 + Math.floor(o2 / 7e3)) + s3), l2 = a2.subarray(r3, a2.length - s3), u2 = 0;
          if (!i3 || o2 < 8) for (var h2 = 0; h2 <= o2; h2 += 65535) {
            var d2 = h2 + 65535;
            d2 < o2 ? u2 = Gs(l2, u2, t3.subarray(h2, d2)) : (l2[h2] = n2, u2 = Gs(l2, u2, t3.subarray(h2, o2)));
          }
          else {
            for (var v2 = Js[i3 - 1], c2 = v2 >>> 13, f2 = 8191 & v2, p2 = (1 << e3) - 1, g2 = new bs(32768), _2 = new bs(p2 + 1), m2 = Math.ceil(e3 / 3), y2 = 2 * m2, b2 = function(i4) {
              return (t3[i4] ^ t3[i4 + 1] << m2 ^ t3[i4 + 2] << y2) & p2;
            }, w2 = new ws(25e3), x2 = new bs(288), S2 = new bs(32), E2 = 0, k2 = 0, P2 = (h2 = 0, 0), T2 = 0, I2 = 0; h2 < o2; ++h2) {
              var R2 = b2(h2), O2 = 32767 & h2, C2 = _2[R2];
              if (g2[O2] = C2, _2[R2] = O2, T2 <= h2) {
                var F2 = o2 - h2;
                if ((E2 > 7e3 || P2 > 24576) && F2 > 423) {
                  u2 = Vs(t3, l2, 0, w2, x2, S2, k2, P2, I2, h2 - I2, u2), P2 = E2 = k2 = 0, I2 = h2;
                  for (var M2 = 0; M2 < 286; ++M2) x2[M2] = 0;
                  for (M2 = 0; M2 < 30; ++M2) S2[M2] = 0;
                }
                var A2 = 2, j2 = 0, D2 = f2, L2 = O2 - C2 & 32767;
                if (F2 > 2 && R2 == b2(h2 - L2)) for (var N2 = Math.min(c2, F2) - 1, U2 = Math.min(32767, h2), z2 = Math.min(258, F2); L2 <= U2 && --D2 && O2 != C2; ) {
                  if (t3[h2 + A2] == t3[h2 + A2 - L2]) {
                    for (var H2 = 0; H2 < z2 && t3[h2 + H2] == t3[h2 + H2 - L2]; ++H2) ;
                    if (H2 > A2) {
                      if (A2 = H2, j2 = L2, H2 > N2) break;
                      var B2 = Math.min(L2, H2 - 2), q2 = 0;
                      for (M2 = 0; M2 < B2; ++M2) {
                        var W2 = h2 - L2 + M2 + 32768 & 32767, G2 = W2 - g2[W2] + 32768 & 32767;
                        G2 > q2 && (q2 = G2, C2 = W2);
                      }
                    }
                  }
                  L2 += (O2 = C2) - (C2 = g2[O2]) + 32768 & 32767;
                }
                if (j2) {
                  w2[P2++] = 268435456 | Ts[A2] << 18 | Is[j2];
                  var V2 = 31 & Ts[A2], J2 = 31 & Is[j2];
                  k2 += xs[V2] + Ss[J2], ++x2[257 + V2], ++S2[J2], T2 = h2 + A2, ++E2;
                } else w2[P2++] = t3[h2], ++x2[t3[h2]];
              }
            }
            u2 = Vs(t3, l2, n2, w2, x2, S2, k2, P2, I2, h2 - I2, u2);
          }
          return Ns(a2, 0, r3 + Ls(u2) + s3);
        }(t2, null == i2.level ? 6 : i2.level, null == i2.mem ? Math.ceil(1.5 * Math.max(8, Math.min(13, Math.log(t2.length)))) : 12 + i2.mem, e2, r2, true);
      };
      var Xs = function(t2, i2, e2) {
        for (; e2; ++i2) t2[i2] = e2, e2 >>>= 8;
      };
      function Qs(t2, i2) {
        void 0 === i2 && (i2 = {});
        var e2 = /* @__PURE__ */ function() {
          var t3 = 4294967295;
          return { p: function(i3) {
            for (var e3 = t3, r3 = 0; r3 < i3.length; ++r3) e3 = Ks[255 & e3 ^ i3[r3]] ^ e3 >>> 8;
            t3 = e3;
          }, d: function() {
            return 4294967295 ^ t3;
          } };
        }(), r2 = t2.length;
        e2.p(t2);
        var s2, n2 = Ys(t2, i2, 10 + ((s2 = i2).filename && s2.filename.length + 1 || 0), 8), o2 = n2.length;
        return function(t3, i3) {
          var e3 = i3.filename;
          if (t3[0] = 31, t3[1] = 139, t3[2] = 8, t3[8] = i3.level < 2 ? 4 : 9 == i3.level ? 2 : 0, t3[9] = 3, 0 != i3.mtime && Xs(t3, 4, Math.floor(new Date(i3.mtime || Date.now()) / 1e3)), e3) {
            t3[3] = 8;
            for (var r3 = 0; r3 <= e3.length; ++r3) t3[r3 + 10] = e3.charCodeAt(r3);
          }
        }(n2, i2), Xs(n2, o2 - 8, e2.d()), Xs(n2, o2 - 4, r2), n2;
      }
      var Zs = function(t2) {
        var i2, e2, r2, s2, n2 = "";
        for (i2 = e2 = 0, r2 = (t2 = (t2 + "").replace(/\r\n/g, "\n").replace(/\r/g, "\n")).length, s2 = 0; s2 < r2; s2++) {
          var o2 = t2.charCodeAt(s2), a2 = null;
          o2 < 128 ? e2++ : a2 = o2 > 127 && o2 < 2048 ? String.fromCharCode(o2 >> 6 | 192, 63 & o2 | 128) : String.fromCharCode(o2 >> 12 | 224, o2 >> 6 & 63 | 128, 63 & o2 | 128), M(a2) || (e2 > i2 && (n2 += t2.substring(i2, e2)), n2 += a2, i2 = e2 = s2 + 1);
        }
        return e2 > i2 && (n2 += t2.substring(i2, t2.length)), n2;
      };
      var tn = !!u || !!l;
      var en = "text/plain";
      var rn = (t2, i2) => {
        var [e2, r2] = t2.split("?"), s2 = g({}, i2);
        null == r2 || r2.split("&").forEach((t3) => {
          var [i3] = t3.split("=");
          delete s2[i3];
        });
        var n2 = re(s2);
        return e2 + "?" + (n2 = n2 ? (r2 ? r2 + "&" : "") + n2 : r2);
      };
      var sn = (t2, i2) => JSON.stringify(t2, (t3, i3) => "bigint" == typeof i3 ? i3.toString() : i3, i2);
      var nn = (t2) => {
        var { data: i2, compression: e2 } = t2;
        if (i2) {
          if (e2 === ie.GZipJS) {
            var r2 = Qs(function(t3, i3) {
              var e3 = t3.length;
              if ("undefined" != typeof TextEncoder) return new TextEncoder().encode(t3);
              for (var r3 = new ys(t3.length + (t3.length >>> 1)), s3 = 0, n3 = function(t4) {
                r3[s3++] = t4;
              }, o3 = 0; o3 < e3; ++o3) {
                if (s3 + 5 > r3.length) {
                  var a3 = new ys(s3 + 8 + (e3 - o3 << 1));
                  a3.set(r3), r3 = a3;
                }
                var l2 = t3.charCodeAt(o3);
                l2 < 128 || i3 ? n3(l2) : l2 < 2048 ? (n3(192 | l2 >>> 6), n3(128 | 63 & l2)) : l2 > 55295 && l2 < 57344 ? (n3(240 | (l2 = 65536 + (1047552 & l2) | 1023 & t3.charCodeAt(++o3)) >>> 18), n3(128 | l2 >>> 12 & 63), n3(128 | l2 >>> 6 & 63), n3(128 | 63 & l2)) : (n3(224 | l2 >>> 12), n3(128 | l2 >>> 6 & 63), n3(128 | 63 & l2));
              }
              return Ns(r3, 0, s3);
            }(sn(i2)), { mtime: 0 }), s2 = new Blob([r2], { type: en });
            return { contentType: en, body: s2, estimatedSize: s2.size };
          }
          if (e2 === ie.Base64) {
            var n2 = function(t3) {
              var i3, e3, r3, s3, n3, o3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", a3 = 0, l2 = 0, u2 = "", h2 = [];
              if (!t3) return t3;
              t3 = Zs(t3);
              do {
                i3 = (n3 = t3.charCodeAt(a3++) << 16 | t3.charCodeAt(a3++) << 8 | t3.charCodeAt(a3++)) >> 18 & 63, e3 = n3 >> 12 & 63, r3 = n3 >> 6 & 63, s3 = 63 & n3, h2[l2++] = o3.charAt(i3) + o3.charAt(e3) + o3.charAt(r3) + o3.charAt(s3);
              } while (a3 < t3.length);
              switch (u2 = h2.join(""), t3.length % 3) {
                case 1:
                  u2 = u2.slice(0, -2) + "==";
                  break;
                case 2:
                  u2 = u2.slice(0, -1) + "=";
              }
              return u2;
            }(sn(i2)), o2 = ((t3) => "data=" + encodeURIComponent("string" == typeof t3 ? t3 : sn(t3)))(n2);
            return { contentType: "application/x-www-form-urlencoded", body: o2, estimatedSize: new Blob([o2]).size };
          }
          var a2 = sn(i2);
          return { contentType: "application/json", body: a2, estimatedSize: new Blob([a2]).size };
        }
      };
      var on = [];
      l && on.push({ transport: "fetch", method: (t2) => {
        var i2, e2, { contentType: r2, body: s2, estimatedSize: n2 } = null !== (i2 = nn(t2)) && void 0 !== i2 ? i2 : {}, o2 = new Headers();
        Ot(t2.headers, function(t3, i3) {
          o2.append(i3, t3);
        }), r2 && o2.append("Content-Type", r2);
        var a2 = t2.url, u2 = null;
        if (h) {
          var d2 = new h();
          u2 = { signal: d2.signal, timeout: setTimeout(() => d2.abort(), t2.timeout) };
        }
        l(a2, g({ method: (null == t2 ? void 0 : t2.method) || "GET", headers: o2, keepalive: "POST" === t2.method && (n2 || 0) < 52428.8, body: s2, signal: null == (e2 = u2) ? void 0 : e2.signal }, t2.fetchOptions)).then((i3) => i3.text().then((e3) => {
          var r3 = { statusCode: i3.status, text: e3 };
          if (200 === i3.status) try {
            r3.json = JSON.parse(e3);
          } catch (t3) {
            $t.error(t3);
          }
          null == t2.callback || t2.callback(r3);
        })).catch((i3) => {
          $t.error(i3), null == t2.callback || t2.callback({ statusCode: 0, text: i3 });
        }).finally(() => u2 ? clearTimeout(u2.timeout) : null);
      } }), u && on.push({ transport: "XHR", method: (t2) => {
        var i2, e2 = new u();
        e2.open(t2.method || "GET", t2.url, true);
        var { contentType: r2, body: s2 } = null !== (i2 = nn(t2)) && void 0 !== i2 ? i2 : {};
        Ot(t2.headers, function(t3, i3) {
          e2.setRequestHeader(i3, t3);
        }), r2 && e2.setRequestHeader("Content-Type", r2), t2.timeout && (e2.timeout = t2.timeout), t2.disableXHRCredentials || (e2.withCredentials = true), e2.onreadystatechange = () => {
          if (4 === e2.readyState) {
            var i3 = { statusCode: e2.status, text: e2.responseText };
            if (200 === e2.status) try {
              i3.json = JSON.parse(e2.responseText);
            } catch (t3) {
            }
            null == t2.callback || t2.callback(i3);
          }
        }, e2.send(s2);
      } }), null != n && n.sendBeacon && on.push({ transport: "sendBeacon", method: (t2) => {
        var i2 = rn(t2.url, { beacon: "1" });
        try {
          var e2, { contentType: r2, body: s2 } = null !== (e2 = nn(t2)) && void 0 !== e2 ? e2 : {}, o2 = "string" == typeof s2 ? new Blob([s2], { type: r2 }) : s2;
          n.sendBeacon(i2, o2);
        } catch (t3) {
        }
      } });
      var an = function(t2, i2) {
        if (!function(t3) {
          try {
            new RegExp(t3);
          } catch (t4) {
            return false;
          }
          return true;
        }(i2)) return false;
        try {
          return new RegExp(i2).test(t2);
        } catch (t3) {
          return false;
        }
      };
      function ln(t2, i2, e2) {
        return sn({ distinct_id: t2, userPropertiesToSet: i2, userPropertiesToSetOnce: e2 });
      }
      var un = { exact: (t2, i2) => i2.some((i3) => t2.some((t3) => i3 === t3)), is_not: (t2, i2) => i2.every((i3) => t2.every((t3) => i3 !== t3)), regex: (t2, i2) => i2.some((i3) => t2.some((t3) => an(i3, t3))), not_regex: (t2, i2) => i2.every((i3) => t2.every((t3) => !an(i3, t3))), icontains: (t2, i2) => i2.map(hn).some((i3) => t2.map(hn).some((t3) => i3.includes(t3))), not_icontains: (t2, i2) => i2.map(hn).every((i3) => t2.map(hn).every((t3) => !i3.includes(t3))) };
      var hn = (t2) => t2.toLowerCase();
      var dn = kt("[Error tracking]");
      var vn = class {
        constructor(t2) {
          var i2, e2;
          this.Gt = [], this.Vt = new vt([new ct(), new St(), new pt(), new ft(), new wt(), new bt(), new _t(), new xt()], [nt, lt]), this._instance = t2, this.Gt = null !== (i2 = null == (e2 = this._instance.persistence) ? void 0 : e2.get_property(Kt)) && void 0 !== i2 ? i2 : [];
        }
        onRemoteConfig(t2) {
          var i2, e2, r2, s2 = null !== (i2 = null == (e2 = t2.errorTracking) ? void 0 : e2.suppressionRules) && void 0 !== i2 ? i2 : [], n2 = null == (r2 = t2.errorTracking) ? void 0 : r2.captureExtensionExceptions;
          this.Gt = s2, this._instance.persistence && this._instance.persistence.register({ [Kt]: this.Gt, [Yt]: n2 });
        }
        get Jt() {
          var t2, i2 = !!this._instance.get_property(Yt), e2 = this._instance.config.error_tracking.captureExtensionExceptions;
          return null !== (t2 = null != e2 ? e2 : i2) && void 0 !== t2 && t2;
        }
        buildProperties(t2, i2) {
          return this.Vt.buildFromUnknown(t2, { syntheticException: null == i2 ? void 0 : i2.syntheticException, mechanism: { handled: null == i2 ? void 0 : i2.handled } });
        }
        sendExceptionEvent(t2) {
          if (this.Kt(t2)) dn.info("Skipping exception capture because a suppression rule matched");
          else {
            if (this.Jt || !this.Yt(t2)) return this._instance.capture("$exception", t2, { _noTruncate: true, _batchKey: "exceptionEvent" });
            dn.info("Skipping exception capture because it was thrown by an extension");
          }
        }
        Kt(t2) {
          var i2 = t2.$exception_list;
          if (!i2 || !P(i2) || 0 === i2.length) return false;
          var e2 = i2.reduce((t3, i3) => {
            var { type: e3, value: r2 } = i3;
            return C(e3) && e3.length > 0 && t3.$exception_types.push(e3), C(r2) && r2.length > 0 && t3.$exception_values.push(r2), t3;
          }, { $exception_types: [], $exception_values: [] });
          return this.Gt.some((t3) => {
            var i3 = t3.values.map((t4) => {
              var i4, r2 = un[t4.operator], s2 = P(t4.value) ? t4.value : [t4.value], n2 = null !== (i4 = e2[t4.key]) && void 0 !== i4 ? i4 : [];
              return s2.length > 0 && r2(s2, n2);
            });
            return "OR" === t3.type ? i3.some(Boolean) : i3.every(Boolean);
          });
        }
        Yt(t2) {
          var i2 = t2.$exception_list;
          return !(!i2 || !P(i2)) && i2.flatMap((t3) => {
            var i3, e2;
            return null !== (i3 = null == (e2 = t3.stacktrace) ? void 0 : e2.frames) && void 0 !== i3 ? i3 : [];
          }).some((t3) => t3.filename && t3.filename.startsWith("chrome-extension://"));
        }
      };
      var cn = kt("[FeatureFlags]");
      var fn = "$active_feature_flags";
      var pn = "$override_feature_flags";
      var gn = "$feature_flag_payloads";
      var _n = "$override_feature_flag_payloads";
      var mn = "$feature_flag_request_id";
      var yn = (t2) => {
        var i2 = {};
        for (var [e2, r2] of Mt(t2 || {})) r2 && (i2[e2] = r2);
        return i2;
      };
      var bn = (t2) => {
        var i2 = t2.flags;
        return i2 ? (t2.featureFlags = Object.fromEntries(Object.keys(i2).map((t3) => {
          var e2;
          return [t3, null !== (e2 = i2[t3].variant) && void 0 !== e2 ? e2 : i2[t3].enabled];
        })), t2.featureFlagPayloads = Object.fromEntries(Object.keys(i2).filter((t3) => i2[t3].enabled).filter((t3) => {
          var e2;
          return null == (e2 = i2[t3].metadata) ? void 0 : e2.payload;
        }).map((t3) => {
          var e2;
          return [t3, null == (e2 = i2[t3].metadata) ? void 0 : e2.payload];
        }))) : cn.warn("Using an older version of the feature flags endpoint. Please upgrade your PostHog server to the latest version"), t2;
      };
      var wn = function(t2) {
        return t2.FeatureFlags = "feature_flags", t2.Recordings = "recordings", t2;
      }({});
      var xn = class {
        constructor(t2) {
          this.Xt = false, this.Qt = false, this.Zt = false, this.ti = false, this.ii = false, this.ei = false, this.ri = false, this._instance = t2, this.featureFlagEventHandlers = [];
        }
        si() {
          var t2 = this._instance.config.evaluation_environments;
          return null != t2 && t2.length ? t2.filter((t3) => {
            var i2 = t3 && "string" == typeof t3 && t3.trim().length > 0;
            return i2 || cn.error("Invalid evaluation environment found:", t3, "Expected non-empty string"), i2;
          }) : [];
        }
        ni() {
          return this.si().length > 0;
        }
        flags() {
          if (this._instance.config.__preview_remote_config) this.ei = true;
          else {
            var t2 = !this.oi && (this._instance.config.advanced_disable_feature_flags || this._instance.config.advanced_disable_feature_flags_on_first_load);
            this.ai({ disableFlags: t2 });
          }
        }
        get hasLoadedFlags() {
          return this.Qt;
        }
        getFlags() {
          return Object.keys(this.getFlagVariants());
        }
        getFlagsWithDetails() {
          var t2 = this._instance.get_property(ni), i2 = this._instance.get_property(pn), e2 = this._instance.get_property(_n);
          if (!e2 && !i2) return t2 || {};
          var r2 = Ct({}, t2 || {}), s2 = [.../* @__PURE__ */ new Set([...Object.keys(e2 || {}), ...Object.keys(i2 || {})])];
          for (var n2 of s2) {
            var o2, a2, l2 = r2[n2], u2 = null == i2 ? void 0 : i2[n2], h2 = O(u2) ? null !== (o2 = null == l2 ? void 0 : l2.enabled) && void 0 !== o2 && o2 : !!u2, d2 = O(u2) ? l2.variant : "string" == typeof u2 ? u2 : void 0, v2 = null == e2 ? void 0 : e2[n2], c2 = g({}, l2, { enabled: h2, variant: h2 ? null != d2 ? d2 : null == l2 ? void 0 : l2.variant : void 0 });
            if (h2 !== (null == l2 ? void 0 : l2.enabled) && (c2.original_enabled = null == l2 ? void 0 : l2.enabled), d2 !== (null == l2 ? void 0 : l2.variant) && (c2.original_variant = null == l2 ? void 0 : l2.variant), v2) c2.metadata = g({}, null == l2 ? void 0 : l2.metadata, { payload: v2, original_payload: null == l2 || null == (a2 = l2.metadata) ? void 0 : a2.payload });
            r2[n2] = c2;
          }
          return this.Xt || (cn.warn(" Overriding feature flag details!", { flagDetails: t2, overriddenPayloads: e2, finalDetails: r2 }), this.Xt = true), r2;
        }
        getFlagVariants() {
          var t2 = this._instance.get_property(ri), i2 = this._instance.get_property(pn);
          if (!i2) return t2 || {};
          for (var e2 = Ct({}, t2), r2 = Object.keys(i2), s2 = 0; s2 < r2.length; s2++) e2[r2[s2]] = i2[r2[s2]];
          return this.Xt || (cn.warn(" Overriding feature flags!", { enabledFlags: t2, overriddenFlags: i2, finalFlags: e2 }), this.Xt = true), e2;
        }
        getFlagPayloads() {
          var t2 = this._instance.get_property(gn), i2 = this._instance.get_property(_n);
          if (!i2) return t2 || {};
          for (var e2 = Ct({}, t2 || {}), r2 = Object.keys(i2), s2 = 0; s2 < r2.length; s2++) e2[r2[s2]] = i2[r2[s2]];
          return this.Xt || (cn.warn(" Overriding feature flag payloads!", { flagPayloads: t2, overriddenPayloads: i2, finalPayloads: e2 }), this.Xt = true), e2;
        }
        reloadFeatureFlags() {
          this.ti || this._instance.config.advanced_disable_feature_flags || this.oi || (this.oi = setTimeout(() => {
            this.ai();
          }, 5));
        }
        li() {
          clearTimeout(this.oi), this.oi = void 0;
        }
        ensureFlagsLoaded() {
          this.Qt || this.Zt || this.oi || this.reloadFeatureFlags();
        }
        setAnonymousDistinctId(t2) {
          this.$anon_distinct_id = t2;
        }
        setReloadingPaused(t2) {
          this.ti = t2;
        }
        ai(t2) {
          var i2;
          if (this.li(), !this._instance.L()) if (this.Zt) this.ii = true;
          else {
            var e2 = { token: this._instance.config.token, distinct_id: this._instance.get_distinct_id(), groups: this._instance.getGroups(), $anon_distinct_id: this.$anon_distinct_id, person_properties: g({}, (null == (i2 = this._instance.persistence) ? void 0 : i2.get_initial_props()) || {}, this._instance.get_property(oi) || {}), group_properties: this._instance.get_property(ai) };
            (null != t2 && t2.disableFlags || this._instance.config.advanced_disable_feature_flags) && (e2.disable_flags = true), this.ni() && (e2.evaluation_environments = this.si());
            var r2 = this._instance.config.__preview_remote_config, s2 = r2 ? "/flags/?v=2" : "/flags/?v=2&config=true", n2 = this._instance.config.advanced_only_evaluate_survey_feature_flags ? "&only_evaluate_survey_feature_flags=true" : "", o2 = this._instance.requestRouter.endpointFor("api", s2 + n2);
            r2 && (e2.timezone = us()), this.Zt = true, this._instance.ui({ method: "POST", url: o2, data: e2, compression: this._instance.config.disable_compression ? void 0 : ie.Base64, timeout: this._instance.config.feature_flag_request_timeout_ms, callback: (t3) => {
              var i3, r3, s3 = true;
              (200 === t3.statusCode && (this.ii || (this.$anon_distinct_id = void 0), s3 = false), this.Zt = false, this.ei) || (this.ei = true, this._instance.hi(null !== (r3 = t3.json) && void 0 !== r3 ? r3 : {}));
              if (!e2.disable_flags || this.ii) if (this.ri = !s3, t3.json && null != (i3 = t3.json.quotaLimited) && i3.includes(wn.FeatureFlags)) cn.warn("You have hit your feature flags quota limit, and will not be able to load feature flags until the quota is reset.  Please visit https://posthog.com/docs/billing/limits-alerts to learn more.");
              else {
                var n3;
                if (!e2.disable_flags) this.receivedFeatureFlags(null !== (n3 = t3.json) && void 0 !== n3 ? n3 : {}, s3);
                this.ii && (this.ii = false, this.ai());
              }
            } });
          }
        }
        getFeatureFlag(t2, i2) {
          if (void 0 === i2 && (i2 = {}), this.Qt || this.getFlags() && this.getFlags().length > 0) {
            var e2 = this.getFlagVariants()[t2], r2 = "" + e2, s2 = this._instance.get_property(mn) || void 0, n2 = this._instance.get_property(hi) || {};
            if ((i2.send_event || !("send_event" in i2)) && (!(t2 in n2) || !n2[t2].includes(r2))) {
              var o2, a2, l2, u2, h2, d2, v2, c2, f2;
              P(n2[t2]) ? n2[t2].push(r2) : n2[t2] = [r2], null == (o2 = this._instance.persistence) || o2.register({ [hi]: n2 });
              var p2 = this.getFeatureFlagDetails(t2), g2 = { $feature_flag: t2, $feature_flag_response: e2, $feature_flag_payload: this.getFeatureFlagPayload(t2) || null, $feature_flag_request_id: s2, $feature_flag_bootstrapped_response: (null == (a2 = this._instance.config.bootstrap) || null == (a2 = a2.featureFlags) ? void 0 : a2[t2]) || null, $feature_flag_bootstrapped_payload: (null == (l2 = this._instance.config.bootstrap) || null == (l2 = l2.featureFlagPayloads) ? void 0 : l2[t2]) || null, $used_bootstrap_value: !this.ri };
              O(null == p2 || null == (u2 = p2.metadata) ? void 0 : u2.version) || (g2.$feature_flag_version = p2.metadata.version);
              var _2, m2 = null !== (h2 = null == p2 || null == (d2 = p2.reason) ? void 0 : d2.description) && void 0 !== h2 ? h2 : null == p2 || null == (v2 = p2.reason) ? void 0 : v2.code;
              if (m2 && (g2.$feature_flag_reason = m2), null != p2 && null != (c2 = p2.metadata) && c2.id && (g2.$feature_flag_id = p2.metadata.id), O(null == p2 ? void 0 : p2.original_variant) && O(null == p2 ? void 0 : p2.original_enabled) || (g2.$feature_flag_original_response = O(p2.original_variant) ? p2.original_enabled : p2.original_variant), null != p2 && null != (f2 = p2.metadata) && f2.original_payload) g2.$feature_flag_original_payload = null == p2 || null == (_2 = p2.metadata) ? void 0 : _2.original_payload;
              this._instance.capture("$feature_flag_called", g2);
            }
            return e2;
          }
          cn.warn('getFeatureFlag for key "' + t2 + `" failed. Feature flags didn't load in time.`);
        }
        getFeatureFlagDetails(t2) {
          return this.getFlagsWithDetails()[t2];
        }
        getFeatureFlagPayload(t2) {
          return this.getFlagPayloads()[t2];
        }
        getRemoteConfigPayload(t2, i2) {
          var e2 = this._instance.config.token, r2 = { distinct_id: this._instance.get_distinct_id(), token: e2 };
          this.ni() && (r2.evaluation_environments = this.si()), this._instance.ui({ method: "POST", url: this._instance.requestRouter.endpointFor("api", "/flags/?v=2&config=true"), data: r2, compression: this._instance.config.disable_compression ? void 0 : ie.Base64, timeout: this._instance.config.feature_flag_request_timeout_ms, callback: (e3) => {
            var r3, s2 = null == (r3 = e3.json) ? void 0 : r3.featureFlagPayloads;
            i2((null == s2 ? void 0 : s2[t2]) || void 0);
          } });
        }
        isFeatureEnabled(t2, i2) {
          if (void 0 === i2 && (i2 = {}), this.Qt || this.getFlags() && this.getFlags().length > 0) {
            var e2 = this.getFeatureFlag(t2, i2);
            return O(e2) ? void 0 : !!e2;
          }
          cn.warn('isFeatureEnabled for key "' + t2 + `" failed. Feature flags didn't load in time.`);
        }
        addFeatureFlagsHandler(t2) {
          this.featureFlagEventHandlers.push(t2);
        }
        removeFeatureFlagsHandler(t2) {
          this.featureFlagEventHandlers = this.featureFlagEventHandlers.filter((i2) => i2 !== t2);
        }
        receivedFeatureFlags(t2, i2) {
          if (this._instance.persistence) {
            this.Qt = true;
            var e2 = this.getFlagVariants(), r2 = this.getFlagPayloads(), s2 = this.getFlagsWithDetails();
            !function(t3, i3, e3, r3, s3) {
              void 0 === e3 && (e3 = {}), void 0 === r3 && (r3 = {}), void 0 === s3 && (s3 = {});
              var n2 = bn(t3), o2 = n2.flags, a2 = n2.featureFlags, l2 = n2.featureFlagPayloads;
              if (a2) {
                var u2 = t3.requestId;
                if (P(a2)) {
                  cn.warn("v1 of the feature flags endpoint is deprecated. Please use the latest version.");
                  var h2 = {};
                  if (a2) for (var d2 = 0; d2 < a2.length; d2++) h2[a2[d2]] = true;
                  i3 && i3.register({ [fn]: a2, [ri]: h2 });
                } else {
                  var v2 = a2, c2 = l2, f2 = o2;
                  t3.errorsWhileComputingFlags && (v2 = g({}, e3, v2), c2 = g({}, r3, c2), f2 = g({}, s3, f2)), i3 && i3.register(g({ [fn]: Object.keys(yn(v2)), [ri]: v2 || {}, [gn]: c2 || {}, [ni]: f2 || {} }, u2 ? { [mn]: u2 } : {}));
                }
              }
            }(t2, this._instance.persistence, e2, r2, s2), this.di(i2);
          }
        }
        override(t2, i2) {
          void 0 === i2 && (i2 = false), cn.warn("override is deprecated. Please use overrideFeatureFlags instead."), this.overrideFeatureFlags({ flags: t2, suppressWarning: i2 });
        }
        overrideFeatureFlags(t2) {
          if (!this._instance.__loaded || !this._instance.persistence) return cn.uninitializedWarning("posthog.featureFlags.overrideFeatureFlags");
          if (false === t2) return this._instance.persistence.unregister(pn), this._instance.persistence.unregister(_n), void this.di();
          if (t2 && "object" == typeof t2 && ("flags" in t2 || "payloads" in t2)) {
            var i2, e2 = t2;
            if (this.Xt = Boolean(null !== (i2 = e2.suppressWarning) && void 0 !== i2 && i2), "flags" in e2) {
              if (false === e2.flags) this._instance.persistence.unregister(pn);
              else if (e2.flags) if (P(e2.flags)) {
                for (var r2 = {}, s2 = 0; s2 < e2.flags.length; s2++) r2[e2.flags[s2]] = true;
                this._instance.persistence.register({ [pn]: r2 });
              } else this._instance.persistence.register({ [pn]: e2.flags });
            }
            return "payloads" in e2 && (false === e2.payloads ? this._instance.persistence.unregister(_n) : e2.payloads && this._instance.persistence.register({ [_n]: e2.payloads })), void this.di();
          }
          this.di();
        }
        onFeatureFlags(t2) {
          if (this.addFeatureFlagsHandler(t2), this.Qt) {
            var { flags: i2, flagVariants: e2 } = this.vi();
            t2(i2, e2);
          }
          return () => this.removeFeatureFlagsHandler(t2);
        }
        updateEarlyAccessFeatureEnrollment(t2, i2, e2) {
          var r2, s2 = (this._instance.get_property(si) || []).find((i3) => i3.flagKey === t2), n2 = { ["$feature_enrollment/" + t2]: i2 }, o2 = { $feature_flag: t2, $feature_enrollment: i2, $set: n2 };
          s2 && (o2.$early_access_feature_name = s2.name), e2 && (o2.$feature_enrollment_stage = e2), this._instance.capture("$feature_enrollment_update", o2), this.setPersonPropertiesForFlags(n2, false);
          var a2 = g({}, this.getFlagVariants(), { [t2]: i2 });
          null == (r2 = this._instance.persistence) || r2.register({ [fn]: Object.keys(yn(a2)), [ri]: a2 }), this.di();
        }
        getEarlyAccessFeatures(t2, i2, e2) {
          void 0 === i2 && (i2 = false);
          var r2 = this._instance.get_property(si), s2 = e2 ? "&" + e2.map((t3) => "stage=" + t3).join("&") : "";
          if (r2 && !i2) return t2(r2);
          this._instance.ui({ url: this._instance.requestRouter.endpointFor("api", "/api/early_access_features/?token=" + this._instance.config.token + s2), method: "GET", callback: (i3) => {
            var e3, r3;
            if (i3.json) {
              var s3 = i3.json.earlyAccessFeatures;
              return null == (e3 = this._instance.persistence) || e3.unregister(si), null == (r3 = this._instance.persistence) || r3.register({ [si]: s3 }), t2(s3);
            }
          } });
        }
        vi() {
          var t2 = this.getFlags(), i2 = this.getFlagVariants();
          return { flags: t2.filter((t3) => i2[t3]), flagVariants: Object.keys(i2).filter((t3) => i2[t3]).reduce((t3, e2) => (t3[e2] = i2[e2], t3), {}) };
        }
        di(t2) {
          var { flags: i2, flagVariants: e2 } = this.vi();
          this.featureFlagEventHandlers.forEach((r2) => r2(i2, e2, { errorsLoading: t2 }));
        }
        setPersonPropertiesForFlags(t2, i2) {
          void 0 === i2 && (i2 = true);
          var e2 = this._instance.get_property(oi) || {};
          this._instance.register({ [oi]: g({}, e2, t2) }), i2 && this._instance.reloadFeatureFlags();
        }
        resetPersonPropertiesForFlags() {
          this._instance.unregister(oi);
        }
        setGroupPropertiesForFlags(t2, i2) {
          void 0 === i2 && (i2 = true);
          var e2 = this._instance.get_property(ai) || {};
          0 !== Object.keys(e2).length && Object.keys(e2).forEach((i3) => {
            e2[i3] = g({}, e2[i3], t2[i3]), delete t2[i3];
          }), this._instance.register({ [ai]: g({}, e2, t2) }), i2 && this._instance.reloadFeatureFlags();
        }
        resetGroupPropertiesForFlags(t2) {
          if (t2) {
            var i2 = this._instance.get_property(ai) || {};
            this._instance.register({ [ai]: g({}, i2, { [t2]: {} }) });
          } else this._instance.unregister(ai);
        }
        reset() {
          this.Qt = false, this.Zt = false, this.ti = false, this.ii = false, this.ei = false, this.ri = false, this.$anon_distinct_id = void 0, this.li(), this.Xt = false;
        }
      };
      var Sn = ["cookie", "localstorage", "localstorage+cookie", "sessionstorage", "memory"];
      var En = class {
        constructor(t2, i2) {
          this.A = t2, this.props = {}, this.ci = false, this.fi = ((t3) => {
            var i3 = "";
            return t3.token && (i3 = t3.token.replace(/\+/g, "PL").replace(/\//g, "SL").replace(/=/g, "EQ")), t3.persistence_name ? "ph_" + t3.persistence_name : "ph_" + i3 + "_posthog";
          })(t2), this.it = this.pi(t2), this.load(), t2.debug && $t.info("Persistence loaded", t2.persistence, g({}, this.props)), this.update_config(t2, t2, i2), this.save();
        }
        isDisabled() {
          return !!this.gi;
        }
        pi(t2) {
          -1 === Sn.indexOf(t2.persistence.toLowerCase()) && ($t.critical("Unknown persistence type " + t2.persistence + "; falling back to localStorage+cookie"), t2.persistence = "localStorage+cookie");
          var i2 = t2.persistence.toLowerCase();
          return "localstorage" === i2 && ke.G() ? ke : "localstorage+cookie" === i2 && Te.G() ? Te : "sessionstorage" === i2 && Ce.G() ? Ce : "memory" === i2 ? Re : "cookie" === i2 ? Ee : Te.G() ? Te : Ee;
        }
        properties() {
          var t2 = {};
          return Ot(this.props, function(i2, e2) {
            if (e2 === ri && I(i2)) for (var r2 = Object.keys(i2), n2 = 0; n2 < r2.length; n2++) t2["$feature/" + r2[n2]] = i2[r2[n2]];
            else a2 = e2, l2 = false, (M(o2 = bi) ? l2 : s && o2.indexOf === s ? -1 != o2.indexOf(a2) : (Ot(o2, function(t3) {
              if (l2 || (l2 = t3 === a2)) return It;
            }), l2)) || (t2[e2] = i2);
            var o2, a2, l2;
          }), t2;
        }
        load() {
          if (!this.gi) {
            var t2 = this.it.K(this.fi);
            t2 && (this.props = Ct({}, t2));
          }
        }
        save() {
          this.gi || this.it.Y(this.fi, this.props, this.mi, this.yi, this.bi, this.A.debug);
        }
        remove() {
          this.it.X(this.fi, false), this.it.X(this.fi, true);
        }
        clear() {
          this.remove(), this.props = {};
        }
        register_once(t2, i2, e2) {
          if (I(t2)) {
            O(i2) && (i2 = "None"), this.mi = O(e2) ? this.wi : e2;
            var r2 = false;
            if (Ot(t2, (t3, e3) => {
              this.props.hasOwnProperty(e3) && this.props[e3] !== i2 || (this.props[e3] = t3, r2 = true);
            }), r2) return this.save(), true;
          }
          return false;
        }
        register(t2, i2) {
          if (I(t2)) {
            this.mi = O(i2) ? this.wi : i2;
            var e2 = false;
            if (Ot(t2, (i3, r2) => {
              t2.hasOwnProperty(r2) && this.props[r2] !== i3 && (this.props[r2] = i3, e2 = true);
            }), e2) return this.save(), true;
          }
          return false;
        }
        unregister(t2) {
          t2 in this.props && (delete this.props[t2], this.save());
        }
        update_campaign_params() {
          if (!this.ci) {
            var t2 = es(this.A.custom_campaign_params, this.A.mask_personal_data_properties, this.A.custom_personal_data_properties);
            R(Dt(t2)) || this.register(t2), this.ci = true;
          }
        }
        update_search_keyword() {
          var t2;
          this.register((t2 = null == o ? void 0 : o.referrer) ? ss(t2) : {});
        }
        update_referrer_info() {
          var t2;
          this.register_once({ $referrer: os(), $referring_domain: null != o && o.referrer && (null == (t2 = ee(o.referrer)) ? void 0 : t2.host) || "$direct" }, void 0);
        }
        set_initial_person_info() {
          this.props[fi] || this.props[pi] || this.register_once({ [gi]: as(this.A.mask_personal_data_properties, this.A.custom_personal_data_properties) }, void 0);
        }
        get_initial_props() {
          var t2 = {};
          Ot([pi, fi], (i3) => {
            var e3 = this.props[i3];
            e3 && Ot(e3, function(i4, e4) {
              t2["$initial_" + w(e4)] = i4;
            });
          });
          var i2, e2, r2 = this.props[gi];
          if (r2) {
            var s2 = (i2 = ls(r2), e2 = {}, Ot(i2, function(t3, i3) {
              e2["$initial_" + w(i3)] = t3;
            }), e2);
            Ct(t2, s2);
          }
          return t2;
        }
        safe_merge(t2) {
          return Ot(this.props, function(i2, e2) {
            e2 in t2 || (t2[e2] = i2);
          }), t2;
        }
        update_config(t2, i2, e2) {
          if (this.wi = this.mi = t2.cookie_expiration, this.set_disabled(t2.disable_persistence || !!e2), this.set_cross_subdomain(t2.cross_subdomain_cookie), this.set_secure(t2.secure_cookie), t2.persistence !== i2.persistence) {
            var r2 = this.pi(t2), s2 = this.props;
            this.clear(), this.it = r2, this.props = s2, this.save();
          }
        }
        set_disabled(t2) {
          this.gi = t2, this.gi ? this.remove() : this.save();
        }
        set_cross_subdomain(t2) {
          t2 !== this.yi && (this.yi = t2, this.remove(), this.save());
        }
        set_secure(t2) {
          t2 !== this.bi && (this.bi = t2, this.remove(), this.save());
        }
        set_event_timer(t2, i2) {
          var e2 = this.props[Wt] || {};
          e2[t2] = i2, this.props[Wt] = e2, this.save();
        }
        remove_event_timer(t2) {
          var i2 = (this.props[Wt] || {})[t2];
          return O(i2) || (delete this.props[Wt][t2], this.save()), i2;
        }
        get_property(t2) {
          return this.props[t2];
        }
        set_property(t2, i2) {
          this.props[t2] = i2, this.save();
        }
      };
      var $n = function(t2) {
        return t2.Button = "button", t2.Tab = "tab", t2.Selector = "selector", t2;
      }({});
      var kn = function(t2) {
        return t2.TopLeft = "top_left", t2.TopRight = "top_right", t2.TopCenter = "top_center", t2.MiddleLeft = "middle_left", t2.MiddleRight = "middle_right", t2.MiddleCenter = "middle_center", t2.Left = "left", t2.Center = "center", t2.Right = "right", t2.NextToTrigger = "next_to_trigger", t2;
      }({});
      var Pn = function(t2) {
        return t2.Popover = "popover", t2.API = "api", t2.Widget = "widget", t2.ExternalSurvey = "external_survey", t2;
      }({});
      var Tn = function(t2) {
        return t2.Open = "open", t2.MultipleChoice = "multiple_choice", t2.SingleChoice = "single_choice", t2.Rating = "rating", t2.Link = "link", t2;
      }({});
      var In = function(t2) {
        return t2.NextQuestion = "next_question", t2.End = "end", t2.ResponseBased = "response_based", t2.SpecificQuestion = "specific_question", t2;
      }({});
      var Rn = function(t2) {
        return t2.Once = "once", t2.Recurring = "recurring", t2.Always = "always", t2;
      }({});
      var On = function(t2) {
        return t2.SHOWN = "survey shown", t2.DISMISSED = "survey dismissed", t2.SENT = "survey sent", t2;
      }({});
      var Cn = function(t2) {
        return t2.SURVEY_ID = "$survey_id", t2.SURVEY_NAME = "$survey_name", t2.SURVEY_RESPONSE = "$survey_response", t2.SURVEY_ITERATION = "$survey_iteration", t2.SURVEY_ITERATION_START_DATE = "$survey_iteration_start_date", t2.SURVEY_PARTIALLY_COMPLETED = "$survey_partially_completed", t2.SURVEY_SUBMISSION_ID = "$survey_submission_id", t2.SURVEY_QUESTIONS = "$survey_questions", t2.SURVEY_COMPLETED = "$survey_completed", t2;
      }({});
      var Fn = function(t2) {
        return t2.Popover = "popover", t2.Inline = "inline", t2;
      }({});
      var Mn = class {
        constructor() {
          this.xi = {}, this.xi = {};
        }
        on(t2, i2) {
          return this.xi[t2] || (this.xi[t2] = []), this.xi[t2].push(i2), () => {
            this.xi[t2] = this.xi[t2].filter((t3) => t3 !== i2);
          };
        }
        emit(t2, i2) {
          for (var e2 of this.xi[t2] || []) e2(i2);
          for (var r2 of this.xi["*"] || []) r2(t2, i2);
        }
      };
      var An = class _An {
        constructor(t2) {
          this.Si = new Mn(), this.Ei = (t3, i2) => this.$i(t3, i2) && this.ki(t3, i2) && this.Pi(t3, i2), this.$i = (t3, i2) => null == i2 || !i2.event || (null == t3 ? void 0 : t3.event) === (null == i2 ? void 0 : i2.event), this._instance = t2, this.Ti = /* @__PURE__ */ new Set(), this.Ii = /* @__PURE__ */ new Set();
        }
        init() {
          var t2;
          if (!O(null == (t2 = this._instance) ? void 0 : t2.Ri)) {
            var i2;
            null == (i2 = this._instance) || i2.Ri((t3, i3) => {
              this.on(t3, i3);
            });
          }
        }
        register(t2) {
          var i2, e2;
          if (!O(null == (i2 = this._instance) ? void 0 : i2.Ri) && (t2.forEach((t3) => {
            var i3, e3;
            null == (i3 = this.Ii) || i3.add(t3), null == (e3 = t3.steps) || e3.forEach((t4) => {
              var i4;
              null == (i4 = this.Ti) || i4.add((null == t4 ? void 0 : t4.event) || "");
            });
          }), null != (e2 = this._instance) && e2.autocapture)) {
            var r2, s2 = /* @__PURE__ */ new Set();
            t2.forEach((t3) => {
              var i3;
              null == (i3 = t3.steps) || i3.forEach((t4) => {
                null != t4 && t4.selector && s2.add(null == t4 ? void 0 : t4.selector);
              });
            }), null == (r2 = this._instance) || r2.autocapture.setElementSelectors(s2);
          }
        }
        on(t2, i2) {
          var e2;
          null != i2 && 0 != t2.length && (this.Ti.has(t2) || this.Ti.has(null == i2 ? void 0 : i2.event)) && this.Ii && (null == (e2 = this.Ii) ? void 0 : e2.size) > 0 && this.Ii.forEach((t3) => {
            this.Oi(i2, t3) && this.Si.emit("actionCaptured", t3.name);
          });
        }
        Ci(t2) {
          this.onAction("actionCaptured", (i2) => t2(i2));
        }
        Oi(t2, i2) {
          if (null == (null == i2 ? void 0 : i2.steps)) return false;
          for (var e2 of i2.steps) if (this.Ei(t2, e2)) return true;
          return false;
        }
        onAction(t2, i2) {
          return this.Si.on(t2, i2);
        }
        ki(t2, i2) {
          if (null != i2 && i2.url) {
            var e2, r2 = null == t2 || null == (e2 = t2.properties) ? void 0 : e2.$current_url;
            if (!r2 || "string" != typeof r2) return false;
            if (!_An.Fi(r2, null == i2 ? void 0 : i2.url, (null == i2 ? void 0 : i2.url_matching) || "contains")) return false;
          }
          return true;
        }
        static Fi(i2, e2, r2) {
          switch (r2) {
            case "regex":
              return !!t && an(i2, e2);
            case "exact":
              return e2 === i2;
            case "contains":
              var s2 = _An.Mi(e2).replace(/_/g, ".").replace(/%/g, ".*");
              return an(i2, s2);
            default:
              return false;
          }
        }
        static Mi(t2) {
          return t2.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
        }
        Pi(t2, i2) {
          if ((null != i2 && i2.href || null != i2 && i2.tag_name || null != i2 && i2.text) && !this.Ai(t2).some((t3) => !(null != i2 && i2.href && !_An.Fi(t3.href || "", null == i2 ? void 0 : i2.href, (null == i2 ? void 0 : i2.href_matching) || "exact")) && ((null == i2 || !i2.tag_name || t3.tag_name === (null == i2 ? void 0 : i2.tag_name)) && !(null != i2 && i2.text && !_An.Fi(t3.text || "", null == i2 ? void 0 : i2.text, (null == i2 ? void 0 : i2.text_matching) || "exact") && !_An.Fi(t3.$el_text || "", null == i2 ? void 0 : i2.text, (null == i2 ? void 0 : i2.text_matching) || "exact"))))) return false;
          if (null != i2 && i2.selector) {
            var e2, r2 = null == t2 || null == (e2 = t2.properties) ? void 0 : e2.$element_selectors;
            if (!r2) return false;
            if (!r2.includes(null == i2 ? void 0 : i2.selector)) return false;
          }
          return true;
        }
        Ai(t2) {
          return null == (null == t2 ? void 0 : t2.properties.$elements) ? [] : null == t2 ? void 0 : t2.properties.$elements;
        }
      };
      var jn = kt("[Surveys]");
      var Dn = "seenSurvey_";
      var Ln = (t2, i2) => {
        var e2 = "$survey_" + i2 + "/" + t2.id;
        return t2.current_iteration && t2.current_iteration > 0 && (e2 = "$survey_" + i2 + "/" + t2.id + "/" + t2.current_iteration), e2;
      };
      var Nn = (t2) => {
        var i2 = "" + Dn + t2.id;
        return t2.current_iteration && t2.current_iteration > 0 && (i2 = "" + Dn + t2.id + "_" + t2.current_iteration), i2;
      };
      var Un = [Pn.Popover, Pn.Widget, Pn.API];
      var zn = { ignoreConditions: false, ignoreDelay: false, displayType: Fn.Popover };
      var Hn = class {
        constructor(t2) {
          this._instance = t2, this.ji = /* @__PURE__ */ new Map(), this.Di = /* @__PURE__ */ new Map();
        }
        register(t2) {
          var i2;
          O(null == (i2 = this._instance) ? void 0 : i2.Ri) || (this.Li(t2), this.Ni(t2));
        }
        Ni(t2) {
          var i2 = t2.filter((t3) => {
            var i3, e2;
            return (null == (i3 = t3.conditions) ? void 0 : i3.actions) && (null == (e2 = t3.conditions) || null == (e2 = e2.actions) || null == (e2 = e2.values) ? void 0 : e2.length) > 0;
          });
          if (0 !== i2.length) {
            if (null == this.Ui) {
              this.Ui = new An(this._instance), this.Ui.init();
              this.Ui.Ci((t3) => {
                this.onAction(t3);
              });
            }
            i2.forEach((t3) => {
              var i3, e2, r2, s2, n2;
              t3.conditions && null != (i3 = t3.conditions) && i3.actions && null != (e2 = t3.conditions) && null != (e2 = e2.actions) && e2.values && (null == (r2 = t3.conditions) || null == (r2 = r2.actions) || null == (r2 = r2.values) ? void 0 : r2.length) > 0 && (null == (s2 = this.Ui) || s2.register(t3.conditions.actions.values), null == (n2 = t3.conditions) || null == (n2 = n2.actions) || null == (n2 = n2.values) || n2.forEach((i4) => {
                if (i4 && i4.name) {
                  var e3 = this.Di.get(i4.name);
                  e3 && e3.push(t3.id), this.Di.set(i4.name, e3 || [t3.id]);
                }
              }));
            });
          }
        }
        Li(t2) {
          var i2;
          if (0 !== t2.filter((t3) => {
            var i3, e2;
            return (null == (i3 = t3.conditions) ? void 0 : i3.events) && (null == (e2 = t3.conditions) || null == (e2 = e2.events) || null == (e2 = e2.values) ? void 0 : e2.length) > 0;
          }).length) {
            null == (i2 = this._instance) || i2.Ri((t3, i3) => {
              this.onEvent(t3, i3);
            }), t2.forEach((t3) => {
              var i3;
              null == (i3 = t3.conditions) || null == (i3 = i3.events) || null == (i3 = i3.values) || i3.forEach((i4) => {
                if (i4 && i4.name) {
                  var e2 = this.ji.get(i4.name);
                  e2 && e2.push(t3.id), this.ji.set(i4.name, e2 || [t3.id]);
                }
              });
            });
          }
        }
        onEvent(t2, i2) {
          var e2, r2, s2 = (null == (e2 = this._instance) || null == (e2 = e2.persistence) ? void 0 : e2.props[ui]) || [];
          if (On.SHOWN === t2 && i2 && s2.length > 0) {
            var n2;
            jn.info("survey event matched, removing survey from activated surveys", { event: t2, eventPayload: i2, existingActivatedSurveys: s2 });
            var o2 = null == i2 || null == (n2 = i2.properties) ? void 0 : n2.$survey_id;
            if (o2) {
              var a2 = s2.indexOf(o2);
              a2 >= 0 && (s2.splice(a2, 1), this.zi(s2));
            }
          } else if (this.ji.has(t2)) {
            jn.info("survey event name matched", { event: t2, eventPayload: i2, surveys: this.ji.get(t2) });
            var l2 = [];
            null == (r2 = this._instance) || r2.getSurveys((i3) => {
              l2 = i3.filter((i4) => {
                var e3;
                return null == (e3 = this.ji.get(t2)) ? void 0 : e3.includes(i4.id);
              });
            });
            var u2 = l2.filter((e3) => {
              var r3, s3 = null == (r3 = e3.conditions) || null == (r3 = r3.events) || null == (r3 = r3.values) ? void 0 : r3.find((i3) => i3.name === t2);
              return !!s3 && (!s3.propertyFilters || Object.entries(s3.propertyFilters).every((t3) => {
                var e4, [r4, s4] = t3, n3 = null == i2 || null == (e4 = i2.properties) ? void 0 : e4[r4];
                if (O(n3) || M(n3)) return false;
                var o3 = [String(n3)], a3 = un[s4.operator];
                return a3 ? a3(s4.values, o3) : (jn.warn("Unknown property comparison operator: " + s4.operator), false);
              }));
            });
            this.zi(s2.concat(u2.map((t3) => t3.id) || []));
          }
        }
        onAction(t2) {
          var i2, e2 = (null == (i2 = this._instance) || null == (i2 = i2.persistence) ? void 0 : i2.props[ui]) || [];
          this.Di.has(t2) && this.zi(e2.concat(this.Di.get(t2) || []));
        }
        zi(t2) {
          var i2;
          jn.info("updating activated surveys", { activatedSurveys: t2 }), null == (i2 = this._instance) || null == (i2 = i2.persistence) || i2.register({ [ui]: [...new Set(t2)] });
        }
        getSurveys() {
          var t2, i2 = null == (t2 = this._instance) || null == (t2 = t2.persistence) ? void 0 : t2.props[ui];
          return i2 || [];
        }
        getEventToSurveys() {
          return this.ji;
        }
        Hi() {
          return this.Ui;
        }
      };
      var Bn = class {
        constructor(t2) {
          this.Bi = void 0, this._surveyManager = null, this.qi = false, this.Wi = false, this.Gi = [], this._instance = t2, this._surveyEventReceiver = null;
        }
        onRemoteConfig(t2) {
          if (!this._instance.config.disable_surveys) {
            var i2 = t2.surveys;
            if (A(i2)) return jn.warn("Flags not loaded yet. Not loading surveys.");
            var e2 = P(i2);
            this.Bi = e2 ? i2.length > 0 : i2, jn.info("flags response received, isSurveysEnabled: " + this.Bi), this.loadIfEnabled();
          }
        }
        reset() {
          localStorage.removeItem("lastSeenSurveyDate");
          for (var t2 = [], i2 = 0; i2 < localStorage.length; i2++) {
            var e2 = localStorage.key(i2);
            (null != e2 && e2.startsWith(Dn) || null != e2 && e2.startsWith("inProgressSurvey_")) && t2.push(e2);
          }
          t2.forEach((t3) => localStorage.removeItem(t3));
        }
        loadIfEnabled() {
          if (!this._surveyManager) if (this.Wi) jn.info("Already initializing surveys, skipping...");
          else if (this._instance.config.disable_surveys) jn.info("Disabled. Not loading surveys.");
          else if (this._instance.config.cookieless_mode && this._instance.consent.isOptedOut()) jn.info("Not loading surveys in cookieless mode without consent.");
          else {
            var t2 = null == v ? void 0 : v.__PosthogExtensions__;
            if (t2) {
              if (!O(this.Bi) || this._instance.config.advanced_enable_surveys) {
                var i2 = this.Bi || this._instance.config.advanced_enable_surveys;
                this.Wi = true;
                try {
                  var e2 = t2.generateSurveys;
                  if (e2) return void this.Vi(e2, i2);
                  var r2 = t2.loadExternalDependency;
                  if (!r2) return void this.Ji("PostHog loadExternalDependency extension not found.");
                  r2(this._instance, "surveys", (e3) => {
                    e3 || !t2.generateSurveys ? this.Ji("Could not load surveys script", e3) : this.Vi(t2.generateSurveys, i2);
                  });
                } catch (t3) {
                  throw this.Ji("Error initializing surveys", t3), t3;
                } finally {
                  this.Wi = false;
                }
              }
            } else jn.error("PostHog Extensions not found.");
          }
        }
        Vi(t2, i2) {
          this._surveyManager = t2(this._instance, i2), this._surveyEventReceiver = new Hn(this._instance), jn.info("Surveys loaded successfully"), this.Ki({ isLoaded: true });
        }
        Ji(t2, i2) {
          jn.error(t2, i2), this.Ki({ isLoaded: false, error: t2 });
        }
        onSurveysLoaded(t2) {
          return this.Gi.push(t2), this._surveyManager && this.Ki({ isLoaded: true }), () => {
            this.Gi = this.Gi.filter((i2) => i2 !== t2);
          };
        }
        getSurveys(t2, i2) {
          if (void 0 === i2 && (i2 = false), this._instance.config.disable_surveys) return jn.info("Disabled. Not loading surveys."), t2([]);
          var e2 = this._instance.get_property(li);
          if (e2 && !i2) return t2(e2, { isLoaded: true });
          if (this.qi) return t2([], { isLoaded: false, error: "Surveys are already being loaded" });
          try {
            this.qi = true, this._instance.ui({ url: this._instance.requestRouter.endpointFor("api", "/api/surveys/?token=" + this._instance.config.token), method: "GET", timeout: this._instance.config.surveys_request_timeout_ms, callback: (i3) => {
              var e3;
              this.qi = false;
              var r2 = i3.statusCode;
              if (200 !== r2 || !i3.json) {
                var s2 = "Surveys API could not be loaded, status: " + r2;
                return jn.error(s2), t2([], { isLoaded: false, error: s2 });
              }
              var n2, o2 = i3.json.surveys || [], a2 = o2.filter((t3) => function(t4) {
                return !(!t4.start_date || t4.end_date);
              }(t3) && (function(t4) {
                var i4;
                return !(null == (i4 = t4.conditions) || null == (i4 = i4.events) || null == (i4 = i4.values) || !i4.length);
              }(t3) || function(t4) {
                var i4;
                return !(null == (i4 = t4.conditions) || null == (i4 = i4.actions) || null == (i4 = i4.values) || !i4.length);
              }(t3)));
              a2.length > 0 && (null == (n2 = this._surveyEventReceiver) || n2.register(a2));
              return null == (e3 = this._instance.persistence) || e3.register({ [li]: o2 }), t2(o2, { isLoaded: true });
            } });
          } catch (t3) {
            throw this.qi = false, t3;
          }
        }
        Ki(t2) {
          for (var i2 of this.Gi) try {
            if (!t2.isLoaded) return i2([], t2);
            this.getSurveys(i2);
          } catch (t3) {
            jn.error("Error in survey callback", t3);
          }
        }
        getActiveMatchingSurveys(t2, i2) {
          if (void 0 === i2 && (i2 = false), !A(this._surveyManager)) return this._surveyManager.getActiveMatchingSurveys(t2, i2);
          jn.warn("init was not called");
        }
        Yi(t2) {
          var i2 = null;
          return this.getSurveys((e2) => {
            var r2;
            i2 = null !== (r2 = e2.find((i3) => i3.id === t2)) && void 0 !== r2 ? r2 : null;
          }), i2;
        }
        Xi(t2) {
          if (A(this._surveyManager)) return { eligible: false, reason: "SDK is not enabled or survey functionality is not yet loaded" };
          var i2 = "string" == typeof t2 ? this.Yi(t2) : t2;
          return i2 ? this._surveyManager.checkSurveyEligibility(i2) : { eligible: false, reason: "Survey not found" };
        }
        canRenderSurvey(t2) {
          if (A(this._surveyManager)) return jn.warn("init was not called"), { visible: false, disabledReason: "SDK is not enabled or survey functionality is not yet loaded" };
          var i2 = this.Xi(t2);
          return { visible: i2.eligible, disabledReason: i2.reason };
        }
        canRenderSurveyAsync(t2, i2) {
          return A(this._surveyManager) ? (jn.warn("init was not called"), Promise.resolve({ visible: false, disabledReason: "SDK is not enabled or survey functionality is not yet loaded" })) : new Promise((e2) => {
            this.getSurveys((i3) => {
              var r2, s2 = null !== (r2 = i3.find((i4) => i4.id === t2)) && void 0 !== r2 ? r2 : null;
              if (s2) {
                var n2 = this.Xi(s2);
                e2({ visible: n2.eligible, disabledReason: n2.reason });
              } else e2({ visible: false, disabledReason: "Survey not found" });
            }, i2);
          });
        }
        renderSurvey(t2, i2) {
          var e2;
          if (A(this._surveyManager)) jn.warn("init was not called");
          else {
            var r2 = "string" == typeof t2 ? this.Yi(t2) : t2;
            if (null != r2 && r2.id) if (Un.includes(r2.type)) {
              var s2 = null == o ? void 0 : o.querySelector(i2);
              if (s2) return null != (e2 = r2.appearance) && e2.surveyPopupDelaySeconds ? (jn.info("Rendering survey " + r2.id + " with delay of " + r2.appearance.surveyPopupDelaySeconds + " seconds"), void setTimeout(() => {
                var t3, i3;
                jn.info("Rendering survey " + r2.id + " with delay of " + (null == (t3 = r2.appearance) ? void 0 : t3.surveyPopupDelaySeconds) + " seconds"), null == (i3 = this._surveyManager) || i3.renderSurvey(r2, s2), jn.info("Survey " + r2.id + " rendered");
              }, 1e3 * r2.appearance.surveyPopupDelaySeconds)) : void this._surveyManager.renderSurvey(r2, s2);
              jn.warn("Survey element not found");
            } else jn.warn("Surveys of type " + r2.type + " cannot be rendered in the app");
            else jn.warn("Survey not found");
          }
        }
        displaySurvey(t2, i2) {
          var e2;
          if (A(this._surveyManager)) jn.warn("init was not called");
          else {
            var r2 = this.Yi(t2);
            if (r2) {
              var s2 = r2;
              if (null != (e2 = r2.appearance) && e2.surveyPopupDelaySeconds && i2.ignoreDelay && (s2 = g({}, r2, { appearance: g({}, r2.appearance, { surveyPopupDelaySeconds: 0 }) })), false === i2.ignoreConditions) {
                var n2 = this.canRenderSurvey(r2);
                if (!n2.visible) return void jn.warn("Survey is not eligible to be displayed: ", n2.disabledReason);
              }
              i2.displayType !== Fn.Inline ? this._surveyManager.handlePopoverSurvey(s2) : this.renderSurvey(s2, i2.selector);
            } else jn.warn("Survey not found");
          }
        }
      };
      var qn = kt("[RateLimiter]");
      var Wn = class {
        constructor(t2) {
          var i2, e2;
          this.serverLimits = {}, this.lastEventRateLimited = false, this.checkForLimiting = (t3) => {
            var i3 = t3.text;
            if (i3 && i3.length) try {
              (JSON.parse(i3).quota_limited || []).forEach((t4) => {
                qn.info((t4 || "events") + " is quota limited."), this.serverLimits[t4] = (/* @__PURE__ */ new Date()).getTime() + 6e4;
              });
            } catch (t4) {
              return void qn.warn('could not rate limit - continuing. Error: "' + (null == t4 ? void 0 : t4.message) + '"', { text: i3 });
            }
          }, this.instance = t2, this.captureEventsPerSecond = (null == (i2 = t2.config.rate_limiting) ? void 0 : i2.events_per_second) || 10, this.captureEventsBurstLimit = Math.max((null == (e2 = t2.config.rate_limiting) ? void 0 : e2.events_burst_limit) || 10 * this.captureEventsPerSecond, this.captureEventsPerSecond), this.lastEventRateLimited = this.clientRateLimitContext(true).isRateLimited;
        }
        clientRateLimitContext(t2) {
          var i2, e2, r2;
          void 0 === t2 && (t2 = false);
          var s2 = (/* @__PURE__ */ new Date()).getTime(), n2 = null !== (i2 = null == (e2 = this.instance.persistence) ? void 0 : e2.get_property(ci)) && void 0 !== i2 ? i2 : { tokens: this.captureEventsBurstLimit, last: s2 };
          n2.tokens += (s2 - n2.last) / 1e3 * this.captureEventsPerSecond, n2.last = s2, n2.tokens > this.captureEventsBurstLimit && (n2.tokens = this.captureEventsBurstLimit);
          var o2 = n2.tokens < 1;
          return o2 || t2 || (n2.tokens = Math.max(0, n2.tokens - 1)), !o2 || this.lastEventRateLimited || t2 || this.instance.capture("$$client_ingestion_warning", { $$client_ingestion_warning_message: "posthog-js client rate limited. Config is set to " + this.captureEventsPerSecond + " events per second and " + this.captureEventsBurstLimit + " events burst limit." }, { skip_client_rate_limiting: true }), this.lastEventRateLimited = o2, null == (r2 = this.instance.persistence) || r2.set_property(ci, n2), { isRateLimited: o2, remainingTokens: n2.tokens };
        }
        isServerRateLimited(t2) {
          var i2 = this.serverLimits[t2 || "events"] || false;
          return false !== i2 && (/* @__PURE__ */ new Date()).getTime() < i2;
        }
      };
      var Gn = kt("[RemoteConfig]");
      var Vn = class {
        constructor(t2) {
          this._instance = t2;
        }
        get remoteConfig() {
          var t2;
          return null == (t2 = v._POSTHOG_REMOTE_CONFIG) || null == (t2 = t2[this._instance.config.token]) ? void 0 : t2.config;
        }
        Qi(t2) {
          var i2, e2;
          null != (i2 = v.__PosthogExtensions__) && i2.loadExternalDependency ? null == (e2 = v.__PosthogExtensions__) || null == e2.loadExternalDependency || e2.loadExternalDependency(this._instance, "remote-config", () => t2(this.remoteConfig)) : (Gn.error("PostHog Extensions not found. Cannot load remote config."), t2());
        }
        Zi(t2) {
          this._instance.ui({ method: "GET", url: this._instance.requestRouter.endpointFor("assets", "/array/" + this._instance.config.token + "/config"), callback: (i2) => {
            t2(i2.json);
          } });
        }
        load() {
          try {
            if (this.remoteConfig) return Gn.info("Using preloaded remote config", this.remoteConfig), void this.hi(this.remoteConfig);
            if (this._instance.L()) return void Gn.warn("Remote config is disabled. Falling back to local config.");
            this.Qi((t2) => {
              if (!t2) return Gn.info("No config found after loading remote JS config. Falling back to JSON."), void this.Zi((t3) => {
                this.hi(t3);
              });
              this.hi(t2);
            });
          } catch (t2) {
            Gn.error("Error loading remote config", t2);
          }
        }
        hi(t2) {
          t2 ? this._instance.config.__preview_remote_config ? (this._instance.hi(t2), false !== t2.hasFeatureFlags && this._instance.featureFlags.ensureFlagsLoaded()) : Gn.info("__preview_remote_config is disabled. Logging config instead", t2) : Gn.error("Failed to fetch remote config from PostHog.");
        }
      };
      var Jn = 3e3;
      var Kn = class {
        constructor(t2, i2) {
          this.te = true, this.ie = [], this.ee = G((null == i2 ? void 0 : i2.flush_interval_ms) || Jn, 250, 5e3, $t.createLogger("flush interval"), Jn), this.re = t2;
        }
        enqueue(t2) {
          this.ie.push(t2), this.se || this.ne();
        }
        unload() {
          this.oe();
          var t2 = this.ie.length > 0 ? this.ae() : {}, i2 = Object.values(t2);
          [...i2.filter((t3) => 0 === t3.url.indexOf("/e")), ...i2.filter((t3) => 0 !== t3.url.indexOf("/e"))].map((t3) => {
            this.re(g({}, t3, { transport: "sendBeacon" }));
          });
        }
        enable() {
          this.te = false, this.ne();
        }
        ne() {
          var t2 = this;
          this.te || (this.se = setTimeout(() => {
            if (this.oe(), this.ie.length > 0) {
              var i2 = this.ae(), e2 = function() {
                var e3 = i2[r2], s2 = (/* @__PURE__ */ new Date()).getTime();
                e3.data && P(e3.data) && Ot(e3.data, (t3) => {
                  t3.offset = Math.abs(t3.timestamp - s2), delete t3.timestamp;
                }), t2.re(e3);
              };
              for (var r2 in i2) e2();
            }
          }, this.ee));
        }
        oe() {
          clearTimeout(this.se), this.se = void 0;
        }
        ae() {
          var t2 = {};
          return Ot(this.ie, (i2) => {
            var e2, r2 = i2, s2 = (r2 ? r2.batchKey : null) || r2.url;
            O(t2[s2]) && (t2[s2] = g({}, r2, { data: [] })), null == (e2 = t2[s2].data) || e2.push(r2.data);
          }), this.ie = [], t2;
        }
      };
      var Yn = ["retriesPerformedSoFar"];
      var Xn = class {
        constructor(i2) {
          this.le = false, this.ue = 3e3, this.ie = [], this._instance = i2, this.ie = [], this.he = true, !O(t) && "onLine" in t.navigator && (this.he = t.navigator.onLine, Ht(t, "online", () => {
            this.he = true, this.jt();
          }), Ht(t, "offline", () => {
            this.he = false;
          }));
        }
        get length() {
          return this.ie.length;
        }
        retriableRequest(t2) {
          var { retriesPerformedSoFar: i2 } = t2, e2 = _(t2, Yn);
          j(i2) && i2 > 0 && (e2.url = rn(e2.url, { retry_count: i2 })), this._instance.ui(g({}, e2, { callback: (t3) => {
            200 !== t3.statusCode && (t3.statusCode < 400 || t3.statusCode >= 500) && (null != i2 ? i2 : 0) < 10 ? this.de(g({ retriesPerformedSoFar: i2 }, e2)) : null == e2.callback || e2.callback(t3);
          } }));
        }
        de(t2) {
          var i2 = t2.retriesPerformedSoFar || 0;
          t2.retriesPerformedSoFar = i2 + 1;
          var e2 = function(t3) {
            var i3 = 3e3 * Math.pow(2, t3), e3 = i3 / 2, r3 = Math.min(18e5, i3), s3 = (Math.random() - 0.5) * (r3 - e3);
            return Math.ceil(r3 + s3);
          }(i2), r2 = Date.now() + e2;
          this.ie.push({ retryAt: r2, requestOptions: t2 });
          var s2 = "Enqueued failed request for retry in " + e2;
          navigator.onLine || (s2 += " (Browser is offline)"), $t.warn(s2), this.le || (this.le = true, this.ve());
        }
        ve() {
          this.ce && clearTimeout(this.ce), this.ce = setTimeout(() => {
            this.he && this.ie.length > 0 && this.jt(), this.ve();
          }, this.ue);
        }
        jt() {
          var t2 = Date.now(), i2 = [], e2 = this.ie.filter((e3) => e3.retryAt < t2 || (i2.push(e3), false));
          if (this.ie = i2, e2.length > 0) for (var { requestOptions: r2 } of e2) this.retriableRequest(r2);
        }
        unload() {
          for (var { requestOptions: t2 } of (this.ce && (clearTimeout(this.ce), this.ce = void 0), this.ie)) try {
            this._instance.ui(g({}, t2, { transport: "sendBeacon" }));
          } catch (t3) {
            $t.error(t3);
          }
          this.ie = [];
        }
      };
      var Qn = class {
        constructor(t2) {
          this.fe = () => {
            var t3, i2, e2, r2;
            this.pe || (this.pe = {});
            var s2 = this.scrollElement(), n2 = this.scrollY(), o2 = s2 ? Math.max(0, s2.scrollHeight - s2.clientHeight) : 0, a2 = n2 + ((null == s2 ? void 0 : s2.clientHeight) || 0), l2 = (null == s2 ? void 0 : s2.scrollHeight) || 0;
            this.pe.lastScrollY = Math.ceil(n2), this.pe.maxScrollY = Math.max(n2, null !== (t3 = this.pe.maxScrollY) && void 0 !== t3 ? t3 : 0), this.pe.maxScrollHeight = Math.max(o2, null !== (i2 = this.pe.maxScrollHeight) && void 0 !== i2 ? i2 : 0), this.pe.lastContentY = a2, this.pe.maxContentY = Math.max(a2, null !== (e2 = this.pe.maxContentY) && void 0 !== e2 ? e2 : 0), this.pe.maxContentHeight = Math.max(l2, null !== (r2 = this.pe.maxContentHeight) && void 0 !== r2 ? r2 : 0);
          }, this._instance = t2;
        }
        getContext() {
          return this.pe;
        }
        resetContext() {
          var t2 = this.pe;
          return setTimeout(this.fe, 0), t2;
        }
        startMeasuringScrollPosition() {
          Ht(t, "scroll", this.fe, { capture: true }), Ht(t, "scrollend", this.fe, { capture: true }), Ht(t, "resize", this.fe);
        }
        scrollElement() {
          if (!this._instance.config.scroll_root_selector) return null == t ? void 0 : t.document.documentElement;
          var i2 = P(this._instance.config.scroll_root_selector) ? this._instance.config.scroll_root_selector : [this._instance.config.scroll_root_selector];
          for (var e2 of i2) {
            var r2 = null == t ? void 0 : t.document.querySelector(e2);
            if (r2) return r2;
          }
        }
        scrollY() {
          if (this._instance.config.scroll_root_selector) {
            var i2 = this.scrollElement();
            return i2 && i2.scrollTop || 0;
          }
          return t && (t.scrollY || t.pageYOffset || t.document.documentElement.scrollTop) || 0;
        }
        scrollX() {
          if (this._instance.config.scroll_root_selector) {
            var i2 = this.scrollElement();
            return i2 && i2.scrollLeft || 0;
          }
          return t && (t.scrollX || t.pageXOffset || t.document.documentElement.scrollLeft) || 0;
        }
      };
      var Zn = (t2) => as(null == t2 ? void 0 : t2.config.mask_personal_data_properties, null == t2 ? void 0 : t2.config.custom_personal_data_properties);
      var to = class {
        constructor(t2, i2, e2, r2) {
          this.ge = (t3) => {
            var i3 = this._e();
            if (!i3 || i3.sessionId !== t3) {
              var e3 = { sessionId: t3, props: this.me(this._instance) };
              this.ye.register({ [vi]: e3 });
            }
          }, this._instance = t2, this.be = i2, this.ye = e2, this.me = r2 || Zn, this.be.onSessionId(this.ge);
        }
        _e() {
          return this.ye.props[vi];
        }
        getSetOnceProps() {
          var t2, i2 = null == (t2 = this._e()) ? void 0 : t2.props;
          return i2 ? "r" in i2 ? ls(i2) : { $referring_domain: i2.referringDomain, $pathname: i2.initialPathName, utm_source: i2.utm_source, utm_campaign: i2.utm_campaign, utm_medium: i2.utm_medium, utm_content: i2.utm_content, utm_term: i2.utm_term } : {};
        }
        getSessionProps() {
          var t2 = {};
          return Ot(Dt(this.getSetOnceProps()), (i2, e2) => {
            "$current_url" === e2 && (e2 = "url"), t2["$session_entry_" + w(e2)] = i2;
          }), t2;
        }
      };
      var io = kt("[SessionId]");
      var eo = class {
        on(t2, i2) {
          return this.we.on(t2, i2);
        }
        constructor(t2, i2, e2) {
          var r2;
          if (this.xe = [], this.Se = void 0, this.we = new Mn(), this.Ee = (t3, i3) => Math.abs(t3 - i3) > this.sessionTimeoutMs, !t2.persistence) throw new Error("SessionIdManager requires a PostHogPersistence instance");
          if ("always" === t2.config.cookieless_mode) throw new Error('SessionIdManager cannot be used with cookieless_mode="always"');
          this.A = t2.config, this.ye = t2.persistence, this.$e = void 0, this.ke = void 0, this._sessionStartTimestamp = null, this._sessionActivityTimestamp = null, this.Pe = i2 || ye, this.Te = e2 || ye;
          var s2 = this.A.persistence_name || this.A.token, n2 = this.A.session_idle_timeout_seconds || 1800;
          if (this._sessionTimeoutMs = 1e3 * G(n2, 60, 36e3, io.createLogger("session_idle_timeout_seconds"), 1800), t2.register({ $configured_session_timeout_ms: this._sessionTimeoutMs }), this.Ie(), this.Re = "ph_" + s2 + "_window_id", this.Oe = "ph_" + s2 + "_primary_window_exists", this.Ce()) {
            var o2 = Ce.K(this.Re), a2 = Ce.K(this.Oe);
            o2 && !a2 ? this.$e = o2 : Ce.X(this.Re), Ce.Y(this.Oe, true);
          }
          if (null != (r2 = this.A.bootstrap) && r2.sessionID) try {
            var l2 = ((t3) => {
              var i3 = t3.replace(/-/g, "");
              if (32 !== i3.length) throw new Error("Not a valid UUID");
              if ("7" !== i3[12]) throw new Error("Not a UUIDv7");
              return parseInt(i3.substring(0, 12), 16);
            })(this.A.bootstrap.sessionID);
            this.Fe(this.A.bootstrap.sessionID, (/* @__PURE__ */ new Date()).getTime(), l2);
          } catch (t3) {
            io.error("Invalid sessionID in bootstrap", t3);
          }
          this.Me();
        }
        get sessionTimeoutMs() {
          return this._sessionTimeoutMs;
        }
        onSessionId(t2) {
          return O(this.xe) && (this.xe = []), this.xe.push(t2), this.ke && t2(this.ke, this.$e), () => {
            this.xe = this.xe.filter((i2) => i2 !== t2);
          };
        }
        Ce() {
          return "memory" !== this.A.persistence && !this.ye.gi && Ce.G();
        }
        Ae(t2) {
          t2 !== this.$e && (this.$e = t2, this.Ce() && Ce.Y(this.Re, t2));
        }
        je() {
          return this.$e ? this.$e : this.Ce() ? Ce.K(this.Re) : null;
        }
        Fe(t2, i2, e2) {
          t2 === this.ke && i2 === this._sessionActivityTimestamp && e2 === this._sessionStartTimestamp || (this._sessionStartTimestamp = e2, this._sessionActivityTimestamp = i2, this.ke = t2, this.ye.register({ [ii]: [i2, t2, e2] }));
        }
        De() {
          if (this.ke && this._sessionActivityTimestamp && this._sessionStartTimestamp) return [this._sessionActivityTimestamp, this.ke, this._sessionStartTimestamp];
          var t2 = this.ye.props[ii];
          return P(t2) && 2 === t2.length && t2.push(t2[0]), t2 || [0, null, 0];
        }
        resetSessionId() {
          this.Fe(null, null, null);
        }
        destroy() {
          clearTimeout(this.Le), this.Le = void 0, this.Se && t && (t.removeEventListener("beforeunload", this.Se, { capture: false }), this.Se = void 0), this.xe = [];
        }
        Me() {
          this.Se = () => {
            this.Ce() && Ce.X(this.Oe);
          }, Ht(t, "beforeunload", this.Se, { capture: false });
        }
        checkAndGetSessionAndWindowId(t2, i2) {
          if (void 0 === t2 && (t2 = false), void 0 === i2 && (i2 = null), "always" === this.A.cookieless_mode) throw new Error('checkAndGetSessionAndWindowId should not be called with cookieless_mode="always"');
          var e2 = i2 || (/* @__PURE__ */ new Date()).getTime(), [r2, s2, n2] = this.De(), o2 = this.je(), a2 = j(n2) && n2 > 0 && Math.abs(e2 - n2) > 864e5, l2 = false, u2 = !s2, h2 = !t2 && this.Ee(e2, r2);
          u2 || h2 || a2 ? (s2 = this.Pe(), o2 = this.Te(), io.info("new session ID generated", { sessionId: s2, windowId: o2, changeReason: { noSessionId: u2, activityTimeout: h2, sessionPastMaximumLength: a2 } }), n2 = e2, l2 = true) : o2 || (o2 = this.Te(), l2 = true);
          var d2 = 0 === r2 || !t2 || a2 ? e2 : r2, v2 = 0 === n2 ? (/* @__PURE__ */ new Date()).getTime() : n2;
          return this.Ae(o2), this.Fe(s2, d2, v2), t2 || this.Ie(), l2 && this.xe.forEach((t3) => t3(s2, o2, l2 ? { noSessionId: u2, activityTimeout: h2, sessionPastMaximumLength: a2 } : void 0)), { sessionId: s2, windowId: o2, sessionStartTimestamp: v2, changeReason: l2 ? { noSessionId: u2, activityTimeout: h2, sessionPastMaximumLength: a2 } : void 0, lastActivityTimestamp: r2 };
        }
        Ie() {
          clearTimeout(this.Le), this.Le = setTimeout(() => {
            var [t2] = this.De();
            if (this.Ee((/* @__PURE__ */ new Date()).getTime(), t2)) {
              var i2 = this.ke;
              this.resetSessionId(), this.we.emit("forcedIdleReset", { idleSessionId: i2 });
            }
          }, 1.1 * this.sessionTimeoutMs);
        }
      };
      var ro = ["$set_once", "$set"];
      var so = kt("[SiteApps]");
      var no = class {
        constructor(t2) {
          this._instance = t2, this.Ne = [], this.apps = {};
        }
        get isEnabled() {
          return !!this._instance.config.opt_in_site_apps;
        }
        Ue(t2, i2) {
          if (i2) {
            var e2 = this.globalsForEvent(i2);
            this.Ne.push(e2), this.Ne.length > 1e3 && (this.Ne = this.Ne.slice(10));
          }
        }
        get siteAppLoaders() {
          var t2;
          return null == (t2 = v._POSTHOG_REMOTE_CONFIG) || null == (t2 = t2[this._instance.config.token]) ? void 0 : t2.siteApps;
        }
        init() {
          if (this.isEnabled) {
            var t2 = this._instance.Ri(this.Ue.bind(this));
            this.ze = () => {
              t2(), this.Ne = [], this.ze = void 0;
            };
          }
        }
        globalsForEvent(t2) {
          var i2, e2, r2, s2, n2, o2, a2;
          if (!t2) throw new Error("Event payload is required");
          var l2 = {}, u2 = this._instance.get_property("$groups") || [], h2 = this._instance.get_property("$stored_group_properties") || {};
          for (var [d2, v2] of Object.entries(h2)) l2[d2] = { id: u2[d2], type: d2, properties: v2 };
          var { $set_once: c2, $set: f2 } = t2;
          return { event: g({}, _(t2, ro), { properties: g({}, t2.properties, f2 ? { $set: g({}, null !== (i2 = null == (e2 = t2.properties) ? void 0 : e2.$set) && void 0 !== i2 ? i2 : {}, f2) } : {}, c2 ? { $set_once: g({}, null !== (r2 = null == (s2 = t2.properties) ? void 0 : s2.$set_once) && void 0 !== r2 ? r2 : {}, c2) } : {}), elements_chain: null !== (n2 = null == (o2 = t2.properties) ? void 0 : o2.$elements_chain) && void 0 !== n2 ? n2 : "", distinct_id: null == (a2 = t2.properties) ? void 0 : a2.distinct_id }), person: { properties: this._instance.get_property("$stored_person_properties") }, groups: l2 };
        }
        setupSiteApp(t2) {
          var i2 = this.apps[t2.id], e2 = () => {
            var e3;
            (!i2.errored && this.Ne.length && (so.info("Processing " + this.Ne.length + " events for site app with id " + t2.id), this.Ne.forEach((t3) => null == i2.processEvent ? void 0 : i2.processEvent(t3)), i2.processedBuffer = true), Object.values(this.apps).every((t3) => t3.processedBuffer || t3.errored)) && (null == (e3 = this.ze) || e3.call(this));
          }, r2 = false, s2 = (s3) => {
            i2.errored = !s3, i2.loaded = true, so.info("Site app with id " + t2.id + " " + (s3 ? "loaded" : "errored")), r2 && e2();
          };
          try {
            var { processEvent: n2 } = t2.init({ posthog: this._instance, callback: (t3) => {
              s2(t3);
            } });
            n2 && (i2.processEvent = n2), r2 = true;
          } catch (i3) {
            so.error("Error while initializing PostHog app with config id " + t2.id, i3), s2(false);
          }
          if (r2 && i2.loaded) try {
            e2();
          } catch (e3) {
            so.error("Error while processing buffered events PostHog app with config id " + t2.id, e3), i2.errored = true;
          }
        }
        He() {
          var t2 = this.siteAppLoaders || [];
          for (var i2 of t2) this.apps[i2.id] = { id: i2.id, loaded: false, errored: false, processedBuffer: false };
          for (var e2 of t2) this.setupSiteApp(e2);
        }
        Be(t2) {
          if (0 !== Object.keys(this.apps).length) {
            var i2 = this.globalsForEvent(t2);
            for (var e2 of Object.values(this.apps)) try {
              null == e2.processEvent || e2.processEvent(i2);
            } catch (i3) {
              so.error("Error while processing event " + t2.event + " for site app " + e2.id, i3);
            }
          }
        }
        onRemoteConfig(t2) {
          var i2, e2, r2, s2 = this;
          if (null != (i2 = this.siteAppLoaders) && i2.length) return this.isEnabled ? (this.He(), void this._instance.on("eventCaptured", (t3) => this.Be(t3))) : void so.error('PostHog site apps are disabled. Enable the "opt_in_site_apps" config to proceed.');
          if (null == (e2 = this.ze) || e2.call(this), null != (r2 = t2.siteApps) && r2.length) if (this.isEnabled) {
            var n2 = function(t3) {
              var i3;
              v["__$$ph_site_app_" + t3] = s2._instance, null == (i3 = v.__PosthogExtensions__) || null == i3.loadSiteApp || i3.loadSiteApp(s2._instance, a2, (i4) => {
                if (i4) return so.error("Error while initializing PostHog app with config id " + t3, i4);
              });
            };
            for (var { id: o2, url: a2 } of t2.siteApps) n2(o2);
          } else so.error('PostHog site apps are disabled. Enable the "opt_in_site_apps" config to proceed.');
        }
      };
      var oo = ["amazonbot", "amazonproductbot", "app.hypefactors.com", "applebot", "archive.org_bot", "awariobot", "backlinksextendedbot", "baiduspider", "bingbot", "bingpreview", "chrome-lighthouse", "dataforseobot", "deepscan", "duckduckbot", "facebookexternal", "facebookcatalog", "http://yandex.com/bots", "hubspot", "ia_archiver", "leikibot", "linkedinbot", "meta-externalagent", "mj12bot", "msnbot", "nessus", "petalbot", "pinterest", "prerender", "rogerbot", "screaming frog", "sebot-wa", "sitebulb", "slackbot", "slurp", "trendictionbot", "turnitin", "twitterbot", "vercel-screenshot", "vercelbot", "yahoo! slurp", "yandexbot", "zoombot", "bot.htm", "bot.php", "(bot;", "bot/", "crawler", "ahrefsbot", "ahrefssiteaudit", "semrushbot", "siteauditbot", "splitsignalbot", "gptbot", "oai-searchbot", "chatgpt-user", "perplexitybot", "better uptime bot", "sentryuptimebot", "uptimerobot", "headlesschrome", "cypress", "google-hoteladsverifier", "adsbot-google", "apis-google", "duplexweb-google", "feedfetcher-google", "google favicon", "google web preview", "google-read-aloud", "googlebot", "googleother", "google-cloudvertexbot", "googleweblight", "mediapartners-google", "storebot-google", "google-inspectiontool", "bytespider"];
      var ao = function(t2, i2) {
        if (!t2) return false;
        var e2 = t2.toLowerCase();
        return oo.concat(i2 || []).some((t3) => {
          var i3 = t3.toLowerCase();
          return -1 !== e2.indexOf(i3);
        });
      };
      var lo = function(t2, i2) {
        if (!t2) return false;
        var e2 = t2.userAgent;
        if (e2 && ao(e2, i2)) return true;
        try {
          var r2 = null == t2 ? void 0 : t2.userAgentData;
          if (null != r2 && r2.brands && r2.brands.some((t3) => ao(null == t3 ? void 0 : t3.brand, i2))) return true;
        } catch (t3) {
        }
        return !!t2.webdriver;
      };
      var uo = function(t2) {
        return t2.US = "us", t2.EU = "eu", t2.CUSTOM = "custom", t2;
      }({});
      var ho = "i.posthog.com";
      var vo = class {
        constructor(t2) {
          this.qe = {}, this.instance = t2;
        }
        get apiHost() {
          var t2 = this.instance.config.api_host.trim().replace(/\/$/, "");
          return "https://app.posthog.com" === t2 ? "https://us.i.posthog.com" : t2;
        }
        get uiHost() {
          var t2, i2 = null == (t2 = this.instance.config.ui_host) ? void 0 : t2.replace(/\/$/, "");
          return i2 || (i2 = this.apiHost.replace("." + ho, ".posthog.com")), "https://app.posthog.com" === i2 ? "https://us.posthog.com" : i2;
        }
        get region() {
          return this.qe[this.apiHost] || (/https:\/\/(app|us|us-assets)(\.i)?\.posthog\.com/i.test(this.apiHost) ? this.qe[this.apiHost] = uo.US : /https:\/\/(eu|eu-assets)(\.i)?\.posthog\.com/i.test(this.apiHost) ? this.qe[this.apiHost] = uo.EU : this.qe[this.apiHost] = uo.CUSTOM), this.qe[this.apiHost];
        }
        endpointFor(t2, i2) {
          if (void 0 === i2 && (i2 = ""), i2 && (i2 = "/" === i2[0] ? i2 : "/" + i2), "ui" === t2) return this.uiHost + i2;
          if (this.region === uo.CUSTOM) return this.apiHost + i2;
          var e2 = ho + i2;
          switch (t2) {
            case "assets":
              return "https://" + this.region + "-assets." + e2;
            case "api":
              return "https://" + this.region + "." + e2;
          }
        }
      };
      var co = { icontains: (i2, e2) => !!t && e2.href.toLowerCase().indexOf(i2.toLowerCase()) > -1, not_icontains: (i2, e2) => !!t && -1 === e2.href.toLowerCase().indexOf(i2.toLowerCase()), regex: (i2, e2) => !!t && an(e2.href, i2), not_regex: (i2, e2) => !!t && !an(e2.href, i2), exact: (t2, i2) => i2.href === t2, is_not: (t2, i2) => i2.href !== t2 };
      var fo = class _fo {
        constructor(t2) {
          var i2 = this;
          this.getWebExperimentsAndEvaluateDisplayLogic = function(t3) {
            void 0 === t3 && (t3 = false), i2.getWebExperiments((t4) => {
              _fo.We("retrieved web experiments from the server"), i2.Ge = /* @__PURE__ */ new Map(), t4.forEach((t5) => {
                if (t5.feature_flag_key) {
                  var e2;
                  if (i2.Ge) _fo.We("setting flag key ", t5.feature_flag_key, " to web experiment ", t5), null == (e2 = i2.Ge) || e2.set(t5.feature_flag_key, t5);
                  var r2 = i2._instance.getFeatureFlag(t5.feature_flag_key);
                  C(r2) && t5.variants[r2] && i2.Ve(t5.name, r2, t5.variants[r2].transforms);
                } else if (t5.variants) for (var s2 in t5.variants) {
                  var n2 = t5.variants[s2];
                  _fo.Je(n2) && i2.Ve(t5.name, s2, n2.transforms);
                }
              });
            }, t3);
          }, this._instance = t2, this._instance.onFeatureFlags((t3) => {
            this.onFeatureFlags(t3);
          });
        }
        onFeatureFlags(t2) {
          if (this._is_bot()) _fo.We("Refusing to render web experiment since the viewer is a likely bot");
          else if (!this._instance.config.disable_web_experiments) {
            if (A(this.Ge)) return this.Ge = /* @__PURE__ */ new Map(), this.loadIfEnabled(), void this.previewWebExperiment();
            _fo.We("applying feature flags", t2), t2.forEach((t3) => {
              var i2;
              if (this.Ge && null != (i2 = this.Ge) && i2.has(t3)) {
                var e2, r2 = this._instance.getFeatureFlag(t3), s2 = null == (e2 = this.Ge) ? void 0 : e2.get(t3);
                r2 && null != s2 && s2.variants[r2] && this.Ve(s2.name, r2, s2.variants[r2].transforms);
              }
            });
          }
        }
        previewWebExperiment() {
          var t2 = _fo.getWindowLocation();
          if (null != t2 && t2.search) {
            var i2 = se(null == t2 ? void 0 : t2.search, "__experiment_id"), e2 = se(null == t2 ? void 0 : t2.search, "__experiment_variant");
            i2 && e2 && (_fo.We("previewing web experiments " + i2 + " && " + e2), this.getWebExperiments((t3) => {
              this.Ke(parseInt(i2), e2, t3);
            }, false, true));
          }
        }
        loadIfEnabled() {
          this._instance.config.disable_web_experiments || this.getWebExperimentsAndEvaluateDisplayLogic();
        }
        getWebExperiments(t2, i2, e2) {
          if (this._instance.config.disable_web_experiments && !e2) return t2([]);
          var r2 = this._instance.get_property("$web_experiments");
          if (r2 && !i2) return t2(r2);
          this._instance.ui({ url: this._instance.requestRouter.endpointFor("api", "/api/web_experiments/?token=" + this._instance.config.token), method: "GET", callback: (i3) => {
            if (200 !== i3.statusCode || !i3.json) return t2([]);
            var e3 = i3.json.experiments || [];
            return t2(e3);
          } });
        }
        Ke(t2, i2, e2) {
          var r2 = e2.filter((i3) => i3.id === t2);
          r2 && r2.length > 0 && (_fo.We("Previewing web experiment [" + r2[0].name + "] with variant [" + i2 + "]"), this.Ve(r2[0].name, i2, r2[0].variants[i2].transforms));
        }
        static Je(t2) {
          return !A(t2.conditions) && (_fo.Ye(t2) && _fo.Xe(t2));
        }
        static Ye(t2) {
          var i2;
          if (A(t2.conditions) || A(null == (i2 = t2.conditions) ? void 0 : i2.url)) return true;
          var e2, r2, s2, n2 = _fo.getWindowLocation();
          return !!n2 && (null == (e2 = t2.conditions) || !e2.url || co[null !== (r2 = null == (s2 = t2.conditions) ? void 0 : s2.urlMatchType) && void 0 !== r2 ? r2 : "icontains"](t2.conditions.url, n2));
        }
        static getWindowLocation() {
          return null == t ? void 0 : t.location;
        }
        static Xe(t2) {
          var i2;
          if (A(t2.conditions) || A(null == (i2 = t2.conditions) ? void 0 : i2.utm)) return true;
          var e2 = es();
          if (e2.utm_source) {
            var r2, s2, n2, o2, a2, l2, u2, h2, d2 = null == (r2 = t2.conditions) || null == (r2 = r2.utm) || !r2.utm_campaign || (null == (s2 = t2.conditions) || null == (s2 = s2.utm) ? void 0 : s2.utm_campaign) == e2.utm_campaign, v2 = null == (n2 = t2.conditions) || null == (n2 = n2.utm) || !n2.utm_source || (null == (o2 = t2.conditions) || null == (o2 = o2.utm) ? void 0 : o2.utm_source) == e2.utm_source, c2 = null == (a2 = t2.conditions) || null == (a2 = a2.utm) || !a2.utm_medium || (null == (l2 = t2.conditions) || null == (l2 = l2.utm) ? void 0 : l2.utm_medium) == e2.utm_medium, f2 = null == (u2 = t2.conditions) || null == (u2 = u2.utm) || !u2.utm_term || (null == (h2 = t2.conditions) || null == (h2 = h2.utm) ? void 0 : h2.utm_term) == e2.utm_term;
            return d2 && c2 && f2 && v2;
          }
          return false;
        }
        static We(t2) {
          for (var i2 = arguments.length, e2 = new Array(i2 > 1 ? i2 - 1 : 0), r2 = 1; r2 < i2; r2++) e2[r2 - 1] = arguments[r2];
          $t.info("[WebExperiments] " + t2, e2);
        }
        Ve(t2, i2, e2) {
          this._is_bot() ? _fo.We("Refusing to render web experiment since the viewer is a likely bot") : "control" !== i2 ? e2.forEach((e3) => {
            if (e3.selector) {
              var r2;
              _fo.We("applying transform of variant " + i2 + " for experiment " + t2 + " ", e3);
              var s2 = null == (r2 = document) ? void 0 : r2.querySelectorAll(e3.selector);
              null == s2 || s2.forEach((t3) => {
                var i3 = t3;
                e3.html && (i3.innerHTML = e3.html), e3.css && i3.setAttribute("style", e3.css);
              });
            }
          }) : _fo.We("Control variants leave the page unmodified.");
        }
        _is_bot() {
          return n && this._instance ? lo(n, this._instance.config.custom_blocked_useragents) : void 0;
        }
      };
      var po = kt("[PostHog ExternalIntegrations]");
      var go = { intercom: "intercom-integration", crispChat: "crisp-chat-integration" };
      var _o = class {
        constructor(t2) {
          this._instance = t2;
        }
        nt(t2, i2) {
          var e2;
          null == (e2 = v.__PosthogExtensions__) || null == e2.loadExternalDependency || e2.loadExternalDependency(this._instance, t2, (t3) => {
            if (t3) return po.error("failed to load script", t3);
            i2();
          });
        }
        startIfEnabledOrStop() {
          var t2 = this, i2 = function(i3) {
            var e3, s3, n2;
            (!r2 || null != (e3 = v.__PosthogExtensions__) && null != (e3 = e3.integrations) && e3[i3] || t2.nt(go[i3], () => {
              var e4;
              null == (e4 = v.__PosthogExtensions__) || null == (e4 = e4.integrations) || null == (e4 = e4[i3]) || e4.start(t2._instance);
            }), !r2 && null != (s3 = v.__PosthogExtensions__) && null != (s3 = s3.integrations) && s3[i3]) && (null == (n2 = v.__PosthogExtensions__) || null == (n2 = n2.integrations) || null == (n2 = n2[i3]) || n2.stop());
          };
          for (var [e2, r2] of Object.entries(null !== (s2 = this._instance.config.integrations) && void 0 !== s2 ? s2 : {})) {
            var s2;
            i2(e2);
          }
        }
      };
      var mo = "[SessionRecording]";
      var yo = kt(mo);
      var bo = class {
        get started() {
          var t2;
          return !(null == (t2 = this.Qe) || !t2.isStarted);
        }
        get status() {
          return this.Qe ? this.Qe.status : this.Ze && !this.tr ? "disabled" : "lazy_loading";
        }
        constructor(t2) {
          if (this._forceAllowLocalhostNetworkCapture = false, this.Ze = false, this.ir = void 0, this._instance = t2, !this._instance.sessionManager) throw yo.error("started without valid sessionManager"), new Error(mo + " started without valid sessionManager. This is a bug.");
          if ("always" === this._instance.config.cookieless_mode) throw new Error(mo + ' cannot be used with cookieless_mode="always"');
        }
        get tr() {
          var i2, e2 = !(null == (i2 = this._instance.get_property(ti)) || !i2.enabled), r2 = !this._instance.config.disable_session_recording, s2 = this._instance.config.disable_session_recording || this._instance.consent.isOptedOut();
          return t && e2 && r2 && !s2;
        }
        startIfEnabledOrStop(t2) {
          var i2;
          if (!this.tr || null == (i2 = this.Qe) || !i2.isStarted) {
            var e2 = !O(Object.assign) && !O(Array.from);
            this.tr && e2 ? (this.er(t2), yo.info("starting")) : this.stopRecording();
          }
        }
        er(t2) {
          var i2, e2, r2;
          this.tr && (null != v && null != (i2 = v.__PosthogExtensions__) && null != (i2 = i2.rrweb) && i2.record && null != (e2 = v.__PosthogExtensions__) && e2.initSessionRecording ? this.rr(t2) : null == (r2 = v.__PosthogExtensions__) || null == r2.loadExternalDependency || r2.loadExternalDependency(this._instance, this.sr, (i3) => {
            if (i3) return yo.error("could not load recorder", i3);
            this.rr(t2);
          }));
        }
        stopRecording() {
          var t2, i2;
          null == (t2 = this.ir) || t2.call(this), this.ir = void 0, null == (i2 = this.Qe) || i2.stop();
        }
        nr() {
          var t2;
          null == (t2 = this._instance.persistence) || t2.unregister(ei);
        }
        ar(t2) {
          if (this._instance.persistence) {
            var i2, e2, r2 = this._instance.persistence, s2 = () => {
              var i3 = false === t2.sessionRecording ? void 0 : t2.sessionRecording, e3 = null == i3 ? void 0 : i3.sampleRate, s3 = A(e3) ? null : parseFloat(e3);
              A(s3) && this.nr();
              var n2 = null == i3 ? void 0 : i3.minimumDurationMilliseconds;
              r2.register({ [ti]: g({ enabled: !!i3 }, i3, { networkPayloadCapture: g({ capturePerformance: t2.capturePerformance }, null == i3 ? void 0 : i3.networkPayloadCapture), canvasRecording: { enabled: null == i3 ? void 0 : i3.recordCanvas, fps: null == i3 ? void 0 : i3.canvasFps, quality: null == i3 ? void 0 : i3.canvasQuality }, sampleRate: s3, minimumDurationMilliseconds: O(n2) ? null : n2, endpoint: null == i3 ? void 0 : i3.endpoint, triggerMatchType: null == i3 ? void 0 : i3.triggerMatchType, masking: null == i3 ? void 0 : i3.masking, urlTriggers: null == i3 ? void 0 : i3.urlTriggers }) });
            };
            s2(), null == (i2 = this.ir) || i2.call(this), this.ir = null == (e2 = this._instance.sessionManager) ? void 0 : e2.onSessionId(s2);
          }
        }
        onRemoteConfig(t2) {
          "sessionRecording" in t2 ? false !== t2.sessionRecording ? (this.ar(t2), this.Ze = true, this.startIfEnabledOrStop()) : this.Ze = true : yo.info("skipping remote config with no sessionRecording", t2);
        }
        log(t2, i2) {
          var e2;
          void 0 === i2 && (i2 = "log"), null != (e2 = this.Qe) && e2.log ? this.Qe.log(t2, i2) : yo.warn("log called before recorder was ready");
        }
        get sr() {
          var t2, i2, e2 = null == (t2 = this._instance) || null == (t2 = t2.persistence) ? void 0 : t2.get_property(ti);
          return (null == e2 || null == (i2 = e2.scriptConfig) ? void 0 : i2.script) || "lazy-recorder";
        }
        rr(t2) {
          var i2, e2;
          if (null == (i2 = v.__PosthogExtensions__) || !i2.initSessionRecording) throw Error("Called on script loaded before session recording is available");
          this.Qe || (this.Qe = null == (e2 = v.__PosthogExtensions__) ? void 0 : e2.initSessionRecording(this._instance), this.Qe._forceAllowLocalhostNetworkCapture = this._forceAllowLocalhostNetworkCapture);
          this.Qe.start(t2);
        }
        onRRwebEmit(t2) {
          var i2;
          null == (i2 = this.Qe) || null == i2.onRRwebEmit || i2.onRRwebEmit(t2);
        }
        overrideLinkedFlag() {
          var t2;
          null == (t2 = this.Qe) || t2.overrideLinkedFlag();
        }
        overrideSampling() {
          var t2;
          null == (t2 = this.Qe) || t2.overrideSampling();
        }
        overrideTrigger(t2) {
          var i2;
          null == (i2 = this.Qe) || i2.overrideTrigger(t2);
        }
        get sdkDebugProperties() {
          var t2;
          return (null == (t2 = this.Qe) ? void 0 : t2.sdkDebugProperties) || { $recording_status: this.status };
        }
        tryAddCustomEvent(t2, i2) {
          var e2;
          return !(null == (e2 = this.Qe) || !e2.tryAddCustomEvent(t2, i2));
        }
      };
      var wo = {};
      var xo = () => {
      };
      var So = "posthog";
      var Eo = !tn && -1 === (null == d ? void 0 : d.indexOf("MSIE")) && -1 === (null == d ? void 0 : d.indexOf("Mozilla"));
      var $o = (i2) => {
        var e2;
        return { api_host: "https://us.i.posthog.com", ui_host: null, token: "", autocapture: true, rageclick: true, cross_subdomain_cookie: Ut(null == o ? void 0 : o.location), persistence: "localStorage+cookie", persistence_name: "", loaded: xo, save_campaign_params: true, custom_campaign_params: [], custom_blocked_useragents: [], save_referrer: true, capture_pageview: "2025-05-24" !== i2 || "history_change", capture_pageleave: "if_capture_pageview", defaults: null != i2 ? i2 : "unset", debug: a && C(null == a ? void 0 : a.search) && -1 !== a.search.indexOf("__posthog_debug=true") || false, cookie_expiration: 365, upgrade: false, disable_session_recording: false, disable_persistence: false, disable_web_experiments: true, disable_surveys: false, disable_surveys_automatic_display: false, disable_external_dependency_loading: false, enable_recording_console_log: void 0, secure_cookie: "https:" === (null == t || null == (e2 = t.location) ? void 0 : e2.protocol), ip: false, opt_out_capturing_by_default: false, opt_out_persistence_by_default: false, opt_out_useragent_filter: false, opt_out_capturing_persistence_type: "localStorage", consent_persistence_name: null, opt_out_capturing_cookie_prefix: null, opt_in_site_apps: false, property_denylist: [], respect_dnt: false, sanitize_properties: null, request_headers: {}, request_batching: true, properties_string_max_length: 65535, session_recording: {}, mask_all_element_attributes: false, mask_all_text: false, mask_personal_data_properties: false, custom_personal_data_properties: [], advanced_disable_flags: false, advanced_disable_decide: false, advanced_disable_feature_flags: false, advanced_disable_feature_flags_on_first_load: false, advanced_only_evaluate_survey_feature_flags: false, advanced_enable_surveys: false, advanced_disable_toolbar_metrics: false, feature_flag_request_timeout_ms: 3e3, surveys_request_timeout_ms: 1e4, on_request_error: (t2) => {
          var i3 = "Bad HTTP status: " + t2.statusCode + " " + t2.text;
          $t.error(i3);
        }, get_device_id: (t2) => t2, capture_performance: void 0, name: "posthog", bootstrap: {}, disable_compression: false, session_idle_timeout_seconds: 1800, person_profiles: "identified_only", before_send: void 0, request_queue_config: { flush_interval_ms: Jn }, error_tracking: {}, _onCapture: xo, __preview_eager_load_replay: false };
      };
      var ko = (t2) => {
        var i2 = {};
        O(t2.process_person) || (i2.person_profiles = t2.process_person), O(t2.xhr_headers) || (i2.request_headers = t2.xhr_headers), O(t2.cookie_name) || (i2.persistence_name = t2.cookie_name), O(t2.disable_cookie) || (i2.disable_persistence = t2.disable_cookie), O(t2.store_google) || (i2.save_campaign_params = t2.store_google), O(t2.verbose) || (i2.debug = t2.verbose);
        var e2 = Ct({}, i2, t2);
        return P(t2.property_blacklist) && (O(t2.property_denylist) ? e2.property_denylist = t2.property_blacklist : P(t2.property_denylist) ? e2.property_denylist = [...t2.property_blacklist, ...t2.property_denylist] : $t.error("Invalid value for property_denylist config: " + t2.property_denylist)), e2;
      };
      var Po = class {
        constructor() {
          this.__forceAllowLocalhost = false;
        }
        get lr() {
          return this.__forceAllowLocalhost;
        }
        set lr(t2) {
          $t.error("WebPerformanceObserver is deprecated and has no impact on network capture. Use `_forceAllowLocalhostNetworkCapture` on `posthog.sessionRecording`"), this.__forceAllowLocalhost = t2;
        }
      };
      var To = class _To {
        get decideEndpointWasHit() {
          var t2, i2;
          return null !== (t2 = null == (i2 = this.featureFlags) ? void 0 : i2.hasLoadedFlags) && void 0 !== t2 && t2;
        }
        get flagsEndpointWasHit() {
          var t2, i2;
          return null !== (t2 = null == (i2 = this.featureFlags) ? void 0 : i2.hasLoadedFlags) && void 0 !== t2 && t2;
        }
        constructor() {
          this.webPerformance = new Po(), this.ur = false, this.version = c.LIB_VERSION, this.hr = new Mn(), this._calculate_event_properties = this.calculateEventProperties.bind(this), this.config = $o(), this.SentryIntegration = Ve, this.sentryIntegration = (t2) => function(t3, i2) {
            var e2 = Ge(t3, i2);
            return { name: We, processEvent: (t4) => e2(t4) };
          }(this, t2), this.__request_queue = [], this.__loaded = false, this.analyticsDefaultEndpoint = "/e/", this.dr = false, this.vr = null, this.cr = null, this.pr = null, this.featureFlags = new xn(this), this.toolbar = new Qe(this), this.scrollManager = new Qn(this), this.pageViewManager = new ms(this), this.surveys = new Bn(this), this.experiments = new fo(this), this.exceptions = new vn(this), this.rateLimiter = new Wn(this), this.requestRouter = new vo(this), this.consent = new Me(this), this.externalIntegrations = new _o(this), this.people = { set: (t2, i2, e2) => {
            var r2 = C(t2) ? { [t2]: i2 } : t2;
            this.setPersonProperties(r2), null == e2 || e2({});
          }, set_once: (t2, i2, e2) => {
            var r2 = C(t2) ? { [t2]: i2 } : t2;
            this.setPersonProperties(void 0, r2), null == e2 || e2({});
          } }, this.on("eventCaptured", (t2) => $t.info('send "' + (null == t2 ? void 0 : t2.event) + '"', t2));
        }
        init(t2, i2, e2) {
          if (e2 && e2 !== So) {
            var r2, s2 = null !== (r2 = wo[e2]) && void 0 !== r2 ? r2 : new _To();
            return s2._init(t2, i2, e2), wo[e2] = s2, wo[So][e2] = s2, s2;
          }
          return this._init(t2, i2, e2);
        }
        _init(i2, e2, r2) {
          var s2, n2;
          if (void 0 === e2 && (e2 = {}), O(i2) || F(i2)) return $t.critical("PostHog was initialized without a token. This likely indicates a misconfiguration. Please check the first argument passed to posthog.init()"), this;
          if (this.__loaded) return $t.warn("You have already initialized PostHog! Re-initializing is a no-op"), this;
          this.__loaded = true, this.config = {}, this.gr = e2, this._r = [], e2.person_profiles && (this.cr = e2.person_profiles), this.set_config(Ct({}, $o(e2.defaults), ko(e2), { name: r2, token: i2 })), this.config.on_xhr_error && $t.error("on_xhr_error is deprecated. Use on_request_error instead"), this.compression = e2.disable_compression ? void 0 : ie.GZipJS;
          var o2 = this.mr();
          this.persistence = new En(this.config, o2), this.sessionPersistence = "sessionStorage" === this.config.persistence || "memory" === this.config.persistence ? this.persistence : new En(g({}, this.config, { persistence: "sessionStorage" }), o2);
          var a2 = g({}, this.persistence.props), l2 = g({}, this.sessionPersistence.props);
          this.register({ $initialization_time: (/* @__PURE__ */ new Date()).toISOString() }), this.yr = new Kn((t2) => this.br(t2), this.config.request_queue_config), this.wr = new Xn(this), this.__request_queue = [];
          var u2 = "always" === this.config.cookieless_mode || "on_reject" === this.config.cookieless_mode && this.consent.isExplicitlyOptedOut();
          if (u2 || (this.sessionManager = new eo(this), this.sessionPropsManager = new to(this, this.sessionManager, this.persistence)), new tr(this).startIfEnabledOrStop(), this.siteApps = new no(this), null == (s2 = this.siteApps) || s2.init(), u2 || (this.sessionRecording = new bo(this), this.sessionRecording.startIfEnabledOrStop()), this.config.disable_scroll_properties || this.scrollManager.startMeasuringScrollPosition(), this.autocapture = new ve(this), this.autocapture.startIfEnabled(), this.surveys.loadIfEnabled(), this.heatmaps = new _s(this), this.heatmaps.startIfEnabled(), this.webVitalsAutocapture = new fs(this), this.exceptionObserver = new Ue(this), this.exceptionObserver.startIfEnabled(), this.deadClicksAutocapture = new Le(this, De), this.deadClicksAutocapture.startIfEnabled(), this.historyAutocapture = new He(this), this.historyAutocapture.startIfEnabled(), c.DEBUG = c.DEBUG || this.config.debug, c.DEBUG && $t.info("Starting in debug mode", { this: this, config: e2, thisC: g({}, this.config), p: a2, s: l2 }), void 0 !== (null == (n2 = e2.bootstrap) ? void 0 : n2.distinctID)) {
            var h2, d2, v2 = this.config.get_device_id(ye()), f2 = null != (h2 = e2.bootstrap) && h2.isIdentifiedID ? v2 : e2.bootstrap.distinctID;
            this.persistence.set_property(di, null != (d2 = e2.bootstrap) && d2.isIdentifiedID ? "identified" : "anonymous"), this.register({ distinct_id: e2.bootstrap.distinctID, $device_id: f2 });
          }
          if (this.Sr()) {
            var p2, _2, m2 = Object.keys((null == (p2 = e2.bootstrap) ? void 0 : p2.featureFlags) || {}).filter((t2) => {
              var i3;
              return !(null == (i3 = e2.bootstrap) || null == (i3 = i3.featureFlags) || !i3[t2]);
            }).reduce((t2, i3) => {
              var r3;
              return t2[i3] = (null == (r3 = e2.bootstrap) || null == (r3 = r3.featureFlags) ? void 0 : r3[i3]) || false, t2;
            }, {}), y2 = Object.keys((null == (_2 = e2.bootstrap) ? void 0 : _2.featureFlagPayloads) || {}).filter((t2) => m2[t2]).reduce((t2, i3) => {
              var r3, s3;
              null != (r3 = e2.bootstrap) && null != (r3 = r3.featureFlagPayloads) && r3[i3] && (t2[i3] = null == (s3 = e2.bootstrap) || null == (s3 = s3.featureFlagPayloads) ? void 0 : s3[i3]);
              return t2;
            }, {});
            this.featureFlags.receivedFeatureFlags({ featureFlags: m2, featureFlagPayloads: y2 });
          }
          if (u2) this.register_once({ distinct_id: yi, $device_id: null }, "");
          else if (!this.get_distinct_id()) {
            var b2 = this.config.get_device_id(ye());
            this.register_once({ distinct_id: b2, $device_id: b2 }, ""), this.persistence.set_property(di, "anonymous");
          }
          return Ht(t, "onpagehide" in self ? "pagehide" : "unload", this._handle_unload.bind(this), { passive: false }), this.toolbar.maybeLoadToolbar(), e2.segment ? qe(this, () => this.Er()) : this.Er(), T(this.config._onCapture) && this.config._onCapture !== xo && ($t.warn("onCapture is deprecated. Please use `before_send` instead"), this.on("eventCaptured", (t2) => this.config._onCapture(t2.event, t2))), this.config.ip && $t.warn('The `ip` config option has NO EFFECT AT ALL and has been deprecated. Use a custom transformation or "Discard IP data" project setting instead. See https://posthog.com/tutorials/web-redact-properties#hiding-customer-ip-address for more information.'), this;
        }
        hi(t2) {
          var i2, e2, r2, s2, n2, a2, l2, u2;
          if (!o || !o.body) return $t.info("document not ready yet, trying again in 500 milliseconds..."), void setTimeout(() => {
            this.hi(t2);
          }, 500);
          this.compression = void 0, t2.supportedCompression && !this.config.disable_compression && (this.compression = y(t2.supportedCompression, ie.GZipJS) ? ie.GZipJS : y(t2.supportedCompression, ie.Base64) ? ie.Base64 : void 0), null != (i2 = t2.analytics) && i2.endpoint && (this.analyticsDefaultEndpoint = t2.analytics.endpoint), this.set_config({ person_profiles: this.cr ? this.cr : "identified_only" }), null == (e2 = this.siteApps) || e2.onRemoteConfig(t2), null == (r2 = this.sessionRecording) || r2.onRemoteConfig(t2), null == (s2 = this.autocapture) || s2.onRemoteConfig(t2), null == (n2 = this.heatmaps) || n2.onRemoteConfig(t2), this.surveys.onRemoteConfig(t2), null == (a2 = this.webVitalsAutocapture) || a2.onRemoteConfig(t2), null == (l2 = this.exceptionObserver) || l2.onRemoteConfig(t2), this.exceptions.onRemoteConfig(t2), null == (u2 = this.deadClicksAutocapture) || u2.onRemoteConfig(t2);
        }
        Er() {
          try {
            this.config.loaded(this);
          } catch (t2) {
            $t.critical("`loaded` function failed", t2);
          }
          this.$r(), this.config.capture_pageview && setTimeout(() => {
            (this.consent.isOptedIn() || "always" === this.config.cookieless_mode) && this.kr();
          }, 1), new Vn(this).load(), this.featureFlags.flags();
        }
        $r() {
          var t2;
          this.is_capturing() && (this.config.request_batching && (null == (t2 = this.yr) || t2.enable()));
        }
        _dom_loaded() {
          this.is_capturing() && Rt(this.__request_queue, (t2) => this.br(t2)), this.__request_queue = [], this.$r();
        }
        _handle_unload() {
          var t2, i2;
          this.config.request_batching ? (this.Pr() && this.capture("$pageleave"), null == (t2 = this.yr) || t2.unload(), null == (i2 = this.wr) || i2.unload()) : this.Pr() && this.capture("$pageleave", null, { transport: "sendBeacon" });
        }
        ui(t2) {
          this.__loaded && (Eo ? this.__request_queue.push(t2) : this.rateLimiter.isServerRateLimited(t2.batchKey) || (t2.transport = t2.transport || this.config.api_transport, t2.url = rn(t2.url, { ip: this.config.ip ? 1 : 0 }), t2.headers = g({}, this.config.request_headers), t2.compression = "best-available" === t2.compression ? this.compression : t2.compression, t2.disableXHRCredentials = this.config.__preview_disable_xhr_credentials, this.config.__preview_disable_beacon && (t2.disableTransport = ["sendBeacon"]), t2.fetchOptions = t2.fetchOptions || this.config.fetch_options, ((t3) => {
            var i2, e2, r2, s2 = g({}, t3);
            s2.timeout = s2.timeout || 6e4, s2.url = rn(s2.url, { _: (/* @__PURE__ */ new Date()).getTime().toString(), ver: c.LIB_VERSION, compression: s2.compression });
            var n2 = null !== (i2 = s2.transport) && void 0 !== i2 ? i2 : "fetch", o2 = on.filter((t4) => !s2.disableTransport || !t4.transport || !s2.disableTransport.includes(t4.transport)), a2 = null !== (e2 = null == (r2 = zt(o2, (t4) => t4.transport === n2)) ? void 0 : r2.method) && void 0 !== e2 ? e2 : o2[0].method;
            if (!a2) throw new Error("No available transport method");
            a2(s2);
          })(g({}, t2, { callback: (i2) => {
            var e2, r2;
            (this.rateLimiter.checkForLimiting(i2), i2.statusCode >= 400) && (null == (e2 = (r2 = this.config).on_request_error) || e2.call(r2, i2));
            null == t2.callback || t2.callback(i2);
          } }))));
        }
        br(t2) {
          this.wr ? this.wr.retriableRequest(t2) : this.ui(t2);
        }
        _execute_array(t2) {
          var i2, e2 = [], r2 = [], s2 = [];
          Rt(t2, (t3) => {
            t3 && (i2 = t3[0], P(i2) ? s2.push(t3) : T(t3) ? t3.call(this) : P(t3) && "alias" === i2 ? e2.push(t3) : P(t3) && -1 !== i2.indexOf("capture") && T(this[i2]) ? s2.push(t3) : r2.push(t3));
          });
          var n2 = function(t3, i3) {
            Rt(t3, function(t4) {
              if (P(t4[0])) {
                var e3 = i3;
                Ot(t4, function(t5) {
                  e3 = e3[t5[0]].apply(e3, t5.slice(1));
                });
              } else this[t4[0]].apply(this, t4.slice(1));
            }, i3);
          };
          n2(e2, this), n2(r2, this), n2(s2, this);
        }
        Sr() {
          var t2, i2;
          return (null == (t2 = this.config.bootstrap) ? void 0 : t2.featureFlags) && Object.keys(null == (i2 = this.config.bootstrap) ? void 0 : i2.featureFlags).length > 0 || false;
        }
        push(t2) {
          this._execute_array([t2]);
        }
        capture(t2, i2, e2) {
          var r2;
          if (this.__loaded && this.persistence && this.sessionPersistence && this.yr) {
            if (this.is_capturing()) if (!O(t2) && C(t2)) {
              if (this.config.opt_out_useragent_filter || !this._is_bot()) {
                var s2 = null != e2 && e2.skip_client_rate_limiting ? void 0 : this.rateLimiter.clientRateLimitContext();
                if (null == s2 || !s2.isRateLimited) {
                  null != i2 && i2.$current_url && !C(null == i2 ? void 0 : i2.$current_url) && ($t.error("Invalid `$current_url` property provided to `posthog.capture`. Input must be a string. Ignoring provided value."), null == i2 || delete i2.$current_url), this.sessionPersistence.update_search_keyword(), this.config.save_campaign_params && this.sessionPersistence.update_campaign_params(), this.config.save_referrer && this.sessionPersistence.update_referrer_info(), (this.config.save_campaign_params || this.config.save_referrer) && this.persistence.set_initial_person_info();
                  var n2 = /* @__PURE__ */ new Date(), o2 = (null == e2 ? void 0 : e2.timestamp) || n2, a2 = ye(), l2 = { uuid: a2, event: t2, properties: this.calculateEventProperties(t2, i2 || {}, o2, a2) };
                  s2 && (l2.properties.$lib_rate_limit_remaining_tokens = s2.remainingTokens), (null == e2 ? void 0 : e2.$set) && (l2.$set = null == e2 ? void 0 : e2.$set);
                  var u2, h2 = this.Tr(null == e2 ? void 0 : e2.$set_once);
                  if (h2 && (l2.$set_once = h2), (l2 = Lt(l2, null != e2 && e2._noTruncate ? null : this.config.properties_string_max_length)).timestamp = o2, O(null == e2 ? void 0 : e2.timestamp) || (l2.properties.$event_time_override_provided = true, l2.properties.$event_time_override_system_time = n2), t2 === On.DISMISSED || t2 === On.SENT) {
                    var d2 = null == i2 ? void 0 : i2[Cn.SURVEY_ID], v2 = null == i2 ? void 0 : i2[Cn.SURVEY_ITERATION];
                    u2 = { id: d2, current_iteration: v2 }, localStorage.getItem(Nn(u2)) || localStorage.setItem(Nn(u2), "true"), l2.$set = g({}, l2.$set, { [Ln({ id: d2, current_iteration: v2 }, t2 === On.SENT ? "responded" : "dismissed")]: true });
                  }
                  var c2 = g({}, l2.properties.$set, l2.$set);
                  if (R(c2) || this.setPersonPropertiesForFlags(c2), !A(this.config.before_send)) {
                    var f2 = this.Ir(l2);
                    if (!f2) return;
                    l2 = f2;
                  }
                  this.hr.emit("eventCaptured", l2);
                  var p2 = { method: "POST", url: null !== (r2 = null == e2 ? void 0 : e2._url) && void 0 !== r2 ? r2 : this.requestRouter.endpointFor("api", this.analyticsDefaultEndpoint), data: l2, compression: "best-available", batchKey: null == e2 ? void 0 : e2._batchKey };
                  return !this.config.request_batching || e2 && (null == e2 || !e2._batchKey) || null != e2 && e2.send_instantly ? this.br(p2) : this.yr.enqueue(p2), l2;
                }
                $t.critical("This capture call is ignored due to client rate limiting.");
              }
            } else $t.error("No event name provided to posthog.capture");
          } else $t.uninitializedWarning("posthog.capture");
        }
        Ri(t2) {
          return this.on("eventCaptured", (i2) => t2(i2.event, i2));
        }
        calculateEventProperties(t2, i2, e2, r2, s2) {
          if (e2 = e2 || /* @__PURE__ */ new Date(), !this.persistence || !this.sessionPersistence) return i2;
          var n2 = s2 ? void 0 : this.persistence.remove_event_timer(t2), a2 = g({}, i2);
          if (a2.token = this.config.token, a2.$config_defaults = this.config.defaults, ("always" == this.config.cookieless_mode || "on_reject" == this.config.cookieless_mode && this.consent.isExplicitlyOptedOut()) && (a2.$cookieless_mode = true), "$snapshot" === t2) {
            var l2 = g({}, this.persistence.properties(), this.sessionPersistence.properties());
            return a2.distinct_id = l2.distinct_id, (!C(a2.distinct_id) && !j(a2.distinct_id) || F(a2.distinct_id)) && $t.error("Invalid distinct_id for replay event. This indicates a bug in your implementation"), a2;
          }
          var u2, h2 = ds(this.config.mask_personal_data_properties, this.config.custom_personal_data_properties);
          if (this.sessionManager) {
            var { sessionId: v2, windowId: c2 } = this.sessionManager.checkAndGetSessionAndWindowId(s2, e2.getTime());
            a2.$session_id = v2, a2.$window_id = c2;
          }
          this.sessionPropsManager && Ct(a2, this.sessionPropsManager.getSessionProps());
          try {
            var f2;
            this.sessionRecording && Ct(a2, this.sessionRecording.sdkDebugProperties), a2.$sdk_debug_retry_queue_size = null == (f2 = this.wr) ? void 0 : f2.length;
          } catch (t3) {
            a2.$sdk_debug_error_capturing_properties = String(t3);
          }
          if (this.requestRouter.region === uo.CUSTOM && (a2.$lib_custom_api_host = this.config.api_host), u2 = "$pageview" !== t2 || s2 ? "$pageleave" !== t2 || s2 ? this.pageViewManager.doEvent() : this.pageViewManager.doPageLeave(e2) : this.pageViewManager.doPageView(e2, r2), a2 = Ct(a2, u2), "$pageview" === t2 && o && (a2.title = o.title), !O(n2)) {
            var p2 = e2.getTime() - n2;
            a2.$duration = parseFloat((p2 / 1e3).toFixed(3));
          }
          d && this.config.opt_out_useragent_filter && (a2.$browser_type = this._is_bot() ? "bot" : "browser"), (a2 = Ct({}, h2, this.persistence.properties(), this.sessionPersistence.properties(), a2)).$is_identified = this._isIdentified(), P(this.config.property_denylist) ? Ot(this.config.property_denylist, function(t3) {
            delete a2[t3];
          }) : $t.error("Invalid value for property_denylist config: " + this.config.property_denylist + " or property_blacklist config: " + this.config.property_blacklist);
          var _2 = this.config.sanitize_properties;
          _2 && ($t.error("sanitize_properties is deprecated. Use before_send instead"), a2 = _2(a2, t2));
          var m2 = this.Rr();
          return a2.$process_person_profile = m2, m2 && !s2 && this.Or("_calculate_event_properties"), a2;
        }
        Tr(t2) {
          var i2;
          if (!this.persistence || !this.Rr()) return t2;
          if (this.ur) return t2;
          var e2 = this.persistence.get_initial_props(), r2 = null == (i2 = this.sessionPropsManager) ? void 0 : i2.getSetOnceProps(), s2 = Ct({}, e2, r2 || {}, t2 || {}), n2 = this.config.sanitize_properties;
          return n2 && ($t.error("sanitize_properties is deprecated. Use before_send instead"), s2 = n2(s2, "$set_once")), this.ur = true, R(s2) ? void 0 : s2;
        }
        register(t2, i2) {
          var e2;
          null == (e2 = this.persistence) || e2.register(t2, i2);
        }
        register_once(t2, i2, e2) {
          var r2;
          null == (r2 = this.persistence) || r2.register_once(t2, i2, e2);
        }
        register_for_session(t2) {
          var i2;
          null == (i2 = this.sessionPersistence) || i2.register(t2);
        }
        unregister(t2) {
          var i2;
          null == (i2 = this.persistence) || i2.unregister(t2);
        }
        unregister_for_session(t2) {
          var i2;
          null == (i2 = this.sessionPersistence) || i2.unregister(t2);
        }
        Cr(t2, i2) {
          this.register({ [t2]: i2 });
        }
        getFeatureFlag(t2, i2) {
          return this.featureFlags.getFeatureFlag(t2, i2);
        }
        getFeatureFlagPayload(t2) {
          var i2 = this.featureFlags.getFeatureFlagPayload(t2);
          try {
            return JSON.parse(i2);
          } catch (t3) {
            return i2;
          }
        }
        isFeatureEnabled(t2, i2) {
          return this.featureFlags.isFeatureEnabled(t2, i2);
        }
        reloadFeatureFlags() {
          this.featureFlags.reloadFeatureFlags();
        }
        updateEarlyAccessFeatureEnrollment(t2, i2, e2) {
          this.featureFlags.updateEarlyAccessFeatureEnrollment(t2, i2, e2);
        }
        getEarlyAccessFeatures(t2, i2, e2) {
          return void 0 === i2 && (i2 = false), this.featureFlags.getEarlyAccessFeatures(t2, i2, e2);
        }
        on(t2, i2) {
          return this.hr.on(t2, i2);
        }
        onFeatureFlags(t2) {
          return this.featureFlags.onFeatureFlags(t2);
        }
        onSurveysLoaded(t2) {
          return this.surveys.onSurveysLoaded(t2);
        }
        onSessionId(t2) {
          var i2, e2;
          return null !== (i2 = null == (e2 = this.sessionManager) ? void 0 : e2.onSessionId(t2)) && void 0 !== i2 ? i2 : () => {
          };
        }
        getSurveys(t2, i2) {
          void 0 === i2 && (i2 = false), this.surveys.getSurveys(t2, i2);
        }
        getActiveMatchingSurveys(t2, i2) {
          void 0 === i2 && (i2 = false), this.surveys.getActiveMatchingSurveys(t2, i2);
        }
        renderSurvey(t2, i2) {
          this.surveys.renderSurvey(t2, i2);
        }
        displaySurvey(t2, i2) {
          void 0 === i2 && (i2 = zn), this.surveys.displaySurvey(t2, i2);
        }
        canRenderSurvey(t2) {
          return this.surveys.canRenderSurvey(t2);
        }
        canRenderSurveyAsync(t2, i2) {
          return void 0 === i2 && (i2 = false), this.surveys.canRenderSurveyAsync(t2, i2);
        }
        identify(t2, i2, e2) {
          if (!this.__loaded || !this.persistence) return $t.uninitializedWarning("posthog.identify");
          if (j(t2) && (t2 = t2.toString(), $t.warn("The first argument to posthog.identify was a number, but it should be a string. It has been converted to a string.")), t2) if (["distinct_id", "distinctid"].includes(t2.toLowerCase())) $t.critical('The string "' + t2 + '" was set in posthog.identify which indicates an error. This ID should be unique to the user and not a hardcoded string.');
          else if (t2 !== yi) {
            if (this.Or("posthog.identify")) {
              var r2 = this.get_distinct_id();
              if (this.register({ $user_id: t2 }), !this.get_property("$device_id")) {
                var s2 = r2;
                this.register_once({ $had_persisted_distinct_id: true, $device_id: s2 }, "");
              }
              t2 !== r2 && t2 !== this.get_property(qt) && (this.unregister(qt), this.register({ distinct_id: t2 }));
              var n2 = "anonymous" === (this.persistence.get_property(di) || "anonymous");
              t2 !== r2 && n2 ? (this.persistence.set_property(di, "identified"), this.setPersonPropertiesForFlags(g({}, e2 || {}, i2 || {}), false), this.capture("$identify", { distinct_id: t2, $anon_distinct_id: r2 }, { $set: i2 || {}, $set_once: e2 || {} }), this.pr = ln(t2, i2, e2), this.featureFlags.setAnonymousDistinctId(r2)) : (i2 || e2) && this.setPersonProperties(i2, e2), t2 !== r2 && (this.reloadFeatureFlags(), this.unregister(hi));
            }
          } else $t.critical('The string "' + yi + '" was set in posthog.identify which indicates an error. This ID is only used as a sentinel value.');
          else $t.error("Unique user id has not been set in posthog.identify");
        }
        setPersonProperties(t2, i2) {
          if ((t2 || i2) && this.Or("posthog.setPersonProperties")) {
            var e2 = ln(this.get_distinct_id(), t2, i2);
            this.pr !== e2 ? (this.setPersonPropertiesForFlags(g({}, i2 || {}, t2 || {})), this.capture("$set", { $set: t2 || {}, $set_once: i2 || {} }), this.pr = e2) : $t.info("A duplicate setPersonProperties call was made with the same properties. It has been ignored.");
          }
        }
        group(t2, i2, e2) {
          if (t2 && i2) {
            if (this.Or("posthog.group")) {
              var r2 = this.getGroups();
              r2[t2] !== i2 && this.resetGroupPropertiesForFlags(t2), this.register({ $groups: g({}, r2, { [t2]: i2 }) }), e2 && (this.capture("$groupidentify", { $group_type: t2, $group_key: i2, $group_set: e2 }), this.setGroupPropertiesForFlags({ [t2]: e2 })), r2[t2] === i2 || e2 || this.reloadFeatureFlags();
            }
          } else $t.error("posthog.group requires a group type and group key");
        }
        resetGroups() {
          this.register({ $groups: {} }), this.resetGroupPropertiesForFlags(), this.reloadFeatureFlags();
        }
        setPersonPropertiesForFlags(t2, i2) {
          void 0 === i2 && (i2 = true), this.featureFlags.setPersonPropertiesForFlags(t2, i2);
        }
        resetPersonPropertiesForFlags() {
          this.featureFlags.resetPersonPropertiesForFlags();
        }
        setGroupPropertiesForFlags(t2, i2) {
          void 0 === i2 && (i2 = true), this.Or("posthog.setGroupPropertiesForFlags") && this.featureFlags.setGroupPropertiesForFlags(t2, i2);
        }
        resetGroupPropertiesForFlags(t2) {
          this.featureFlags.resetGroupPropertiesForFlags(t2);
        }
        reset(t2) {
          var i2, e2, r2, s2;
          if ($t.info("reset"), !this.__loaded) return $t.uninitializedWarning("posthog.reset");
          var n2 = this.get_property("$device_id");
          if (this.consent.reset(), null == (i2 = this.persistence) || i2.clear(), null == (e2 = this.sessionPersistence) || e2.clear(), this.surveys.reset(), this.featureFlags.reset(), null == (r2 = this.persistence) || r2.set_property(di, "anonymous"), null == (s2 = this.sessionManager) || s2.resetSessionId(), this.pr = null, "always" === this.config.cookieless_mode) this.register_once({ distinct_id: yi, $device_id: null }, "");
          else {
            var o2 = this.config.get_device_id(ye());
            this.register_once({ distinct_id: o2, $device_id: t2 ? o2 : n2 }, "");
          }
          this.register({ $last_posthog_reset: (/* @__PURE__ */ new Date()).toISOString() }, 1);
        }
        get_distinct_id() {
          return this.get_property("distinct_id");
        }
        getGroups() {
          return this.get_property("$groups") || {};
        }
        get_session_id() {
          var t2, i2;
          return null !== (t2 = null == (i2 = this.sessionManager) ? void 0 : i2.checkAndGetSessionAndWindowId(true).sessionId) && void 0 !== t2 ? t2 : "";
        }
        get_session_replay_url(t2) {
          if (!this.sessionManager) return "";
          var { sessionId: i2, sessionStartTimestamp: e2 } = this.sessionManager.checkAndGetSessionAndWindowId(true), r2 = this.requestRouter.endpointFor("ui", "/project/" + this.config.token + "/replay/" + i2);
          if (null != t2 && t2.withTimestamp && e2) {
            var s2, n2 = null !== (s2 = t2.timestampLookBack) && void 0 !== s2 ? s2 : 10;
            if (!e2) return r2;
            r2 += "?t=" + Math.max(Math.floor(((/* @__PURE__ */ new Date()).getTime() - e2) / 1e3) - n2, 0);
          }
          return r2;
        }
        alias(t2, i2) {
          return t2 === this.get_property(Bt) ? ($t.critical("Attempting to create alias for existing People user - aborting."), -2) : this.Or("posthog.alias") ? (O(i2) && (i2 = this.get_distinct_id()), t2 !== i2 ? (this.Cr(qt, t2), this.capture("$create_alias", { alias: t2, distinct_id: i2 })) : ($t.warn("alias matches current distinct_id - skipping api call."), this.identify(t2), -1)) : void 0;
        }
        set_config(t2) {
          var i2 = g({}, this.config);
          if (I(t2)) {
            var e2, r2, s2, n2, o2;
            Ct(this.config, ko(t2));
            var a2 = this.mr();
            null == (e2 = this.persistence) || e2.update_config(this.config, i2, a2), this.sessionPersistence = "sessionStorage" === this.config.persistence || "memory" === this.config.persistence ? this.persistence : new En(g({}, this.config, { persistence: "sessionStorage" }), a2), ke.G() && "true" === ke.J("ph_debug") && (this.config.debug = true), this.config.debug && (c.DEBUG = true, $t.info("set_config", { config: t2, oldConfig: i2, newConfig: g({}, this.config) })), null == (r2 = this.sessionRecording) || r2.startIfEnabledOrStop(), null == (s2 = this.autocapture) || s2.startIfEnabled(), null == (n2 = this.heatmaps) || n2.startIfEnabled(), this.surveys.loadIfEnabled(), this.Fr(), null == (o2 = this.externalIntegrations) || o2.startIfEnabledOrStop();
          }
        }
        startSessionRecording(t2) {
          var i2 = true === t2, e2 = { sampling: i2 || !(null == t2 || !t2.sampling), linked_flag: i2 || !(null == t2 || !t2.linked_flag), url_trigger: i2 || !(null == t2 || !t2.url_trigger), event_trigger: i2 || !(null == t2 || !t2.event_trigger) };
          if (Object.values(e2).some(Boolean)) {
            var r2, s2, n2, o2, a2;
            if (null == (r2 = this.sessionManager) || r2.checkAndGetSessionAndWindowId(), e2.sampling) null == (s2 = this.sessionRecording) || s2.overrideSampling();
            if (e2.linked_flag) null == (n2 = this.sessionRecording) || n2.overrideLinkedFlag();
            if (e2.url_trigger) null == (o2 = this.sessionRecording) || o2.overrideTrigger("url");
            if (e2.event_trigger) null == (a2 = this.sessionRecording) || a2.overrideTrigger("event");
          }
          this.set_config({ disable_session_recording: false });
        }
        stopSessionRecording() {
          this.set_config({ disable_session_recording: true });
        }
        sessionRecordingStarted() {
          var t2;
          return !(null == (t2 = this.sessionRecording) || !t2.started);
        }
        captureException(t2, i2) {
          var e2 = new Error("PostHog syntheticException"), r2 = this.exceptions.buildProperties(t2, { handled: true, syntheticException: e2 });
          return this.exceptions.sendExceptionEvent(g({}, r2, i2));
        }
        loadToolbar(t2) {
          return this.toolbar.loadToolbar(t2);
        }
        get_property(t2) {
          var i2;
          return null == (i2 = this.persistence) ? void 0 : i2.props[t2];
        }
        getSessionProperty(t2) {
          var i2;
          return null == (i2 = this.sessionPersistence) ? void 0 : i2.props[t2];
        }
        toString() {
          var t2, i2 = null !== (t2 = this.config.name) && void 0 !== t2 ? t2 : So;
          return i2 !== So && (i2 = So + "." + i2), i2;
        }
        _isIdentified() {
          var t2, i2;
          return "identified" === (null == (t2 = this.persistence) ? void 0 : t2.get_property(di)) || "identified" === (null == (i2 = this.sessionPersistence) ? void 0 : i2.get_property(di));
        }
        Rr() {
          var t2, i2;
          return !("never" === this.config.person_profiles || "identified_only" === this.config.person_profiles && !this._isIdentified() && R(this.getGroups()) && (null == (t2 = this.persistence) || null == (t2 = t2.props) || !t2[qt]) && (null == (i2 = this.persistence) || null == (i2 = i2.props) || !i2[_i]));
        }
        Pr() {
          return true === this.config.capture_pageleave || "if_capture_pageview" === this.config.capture_pageleave && (true === this.config.capture_pageview || "history_change" === this.config.capture_pageview);
        }
        createPersonProfile() {
          this.Rr() || this.Or("posthog.createPersonProfile") && this.setPersonProperties({}, {});
        }
        Or(t2) {
          return "never" === this.config.person_profiles ? ($t.error(t2 + ' was called, but process_person is set to "never". This call will be ignored.'), false) : (this.Cr(_i, true), true);
        }
        mr() {
          if ("always" === this.config.cookieless_mode) return true;
          var t2 = this.consent.isOptedOut(), i2 = this.config.opt_out_persistence_by_default || "on_reject" === this.config.cookieless_mode;
          return this.config.disable_persistence || t2 && !!i2;
        }
        Fr() {
          var t2, i2, e2, r2, s2 = this.mr();
          (null == (t2 = this.persistence) ? void 0 : t2.gi) !== s2 && (null == (e2 = this.persistence) || e2.set_disabled(s2));
          (null == (i2 = this.sessionPersistence) ? void 0 : i2.gi) !== s2 && (null == (r2 = this.sessionPersistence) || r2.set_disabled(s2));
          return s2;
        }
        opt_in_capturing(t2) {
          if ("always" !== this.config.cookieless_mode) {
            var i2, e2;
            if ("on_reject" === this.config.cookieless_mode && this.consent.isExplicitlyOptedOut()) this.reset(true), null == (i2 = this.sessionManager) || i2.destroy(), this.sessionManager = new eo(this), this.persistence && (this.sessionPropsManager = new to(this, this.sessionManager, this.persistence)), this.sessionRecording = new bo(this), this.sessionRecording.startIfEnabledOrStop();
            if (this.consent.optInOut(true), this.Fr(), this.$r(), "on_reject" == this.config.cookieless_mode && this.surveys.loadIfEnabled(), O(null == t2 ? void 0 : t2.captureEventName) || null != t2 && t2.captureEventName) this.capture(null !== (e2 = null == t2 ? void 0 : t2.captureEventName) && void 0 !== e2 ? e2 : "$opt_in", null == t2 ? void 0 : t2.captureProperties, { send_instantly: true });
            this.config.capture_pageview && this.kr();
          } else $t.warn('Consent opt in/out is not valid with cookieless_mode="always" and will be ignored');
        }
        opt_out_capturing() {
          var t2, i2;
          "always" !== this.config.cookieless_mode ? ("on_reject" === this.config.cookieless_mode && this.consent.isOptedIn() && this.reset(true), this.consent.optInOut(false), this.Fr(), "on_reject" === this.config.cookieless_mode && (this.register({ distinct_id: yi, $device_id: null }), null == (t2 = this.sessionManager) || t2.destroy(), this.sessionManager = void 0, this.sessionPropsManager = void 0, null == (i2 = this.sessionRecording) || i2.stopRecording(), this.sessionRecording = void 0, this.kr())) : $t.warn('Consent opt in/out is not valid with cookieless_mode="always" and will be ignored');
        }
        has_opted_in_capturing() {
          return this.consent.isOptedIn();
        }
        has_opted_out_capturing() {
          return this.consent.isOptedOut();
        }
        get_explicit_consent_status() {
          var t2 = this.consent.consent;
          return t2 === Fe.GRANTED ? "granted" : t2 === Fe.DENIED ? "denied" : "pending";
        }
        is_capturing() {
          return "always" === this.config.cookieless_mode || ("on_reject" === this.config.cookieless_mode ? this.consent.isExplicitlyOptedOut() || this.consent.isOptedIn() : !this.has_opted_out_capturing());
        }
        clear_opt_in_out_capturing() {
          this.consent.reset(), this.Fr();
        }
        _is_bot() {
          return n ? lo(n, this.config.custom_blocked_useragents) : void 0;
        }
        kr() {
          o && ("visible" === o.visibilityState ? this.dr || (this.dr = true, this.capture("$pageview", { title: o.title }, { send_instantly: true }), this.vr && (o.removeEventListener("visibilitychange", this.vr), this.vr = null)) : this.vr || (this.vr = this.kr.bind(this), Ht(o, "visibilitychange", this.vr)));
        }
        debug(i2) {
          false === i2 ? (null == t || t.console.log("You've disabled debug mode."), localStorage && localStorage.removeItem("ph_debug"), this.set_config({ debug: false })) : (null == t || t.console.log("You're now in debug mode. All calls to PostHog will be logged in your console.\nYou can disable this with `posthog.debug(false)`."), localStorage && localStorage.setItem("ph_debug", "true"), this.set_config({ debug: true }));
        }
        L() {
          var t2, i2, e2, r2, s2, n2, o2, a2 = this.gr || {};
          return "advanced_disable_flags" in a2 ? !!a2.advanced_disable_flags : false !== this.config.advanced_disable_flags ? !!this.config.advanced_disable_flags : true === this.config.advanced_disable_decide ? ($t.warn("Config field 'advanced_disable_decide' is deprecated. Please use 'advanced_disable_flags' instead. The old field will be removed in a future major version."), true) : (e2 = "advanced_disable_decide", r2 = false, s2 = $t, n2 = (i2 = "advanced_disable_flags") in (t2 = a2) && !O(t2[i2]), o2 = e2 in t2 && !O(t2[e2]), n2 ? t2[i2] : o2 ? (s2 && s2.warn("Config field '" + e2 + "' is deprecated. Please use '" + i2 + "' instead. The old field will be removed in a future major version."), t2[e2]) : r2);
        }
        Ir(t2) {
          if (A(this.config.before_send)) return t2;
          var i2 = P(this.config.before_send) ? this.config.before_send : [this.config.before_send], e2 = t2;
          for (var r2 of i2) {
            if (e2 = r2(e2), A(e2)) {
              var s2 = "Event '" + t2.event + "' was rejected in beforeSend function";
              return N(t2.event) ? $t.warn(s2 + ". This can cause unexpected behavior.") : $t.info(s2), null;
            }
            e2.properties && !R(e2.properties) || $t.warn("Event '" + t2.event + "' has no properties after beforeSend function, this is likely an error.");
          }
          return e2;
        }
        getPageViewId() {
          var t2;
          return null == (t2 = this.pageViewManager.Wt) ? void 0 : t2.pageViewId;
        }
        captureTraceFeedback(t2, i2) {
          this.capture("$ai_feedback", { $ai_trace_id: String(t2), $ai_feedback_text: i2 });
        }
        captureTraceMetric(t2, i2, e2) {
          this.capture("$ai_metric", { $ai_trace_id: String(t2), $ai_metric_name: i2, $ai_metric_value: String(e2) });
        }
      };
      !function(t2, i2) {
        for (var e2 = 0; e2 < i2.length; e2++) t2.prototype[i2[e2]] = jt(t2.prototype[i2[e2]]);
      }(To, ["identify"]);
      var Io;
      var Ro = (Io = wo[So] = new To(), function() {
        function i2() {
          i2.done || (i2.done = true, Eo = false, Ot(wo, function(t2) {
            t2._dom_loaded();
          }));
        }
        null != o && o.addEventListener ? "complete" === o.readyState ? i2() : Ht(o, "DOMContentLoaded", i2, { capture: false }) : t && $t.error("Browser doesn't support `document.addEventListener` so PostHog couldn't be initialized");
      }(), Io);
      exports.COPY_AUTOCAPTURE_EVENT = te, exports.Compression = ie, exports.DisplaySurveyType = Fn, exports.PostHog = To, exports.SurveyEventName = On, exports.SurveyEventProperties = Cn, exports.SurveyPosition = kn, exports.SurveyQuestionBranchingType = In, exports.SurveyQuestionType = Tn, exports.SurveySchedule = Rn, exports.SurveyType = Pn, exports.SurveyWidgetType = $n, exports.default = Ro, exports.posthog = Ro, exports.severityLevels = ["fatal", "error", "warning", "log", "info", "debug"];
    }
  });

  // loader-entry.js
  init_capture_filtros_inline();
  (function() {
    var SCRIPT_SRC = document.currentScript && document.currentScript.src || "";
    var u = null, SITE_KEY = "", DEBUG = false;
    try {
      if (SCRIPT_SRC) {
        u = new URL(SCRIPT_SRC);
        SITE_KEY = (u.searchParams.get("site") || "").toString();
        var dbg = (u.searchParams.get("debug") || "").toString().toLowerCase();
        DEBUG = dbg === "1" || dbg === "true";
      }
    } catch (_) {
    }
    if (!SITE_KEY) {
      return;
    }
    var APP_ORIGIN = SCRIPT_SRC ? new URL(SCRIPT_SRC).origin : location.origin;
    var log = function() {
      try {
        if (DEBUG) console.log.apply(console, ["[Loader]"].concat([].slice.call(arguments)));
      } catch (_) {
      }
    };
    var cfgUrl = APP_ORIGIN + "/api/sdk/site-config?site=" + encodeURIComponent(SITE_KEY);
    window.MyAnalytics = window.MyAnalytics || {};
    if (DEBUG) window.MyAnalytics.debug = true;
    fetch(cfgUrl, { cache: "no-store" }).then(function(r) {
      return r.json();
    }).then(function(cfg) {
      if (!cfg || !cfg.allowedDomains) {
        return;
      }
      var host = location.hostname.toLowerCase();
      var ok = cfg.allowedDomains.some(function(d) {
        return host === d || host.endsWith("." + d);
      });
      if (!ok) {
        log("blocked by allowedDomains", { host, allowed: cfg.allowedDomains });
        return;
      }
      if (cfg.consentDefault === "opt_out" && !window.__MYANALYTICS_CONSENT__) {
        log("consent: opt_out without explicit consent");
        return;
      }
      var ph = require_main();
      if (ph && ph.default) {
        ph = ph.default;
      }
      if (!ph || typeof ph.init !== "function") {
        log("posthog-js not available");
        return;
      }
      window.posthog = ph;
      ph.init(cfg.phKey, { api_host: cfg.apiHost, autocapture: true, capture_pageview: true, capture_pageleave: true });
      ph.register({ site: SITE_KEY });
      if (cfg.groupEnabled) ph.group("site", SITE_KEY);
      /* @__PURE__ */ (function() {
      })();
    }).catch(function() {
    });
  })();
})();
