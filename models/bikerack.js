module.exports = function(sequelize, DataTypes) {
    var Bikerack = sequelize.define("Bikerack", {
      _id: {
          type: DataTypes.INTEGER,
          allowNull: false
      },
      address: {
          type: DataTypes.STRING,
          allowNull: false 
      },
      bike_capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      longitude: {
          type: DataTypes.FLOAT(12, 10),
          allowNull: false
      },
      latitude: {
        type: DataTypes.FLOAT(12, 10),
        allowNull: false
      }
    }, {
        freezeTableName: true
    });
  
    Bikerack.associate = function(models) {
      // Associating Author with Posts
      // When an Author is deleted, also delete any associated Posts
      Bikerack.hasMany(models.Comment, {
        onDelete: "cascade"
      });

      Bikerack.hasMany(models.Rating, {
        onDelete: "cascade"
      });

    };
 
    return Bikerack;
  };
  