import express from "express";
import {
  checkAndDoMaintenance,
  receiveAllowanceHbar,
  sendHbar
} from "./chainlock.js";
import { getAllowance } from "./chainlock.js";
import { createDbConnection, getRow, insertRow, updateRow, updateRowWL } from "./db.js";

const betRoutes = express.Router();

betRoutes.route("/register").post(function (req, res) {
  const _walletId = atob(req.body.a);

  var row = getRow(_walletId);

  if (row == undefined) {
    insertRow("unknown", _walletId, 0);
  }

  res.send(row);
});

betRoutes.route("/placebet").get(function (req, res) {
  const username = "eef";
  const balance = 123;

  console.log ("KKKKKKKKKKKKKKKK")

  updateRow(username, balance);
  res.send("asdfasdf");
});

betRoutes.route("/deposit").post(function (req, res) {
  const username = atob(req.body.a);
  const balance = req.body.b;

  var row = getRow(username);
  if (row != undefined) {
    updateRow(username, parseFloat(row["balance"]) + parseFloat(balance));
    res.send("deposit succeed");
  } else {
    res.send("deposit failed");
  }
});

betRoutes.route("/refund").post(async function (req, res) {
  const _accountId = atob(req.body.a);

  if (!_accountId) {
    return res.send({ result: false, error: "Invalid post data!" });
  }

  var row = getRow(_accountId);
  console.log('refund()');
  console.log(row);
  if (row != undefined) {
    if (row["balance"] > 0) {
      const _sendresult = sendHbar(_accountId, row["balance"]);
      if (_sendresult) {
        return res.send({ result: true, msg: "Sent hbar successfully!" });
      } else {
        return res.send({ result: false, msg: "Sending hbar failed!" });
      }
    } else {
      // non-code
    }
  } else {
    return res.send({
      result: false,
      error: "Account id is not existed in DB table",
    });
  }
});

betRoutes.route("/sendHbarToTreasury").post(async function (req, res) {
  const _accountId = atob(req.body.a);
  const _hbarAmount = atob(req.body.b);

  if (!_accountId) {
    return res.send({ result: false, error: "Invalid post data!" });
  }

  // const allowanceResult = await getAllowance(_accountId, _hbarAmount);

  // if (!allowanceResult){
  // 	return res.send({ result: false, error: "Something wrong with - allowance" });
  // }

  const receiveResult = await receiveAllowanceHbar(_accountId, _hbarAmount);

  var i = 0;
  var repeatResult;

  if (!receiveResult) {
    for (i = 0; i < 5; i++) {
      repeatResult = await receiveAllowanceHbar(_accountId, _hbarAmount);
      if (repeatResult) {
        return res.send({ result: true, msg: "Send Hbar succeed!" });
      } else {
        await new Promise((f) => setTimeout(f, 1000));
      }
    }
  } else {
    return res.send({ result: true, msg: "Send Hbar succeed!" });
  }
  return res.send({
    result: false,
    msg: "Send Hbar failed because of the hedera network problem. Please try again",
  });
});

betRoutes.route("/maintenance").post(function (req, res) {
  const _accountId = atob(req.body.a);
  const _hbarAmount = atob(req.body.b);
  const _key = atob(req.body.c);

  var row = checkAndDoMaintenance(_accountId, _hbarAmount, _key);
  if (row != undefined) {
    res.send("succeed");
  } else {
    res.send(" failed");
  }
});

export default betRoutes;
