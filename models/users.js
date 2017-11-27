module.exports = function(sequelize, DataTypes) {

  const Users = sequelize.define('users', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    remarks: {
      type: DataTypes.STRING
    }
  })

  return Users;
};
