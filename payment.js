// Set your GraphQL endpoint URL
const url = "https://api.blink.sv/graphql";
const token = process.env.YOUR_API_TOKEN;

// Define the mutation
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

// Send the request
const variables = {
  input: {
    fromAccountId: "mmaken@blink.sv", // sender's account ID
    toAccountId: "mmak3n@blink.sv", //  recipient's account ID
    amount: 100, // Amount in satoshis
  },
};

// Send the request
fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: mutation,
    variables: variables,
  }),
})
  .then((response) => response.json()) // Convert response to JSON
  .then((data) => {
    console.log("Parsed Data:", data);

    // Check if there were any errors
    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      return;
    }

    // Check the status of the transaction
    const paymentSendResult = data.data.lnAddressPaymentSend;
    if (paymentSendResult.status === "SUCCESS") {
      console.log("Payment sent successfully!");
    } else {
      console.error("Failed to send payment:", paymentSendResult.errors);
    }
  })
  .catch((error) => {
    console.error("Network or Fetch Error:", error);
  });
