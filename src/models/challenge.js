export default function defineChallenge(sequelize, DataTypes) {
  const Challenge = sequelize.define('Challenge', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    type: {
      type: DataTypes.ENUM('text', 'qcm'),
      allowNull: false,
      defaultValue: 'text'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    options: {
      // For QCM only: array of option strings
      type: DataTypes.JSON,
      allowNull: true
    },
    correctOptionIndex: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    correctAnswer: {
      // Stored normalized (lowercased, trimmed)
      type: DataTypes.STRING(255),
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
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
      type: DataTypes.INTEGER.UNSIGNED,
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


