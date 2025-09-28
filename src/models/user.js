export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING(100), allowNull: false },
    firstName: { type: DataTypes.STRING(100) },
    lastName: { type: DataTypes.STRING(100) },
    profilePicture: { type: DataTypes.STRING(255) },
    role: { type: DataTypes.ENUM('admin', 'user'), allowNull: false, defaultValue: 'user' },
    balance: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
    isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isSuspended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: 'users'
  });

  return User;
};
