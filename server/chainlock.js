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

export const sendHbar = async (receiverId, hbarAmount, winAmount, lostAmount) => { console.log (receiverId, hbarAmount, "LLLLLLLLLLLLLLLL")
  const refundPercentage = parseInt(process.env.REFUND_PERCENTAGE); console.log ("refundPercenttage", process.env.REFUND_PERCENTAGE, refundPercentage)
  var amount = (hbarAmount * (100 - refundPercentage)) / 100;
  var fee_win = winAmount * refundPercentage / 100;
  var fee_lost = lostAmount * refundPercentage / 100;

  console.log("sendHbar log - 1 : ", receiverId, amount);
  console.log("win, lost fee: ", fee_win, fee_lost);
  try {
    const transferTx = await new TransferTransaction()
      .addHbarTransfer(operatorId, new Hbar(-amount))
      .addHbarTransfer(AccountId.fromString(receiverId), new Hbar(amount))
      .freezeWith(client)
      .sign(operatorKey);
    const transferSubmit = await transferTx.execute(client);
    const transferRx = await transferSubmit.getReceipt(client);
    
    // add fee
    // @{
    const transferTx_fee1 = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(fee_one_Id), new Hbar(fee_win))
      .freezeWith(client_fee1)
      .sign(fee_one_Key);
    const transferSubmit_fee1 = await transferTx.execute(client_fee1);
    const transferRx_fee1 = await transferSubmit.getReceipt(client_fee1);

    const transferTx_fee2 = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(fee_two_Id), new Hbar(fee_lost))
      .freezeWith(client_fee2)
      .sign(fee_two_Key);
    const transferSubmit_fee2 = await transferTx.execute(client_fee2);
    const transferRx_fee2 = await transferSubmit.getReceipt(client_fee2);
    // @}

    if (transferRx.status._code !== 22) return false;
    if (transferRx_fee1.status._code !== 22) return false;
    if (transferRx_fee2.status._code !== 22) return false;

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
