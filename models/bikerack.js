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
  
    // Post.associate = function(models) {
    //   // We're saying that a Post should belong to an Author
    //   // A Post can't be created without an Author due to the foreign key constraint
    //   Post.belongsTo(models.Author, {
    //     foreignKey: {
    //       allowNull: false
    //     }
    //   });
    // };
  
    return Bikerack;
  };
  