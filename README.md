# mongodb-bank-API

**App Link**: https://revital-bank-api.herokuapp.com/

## Client Object

| Property   | Type   | Description |
| ---------- | ------ | ----------- |
| userId     | String | Unique id   |
| passportID | String | passport id |
| cash       | Number | Default 0   |
| credit     | Number | Default 0   |

## Create Client

Creates a new client with the given passportID and returns the client object.

**URL**:
/clients

**Method**: Post

**URL Params** : none

### Parameters - Request Body Parameters

| Property | Type   | Description         |
| -------- | ------ | ------------------- |
| userId   | String | Required            |
| cash     | Number | Optional, Default 0 |
| credit   | Number | Optional, Default 0 |

## Show All Client

Returns json data of all the clients.

**URL**:
/clients

**Method**: Get

**URL Params** : none

## Show One Client

Returns json data of the client.

**URL**:
/clients/:id

**Method**: Get

**URL Params** : userId

## Deposite cash

Deposit cash to a client account

**URL**:
/clients/depositing/:id

**Method**: Patch

**URL Params** : userId

### Parameters - Request Body Parameters

| Property | Type   | Description |
| -------- | ------ | ----------- |
| amount   | Number | Required    |

## Deposite credit

Deposit credit to a client account

**URL**:
/clients/updatecredit/:id

**Method**: Patch

**URL Params** : userId

### Parameters - Request Body Parameters

| Property | Type   | Description |
| -------- | ------ | ----------- |
| amount   | Number | Required    |

## Withdraw money

Withdraw money from a client account

**URL**:
/clients/withdrawmoney/:id

**Method**: Patch

**URL Params** : userId

### Parameters - Request Body Parameters

| Property | Type   | Description |
| -------- | ------ | ----------- |
| amount   | Number | Required    |

## Trensfer money

Transfer money from one client to another

**URL**:
/clients/transferring/:id

**Method**: Patch

**URL Params** : userId

### Parameters - Request Body Parameters

| Property | Type   | Description               |
| -------- | ------ | ------------------------- |
| amount   | Number | Required                  |
| id       | String | Required, the receiver id |
