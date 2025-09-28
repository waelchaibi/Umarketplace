export default (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    actorUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    action: { type: DataTypes.STRING(64), allowNull: false },
    targetType: { type: DataTypes.STRING(64), allowNull: true },
    targetId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: 'activity_logs',
    updatedAt: false
  });

  return ActivityLog;
};

