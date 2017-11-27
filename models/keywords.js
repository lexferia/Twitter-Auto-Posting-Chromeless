module.exports = function(sequelize, DataTypes) {

  const Keywords = sequelize.define('keywords', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    keyword: {
      type: DataTypes.STRING
    },
    remarks: {
      type: DataTypes.STRING
    },
    is_used: {
      type: DataTypes.INTEGER
    },
    successful_comment: {
      type: DataTypes.INTEGER
    },
    unsuccessful_comment: {
      type: DataTypes.INTEGER
    }
  })

  return Keywords;
};
