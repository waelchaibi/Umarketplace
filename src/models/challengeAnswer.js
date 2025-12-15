export default function defineChallengeAnswer(sequelize, DataTypes) {
  const ChallengeAnswer = sequelize.define('ChallengeAnswer', {
    challengeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    answerText: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'challenge_answers',
    indexes: [
      { fields: ['challengeId'] },
      { fields: ['userId'] },
      { fields: ['ipAddress'] }
    ]
  });
  return ChallengeAnswer;
}


