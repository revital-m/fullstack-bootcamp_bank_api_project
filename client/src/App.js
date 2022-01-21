import React, { useState } from "react";
import myApi from './api/Api';
import './App.css';

function App() {
  const [userId, setUserID] = useState('');
  const [passportId, setPassportId] = useState('');
  const [amount, setAmount] = useState('');
  const [transferId, setTransferId] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [data, setData] = useState([]);

  const resetStateData = () => {
    setUserID('');
    setPassportId('');
    setAmount('');
    setTransferId('');
    setErrMsg('');
    setData([]);
  }

  //* Can fetch all details of a particular user.
  const getAllUsers = async () => {
    try {
      const {data} = await myApi.get('/clients');
      resetStateData();
      setData(data);
    } catch (error) {
      setErrMsg(error.message);
      setData([]);
    }
  };

  //* Update the client from the array of clients.
  const getUser = async () => {
    try {
      if (!userId) {
        throw new Error('Must enter a user ID!');
      }
      const { data } = await myApi.get(`/clients/${userId}`);
      resetStateData();
      setData([data]);
    } catch (error) {
      setErrMsg(error.message);
      setData([]);
    }
  };

  //* Can add users to the bank. Each user has the following: passport id, cash(default 0), credit(default 0).
  const addUser = async () => {
    try {
      if (!passportId) {
        throw new Error('Must enter a passport!');
      }
      const body = {
        passportID: passportId,
      };
      if (amount) {
        body.cash = Number(amount);
      }
      const { data } = await myApi.post('/clients', body);
      resetStateData();
      setData([data]);
    } catch (error) {
      setErrMsg(error.message);
      setData([]);
    }
  };

  //* Can deposit cash to a client. (by the clients accountID and amount of cash).
  const depositing = async () => {
    try {
      if (!userId) {
        throw new Error('Must enter a user ID!');
      }
      if (!amount) {
        throw new Error('Must enter an amount!');
      }
      const body = {
        amount: Number(amount),
      };
      const { data } = await myApi.patch(`/clients/depositing/${userId}`, body);
      resetStateData();
      setData([data]);
    } catch (error) {
      setErrMsg(error.message);
      setData([]);
    }
  };

  //* Can update a users credit (only positive numbers).
  const updateCredit = async () => {
    try {
      if (!userId) {
        throw new Error('Must enter a user ID!');
      }
      if (!amount) {
        throw new Error('Must enter an amount!');
      }
      const body = {
        amount: Number(amount),
      };
      const { data } = await myApi.patch(`/clients/updatecredit/${userId}`, body);
      resetStateData();
      setData([data]);
    } catch (error) {
      setErrMsg(error.message);
      setData([]);
    }
  };

  //* Can withdraw money from the user (can withdraw money until the cash and credit run out).
  const withdrawMoney = async () => {
    try {
      if (!userId) {
        throw new Error('Must enter a user ID!');
      }
      if (!amount) {
        throw new Error('Must enter an amount!');
      }
      if (amount <= 0) {
        throw new Error('Amount must be a positive number!');
      }
      const body = {
        amount: Number(amount),
      };
      const { data } = await myApi.patch(`/clients/withdrawmoney/${userId}`, body);
      resetStateData();
      setData([data]);
    } catch (error) {
      setErrMsg(error.message);
      setData([]);
    }
  };

  //* Can transfer money from one user to another with credit (can transfer money until the cash and credit run out).
  const transferring = async () => {
    try {
      if (!userId) {
        throw new Error('Must enter a user ID!');
      }
      if (!transferId) {
        throw new Error('Must enter a user ID to transfer to!');
      }
      if (!amount) {
        throw new Error('Must enter an amount!');
      }
      if (amount <= 0) {
        throw new Error('Amount must be a positive number!');
      }
      const body = {
        amount: Number(amount),
        clientToTransfer: transferId,
      };
      const { data } = await myApi.patch(`/clients/transferring/${userId}`, body);
      resetStateData();
      setData(data);
    } catch (error) {
      setErrMsg(error.message);
      setData([]);
    }
  };

  const handleInput = (e) => {
    switch (e.target.name) {
      case "userId":
        setUserID(e.target.value)
        break;
      case "passportId":
        setPassportId(e.target.value)
        break;
      case "amount":
        setAmount(e.target.value)
        break;
      case "transferId":
        setTransferId(e.target.value)
        break;
      default:
        break;
    }
  }

  const displayData = () => {
    return data.map(user => {
      return (
        <div className="card" key={user._id}>
          <p><span className="card--bold">User ID:</span> {user._id}</p>
          <p><span className="card--bold">Passport:</span> {user.passportID}</p>
          <p><span className="card--bold">Cash: </span>{user.cash}</p>
          <p><span className="card--bold">Credit: </span>{user.credit}</p>
        </div>
      );
    });
  }

  return (
    <div className='App'>
      <div className='inputs-container'>
        <div className='inputs-container--row'>
          <div className="searchInput">
            <label className="searchInput--label">Enter User ID:</label>
            <input
              className="searchInput--info"
              onChange={handleInput}
              name="userId"
              type="text"
              value={userId}
            ></input>
          </div>
          <div className="searchInput">
            <label className="searchInput--label">Enter passport:</label>
            <input
              className="searchInput--info"
              onChange={handleInput}
              name="passportId"
              type="text"
              value={passportId}
            ></input>
          </div>
        </div>
        <div className='inputs-container--row'>
          <div className="searchInput">
            <label className="searchInput--label">Enter amount:</label>
            <input
              className="searchInput--info"
              onChange={handleInput}
              name="amount"
              type="text"
              value={amount}
            ></input>
          </div>
          <div className="searchInput">
            <label className="searchInput--label">Enter user ID to transfer to:</label>
            <input
              className="searchInput--info"
              onChange={handleInput}
              name="transferId"
              type="text"
              value={transferId}
            ></input>
          </div>
        </div>
      </div>
      <div className='btns-container'>
        <button className="btn" onClick={getAllUsers}>Gat All Users</button>
        <button className="btn" onClick={getUser}>Gat A User</button>
        <button className="btn" onClick={addUser}>Add A User</button>
        <button className="btn" onClick={depositing}>Depositing Cash</button>
        <button className="btn" onClick={updateCredit}>Update Credit</button>
        <button className="btn" onClick={withdrawMoney}>Withdraw Money</button>
        <button className="btn" onClick={transferring}>Transferring Money</button>
      </div>
      {errMsg && <h2 className="error-msg">{errMsg}</h2>}
      <div className='data-container'>
        {displayData()}
      </div>
    </div>
  );
}

export default App;
