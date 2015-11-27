#!/usr/bin/env node

"use strict";

// This script initializes the database. You can set the environment variable
// before running it (default: development). ie:
// NODE_ENV=production node artifacts/db-reset.js

var _ = require("underscore");
var MongoClient = require("mongodb").MongoClient;

var USERS_TO_INSERT = [
    {
        "_id": 1,
        "userName": "admin",
        "firstName": "Node Goat",
        "lastName": "Admin",
        "password": "monkey",
        //"password" : "$2a$10$8Zo/1e8KM8QzqOKqbDlYlONBOzukWXrM.IiyzqHRYDXqwB3gzDsba", // Admin_123
        "isAdmin": true
    }, {
        "_id": 2,
        "userName": "user1",
        "firstName": "John",
        "lastName": "Doe",
        "benefitStartDate": "2030-01-10",
        "password": "password"
            // "password" : "$2a$10$RNFhiNmt2TTpVO9cqZElb.LQM9e1mzDoggEHufLjAnAKImc6FNE86",// User1_123
    }, {
        "_id": 3,
        "userName": "user2",
        "firstName": "Will",
        "lastName": "Smith",
        "benefitStartDate": "2025-11-30",
        "password": "123456"
            //"password" : "$2a$10$Tlx2cNv15M0Aia7wyItjsepeA8Y6PyBYaNdQqvpxkIUlcONf1ZHyq", // User2_123
    }];

var SEARCH_DATA = [
    {
        "picture": "http://placehold.it/32x32",
        "age": 36,
        "eyeColor": "green",
        "name": "Smith Gilliam",
        "email": "smithgilliam@extrawear.com",
        "phone": "+1 (803) 515-3910",
        "about": "Aliquip duis laborum dolore ad do mollit officia aliquip non do enim. Ullamco enim officia irure aliquip commodo et sint eiusmod mollit eiusmod. Esse magna culpa consequat laboris elit occaecat occaecat mollit irure mollit. Adipisicing pariatur dolor sint ex dolor. In qui ullamco cillum reprehenderit aute labore. Est amet sit culpa ut do dolor labore aute nulla commodo magna sint. Ea consequat laborum ea aliquip culpa nisi quis laboris aliqua enim sint ea elit commodo.\r\n",
        "registered": "2014-06-19T07:32:02 -03:00"
    },
    {
        "picture": "http://placehold.it/32x32",
        "age": 38,
        "eyeColor": "green",
        "name": "Julie Newton",
        "email": "julienewton@extrawear.com",
        "phone": "+1 (801) 425-3943",
        "about": "Irure duis ipsum veniam dolor reprehenderit voluptate culpa dolor Lorem. Officia sint ea ipsum voluptate aliquip. Quis do incididunt aliqua pariatur officia pariatur veniam ex adipisicing exercitation. Elit fugiat sint qui deserunt excepteur nostrud ea occaecat eiusmod proident laboris. Sint duis pariatur ad exercitation duis pariatur. Eu ex amet sunt reprehenderit nostrud non tempor reprehenderit dolore non non.\r\n",
        "registered": "2015-06-23T08:50:24 -03:00"
    },
    {
        "picture": "http://placehold.it/32x32",
        "age": 38,
        "eyeColor": "blue",
        "name": "Fletcher Everett",
        "email": "fletchereverett@extrawear.com",
        "phone": "+1 (870) 574-3666",
        "about": "Irure aliqua labore magna veniam quis sint magna sit sunt laboris voluptate ex consequat sint. Esse ad quis culpa consequat incididunt ullamco. Duis aliqua tempor laboris culpa eu excepteur laboris laborum eu amet veniam nulla Lorem aute. Cupidatat officia ea duis dolor sint aute proident ea culpa amet minim laboris. Minim nostrud nisi do id occaecat Lorem consequat eu.\r\n",
        "registered": "2014-12-25T11:29:32 -02:00"
    },
    {
        "picture": "http://placehold.it/32x32",
        "age": 34,
        "eyeColor": "brown",
        "name": "Dolly Waters",
        "email": "dollywaters@extrawear.com",
        "phone": "+1 (991) 401-2805",
        "about": "Officia nisi sit nulla sint labore cillum eu magna aute reprehenderit dolor cillum. Commodo ea deserunt elit Lorem sit ad nostrud ex. Magna et do elit quis qui. Occaecat excepteur dolor minim irure esse consectetur occaecat fugiat irure quis id. Laborum sint deserunt laboris duis. Laboris excepteur duis do qui reprehenderit nostrud qui cupidatat aliquip.\r\n",
        "registered": "2015-02-12T07:59:57 -02:00"
    },
    {
        "picture": "http://placehold.it/32x32",
        "age": 23,
        "eyeColor": "blue",
        "name": "King Valdez",
        "email": "kingvaldez@extrawear.com",
        "phone": "+1 (871) 567-3899",
        "about": "Duis velit irure anim elit minim officia est ipsum sit. Aliqua irure laborum ut laborum amet eiusmod labore officia eu aliquip do. Non ea laboris eiusmod exercitation laboris cillum velit deserunt. Fugiat velit nulla proident do commodo aute dolor voluptate consequat do mollit enim commodo. Aute laboris aliquip labore nostrud voluptate magna eiusmod do consectetur. In nostrud proident sint eiusmod non est incididunt qui.\r\n",
        "registered": "2015-04-21T06:09:09 -03:00"
    },
    {
        "picture": "http://placehold.it/32x32",
        "age": 21,
        "eyeColor": "blue",
        "name": "Rosanna Erickson",
        "email": "rosannaerickson@extrawear.com",
        "phone": "+1 (967) 528-2645",
        "about": "Quis incididunt pariatur esse et sint non. Esse sit aliqua laboris non laborum. Enim deserunt excepteur excepteur sit reprehenderit non id commodo pariatur consectetur. In sit sunt enim tempor nostrud ex non. Dolor voluptate excepteur culpa exercitation elit.\r\n",
        "registered": "2014-11-21T02:26:45 -02:00"
    }
];

// Getting the global config taking in account he environment (proc)
var config = require("../config/config");

function parseResponse(err, res, comm) {
    if (err) {
        console.log("ERROR:");
        console.log(comm);
        console.log(JSON.stringify(err));

        process.exit(1);
    }
    console.log(comm);
    console.log(JSON.stringify(res));
}


// Starting here
MongoClient.connect(config.db, function(err, db) {
    var usersCol, allocationsCol, countersCol, searchCol;

    if (err) {
        console.log("ERROR: connect");
        console.log(JSON.stringify(err));
    }
    console.log("Connected to the database: " + config.db);

    // remove existing data (if any), we don't want to look for errors here
    db.dropCollection("users");
    db.dropCollection("allocations");
    db.dropCollection("contributions");
    db.dropCollection("counters");
    db.dropCollection("search");

    usersCol = db.collection("users");
    allocationsCol = db.collection("allocations");
    countersCol = db.collection("counters");
    searchCol = db.collection("search");

    // reset unique id counter
    countersCol.insert({
        _id: "userId",
        seq: 3
    });

    // insert admin and test users
    console.log("Users to insert:");
    USERS_TO_INSERT.forEach(function(user) {
        console.log(JSON.stringify(user));
    });

    usersCol.insertMany(USERS_TO_INSERT, function(err, data) {
        var finalAllocations = [];
        var ids;

        // We can't continue if error here
        if (err) {
            console.log("ERROR: insertMany");
            console.log(JSON.stringify(err));

            process.exit(1);
        }
        parseResponse(err, data, "users.insertMany");

        data.ops.forEach(function(user) {
            var stocks = Math.floor((Math.random() * 40) + 1);
            var funds = Math.floor((Math.random() * 40) + 1);

            finalAllocations.push({
                userId: user._id,
                stocks: stocks,
                funds: funds,
                bonds: 100 - (stocks + funds)
            });
        });

        console.log("Allocations to insert:");
        finalAllocations.forEach(function(allocation) {
            console.log(JSON.stringify(allocation));
        });

        allocationsCol.insertMany(finalAllocations, function(err, data) {
            parseResponse(err, data, "allocations.insertMany");
            searchCol.insertMany(SEARCH_DATA, function (err) {
                if (err) {
                    console.log("ERROR: insertMany");
                    console.log(JSON.stringify(err));

                    process.exit(1);
                }
                process.exit();
            });
        });

    });
});
