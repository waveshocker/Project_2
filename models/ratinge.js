module.exports = function(sequelize, DataTypes) {
    var Rating = sequelize.define("Rating", {      
      Rating: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
              len: [1]
          } 
      }
    }, {
        freezeTableName: true
    });
  
    Rating.associate = function(models) {
      // We're saying that a Rating belongs to a bikerack      
      Rating.belongsTo(models.Bikerack, {
        foreignKey: {
          allowNull: false
        }
      });

      Rating.belongsTo(models.User, {
        foreignKey: {
          allowNull: false
        }
      })
    };
  
    return Rating;
  };