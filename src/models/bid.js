export default (sequelize, DataTypes) => {
  const Bid = sequelize.define('Bid', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    auctionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    bidderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, {
    tableName: 'bids',
    updatedAt: false
  });

  return Bid;
};
