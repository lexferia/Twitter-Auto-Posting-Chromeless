module.exports = function(sequelize, DataTypes) {

  const Promos = sequelize.define('promos', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    post_title: {
      type: DataTypes.STRING
    },
    website_name: {
      type: DataTypes.STRING
    },
    website_address: {
      type: DataTypes.STRING
    },
    post_message: {
      type: DataTypes.STRING
    },
    attachment: {
      type: DataTypes.STRING
    },
    remarks: {
      type: DataTypes.STRING
    }
  })

  return Promos;
};
