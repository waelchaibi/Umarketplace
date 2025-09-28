export default (sequelize, DataTypes) => {
  const Auction = sequelize.define('Auction', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sellerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    startingPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currentBid: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    currentBidderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'ended', 'cancelled'), defaultValue: 'active' }
  }, {
    tableName: 'auctions'
  });

  return Auction;
};
