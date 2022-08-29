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

  type Query {
    getUsers: [User]
    getUser(userId: String!): User!
  }
  type Mutation {
    login(username: String!, password: String!): User!
    register(registerInput: RegisterInput!): User!
    verifyUserEmail(confirmationCode: String!): User!

    createOrder(userId: ID!, orderInput: OrderInput!): User!
    closeOrder(orderId: ID!, closedPrice: Float!, profit: String!, userId: ID!): User!
    cleanHistory(userId: ID!): User!
    changeUserInfo(changeUserInput: ChangeUserInput!): User!
    changeProfileImage(profileImage: String!): User!
    verifyRequest(userId: ID!, request: String!): User!

    deleteOrderFromHistory(userId: ID!, orderId: ID!): User!
    verifyUser(userId: ID!, verified: Boolean!): User!
    changeBalance(userId: ID!, balance: Float!): User!
    changeWallet(userId: ID!, wallet: String!): User!
    changeOpenPrice(userId: ID!, orderId: ID!, changedPrice: Float!): User!
    deleteUser(userId: ID!): DeletedUser!
    updateUsers: [User]

    singleUpload(file: Upload!): ProfileImage!
  }
`;

export default typeDefs;
