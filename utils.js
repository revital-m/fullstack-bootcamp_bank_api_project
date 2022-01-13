const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

//* Can add users to the bank. Each user has the following: passport id, cash(default 0), credit(default 0).
const addClient = (passportID, cash = 0, credit = 0) => {
  const clientsArr = loadClients();
  const duplicatClient = clientsArr.find(
    (client) => client.passportID === passportID
  );

  if (!duplicatClient) {
    const newClient = {
      passportID,
      cash,
      credit,
      accountID: uuidv4(),
    };
    clientsArr.push(newClient);
    saveClients(clientsArr);
    return {
      client: newClient,
    };
  } else {
    return {
      error: true,
      message: "The client already exists!",
    };
  }
};

//* Read a user from the array of users.
// const readUser = (id) => {
//   const usersArr = loadUsers();
//   const chossenUser = usersArr.find((user) => user.id === id);

//   if (chossenUser) {

//   } else {

//   }
// };

//* Update the client from the array of clients.
const updateClients = (accountID, { type, amount, clientToTransfer } = {}) => {
  const clientsArr = loadClients();
  let res = {};
  const isClientExist = clientsArr.find(
    (client) => client.accountID === accountID
  );
  if (!isClientExist) {
    res.error = true;
    res.message = "Client not found!";
    return res;
  }

  switch (type) {
    case "depositing":
      res = depositing(clientsArr, accountID, amount);
      break;
    case "updateCredit":
      res = updateCredit(clientsArr, accountID, amount);
      break;
    case "withdrawMoney":
      res = withdrawMoney(clientsArr, accountID, amount);
      break;
    case "transferring":
      res = transferring(clientsArr, accountID, amount, clientToTransfer);
      break;
    default:
      res.error = true;
      res.message = "Request not found!";
      break;
  }
  return res;
};

//* Can deposit cash to a client. (by the clients accountID and amount of cash).
const depositing = (clientsArr, accountID, amount) => {
  const res = {};
  for (let i = 0; i < clientsArr.length; i++) {
    if (clientsArr[i].accountID === accountID) {
      clientsArr[i].cash += amount;
      res.client = {
        passportID: clientsArr[i].passportID,
        cash: clientsArr[i].cash,
        credit: clientsArr[i].credit,
        accountID,
      };
    }
  }
  saveClients(clientsArr);
  return res;
};

//* Can update a users credit (only positive numbers).
const updateCredit = (clientsArr, accountID, amount) => {
  const res = {};
  if (amount < 0) {
    res.error = true;
    res.message = "Can not update credit with a negative amount!";
    return res;
  }
  for (let i = 0; i < clientsArr.length; i++) {
    if (clientsArr[i].accountID === accountID) {
      clientsArr[i].credit += amount;
      res.client = {
        passportID: clientsArr[i].passportID,
        cash: clientsArr[i].cash,
        credit: clientsArr[i].credit,
        accountID,
      };
    }
  }
  saveClients(clientsArr);
  return res;
};

//* Can withdraw money from the user (can withdraw money until the cash and credit run out).
const withdrawMoney = (clientsArr, accountID, amount) => {
  const res = {};
  if (amount < 0) {
    res.error = true;
    res.message = "Can not withdraw a negative amount!";
    return res;
  }

  for (let i = 0; i < clientsArr.length; i++) {
    if (clientsArr[i].accountID === accountID) {
      if (clientsArr[i].cash + clientsArr[i].credit >= amount) {
        clientsArr[i].cash -= amount;
        if (clientsArr[i].cash < 0) {
          clientsArr[i].credit += clientsArr[i].cash;
          clientsArr[i].cash = 0;
        }
        res.client = {
          passportID: clientsArr[i].passportID,
          cash: clientsArr[i].cash,
          credit: clientsArr[i].credit,
          accountID,
        };
      } else {
        res.error = true;
        res.message =
          "Client does not have enough money to complete the withdraw!";
        return res;
      }
    }
  }
  saveClients(clientsArr);
  return res;
};

//* Can transfer money from one user to another with credit (can transfer money until the cash and credit run out).
const transferring = (clientsArr, accountID, amount, clientToTransfer) => {
  const res = {};
  if (amount < 0) {
    res.error = true;
    res.message = "Can not transfer a negative amount!";
    return res;
  }

  const isClientExist = clientsArr.find(
    (client) => client.accountID === clientToTransfer
  );
  if (!isClientExist) {
    res.error = true;
    res.message = "Client to transfer to not found!";
    return res;
  }

  res.client = [];
  for (let i = 0; i < clientsArr.length; i++) {
    if (clientsArr[i].accountID === accountID) {
      if (clientsArr[i].cash + clientsArr[i].credit >= amount) {
        clientsArr[i].cash -= amount;
        if (clientsArr[i].cash < 0) {
          clientsArr[i].credit += clientsArr[i].cash;
          clientsArr[i].cash = 0;
        }
        res.client[0] = {
          passportID: clientsArr[i].passportID,
          cash: clientsArr[i].cash,
          credit: clientsArr[i].credit,
          accountID,
        };
      } else {
        res.error = true;
        res.message =
          "Client does not have enough money to complete the transfer!";
        return res;
      }
    } else if (clientsArr[i].accountID === clientToTransfer) {
      clientsArr[i].credit += amount;
      res.client[1] = {
        passportID: clientsArr[i].passportID,
        cash: clientsArr[i].cash,
        credit: clientsArr[i].credit,
        accountID: clientToTransfer,
      };
    }
  }
  saveClients(clientsArr);
  return res;
};

//* List all the notes from the array of notes.
// const updateUser = (id, name, email) => {
//   const usersArr = loadUsers();
//   const chosenUser = usersArr.find((user) => user.id === id);

//   if (chosenUser) {
//     chosenUser.name = name || chosenUser.name;
//     chosenUser.email = email || chosenUser.email;

//     saveClients(usersArr);

//   } else {

//   }
// };

//* Save the array of clients in clients.json
const saveClients = (clientsArr) => {
  const clientsJSON = JSON.stringify(clientsArr);
  fs.writeFileSync("clients.json", clientsJSON);
};

//* Load the array of users from users.json and parse them into JS.
const loadClients = () => {
  try {
    const dataBuffer = fs.readFileSync("clients.json");
    const dataJSON = dataBuffer.toString();
    const parseData = JSON.parse(dataJSON);
    return parseData;
  } catch (error) {
    return [];
  }
};

module.exports = {
  addClient,
  updateClients,
};
