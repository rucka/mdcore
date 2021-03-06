"use strict";
define([], function () {
    function createRootNamespace(rootname) {
        var root = {};
        root.namespace = function (ns_string) {
            var parts = ns_string.split('.'),
                parent = root;
            if (parts[0] === rootname) {
                parts = parts.slice(1);
            }
            var i = 0;
            for (i = 0; i < parts.length; i += 1) {
                if (parent[parts[i]] === undefined) {
                    parent[parts[i]] = {};
                }
                parent = parent[parts[i]];
            }
            return parent;
        };
        return root;
    }

    var System = System || createRootNamespace('System');
    System.createRootNamespace = System.createRootNamespace || createRootNamespace;
    return System;
});
