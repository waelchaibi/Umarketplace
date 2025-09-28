export default (sequelize, DataTypes) => {
  const TradeOffer = sequelize.define('TradeOffer', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    fromUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    toUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    offeredProductId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    requestedProductId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    additionalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'declined', 'cancelled'), defaultValue: 'pending' },
    message: { type: DataTypes.TEXT }
  }, {
    tableName: 'trade_offers'
  });

  return TradeOffer;
};
