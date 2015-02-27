
/*
 * GET emails listing.
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


// create an instance of the DocumentDB client
var client = new DocumentDBClient(host, { masterKey: authKey });

exports.list = function (req, res) {
    
    // before we can query for Items in the document store, we need to ensure we 
    // have a database with a collection then use the collection to read the documents
    readOrCreateDatabase(function (database) {
        readOrCreateCollection(database, function (collection) {
            listItems(collection, function (items) {
                //res.render('index', { title: 'My ToDo List', tasks: items });
                res.send(items);
            });
        });
    });

    
};

// query the provided collection for all non-complete items
var listItems = function (collection, callback) {
    client.queryDocuments(collection._self, 'SELECT * FROM root').toArray(function (err, docs) {
        if (err) {
            throw (err);
        }
        
        var emails = [];
        for (var x = 0; x < docs.length; x++) {
            emails.push(docs[x].email);
        }
        
        console.log(emails);
        callback(emails);
    });
}

// if the database does not exist, then create it, else return the database object
var readOrCreateDatabase = function (callback) {
    client.queryDatabases('SELECT * FROM root r WHERE r.id="' + databaseId + '"').toArray(function (err, results) {
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
    client.queryCollections(database._self, 'SELECT * FROM root r WHERE r.id="' + collectionId + '"').toArray(function (err, results) {
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