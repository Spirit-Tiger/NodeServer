import { gql } from "apollo-server";

const typeDefs = gql`
  type Order {
    id: ID!
    orderId: Int!
    createDate: String!
    symbol: String!
    orderType: String!
    volume: Float!
    openPrice: Float!
    sl: Float!
    tp: Float!
    leverage: Int!
  }
  type ClosedOrder {
    id: ID!
    orderId: Int!
    createDate: String!
    symbol: String!
    orderType: String!
    volume: Float!
    openPrice: Float!
    closedPrice: Float!
    closedDate: String!
    sl: Float!
    tp: Float!
    profit: String!
  }
  type User {
    id: ID!
    personalId: Int!
    username: String!
    firstName: String!
    lastName: String!
    country: String!
    phone: String!
    email: String!
    token: String!
    wallet: String!
    password: String
    createdAt: String!
    balance: Float!
    verified: Boolean!
    ordersCounter: Int!
    userRole: String!
    orders: [Order]!
    tradeHistory: [ClosedOrder]!
  }
  type DeletedUser {
    userId: ID!
    message: String!
  }

  input RegisterInput {
    username: String!
    firstName: String!
    lastName: String!
    country: String!
    phone: String!
    email: String!
    password: String!
    userRole: String!
  }
  input OrderInput {
    orderId: Int!
    createDate: String!
    symbol: String!
    orderType: String!
    volume: Float!
    openPrice: Float!
    sl: Float!
    tp: Float!
    nakrutka: String
    leverage: Float!
  }
  input ChangeUserInput {
    firstName: String
    lastName: String
    country: String
    phone: String
    email: String
  }
  input TradeHistoryInput {
    createDate: String!
    symbol: String!
    orderType: String!
    volume: Float!
    openPrice: Float!
    closedPrice: Float!
    closedTime: String!
    sl: Float!
    tp: Float!
    profit: String!
  }
  type ProfileImage {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  scalar Upload

  type Crypto {
    product_id: String!
    price: String!
  }

  type LimitCheck {
    user_id: String!
    order_id: String!
    symbol: String!
    orderType: String!
    openPrice: Float!
    volume: Float!
    sl: Float!
    tp: Float!
  }

  input LimitOrderInput {
    user_id: String!
    order_id: String!
    symbol: String!
    orderType: String!
    openPrice: Float!
    volume: Float!
    sl: Float!
    tp: Float!
  }

  type Verify {
    id: ID!
    userId: ID!
    profileImg: String
    firstName: String!
    lastName: String!
    createdDate: String!
  }

  type Query {
    getUsers: [User]
    getUser(userId: String!): User!
    getCryptoInfo(product_id: String!): Crypto!
    getLimitOrders: [LimitCheck]
    getVerifyRequests: [Verify]
  }
  type Mutation {
    login(username: String!, password: String!): User!
    register(registerInput: RegisterInput!): User!
    verifyUserEmail(confirmationCode: String!): User!

    createOrder(userId: ID!, orderInput: OrderInput!): User!
    closeOrder(
      orderId: ID!
      closedPrice: Float!
      profit: String!
      userId: ID!
      closedDate: String!
    ): User!
    cleanHistory(userId: ID!): User!
    changeUserInfo(changeUserInput: ChangeUserInput!): User!
    changeProfileImage(profileImage: String!): User!
    setStopLoss(orderId: ID!, sl: Float!): User!
    setTakeProfit(orderId: ID!, tp: Float!): User!
    verifyRequest(
      userId: ID!
      profileImg: String
      firstName: String!
      lastName: String!
      createdDate: String!
    ): Verify!

    deleteOrderFromHistory(userId: ID!, orderId: ID!): User!
    clearOrders(userId: ID!): User!
    verifyUser(userId: ID!): User!
    changeBalance(userId: ID!, balance: Float!): User!
    changeWallet(userId: ID!, wallet: String!): User!
    changeOpenPrice(userId: ID!, orderId: ID!, changedPrice: Float!): User!
    deleteUser(userId: ID!): DeletedUser!
    updateUsers: [User]
    updateVerifyRequest(userId:ID!, requestId:ID!, isAccepted:Boolean!): Boolean!

    singleUpload(file: Upload!): ProfileImage!

    createCrypto(product_id: String!, price: String!): Crypto!
    updateCryptoInfo(product_id: String!, price: String!): Crypto!

    addLimitOrders(limitOrderInput: LimitOrderInput): LimitCheck
    deleteLimitOrder(order_id: String!): LimitCheck!
    updateLimitOrder(order_id: String!, sl: Float!, tp: Float!): LimitCheck!
  }

  type Subscription {
    cryptoUpdated: Crypto
    limitsCheck: LimitCheck
    orderClosed(userId: String!): User
  }
`;

export default typeDefs;
