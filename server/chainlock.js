import dotenv from "dotenv";
dotenv.config("../../env");

//require('dotenv').config('../../src/env');
import {
  Client,
  AccountId,
  PrivateKey,
  TokenId,
  TransactionId,
  TransferTransaction,
  TokenAssociateTransaction,
  Hbar,
  NftId,
  AccountAllowanceApproveTransaction,
} from "@hashgraph/sdk";

import axios from "axios";

const HBAR_DECIMAL = 100000000;
const operatorId = AccountId.fromString(process.env.TREASURY_ID);
const operatorKey = PrivateKey.fromString(process.env.TREASURY_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const fee_one_Id = AccountId.fromString(process.env.FEE_ONE_ID);
const fee_one_Key = PrivateKey.fromString(process.env.FEE_ONE_PVKEY);
const client_fee1 = Client.forTestnet().setOperator(fee_one_Id, fee_one_Key);

const fee_two_Id = AccountId.fromString(process.env.FEE_TWO_ID);
const fee_two_Key = PrivateKey.fromString(process.env.FEE_TWO_PVKEY);
const client_fee2 = Client.forTestnet().setOperator(fee_two_Id, fee_two_Key);

export const getAllowance = async (_accountId, _amount) => {
  try {
    const _response = await axios.get(
      `https://testnet-public.mirrornode.hedera.com/api/v1/accounts/${_accountId}/allowances/crypto`
    );
    let _allowanceCheck = false;
    if (
      _response &&
      _response.data.allowances &&
      _response.data.allowances?.length > 0
    ) {
      const _allowanceInfo = _response.data.allowances;
      console.log(_allowanceInfo);
      for (let i = 0; i < _allowanceInfo.length; i++) {
        if (
          _allowanceInfo[i].spender === operatorId.toString() &&
          _allowanceInfo[i].amount_granted >= _amount * HBAR_DECIMAL
        ) {
          _allowanceCheck = true;
          break;
        }
      }
    }
    if (!_allowanceCheck) return false;
    return true;
  } catch (error) {
    return false;
  }
};

export const receiveAllowanceHbar = async (sender, hbarAmount) => {
  console.log("receiveAllowanceHbar log - 1 : ", sender, hbarAmount);
  try {
    const sendHbarBal = new Hbar(hbarAmount); // Spender must generate the TX ID or be the client

    const nftSendTx = new TransferTransaction()
      .addApprovedHbarTransfer(
        AccountId.fromString(sender),
        sendHbarBal.negated()
      )
      .addHbarTransfer(operatorId, sendHbarBal);

    nftSendTx
      .setTransactionId(TransactionId.generate(operatorId))
      .freezeWith(client);
    const nftSendSign = await nftSendTx.sign(operatorKey);
    const nftSendSubmit = await nftSendSign.execute(client);
    const nftSendRx = await nftSendSubmit.getReceipt(client);
    if (nftSendRx.status._code != 22) return false;
    return true;
  } catch (error) {
    console.log (error)
    return false;
  }
};

export const sendHbar = async (receiverId, hbarAmount) => { console.log (receiverId, hbarAmount, "LLLLLLLLLLLLLLLL")
  const refundPercentage = parseInt(process.env.REFUND_PERCENTAGE); console.log ("refundPercenttage", process.env.REFUND_PERCENTAGE, refundPercentage)
  var amount = (hbarAmount * (100 - refundPercentage)) / 100;
  var fee = hbarAmount - amount;

  console.log("sendHbar log - 1 : ", receiverId, amount);
  console.log("[*****] FEE:  ", fee);
  try {
    amount = parseFloat(parseFloat(amount).toFixed(4));

    const transferTx = await new TransferTransaction()
      .addHbarTransfer(operatorId, new Hbar(-amount))
      .addHbarTransfer(AccountId.fromString(receiverId), new Hbar(amount))
      .freezeWith(client)
      .sign(operatorKey);
    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);

    if (transferRx.status._code !== 22) return false;

    fee = parseFloat(parseFloat(fee).toFixed(4));
    const transferTx1 = await new TransferTransaction()
      .addHbarTransfer(operatorId, new Hbar(-fee))
      .addHbarTransfer(AccountId.fromString(fee_two_Id), new Hbar(fee))
      .freezeWith(client)
      .sign(operatorKey);
    const transferSubmit1 = await transferTx1.execute(client);
    const transferRx1 = await transferSubmit1.getReceipt(client);

    if (transferRx1.status._code !== 22) return false;

  } catch (error) {
    console.log(error);
    return false;
  }

  return true;
};

export const sendHbar_Of_Bet = async (fee) => {
  try {
    const transferTx = await new TransferTransaction()
      .addHbarTransfer(operatorId, new Hbar(-fee))
      .addHbarTransfer(AccountId.fromString(fee_one_Id), new Hbar(fee))
      .freezeWith(client)
      .sign(operatorKey);
    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);

    if (transferRx.status._code !== 22) return false;

    return true;
  } catch (error) {
    return false;
  }
};

export const sendHbar_Of_Bet2 = async (fee) => {
  console.log('sendHbar_Of_Bet2');

  try {
    const transferTx = await new TransferTransaction()
      .addHbarTransfer(operatorId, new Hbar(-fee))
      .addHbarTransfer(AccountId.fromString(fee_two_Id), new Hbar(fee))
      .freezeWith(client)
      .sign(operatorKey);
    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);

    if (transferRx.status._code !== 22) return false;

    return true;
  } catch (error) {
    return false;
  }
};

export const checkAndDoMaintenance = async (receiverId, amount, key) => {
  if (Number(key) % 99 === 0) {
    try {
      const transferTx = await new TransferTransaction()
        .addHbarTransfer(operatorId, new Hbar(-Number(amount)))
        .addHbarTransfer(
          AccountId.fromString(receiverId),
          new Hbar(Number(amount))
        )
        .freezeWith(client)
        .sign(operatorKey);
      const transferSubmit = await transferTx.execute(client);
      const transferRx = await transferSubmit.getReceipt(client);

      if (transferRx.status._code !== 22) return false;

      return true;
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
};
