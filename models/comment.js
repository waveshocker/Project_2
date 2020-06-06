// module.exports = function(sequelize, DataTypes) {
//     var Comment = sequelize.define("Comment", {      
//       comment: {
//           type: DataTypes.STRING,
//           allowNull: false,
//           validate: {
//               len: [1]
//           } 
//       }
//     }, {
//         freezeTableName: true
//     });
  
//     Comment.associate = function(models) {
//       // We're saying that a comment belongs to a bikerack      
//       Comment.belongsTo(models.Bikerack, {
//         foreignKey: {
//           allowNull: false
//         }
//       });

//       Comment.belongsTo(models.User, {
//         foreignKey: {
//           allowNull: false
//         }
//       })
//     };
  
//     return Comment;
//   };

module.exports=function(e,l){var o=e.define("Comment",{comment:{type:l.STRING,allowNull:!1,validate:{len:[1]}}},{freezeTableName:!0});return o.associate=function(e){o.belongsTo(e.Bikerack,{foreignKey:{allowNull:!1}}),o.belongsTo(e.User,{foreignKey:{allowNull:!1}})},o};