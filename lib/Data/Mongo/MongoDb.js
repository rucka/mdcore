"use strict";
define(["underscore", "q", "../root"], function (_, Q, System) {
	System.namespace("System.Data.Mongo");
    System.Data.Mongo.MongoDbFactory = {
        createDb : function (name, server) {
            throw new Error('Db function must be override');
        }
    };

    System.Data.Mongo.MongoDb = (function () {
        var db = null;

        var MongoDb = function () {
            if (arguments.length === 1) {
                db = arguments[0];
            } else if (arguments.length === 3) {
                db = System.Data.Mongo.MongoDbFactory.createDb(arguments[0], new System.Data.Mongo.MongoDbInMemory.Server(arguments[1], arguments[2], {}));
            } else {
                throw new Error('There is no MongoDb connection to use.');
            }

            System.ComponentModel.Object.prototype.ensureHasMethods.call(db, db, 'MongoDb', ['open', 'close', 'collection']);

            var services = {
                insert : function(coll, docs, options) {
                    var deferred = Q.defer();

                    coll.insert(docs, options, function(err){
                        if (err){
                            logerror("insert '" + JSON.stringify(docs) + "' in collection '" + coll.name + "' of db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(err);
                        }else{
                            logverbose("insert '" + JSON.stringify(docs) + "' in collection '" + coll.name + "' of db '" + db.toString() +"' completed successfully.");
                            deferred.resolve();
                        }
                    });

                    return deferred.promise;
                },
                update : function (coll, query, object, options) {
                    var deferred = Q.defer();

                    coll.update(query, object, options, function(err){
                        if (err){
                            logerror("update query '" + JSON.stringify(query) + "' object '" + JSON.stringify(object) + "' in collection '" + coll.name + "' of db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(err);
                        }else{
                            logverbose("update query '" + JSON.stringify(query) + "' object '" + JSON.stringify(object) + "' in collection '" + coll.name + "' of db '" + db.toString() +"' completed successfully.");
                            deferred.resolve();
                        }
                    });

                    return deferred.promise;
                },

                save : function (coll, object, options) {
                    var deferred = Q.defer();

                    coll.save(object, options, function(err){
                        if (err){deferred.reject(err);}else{deferred.resolve(coll);}
                        if (err){
                            logerror("save object '" + JSON.stringify(object) + "' in collection '" + coll.name + "' of db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(err);
                        }else{
                            logverbose("save object '" + JSON.stringify(object) + "' in collection '" + coll.name + "' of db '" + db.toString() +"' completed successfully.");
                            deferred.resolve();
                        }
                    });

                    return deferred.promise;
                },
                remove : function (coll, query, options){
                    var deferred = Q.defer();

                    coll.remove(query, options, function(err){
                        if (err){
                            logerror("remove query '" + JSON.stringify(query) + "' from collection '" + coll.name + "' of db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(err);
                        }else{
                            logverbose("remove query '" + JSON.stringify(query) + "' from collection '" + coll.name + "' of db '" + db.toString() +"' completed successfully.");
                            deferred.resolve();
                        }
                    });

                    return deferred.promise;
                },
                find : function (coll, query, fields, options) {
                    var deferred = Q.defer();

                    coll.find(query, fields, options, function(err, cursor){
                        var queryString = _(query).isObject()?  'query ' + JSON.stringify(query)  + ' ': '';
                        var fieldsString = _(fields).isObject()?  'fields ' + JSON.stringify(fields) + ' ': '';
                        var optionsString = _(options).isObject()?  'options ' + JSON.stringify(options) + ' ': '';

                        if (err){
                            logerror("find " + queryString+ " " + fieldsString+ " " + optionsString+ " in collection '" + coll.name + "' of db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(err);
                        }else{
                            cursor.toArray(function(err, array){
                                if (err){
                                    logerror("find " + queryString + fieldsString+ optionsString + "in collection '" + coll.name + "' of db '" + db.toString() +"' error: " + err.message);
                                    deferred.reject(err);
                                }else{
                                    logverbose("find " + queryString + fieldsString+ optionsString + " in collection '" + coll.name + "' of db '" + db.toString() +"' return result: '" + JSON.stringify(array) + "'");
                                    deferred.resolve(array);
                                }
                            });
                        }
                    });

                    return deferred.promise;
                },
                findAndModify : function (coll, query, sort, doc, options) {
                    var deferred = Q.defer();

                    coll.findAndModify(query, sort, doc, options, function(err, result){
                        var queryString = _(query).isObject()?  'query ' + JSON.stringify(query)  + ' ': '';
                        var sortString = _(sort).isObject()?  'sort ' + JSON.stringify(sort) + ' ': '';
                        var docString = _(doc).isObject()?  'doc ' + JSON.stringify(doc) + ' ': '';
                        var optionsString = _(options).isObject()?  'options ' + JSON.stringify(options) + ' ': '';

                        if (err){
                            logerror("find and modify " + queryString + sortString + docString + optionsString + "in collection '" + coll.name + "' of db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(err);
                        }else{
                            deferred.resolve(result);
                            logverbose("find and modify " + queryString + sortString + docString + optionsString + " in collection '" + coll.name + "' of db '" + db.toString() +"' return result: '" + JSON.stringify(result) + "'");
                        }
                    });

                    return deferred.promise;
                },
                findOne : function (coll, query, fields, options) {
                    var deferred = Q.defer();

                    coll.findOne(query, fields, options, function(err, data){
                        var queryString = _(query).isObject()?  'query ' + JSON.stringify(query)  + ' ': '';
                        var fieldsString = _(fields).isObject()?  'fields ' + JSON.stringify(fields) + ' ': '';
                        var optionsString = _(options).isObject()?  'options ' + JSON.stringify(options) + ' ': '';

                        if (err){
                            logerror("findone " + queryString+ " " + fieldsString+ " " + optionsString+ " in collection '" + coll.name + "' of db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(err);
                        }else{
                            logverbose("findone " + queryString + fieldsString+ optionsString + " in collection '" + coll.name + "' of db '" + db.toString() +"' return result: '" + JSON.stringify(data) + "'");
                            deferred.resolve(data);
                        }
                    });

                    return deferred.promise;
                },
                count : function (coll, query) {
                    var deferred = Q.defer();

                    coll.count(query, function(err, cnt){
                        var queryString = _(query).isObject()?  'query ' + JSON.stringify(query)  + ' ': '';

                        if (err){
                            logerror("count " + queryString + "in collection '" + coll.name + "' of db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(new Error(err));
                        }else{
                            logverbose("count " + queryString + " in collection '" + coll.name + "' of db '" + db.toString() +"' return result: '" + cnt +"'");
                            deferred.resolve(cnt);
                        }
                    });

                    return deferred.promise;
                },
                drop : function (coll) {
                    var deferred = Q.defer();
                    coll.drop(function (err, result){
                        if (err){
                            logerror("drop collection '" + coll.name + "' of db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(new Error(err));
                        }else{
                            logverbose("drop collection '" + coll.name + "' of db '" + db.toString() +"' return result: '" + result +"'");
                            deferred.resolve(result);
                        }
                    });
                    return deferred.promise;
                }
            };

            var methods = {
                open : function () {
                    var deferred = Q.defer();
                    if (db.openCalled === true /*db._state === 'connected'*/) {
                        deferred.resolve();
                        return deferred.promise;
                    }

                    db.open(function(err){
                        if (err){
                            logerror("open db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(err);
                        } else {
                            logverbose("open db '" + db.toString() +"' completed successfully.");
                            deferred.resolve();
                        }
                    });

                    return deferred.promise;
                },
                collection : function (db, name) {
                    var deferred = Q.defer();

                    db.collection(name, function(err, coll){
                        if(coll){
                            System.ComponentModel.Object.prototype.ensureHasMethods.call(coll, coll, 'db.Collection', ['find','findOne','insert','remove','update','save', 'count']);
                        }
                        if (err){
                            logerror("retrieve collection '" + name + "' of db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(err);
                        }else{
                            logverbose("retrieve collection '" + name + "' of db '" + db.toString() +"' completed successfully.");
                            coll.name = name;
                            deferred.resolve(coll);
                        }
                    });
                    return deferred.promise;
                },
                close : function () {
                    var deferred = Q.defer();
                    var force = false;
                    db.close(force, function(err){
                        if (err){
                            logerror("close db '" + db.toString() +"' error: " + err.message);
                            deferred.reject(err);
                        }else{
                            logverbose("close db '" + db.toString() +"' completed successfully.");
                            deferred.resolve();
                        }
                    });
                    return deferred.promise;
                }
            };

            var builder = new System.ComponentModel.PromiseServiceBuilder({
                serviceName : 'MongoDb',
                startupMethods : {
                    openCollection : function (name) {
                        var that = this;
                        return methods.open().then(function () {
                            return methods.collection(db, name).then(function (coll) {
                                that.setBagData('collection', coll);
                            });
                        });
                    }
                },
                stopMethods : {
                    close : methods.close
                },
                services : services,
                buildFunctionArguments : function(serviceName, context, args){
                    var a = [];
                    a.push(context.getBagData('collection'));
                    _(args).each (function (k){
                        a.push(k);
                    });
                    return a;
                }
            });

            var log = builder.log;
            var logverbose = builder.logverbose;
            var logerror = builder.logerror;

            return builder.build();
        };
        return MongoDb;
    }());
});