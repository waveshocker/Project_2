// Requiring necessary npm packages
var express = require("express");
var session = require("express-session");
// Requiring passport as we've configured it
var passport = require("./config/passport");

// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 8080;
var db = require("./models");

//Connections required to pull from Open Data API
const
https = require("https"),
packageName = "bicycle-parking-high-capacity-outdoor";

// Creating express app and configuring middleware needed for authentication
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
// We need to use sessions to keep track of our user's login status
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);
require("./routes/bike-routes.js")(app);

//code set up to pull from Open Data API
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

// Syncing our database and logging a message to the user upon success
db.sequelize.sync({force: true}).then(function() {
  app.listen(PORT, function() {
    console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
  });
});

//pulling from open Data API
getPackage.then(package => {

  // get the datastore resources for the package
  let datastoreResources = package["resources"].filter(r => r.datastore_active);
  
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