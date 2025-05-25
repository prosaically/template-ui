"use strict";

// utils is a library of generic helper functions non-specific to axios

const toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
    return toString.call(val) === "[object Array]";
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
    return typeof val === "undefined";
}

/**
 * Determine if a value is Null
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is Null, otherwise false
 */
function isNull(val) {
    return typeof val === "object" && val === null;
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
    return (
        val !== null &&
        !isUndefined(val) &&
        val.constructor !== null &&
        !isUndefined(val.constructor) &&
        typeof val.constructor.isBuffer === "function" &&
        val.constructor.isBuffer(val)
    );
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
    return toString.call(val) === "[object ArrayBuffer]";
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
    if (typeof FormData === "undefined") {
        return false;
    }
    return val instanceof FormData;
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
    let result;
    if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
        result = ArrayBuffer.isView(val);
    } else {
        result = val && val.buffer && val.buffer instanceof ArrayBuffer;
    }
    return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
    return typeof val === "string";
}

/**
 * Determine if a value is a Boolean
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Boolean, otherwise false
 */
function isBoolean(val) {
    return typeof val === "boolean";
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
    return typeof val === "number";
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
    if (val === null) {
        return false;
    }
    return typeof val === "object";
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
    if (toString.call(val) !== "[object Object]") {
        return false;
    }

    const prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
    return toString.call(val) === "[object Date]";
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
    return toString.call(val) === "[object File]";
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
    return toString.call(val) === "[object Blob]";
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
    return toString.call(val) === "[object Function]";
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
    if (typeof URLSearchParams === "undefined") {
        return false;
    }
    return val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
}

/**
 * Check object is empty
 * @param obj Object
 * @returns {boolean}
 */
function isEmptyObject(obj) {
    if (isUndefined(obj) || isNull(obj)) {
        return true;
    }
    return Object.getOwnPropertyNames(obj) < 1;
}

/**
 * JavaScript object diff
 *
 * @param source
 * @param target
 */
function diff(source, target) {
    // 没有参照或目标
    if (isUndefined(source) || isNull(source) || isUndefined(target) || isNull(target)) {
        return source === target ? undefined : target;
    }

    // 类型处理器
    let handlers = [
        {supportType: value => isDate(value), handle: (v1, v2) => (v1.toJSON() === v2.toJSON() ? undefined : v2)},
        {
            supportType: value => isArray(value),
            handle: (v1, v2) => {
                if (v1.length !== v2.length) {
                    return v2;
                }
                for (let i = 0; i < v2.length; i++) {
                    let value = diff(v1[i], v2[i]);
                    if (!isUndefined(value)) {
                        return v2;
                    }
                }
            }
        },
        {
            supportType: value => isPlainObject(value),
            handle: (v1, v2) => {
                let diffObject = {};
                for (let key in v2) {
                    // 属性存在并且类型相同
                    if (Object.prototype.hasOwnProperty.call(v1, key) && typeof v2[key] === typeof v1[key]) {
                        let diffValue = diff(v1[key], v2[key]);
                        if (!isUndefined(diffValue)) {
                            diffObject[key] = diffValue;
                        }
                        continue;
                    }
                    // 默认行为
                    diffObject[key] = v2[key];
                }
                return Object.getOwnPropertyNames(diffObject).length ? diffObject : undefined;
            }
        },
        {supportType: value => isBoolean(value), handle: (v1, v2) => (v1 === v2 ? undefined : v2)},
        {supportType: value => isNumber(value), handle: (v1, v2) => (v1 === v2 ? undefined : v2)},
        {supportType: value => isString(value), handle: (v1, v2) => (v1 === v2 ? undefined : v2)}
    ];

    // 选择处理器
    let handler = handlers.find(h => h.supportType(target));
    if (isUndefined(handler)) {
        throw new Error("不支持的数据类型！");
    }

    return handler.handle(source, target);
}

/**
 * Region code split
 *
 * @param code region code
 */
function regionSplit(code) {
    let ends = [2, 4, 6, 9];
    return ends.map((end, idx) => code.substring(ends[idx - 1] ?? 0, end));
}

/**
 * Duration compute
 * @param millis millis
 */
function duration(millis) {
    if (millis === undefined || millis === null || isNaN(millis)) {
        return undefined;
    }
    return [
        {unit: "天", value: (millis / 1000 / 60 / 60 / 24) >> 0},
        {unit: "时", value: (millis / 1000 / 60 / 60) % 24 >> 0},
        {unit: "分", value: (millis / 1000 / 60) % 60 >> 0},
        {unit: "秒", value: (millis / 1000) % 60 >> 0}
    ]
        .filter(f => f.value)
        .slice(0, 2)
        .map(m => m.value + m.unit)
        .join("");
}

module.exports = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isBoolean: isBoolean,
    isNumber: isNumber,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isUndefined: isUndefined,
    isNull: isNull,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isURLSearchParams: isURLSearchParams,
    isEmptyObject: isEmptyObject,
    trim: trim,
    diff: diff,
    regionSplit: regionSplit,
    duration: duration
};
