// server.js
const db = require('../models');

module.exports = function(app) {
  app.get("/api/search_results", (req, res) => {
    //require request pass in latitude as lat and longitude as lng
    db.Bikerack.findAll({
      attributes: ['_id', 'address', 'bike_capacity', ['longitude', 'lng'], ['latitude', 'lat'],                  
                  [db.sequelize.literal("6371 * acos(cos(radians(" + req.query.latitude + 
                  ")) * cos(radians(latitude)) * cos(radians(" + req.query.longitude + 
                  ") - radians(longitude)) + sin(radians(" + req.query.latitude + 
                  ")) * sin(radians(latitude)))"),'distance'],
                  [db.sequelize.fn('COUNT', db.sequelize.col('Comments.comment')), 'commentCnt']
                  ],
      include: [{model: db.Comment}],
      order: db.sequelize.col('distance'),
      limit: 5
    })
      .then((result) => res.send(result))
      .catch((err) => {
        console.log('There was an error querying bikerack', JSON.stringify(err))
        return res.send(err)
      });
  });

  app.get("/api/parkinglocation", (req, res) => {
    db.Bikerack.findOne({
      where: {
        id: req.query.BikerackId
      },
      include: [db.Comment, db.Rating]
    })
      .then((result) => res.send(result))
      .catch((err) => {
        console.log('There was an error querying bikerack', JSON.stringify(err))
        return res.send(err)
      });
  });

  app.post("/api/comments", (req, res) => {
    console.log(req.body); 
    db.Comment.create({
      comment: req.body.comment,
      BikerackId: req.body.BikerackId,
      UserId: req.user.id
    })
      .then(function(results){
        res.json(results);
      }); 
  });

  app.post("/api/rating", (req, res) => {
    console.log(req.body); 
    db.Rating.create({
      Rating: req.body.Rating,
      BikerackId: req.body.BikerackId,
      UserId: req.user.id
    })
      .then(function(results){
        res.json(results);
      }); 
  });

  // app.delete('/api/contacts/:id', (req, res) => {
  //   const id = parseInt(req.params.id)
  //   return db.Contact.findById(id)
  //     .then((contact) => contact.destroy({ force: true }))
  //     .then(() => res.send({ id }))
  //     .catch((err) => {
  //       console.log('***Error deleting contact', JSON.stringify(err))
  //       res.status(400).send(err)
  //     })
  // });

  // app.put('/api/contacts/:id', (req, res) => {
  //   const id = parseInt(req.params.id)
  //   return db.Contact.findById(id)
  //   .then((contact) => {
  //     const { firstName, lastName, phone } = req.body
  //     return contact.update({ firstName, lastName, phone })
  //       .then(() => res.send(contact))
  //       .catch((err) => {
  //         console.log('***Error updating contact', JSON.stringify(err))
  //         res.status(400).send(err)
  //       })
  //   })
  // });
}