export default (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT },
    uniqueKey: { type: DataTypes.UUID, allowNull: false, unique: true, defaultValue: DataTypes.UUIDV4 },
    category: { type: DataTypes.STRING(100) },
    originalPrice: { type: DataTypes.DECIMAL(10, 2) },
    currentPrice: { type: DataTypes.DECIMAL(10, 2) },
    status: { type: DataTypes.ENUM('available', 'sold', 'in_auction', 'in_trade'), defaultValue: 'available' },
    condition: { type: DataTypes.ENUM('mint', 'excellent', 'good', 'fair'), defaultValue: 'excellent' },
    images: { type: DataTypes.JSON },
    ownerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    originalOwnerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    isHidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: 'products'
  });

  return Product;
};
