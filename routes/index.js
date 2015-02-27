
/*
 * GET home page.
 */

var nconf = require("nconf");
var DocumentDBClient = require("documentdb").DocumentClient;

// Create nconf environtment
nconf
    .file({ file: 'config.json' })
    .env();

var host = nconf.get("DOCUMENTDB_HOST");
var authKey = nconf.get("DOCUMENTDB_AUTH_KEY");

var databaseId = "HackDFW";
var collectionId = "Hackers";

var client = new DocumentDBClient(host, { masterKey: authKey });

exports.index = function (req, res) {
    res.render('index', { title: 'Hello HackDFW!' });
};

exports.createItem = function (req, res) {

    readOrCreateDatabase(function (database) {
        readOrCreateCollection(database, function (collection) {
            var item = req.body.item;
            if (item) {
                createItem(collection, item, function () { 
                    res.redirect('/');
                });
            } else { 
                // Throw some error
            }
        });
    });

};

// if the database does not exist, then create it, else return the database object
var readOrCreateDatabase = function (callback) {
    
    client
        .queryDatabases('SELECT * FROM root r WHERE r.id="' + databaseId + '"')
        .toArray(function (err, results) {
            if (err) {
                // some error occured, rethrow up
                throw (err);
            }
            if (!err && results.length === 0) {
                // no error occured, but there were no results returned 
                // indicating no database exists matching the query            
                client.createDatabase({ id: databaseId }, function (err, createdDatabase) {
                    callback(createdDatabase);
                });
            } else {
                // we found a database
                callback(results[0]);
            }
        });
};

// if the collection does not exist for the database provided, create it, else return the collection object
var readOrCreateCollection = function (database, callback) {
    
    client
        .queryCollections(database._self, 'SELECT * FROM root r WHERE r.id="' + collectionId + '"')
        .toArray(function (err, results) {
            if (err) {
                // some error occured, rethrow up
                throw (err);
            }
            if (!err && results.length === 0) {
                // no error occured, but there were no results returned 
                //indicating no collection exists in the provided database matching the query
                client.createCollection(database._self, { id: collectionId }, function (err, createdCollection) {
                    callback(createdCollection);
                });
            } else {
                // we found a collection
                callback(results[0]);
            }
        });
};

var createItem = function (collection, documentDefinition, callback) {
    client.createDocument(collection._self, documentDefinition, function (err, doc) { 
        if (err) { 
            throw (err);
        }

        callback();
    });
};