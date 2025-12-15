import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

import defineUser from './user.js';
import defineProduct from './product.js';
import defineAuction from './auction.js';
import defineBid from './bid.js';
import defineTransaction from './transaction.js';
import defineMessage from './message.js';
import defineTradeOffer from './tradeOffer.js';
import defineActivityLog from './activityLog.js';
import defineChallenge from './challenge.js';
import defineChallengeAnswer from './challengeAnswer.js';

const User = defineUser(sequelize, DataTypes);
const Product = defineProduct(sequelize, DataTypes);
const Auction = defineAuction(sequelize, DataTypes);
const Bid = defineBid(sequelize, DataTypes);
const Transaction = defineTransaction(sequelize, DataTypes);
const Message = defineMessage(sequelize, DataTypes);
const TradeOffer = defineTradeOffer(sequelize, DataTypes);
const ActivityLog = defineActivityLog(sequelize, DataTypes);
const Challenge = defineChallenge(sequelize, DataTypes);
const ChallengeAnswer = defineChallengeAnswer(sequelize, DataTypes);

// Associations
User.hasMany(Product, { foreignKey: 'ownerId', as: 'ownedProducts' });
Product.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Product, { foreignKey: 'originalOwnerId', as: 'originallyOwnedProducts' });
Product.belongsTo(User, { foreignKey: 'originalOwnerId', as: 'originalOwner' });

Product.hasOne(Auction, { foreignKey: 'productId', as: 'auction' });
Auction.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Auction.hasMany(Bid, { foreignKey: 'auctionId', as: 'bids' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });

User.hasMany(Bid, { foreignKey: 'bidderId', as: 'bids' });
Bid.belongsTo(User, { foreignKey: 'bidderId', as: 'bidder' });

User.hasMany(Transaction, { foreignKey: 'fromUserId', as: 'sentTransactions' });
User.hasMany(Transaction, { foreignKey: 'toUserId', as: 'receivedTransactions' });
Transaction.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
Transaction.belongsTo(User, { foreignKey: 'toUserId', as: 'toUser' });

Product.hasMany(Transaction, { foreignKey: 'productId', as: 'transactions' });
Transaction.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

User.hasMany(TradeOffer, { foreignKey: 'fromUserId', as: 'sentTradeOffers' });
User.hasMany(TradeOffer, { foreignKey: 'toUserId', as: 'receivedTradeOffers' });
TradeOffer.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
TradeOffer.belongsTo(User, { foreignKey: 'toUserId', as: 'toUser' });

Product.hasMany(TradeOffer, { foreignKey: 'offeredProductId', as: 'offersMadeWithProduct' });
Product.hasMany(TradeOffer, { foreignKey: 'requestedProductId', as: 'offersReceivedForProduct' });
TradeOffer.belongsTo(Product, { foreignKey: 'offeredProductId', as: 'offeredProduct' });
TradeOffer.belongsTo(Product, { foreignKey: 'requestedProductId', as: 'requestedProduct' });

// Challenges
Challenge.belongsTo(User, { foreignKey: 'winnerUserId', as: 'winner' });
Challenge.hasMany(ChallengeAnswer, { foreignKey: 'challengeId', as: 'answers' });
ChallengeAnswer.belongsTo(Challenge, { foreignKey: 'challengeId', as: 'challenge' });
ChallengeAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  sequelize,
  User,
  Product,
  Auction,
  Bid,
  Transaction,
  Message,
  TradeOffer,
  ActivityLog,
  Challenge,
  ChallengeAnswer
};
