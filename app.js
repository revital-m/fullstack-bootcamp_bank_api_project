const express = require("express");
const utilsFunctions = require("./utils.js");
const app = express();

app.use(express.json());

app.get("/clients/", (req, res) => {
  const apiRes = utilsFunctions.listClients();
  res.status(200).send(apiRes);
});

app.get("/clients/:accountID", (req, res) => {
  const accountID = req.params.accountID;
  const apiRes = utilsFunctions.readClient(accountID);

  if (!apiRes.error) {
    res.status(200).send(apiRes.client);
  } else {
    res.status(400).send(apiRes.message);
  }
});

app.post("/clients", (req, res) => {
  const passportID = req.body.passportID;
  const cash = req.body.cash;
  const credit = req.body.credit;
  const apiRes = utilsFunctions.addClient(passportID, cash, credit);
  if (!apiRes.error) {
    res.status(201).send(apiRes.client);
  } else {
    res.status(400).send(apiRes.message);
  }
});

app.put("/clients/:accountID", (req, res) => {
  const accountID = req.params.accountID;
  const info = req.body;
  const apiRes = utilsFunctions.updateClients(accountID, info);

  if (!apiRes.error) {
    res.status(200).send(apiRes.client);
  } else {
    res.status(400).send(apiRes.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listentinig to port: ${PORT}`);
});
