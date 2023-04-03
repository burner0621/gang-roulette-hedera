// import { createServer } from "http";
import { createServer } from "https";
import fs from 'fs';
import { Server } from "socket.io";
import { income, balance, GameData, GameStages, PlacedChip, ValueType, Winner } from "../src/Global";
import { Timer } from "easytimer.js";
import express from 'express';
import cors from 'cors';
import betRoutes from './placebet.js';
import { updateRow, getRow, deposit, refund } from "./db";

/** Server Handling */
const app = express();
app.use(cors());
app.use(express.json());
app.use(betRoutes);
const privateKey = fs.readFileSync("/etc/letsencrypt/live/hbarroulette.io/privkey.pem");
const certificate = fs.readFileSync("/etc/letsencrypt/live/hbarroulette.io/fullchain.pem");

const credentials = {
    key: privateKey,
    cert: certificate,
}
const httpServer = createServer(credentials, app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});
app.get('/api/placebet', (req, res) => {
  res.send('index.html');
});

var timer = new Timer();
var users = new Map<string, string>()
let gameData = {} as GameData;
let usersData = {} as Map<string, PlacedChip[]>;
let wins = [] as Winner[];
let incomes = [] as income[];
let balances = [] as balance[];
timer.addEventListener('secondsUpdated', function (e: any) {
  var currentSeconds = timer.getTimeValues().seconds;
  gameData.time_remaining = currentSeconds
  
  if (currentSeconds == 1) {
    console.log("Place bet");
    usersData = new Map()
    gameData.stage = GameStages.PLACE_BET
    wins = []
    sendStageEvent(gameData)
  } else if (currentSeconds == 25) {
    gameData.stage = GameStages.NO_MORE_BETS
    gameData.value = getRandomNumberInt(0, 36);
    console.log("No More Bets")
    sendStageEvent(gameData)

    for(let key of Array.from( usersData.keys()) ) {
      var username = users.get(key);

      if (username != undefined) {
        var chipsPlaced = usersData.get(key) as PlacedChip[]

        var i = 0;
        var bettedSum = 0;

        for(i = 0; i < chipsPlaced.length; i++){
          bettedSum += chipsPlaced[i].sum;
        }

        var sumWon = calculateWinnings(gameData.value, chipsPlaced)
        wins.push({
            username: username,
            sum: sumWon
        });

        for(i = 0; i < balances.length; i++ )
        {
          if(balances[i].username == username){
            balances[i].value += (sumWon - bettedSum);
            updateRow(username, balances[i].value);
          }
        }
      }
    }

  } else if (currentSeconds == 35) {
    console.log("Winners")
    gameData.stage = GameStages.WINNERS
    // sort winners desc
    if (gameData.history == undefined) {
      gameData.history = []
    } 
    gameData.history.push(gameData.value)

    if (gameData.history.length > 10) {
      gameData.history.shift();
    }
    gameData.wins = wins.sort((a,b) => b.sum - a.sum);
    gameData.balances = balances;
    sendStageEvent(gameData)
  }

});

io.on("connection", (socket) => {
  
  socket.on('enter', (data: string) => {
    var existed = false;
    users.set(socket.id, data);
    var db_row = getRow(data);
    var i = 0;
    if(db_row == undefined){
      return;
    }
    if(balances.length > 0){
      for( i = 0; i < balances.length; i++ ){
        if(balances[i].username == data){
          existed = true;
        }
      }
    }
    if( !existed ){
      balances.push({
        username: db_row['walletId'],
        value: parseInt(db_row['balance'])
      })
    }
    
    gameData.balances = balances;
    sendStageEvent(gameData);
  });

  socket.on('place-bet', (data: string) => {
    var chipData = JSON.parse(data) as PlacedChip[]
    usersData.set(socket.id, chipData)
  });
  socket.on('deposit', (name: string, data: number) => {
    var i = 0;
    for( i = 0; i < balances.length; i++ ){
      if(balances[i].username == name){
        balances[i].value += data;
      }
    }
    deposit(name, data);
    gameData.balances = balances;
  });
  socket.on('refund', (name: string) => {
    var i = 0;
    for( i = 0; i < balances.length; i++ ){
      if(balances[i].username == name){
        balances[i].value = 0;
      }
    }
    refund(name);
    gameData.balances = balances;
  });
  socket.on("disconnect", (reason) => {
    users.delete(socket.id);
    usersData.delete(socket.id);
  });
});

httpServer.listen(3306, () =>{

  console.log(`Server is running on port 3306`);
  
  timer.start({precision: 'seconds'});
});

// app.listen(3306, () => {
//   console.log(`Server1 is running on port 3306`);
  
//   timer.start({precision: 'seconds'});
// });

function getRandomNumberInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendStageEvent(_gameData: GameData) { 
  var json = JSON.stringify(_gameData)
  console.log(json)
  io.emit('stage-change', json);
}

var blackNumbers = [ 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 29, 28, 31, 33, 35 ];
var redNumbers = [ 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36 ];

function calculateWinnings(winningNumber: number, placedChips: PlacedChip[]) { 
  var win = 0;
  var arrayLength = placedChips.length;
  for (var i = 0; i < arrayLength; i++) {
     
      var placedChip = placedChips[i]
      var placedChipType = placedChip.item.type
      var placedChipValue = placedChip.item.value;
      var placedChipSum = placedChip.sum
      var placedValueSplit = placedChip.item.valueSplit;
      
      if (placedChipType === ValueType.NUMBER &&  placedChipValue === winningNumber)
      {
          win += placedChipSum * 36;
      }
      else if (placedChipType === ValueType.DOUBLE_SPLIT &&  placedValueSplit !== undefined && placedValueSplit.indexOf(winningNumber) > -1)
      {
          win += placedChipSum * 17;
      }
      else if (placedChipType === ValueType.TRIPLE_SPLIT &&  placedValueSplit !== undefined && placedValueSplit.indexOf(winningNumber) > -1)
      {
          win += placedChipSum * 11;
      }
      else if (placedChipType === ValueType.QUAD_SPLIT &&  placedValueSplit !== undefined && placedValueSplit.indexOf(winningNumber) > -1)
      {
          win += placedChipSum * 8;
      }
      else if (placedChipType === ValueType.SIX_SPLIT &&  placedValueSplit !== undefined && placedValueSplit.indexOf(winningNumber) > -1)
      {
          win += placedChipSum * 5;
      }
      else if (placedChipType === ValueType.BLACK && blackNumbers.includes(winningNumber))
      { // if bet on black and win
          win += placedChipSum * 2;
      }
      else if (placedChipType === ValueType.RED && redNumbers.includes(winningNumber))
      { // if bet on red and win
          win += placedChipSum * 2;
      }
      else if (placedChipType === ValueType.NUMBERS_1_18 && (winningNumber >= 1 && winningNumber <= 18))
      { // if number is 1 to 18
          win += placedChipSum * 2;
      }
      else if (placedChipType === ValueType.NUMBERS_19_36 && (winningNumber >= 19 && winningNumber <= 36))
      { // if number is 19 to 36
          win += placedChipSum * 2;
      }
      else if (placedChipType === ValueType.NUMBERS_1_12 && (winningNumber >= 1 && winningNumber <= 12))
      { // if number is within range of row1
          win += placedChipSum * 3;
      }
      else if (placedChipType === ValueType.NUMBERS_2_12 && (winningNumber >= 13 && winningNumber <= 24))
      { // if number is within range of row2
          win += placedChipSum * 3;
      }
      else if (placedChipType === ValueType.NUMBERS_3_12 && (winningNumber >= 25 && winningNumber <= 36))
      { // if number is within range of row3
          win += placedChipSum * 3;
      }
      else if (placedChipType === ValueType.NUMBERS_1R_12 && ([3,6,9,12,15,18,21,24,27,30,33,36].indexOf(winningNumber) > -1))
      {
          win += placedChipSum * 3;
      }
      else if (placedChipType === ValueType.NUMBERS_2R_12 && ([2,5,8,11,14,17,20,23,26,29,32,35].indexOf(winningNumber) > -1))
      {
          win += placedChipSum * 3;
      }
      else if (placedChipType === ValueType.NUMBERS_3R_12 && ([1,4,7,10,13,16,19,22,25,28,31,34].indexOf(winningNumber) > -1))
      {
          win += placedChipSum * 3;
      }
      else if (placedChipType === ValueType.EVEN || placedChipType === ValueType.ODD)
      {
        if ( (winningNumber % 2 == 0 && placedChipType === ValueType.EVEN) || (winningNumber % 2 == 1 && placedChipType === ValueType.ODD) ) {
            win += placedChipSum * 2;
        }
      }
  }

  return win;
}