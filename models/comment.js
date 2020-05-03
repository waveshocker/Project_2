module.exports = function(sequelize, DataTypes) {
    var Comment = sequelize.define("Comment", {      
      comment: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
              len: [1]
          } 
      }
    }, {
        freezeTableName: true
    });
  
    Post.associate = function(models) {
      // We're saying that a comment belongs to a bikerack      
      Post.belongsTo(models.Bikerack, {
        foreignKey: {
          allowNull: false
        }
      });
    };
  
    return Comment;
  };