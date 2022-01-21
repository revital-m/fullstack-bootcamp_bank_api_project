const express = require("express");
const Client = require("../models/client");
const path = require("path");
const publicPath = path.join(__dirname, "client/build");
const router = express.Router();

//* Can add users to the bank. Each user has the following: passport id, cash(default 0), credit(default 0).
router.post("/api/clients", async (req, res) => {
  try {
    const client = new Client(req.body);
    const result = await client.save();
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//* Can fetch all details of a particular user.
router.get("/api/clients", async (req, res) => {
  try {
    const result = await Client.find({});
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//* Update the client from the array of clients.
router.get("/api/clients/:id", async (req, res) => {
  try {
    const result = await Client.findOne({ _id: req.params.id });
    if (!result) {
      return res.status(404).send("Client not found");
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//* Can deposit cash to a client. (by the clients accountID and amount of cash).
router.patch("/api/clients/depositing/:id", async (req, res) => {
  try {
    const isValid = isValidUpdate(req.body);
    if (!isValid) {
      return res.status(400).send("Invalid update!");
    }
    const isClient = await isClientExist(req.params.id);
    if (!isClient) {
      return res.status(404).send("Client not found");
    }
    const clientUpdate = depositing(req.body, isClient);
    const result = await Client.findByIdAndUpdate(
      { _id: req.params.id },
      clientUpdate,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!result) {
      return res.status(404).send("Client not found");
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//* Can update a users credit (only positive numbers).
router.patch("/api/clients/updatecredit/:id", async (req, res) => {
  try {
    const isValid = isValidUpdate(req.body);
    if (!isValid) {
      return res.status(400).send("Invalid update!");
    }
    const isClient = await isClientExist(req.params.id);
    if (!isClient) {
      return res.status(404).send("Client not found");
    }
    if (req.body.amount <= 0) {
      return res.status(400).send("Invalid amount!");
    }
    const clientUpdate = updateCredit(req.body, isClient);
    const result = await Client.findByIdAndUpdate(
      { _id: req.params.id },
      clientUpdate,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!result) {
      return res.status(404).send("Client not found");
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//* Can withdraw money from the user (can withdraw money until the cash and credit run out).
router.patch("/api/clients/withdrawmoney/:id", async (req, res) => {
  try {
    const isValid = isValidUpdate(req.body);
    if (!isValid) {
      return res.status(400).send("Invalid update!");
    }
    const isClient = await isClientExist(req.params.id);
    if (!isClient) {
      return res.status(404).send("Client not found");
    }
    if (
      req.body.amount <= 0 ||
      isClient.cash + isClient.credit < req.body.amount
    ) {
      return res.status(400).send("Invalid amount!");
    }
    const clientUpdate = withdrawMoney(req.body, isClient);
    const result = await Client.findByIdAndUpdate(
      { _id: req.params.id },
      clientUpdate,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!result) {
      return res.status(404).send("Client not found");
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//* Can transfer money from one user to another with credit (can transfer money until the cash and credit run out).
router.patch("/api/clients/transferring/:id", async (req, res) => {
  try {
    const isValid = isValidUpdate(req.body);
    if (!isValid) {
      return res.status(400).send("Invalid update!");
    }
    const isClient = await isClientExist(req.params.id);
    const isClientToTransfer = await isClientExist(req.body.clientToTransfer);
    if (!isClient || !isClientToTransfer) {
      return res.status(404).send("Client not found");
    }
    if (
      req.body.amount <= 0 ||
      isClient.cash + isClient.credit < req.body.amount
    ) {
      return res.status(400).send("Invalid amount!");
    }
    const clientUpdate = transferring(req.body, isClient, isClientToTransfer);
    const result = [];
    result[0] = await Client.findByIdAndUpdate(
      { _id: req.params.id },
      clientUpdate[0],
      {
        new: true,
        runValidators: true,
      }
    );
    result[1] = await Client.findByIdAndUpdate(
      { _id: req.body.clientToTransfer },
      clientUpdate[1],
      {
        new: true,
        runValidators: true,
      }
    );
    if (!result[0] || !result[1]) {
      return res.status(404).send("Client not found");
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//* Check if the operation that was sent in the body is valid.
const isValidUpdate = (toUpdateObj) => {
  const toUpdateArr = Object.keys(toUpdateObj);
  const allowedUpdates = ["cash", "credit", "amount", "clientToTransfer"];
  const isValid = toUpdateArr.every((update) =>
    allowedUpdates.includes(update)
  );
  return isValid;
};

//* Check if the client exists.
const isClientExist = async (clientId) => {
  const result = await Client.findOne({ _id: clientId });
  return result;
};

//* Creat the updated client obj for the depositing operation.
const depositing = ({ amount }, client) => {
  const update = {
    passportID: client.passportID,
    cash: client.cash + amount,
    credit: client.credit,
  };
  return update;
};

//* Creat the updated client obj for the update credit operation.
const updateCredit = ({ amount }, client) => {
  const update = {
    passportID: client.passportID,
    cash: client.cash,
    credit: client.credit + amount,
  };
  return update;
};

//* Creat the updated client obj for the withdraw money operation.
const withdrawMoney = ({ amount }, client) => {
  let newCash = client.cash - amount;
  let newCredit = client.credit;
  if (newCash < 0) {
    newCredit += newCash;
    newCash = 0;
  }
  const update = {
    passportID: client.passportID,
    cash: newCash,
    credit: newCredit,
  };
  return update;
};

//* Creat the updated client obj for the transferring operation.
const transferring = ({ amount }, client, isClientToTransfer) => {
  let newCash = client.cash - amount;
  let newCredit = client.credit;
  if (newCash < 0) {
    newCredit += newCash;
    newCash = 0;
  }
  const update = {
    passportID: client.passportID,
    cash: newCash,
    credit: newCredit,
  };
  const updateTransfer = {
    passportID: isClientToTransfer.passportID,
    cash: isClientToTransfer.cash,
    credit: isClientToTransfer.credit + amount,
  };
  return [update, updateTransfer];
};

module.exports = router;
