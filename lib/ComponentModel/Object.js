"use strict";
define(["underscore", "q", "../root"], function (_, Q, System) {
	System.namespace("System.ComponentModel");
    System.ComponentModel.Object = (function () {
        function Obj() {
            return this;
        }

        Obj.prototype.method = function (name, func, override) {
            if (this[name] === undefined || this[name] === null || override === true) {
                this[name] = func;
                return this;
            }
        };

        Obj.prototype.isDeeplyEqual = function (expected) { return deepEqual(this, expected); };

        Obj.prototype.deepObjCopy = function (dupeObj) {
            var retObj = new Object();
            if (typeof (dupeObj) === 'object') {
                if (typeof (dupeObj.length) !== 'undefined')
                    var retObj = new Array();
                for (var objInd in dupeObj) {
                    if (dupeObj[objInd] === null){
                        retObj[objInd] = null;
                    }else if (Object.prototype.toString.call(dupeObj[objInd]) === '[object Date]') {
                        retObj[objInd] = new Date(dupeObj[objInd].getTime());
                    }else if (typeof(dupeObj[objInd]) === 'object') {
                        retObj[objInd] = Obj.prototype.deepObjCopy(dupeObj[objInd]);
                    } else if (typeof(dupeObj[objInd]) === 'string') {
                        retObj[objInd] = dupeObj[objInd];
                    } else if (typeof(dupeObj[objInd]) === 'number') {
                        retObj[objInd] = dupeObj[objInd];
                    } else if (typeof(dupeObj[objInd]) === 'boolean') {
                        ((dupeObj[objInd] === true) ? retObj[objInd] = true : retObj[objInd] = false);
                    }
                }
            }
            return retObj;
        };

        Obj.prototype.ensureHasMethods = function (source, entityName, methods){
            if (_.isArray(entityName)){
                methods = entityName;
                entityName = "Source";
            }

            if (_(methods).isString()){
                methods = [methods];
            }

            if (!_.isArray(methods)){
                throw new ("Methods array must be provided");
            }

            if (!_.isString(entityName)){
                entityName = "Source";
            }

            if (!source){
                throw new Error(entityName + ' cannot be null');
            }
            var notFoundMethods = [];
            for (var i = 0; i < methods.length; i++){
                var methodname = methods[i];
                if (!source[methodname] || !_.isFunction (source[methodname])){
                    notFoundMethods.push(methodname);
                }
            }
            if (notFoundMethods.length === 0){
                return;
            }
            if (notFoundMethods.length === 1){
                throw new Error('Expected method ' + notFoundMethods[0] + ' not found for '+ entityName);
            }
            throw new Error('Expected methods ' + notFoundMethods.join(', ') + ' not found for '+ entityName);
        };

        Obj.prototype.ensureHasProperties = function (source, entityName, properties){
            if (_.isArray(entityName)){
                properties = entityName;
                entityName = "Source";
            }

            if (_(properties).isString()){
                properties = [properties];
            }

            if (!_.isArray(properties)){
                throw new ("Properties array must be provided");
            }

            if (!_.isString(entityName)){
                entityName = "Source";
            }

            if (!source){
                throw new Error(entityName + ' cannot be null');
            }
            var notFoundMethods = [];
            for (var i = 0; i < properties.length; i++){
                var methodname = properties[i];
                if (!source[methodname] || _.isFunction (source[methodname])){
                    notFoundMethods.push(methodname);
                }
            }
            if (notFoundMethods.length === 0){
                return;
            }
            if (notFoundMethods.length === 1){
                throw new Error('Expected property ' + notFoundMethods[0] + ' not found for '+ entityName);
            }
            throw new Error('Expected properties ' + notFoundMethods.join(', ') + ' not found for '+ entityName);
        };

        return Obj;
    })();

    System.ComponentModel.Guid = (function () {
        function Guid() {
            if (!_(this).isEmpty()){throw new Error('Guid must be instance via constructor');}
            this.guid = guid();
        }

        Guid.NewGuid = function (){return new Guid();};

        Guid.prototype.asString = function (){ return this.guid;};

        return Guid;

        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }

        function guid() {
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        }
    })();

    var pSlice = Array.prototype.slice;
    var Object_keys = typeof Object.keys === 'function' ? Object.keys
            : function (obj) {
            var keys = [];
            for (var key in obj) {keys.push(key);}
            return keys;
        }
        ;

    function deepEqual(actual, expected) {
        // 7.1. All identical values are equivalent, as determined by ===.
        if (actual === expected) {
            return true;

        } else if (actual instanceof Date && expected instanceof Date) {
            return actual.getTime() === expected.getTime();

            // 7.3. Other pairs that do not both pass typeof value == 'object',
            // equivalence is determined by ==.
        } else if (typeof actual !== 'object' && typeof expected !== 'object') {
            return actual === expected;

            // 7.4. For all other Object pairs, including Array objects, equivalence is
            // determined by having the same number of owned properties (as verified
            // with Object.prototype.hasOwnProperty.call), the same set of keys
            // (although not necessarily the same order), equivalent values for every
            // corresponding key, and an identical 'prototype' property. Note: this
            // accounts for both named and indexed properties on Arrays.
        } else {
            return objEquiv(actual, expected);
        }
    }

    function isUndefinedOrNull(value) {
        return value === null || value === undefined;
    }

    function isArguments(object) {
        return Object.prototype.toString.call(object) == '[object Arguments]';
    }

    function objEquiv(a, b) {
        if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
            return false;
        // an identical 'prototype' property.
        if (a.prototype !== b.prototype) {return false;}
        //~~~I've managed to break Object.keys through screwy arguments passing.
        // Converting to array solves the problem.
        if (isArguments(a)) {
            if (!isArguments(b)) {
                return false;
            }
            a = pSlice.call(a);
            b = pSlice.call(b);
            return deepEqual(a, b);
        }
        try {
            var ka = Object_keys(a),
                kb = Object_keys(b),
                key, i;
        } catch (e) {//happens when one is a string literal and the other isn't
            return false;
        }
        // having the same number of owned properties (keys incorporates
        // hasOwnProperty)
        if (ka.length != kb.length)
            return false;
        //the same set of keys (although not necessarily the same order),
        ka.sort();
        kb.sort();
        //~~~cheap key test
        for (i = ka.length - 1; i >= 0; i--) {
            if (ka[i] != kb[i])
                return false;
        }
        //equivalent values for every corresponding key, and
        //~~~possibly expensive deep test
        for (i = ka.length - 1; i >= 0; i--) {
            key = ka[i];
            if (!deepEqual(a[key], b[key])) return false;
        }
        return true;
    }
});