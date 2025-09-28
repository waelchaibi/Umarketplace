export default (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    senderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    receiverId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    messageType: { type: DataTypes.ENUM('text', 'trade_offer', 'system'), defaultValue: 'text' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'messages',
    updatedAt: false
  });

  return Message;
};
