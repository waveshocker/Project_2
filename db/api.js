var db = require("../models");
var express = require("express");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 8080;


const
https = require("https"),
packageName = "bicycle-parking-high-capacity-outdoor";

// promise to retrieve the package
const getPackage = new Promise((resolve, reject) => {
https.get(`https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id=${packageName}`, (response) => {
    let dataChunks = [];
    response
        .on("data", (chunk) => {
            dataChunks.push(chunk)
        })
        .on("end", () => {
            let data = Buffer.concat(dataChunks)
            resolve(JSON.parse(data.toString())["result"])
        })
        .on("error", (error) => {
            reject(error)
        })
});
});

const getDatastoreResource = resource => new Promise((resolve, reject) => {
https.get(`https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?id=${resource["id"]}`, (response) => {
    let dataChunks = [];
    response
        .on("data", (chunk) => {
            dataChunks.push(chunk)
        })
        .on("end", () => {
            let data = Buffer.concat(dataChunks)
            resolve(JSON.parse(data.toString())["result"]["records"])
        })
        .on("error", (error) => {
            reject(error)
        })
})
});

// get the package information again
getPackage.then(package => {

// get the datastore resources for the package
let datastoreResources = package["resources"].filter(r => r.datastore_active);
db.sequelize.sync({ force: false });

// retrieve the first datastore resource as an example
getDatastoreResource(datastoreResources[0])
    .then(resource => {
        for(i=0; i < resource.length; i++) {
            db.Bikerack.findOrCreate({
                where: {
                _id: resource[i]._id,
                address: resource[i].ADDRESS_FULL,
                bike_capacity: resource[i].BICYCLE_CAPACITY,
                longitude: resource[i].LONGITUDE,
                latitude: resource[i].LATITUDE
            }, defaults: {
                _id: resource[i]._id,
                address: resource[i].ADDRESS_FULL,
                bike_capacity: resource[i].BICYCLE_CAPACITY,
                longitude: resource[i].LONGITUDE,
                latitude: resource[i].LATITUDE
            }});
        }
    })
    .catch(error => {
        console.error(error);
    })
}).catch(error => {
console.error(error);
})


