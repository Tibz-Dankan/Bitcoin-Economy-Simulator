// server.js

const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");

// Define your type definitions and resolvers
const typeDefs = gql`
  type Query {
    hello: String
  }

  type Mutation {
    lnAddressPaymentSend(input: LnAddressPaymentSendInput!): PaymentResponse
  }

  type Mutation {
    onChainAddressCurrent(
      input: OnChainAddressCurrentInput!
    ): OnChainAddressPayload
  }

  input LnAddressPaymentSendInput {
    amount: Int!
    fromAccountId: String!
    toAccountId: String!
  }

  input OnChainAddressCurrentInput {
    amount: Int!
    onChainAddress: String!
    btcWalletId: String!
  }

  type OnChainAddressPayload {
    address: String
    errors: [Error]
  }

  type PaymentResponse {
    status: String
    errors: [Error]
  }

  type Error {
    code: String
    message: String
    path: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
  Mutation: {
    lnAddressPaymentSend: async (_, { input }) => {
      const url = "https://api.blink.sv/graphql";
      const token = process.env.API_TOKEN;

      const mutation = `
        mutation LnAddressPaymentSend($input: LnAddressPaymentSendInput!) {
          lnAddressPaymentSend(input: $input) {
            status
            errors {
              code
              message
              path
            }
          }
        }
      `;

      const variables = { input };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: mutation,
            variables: variables,
          }),
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (response.ok) {
          return data.data.lnAddressPaymentSend;
        } else {
          console.error("Error:", data);
          return {
            status: "FAILURE",
            errors: data.errors || [
              { code: "UNKNOWN", message: "Unknown error" },
            ],
          };
        }
      } catch (error) {
        console.error("Error:", error);
        return {
          status: "FAILURE",
          errors: [{ code: "NETWORK_ERROR", message: error.message }],
        };
      }
    },
  },
};

const startServer = async () => {
  const app = express();

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
