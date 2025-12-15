export default function defineChallenge(sequelize, DataTypes) {
  const Challenge = sequelize.define('Challenge', {
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    correctAnswer: {
      // Stored normalized (lowercased, trimmed)
      type: DataTypes.STRING(255),
      allowNull: false
    },
    prizeDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      allowNull: false,
      defaultValue: 'active'
    },
    winnerUserId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    winnerAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'challenges',
    indexes: [
      { fields: ['status'] }
    ]
  });
  return Challenge;
}


