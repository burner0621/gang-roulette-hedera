import React from "react";
import { useNavigate } from 'react-router-dom';
import Wheel from "./Wheel";
import Board from "./Board";
import { List, Progress } from '@mantine/core';
import { Item, PlacedChip, RouletteWrapperState, GameData, GameStages } from "./Global";
import { Timer } from "easytimer.js";
var classNames = require("classnames");
import { io } from "socket.io-client";
import { height } from "@mui/system";
import anime from "animejs";
import ProgressBarRound from "./ProgressBar";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postRequest } from "./assets/api/apiRequests";
import OutputIcon from '@mui/icons-material/Output';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import HowTo from './HowTo';

import './styles.css';


// var singleRotation = 0

// var r1 = singleRotation * 0 // 0
// var r2 = singleRotation * 2 // 19.45..

class RouletteWrapper extends React.Component<any, any> {

  rouletteWheelNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25,
    17, 34, 6, 27, 13, 36, 11,
    30, 8, 23, 10, 5, 24, 16, 33,
    1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26
  ];


  timer = new Timer();
  numberRef = React.createRef<HTMLInputElement>();
  state: RouletteWrapperState = {
    rouletteData: {
      numbers: this.rouletteWheelNumbers
    },
    chipsData: {
      selectedChip: null,
      placedChips: new Map()
    },
    number: {
      next: null
    },
    winners: [],
    history: [],
    stage: GameStages.NONE,
    username: "", 
    endTime: 0,
    progressCountdown: 0, 
    time_remaining: 0,
    depositBtnFlag: false,
    depositAmount: 0,
    depositedAmount: 0,
    incomes: [],
    balances: []
  };
  socketServer: any;
  animateProgress: any;

  blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 29, 28, 31, 33, 35];
  constructor(props: { username: string }) {
    super(props);

    this.onSpinClick = this.onSpinClick.bind(this);
    this.onChipClick = this.onChipClick.bind(this);
    this.getChipClasses = this.getChipClasses.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.placeBet = this.placeBet.bind(this);
    this.clearBet = this.clearBet.bind(this);
    this.onDepositClick = this.onDepositClick.bind(this);
    this.onRefundClick = this.onRefundClick.bind(this);
    this.onDepositeOkBtnClock = this.onDepositeOkBtnClock.bind(this);
    this.register = this.register.bind(this);
    this.getBalance = this.getBalance.bind(this);

    // show logs
    this.showLogs = this.showLogs.bind(this);

    // this.socketServer = io("http://94.131.105.114:8000");
    this.socketServer = io("http://localhost:8000");
  }

  componentDidMount() {

    this.register();

    this.socketServer.open();

    this.socketServer.on('stage-change', (data: string) => {
      console.log('State-Change Event: Occured');

      var gameData = JSON.parse(data) as GameData;
      this.setGameData(gameData)
      if( this.state.stage == GameStages.WINNERS - 1)
        this.clearBet();
    });

    this.socketServer.on("connect", (socket: { on: (arg0: string, arg1: (data: string) => void) => void; }) => {
      this.setState({ username: this.props.username }, () => {
        console.log('Enter Event: Occured');
        this.socketServer.emit("enter", this.state.username);
      });
    });
  }

  componentWillUnmount() {
    this.socketServer.close();
  }

  async register() {
    const data = { a: btoa(this.props.username) };
    // const _postResult = await postRequest("http://localhost:8000/register", data);
  }

  getBalance(gameData: GameData, name: string){
    console.log('This Wallet\'s Name: ', name);
    var balances = gameData.balances;
    if(balances.length > 0){
      var i = 0;
      for( i = 0; i < balances.length; i++ )
      {
        if( balances[i].username == name ){
          console.log('This Wallet\'s Balance: ', balances[i].value);
          return balances[i].value;
        }
      }
    } else {
      return 0;
    }
  }
  setGameData(gameData: GameData) {
    this.setState({ depositedAmount: this.getBalance(gameData, this.props.username) });
    console.log('depositedAmount: ', this.getBalance(gameData, this.props.username));

    if (gameData.stage === GameStages.NO_MORE_BETS) { // PLACE BET from 25 to 35
      var endTime = 35;
      var nextNumber = gameData.value
      this.setState({ endTime: endTime, progressCountdown: endTime - gameData.time_remaining, number: { next: nextNumber }, stage: gameData.stage, time_remaining: gameData.time_remaining });
    } else if (gameData.stage === GameStages.WINNERS) { // PLACE BET from 35 to 59
      var endTime = 59;
      if (gameData.wins.length > 0) {
        this.setState({ endTime: endTime, progressCountdown: endTime - gameData.time_remaining, winners: gameData.wins, stage: gameData.stage, time_remaining: gameData.time_remaining, history: gameData.history });
      } else {
        this.setState({ endTime: endTime, progressCountdown: endTime - gameData.time_remaining, stage: gameData.stage, time_remaining: gameData.time_remaining, history: gameData.history });
      }
    } else { // PLACE BET from 0 to 25
      var endTime = 25;
      
      this.setState({ endTime: endTime, progressCountdown: endTime - gameData.time_remaining, stage: gameData.stage, time_remaining: gameData.time_remaining });
    }
  }


  onDepositeModalClose() {
    this.setState({ depositBtnFlag: false });
  }

  async onDepositeOkBtnClock() {
    if(this.state.depositAmount > 0 ){
      this.setState({ depositBtnFlag: false });
      var result = await this.props.depositFunc(this.state.depositAmount);
      if(result['result'] == true){
        this.socketServer.emit("deposit", this.props.username, this.state.depositAmount);
        this.setState({depositedAmount: this.state.depositedAmount + this.state.depositAmount});
        toast.info("Deposited successfully. Now you can place bet.",{position: toast.POSITION.BOTTOM_CENTER});
      }
      else {
        toast.error("Depositing has been failed. Please try again.",{position: toast.POSITION.BOTTOM_CENTER});
      }
    }
    else
    toast.error("Amount maybe lower than zero or not correct.",{position: toast.POSITION.BOTTOM_CENTER});
  }

  amountChange = (event) => {
    // 👇 Get input value from "event"
    this.setState({depositAmount: parseFloat(event.target.value) })
  };

  onDepositClick() {
    this.setState({ depositBtnFlag: true });
  }

  async onRefundClick() {
    if(this.state.stage == GameStages.WINNERS)
    {
      const data = {
        a: btoa(this.props.username)
      }
      console.log('http://localhost:8000/refund');
      const _postResult = await postRequest("http://localhost:8000/refund", data);
 
      console.log(_postResult);

      if(!_postResult['result']){
        toast.error("Refund was failed. Please try again after a while.",{position: toast.POSITION.BOTTOM_CENTER});
      } else {
        this.socketServer.emit("refund", this.props.username);
        this.setState({depositedAmount: 0});

        toast.info("Successfully refunded to your wallet.",{position: toast.POSITION.BOTTOM_CENTER});
      }
    }
    else {
      toast.error("You can withdraw only in winners stage.",{position: toast.POSITION.BOTTOM_CENTER})
    }
  }

  onCellClick(item: Item) {
    if (this.state.stage !== GameStages.PLACE_BET) return;
    var currentChips = this.state.chipsData.placedChips;
    var currentChipIterator= currentChips.values()
    var placedSum = 0
    var curIteratorValue = currentChipIterator.next().value
    while (curIteratorValue !== undefined) {
      placedSum += curIteratorValue.sum
      curIteratorValue = currentChipIterator.next().value
    }
    var chipValue = this.state.chipsData.selectedChip;
    if (chipValue === 0 || chipValue === null || chipValue === undefined) {
      toast.error("You should select the chip.",{position: toast.POSITION.BOTTOM_CENTER});
      return;
    }
    if (placedSum + chipValue > 100) 
    {
      toast.error("Only 100 Hbar bet is allowed during beta testing.",{position: toast.POSITION.BOTTOM_CENTER});
      return;
    }
    let currentChip = {} as PlacedChip;
    currentChip.item = item;
    currentChip.sum = chipValue;

    if (currentChips.get(item) !== undefined) {
      currentChip.sum += currentChips.get(item).sum;
    }

    //console.log(currentChips[item]);
    currentChips.set(item, currentChip);
    this.setState({
      chipsData: {
        selectedChip: this.state.chipsData.selectedChip,
        placedChips: currentChips
      }
    });
  }
  onChipClick(chip: number | null) {
    if (chip != null) {
      this.setState({
        chipsData: {
          selectedChip: chip,
          placedChips: this.state.chipsData.placedChips
        }
      });
    }
  }

  getChipClasses(chip: number) {
    var cellClass = classNames({
      chip_selected: chip === this.state.chipsData.selectedChip,
      "chip-100": chip === 100,
      "chip-20": chip === 20,
      "chip-10": chip === 10,
      "chip-5": chip === 5
    });

    return cellClass;
  }
  onSpinClick() {
    var nextNumber = this.numberRef!.current!.value;
    if (nextNumber != null) {
      this.setState({ number: { next: nextNumber } });
    }
  }
  placeBet() {
    console.log('placeBet function');

    if( this.state.stage === GameStages.PLACE_BET){
      var sum = 0;
      var placedChipsMap = this.state.chipsData.placedChips
      var chips: PlacedChip[] = new Array()
      for (let key of Array.from(placedChipsMap.keys())) {
        var chipsPlaced = placedChipsMap.get(key) as PlacedChip
        chips.push(chipsPlaced);
      }

      var i = 0;
      for( i = 0; i < chips.length; i++ ){
        sum += chips[i].sum;
      }

      if( sum > this.state.depositedAmount ){
        toast.error("Insufficient balance error. Please deposit more.",{position: toast.POSITION.BOTTOM_CENTER});
      } else {
        axios({
          method: 'get',
          url: 'http://localhost:8000/placebet',
          responseType: 'json'
        })
        .then(function (response) {
          console.log("OOOOOOOOOOOOOOOOOOOO"+ response.data);
        });

        console.log('chips');
        console.log(chips);
        this.socketServer.emit("place-bet", JSON.stringify(chips));
        toast.info("Betted successfully! Amount:" + sum.toString(),{position: toast.POSITION.BOTTOM_CENTER});
      }
      
    }
    else {
      toast.error("You cannot place bet now. Please wait.",{position: toast.POSITION.BOTTOM_CENTER});
    }
  }

  clearBet() {
    this.setState({
      chipsData: {
        placedChips: new Map()
      }
    });
  }

  showLogs() {
    const navigate = useNavigate();
    navigate('/logs');
  }

  render() {
    return (
      
      <div className="MasterContainer">
           
           <div className="mobilecontainer">
<p className="withdrawarning">Withdrawals can only be made during <span style={{color:"rgb(215, 140, 35)", fontWeight:"900"}}>WINNERS</span> progress bar stage</p>
           <AppBar className='navbarDos' position="sticky" >
                <Container maxWidth="xl">
                    <Toolbar disableGutters> 
                        <Button  className="disconnect deposit2" style={{ marginRight: 20,marginTop: 20, minWidth: 150, minHeight:"50px" }} size="large" onClick={() => this.onDepositClick()} >Deposit</Button>
                        <Button  className="disconnect withdraw2" style={{ marginRight: 20, marginTop: 20, minWidth: 150, minHeight:"50px" }} size="large" onClick={this.onRefundClick}>Withdraw</Button>
                        <Button className="disconnect placeBet2" style={{marginRight: 20, marginTop: 20, minWidth: 150, minHeight:"50px" }} size="large" onClick={() => this.placeBet()} >Place Bet</Button>
                        <Button  className="disconnect clearBet2" style={{ marginRight: 20,marginTop: 20, minWidth: 150, minHeight:"50px" }} size="large" onClick={() => this.clearBet()} >Clear Bet</Button>
          
                    </Toolbar>
                </Container>
            </AppBar>
           </div>
        <div>
        
          <Modal
            open={this.state.depositBtnFlag}
            onClose={() => this.onDepositeModalClose()}
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Box className="GP-modal" >
              <Typography className="ModalTitle" id="modal-modal-title" >
                How much will you DEPOSIT?
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2, }}>
                <div>
                <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                  <InputLabel className="depositeamount" htmlFor="depositAmount">Amount</InputLabel>
                  <Input
                    id="depositAmount"
                    startAdornment={<InputAdornment  position="start">HBAR</InputAdornment>}
                    type="number"
                    onChange={this.amountChange}
                  />
                </FormControl>
                </div>
              </Typography>
              <Stack direction="row" spacing={2} style={{float: "right", marginTop:'2em', justifyContent: 'center', width:'100%'}}>
                <Button className="disconnect" variant="outlined" onClick={this.onDepositeOkBtnClock} style={{ minWidth: 150 }} >OK</Button>
                <Button className="disconnect" variant="contained" href="#contained-buttons" color="error" onClick={() => this.onDepositeModalClose()} style={{ minWidth: 150 }} >Cancel</Button>
              </Stack>
            </Box>
          </Modal>
          <div className="masterdisconnect">
          <div className={"disconnectBtnDiv hideElementsTest"}>
            <Button className="disconnect"
              variant="outlined" endIcon={<OutputIcon />}
              onClick={(event) => {
                this.props.disconnectWallet();
            }}
              >
              Disconnect
            </Button>
          </div>
          </div>
          <div className={"rouletteWheelWrapper"}>
<div className={"winnerHistory_mobile"}>
            <p className="winnerstittle_mobile">Winners</p>
              {
                this.state.history.map((entry, index) => {
                  if (entry === 0) {
                    return (<div className="green">{entry}</div>);
                  } else if (this.blackNumbers.includes(entry)) {
                    return (<div className="black">{entry}</div>);
                  } else {
                    return (<div className="red">{entry}</div>);
                  }
                })
              }
          </div>
    <div className={"balanceDos"} >Balance:&nbsp;<span style={{color: "#d78c23", fontSize:"1.2em", fontWeight:"700"}}>{this.state.depositedAmount}</span>&nbsp;<span style={{color: "#d78c23", fontSize:"1.2em", fontWeight:"700"}}>HBAR</span><img style={{maxWidth:"1.5em", borderRadius:"0.5em", marginLeft:"0.3em"}} alt="..." src="https://wallet.hashpack.app/assets/favicon/favicon.ico" ></img>
    </div> 
         
  <Wheel rouletteData={this.state.rouletteData} number={this.state.number} />
  <Board onCellClick={this.onCellClick} chipsData={this.state.chipsData} rouletteData={this.state.rouletteData}/>
  
  </div>
  <div className="roulette-actions hideElementsTest">
          <ul>

          <li style={{ display: "flex", alignItems: "center"}}>
            <Button  endIcon={<KeyboardArrowDownIcon/>} className="disconnect deposit" style={{ marginRight: 20,marginTop: 20, minWidth: 150, minHeight:"50px" }} size="large" onClick={() => this.onDepositClick()} >Deposit</Button>
            </li>
            <li style={{ display: "flex", alignItems: "center"}}>
              <Button endIcon={<KeyboardArrowUpIcon />} className="disconnect withdraw" style={{ marginRight: 20, marginTop: 20, minWidth: 150, minHeight:"50px" }} size="large" onClick={this.onRefundClick}>Withdraw</Button>
            </li>

          

            
            <div className={"chipfour"}>
            <p className="SelectChip" >Select Chip</p>
            <li className={"board-chip"}>
              <div
                key={"chip_100"}
                className={this.getChipClasses(100)}
                onClick={() => this.onChipClick(100)}
              >
                100
              </div>
            </li>
            <li className={"board-chip"}>
              <span key={"chip_20"}>
                <div
                  className={this.getChipClasses(20)}
                  onClick={() => this.onChipClick(20)}
                >
                  20
                </div>
              </span>
            </li>
            <li className={"board-chip"}>
              <span key={"chip_10"}>
                <div
                  className={this.getChipClasses(10)}
                  onClick={() => this.onChipClick(10)}
                >
                  10
                </div>
              </span>
            </li>
            <li className={"board-chip"}>
              <span key={"chip_5"}>
                <div
                  className={this.getChipClasses(5)}
                  onClick={() => this.onChipClick(5)}
                >
                  5
                </div>
              </span>
            </li>
            </div>

            <li style={{ display: "flex", alignItems: "center"}}>
              
              <Button endIcon={<TouchAppIcon/>} className="disconnect placeBet" style={{marginRight: 20, marginTop: 20, minWidth: 150, minHeight:"50px" }} size="large" onClick={() => this.placeBet()} >Place Bet</Button>
            </li>
            <li style={{ display: "flex", alignItems: "center"}}>
              <Button endIcon={<DeleteOutlineIcon/>} className="disconnect clearBet" style={{ marginRight: 20,marginTop: 20, minWidth: 150, minHeight:"50px" }} size="large" onClick={() => this.clearBet()} >Clear Bet</Button>
            </li>
            
            <li style={{ display: "flex", alignItems: "center"}}>
              <Button endIcon={<DeleteOutlineIcon/>} className="disconnect clearBet" style={{ marginRight: 20,marginTop: 20, minWidth: 150, minHeight:"50px" }} size="large" onClick={() => this.showLogs()} >Logs</Button>
            </li>

          </ul>
        </div>
<div className="winnersResults">
<p className="withdrawarning">Withdrawals can only be made during <span style={{color:"rgb(215, 140, 35)", fontWeight:"900"}}>WINNERS</span> progress bar stage</p>
<HowTo />
  <div className={"winnersBoard"}>
    <div className={"winnerItemHeader hideElementsTest"} >Plays</div>
    <div>
      {
        this.state.winners.map((entry, index) => {
          return (<div className="winnerItem">{index + 1}. {entry.username} : {entry.sum} HBAR</div>);
        })
      }
    </div>
    
  </div>
  <div className={"progressBar hideElementsTest"}>
  <div className={"balance"} >Balance:&nbsp;<span style={{color: "#d78c23", fontSize:"1.2em", fontWeight:"700"}}>{this.state.depositedAmount}</span>&nbsp;<span style={{color: "#d78c23", fontSize:"1.2em", fontWeight:"700"}}>HBAR</span><img style={{maxWidth:"1.5em", borderRadius:"0.5em", marginLeft:"0.3em"}} alt="..." src="https://wallet.hashpack.app/assets/favicon/favicon.ico" ></img></div>
          <ProgressBarRound stage={this.state.stage} maxDuration={this.state.endTime} currentDuration={this.state.time_remaining} />
          
        </div>
        
  <div className={"winnersBoard"}>
    
  <div className={"winnerItemHeader hideElementsTest"} >Winner Numbers</div>
    <div className={"winnerHistory hideElementsTest"}>
      {
        this.state.history.map((entry, index) => {
          if (entry === 0) {
            return (<div className="green">{entry}</div>);
          } else if (this.blackNumbers.includes(entry)) {
            return (<div className="black">{entry}</div>);
          } else {
            return (<div className="red">{entry}</div>);
          }
        })
      }
    </div>
    
  </div>

</div>

<p style={{
                position:"absolute", 
                width:"100%", whiteSpace:"nowrap", 
                fontSize:"0.8em", color:"black", 
                justifyItems:"center",
                display:"flex",
                flexDirection:"row",
                bottom:"-30%",
                justifyContent:"center",
                zIndex:"1000",
                textAlign:"center",
                left:"0%",
                right:"0%"}}>Gangsters Paradise | Casino Roulette 2023. All Rights Reserved ©.</p>
        </div>
        
        {/* <div>
        <h2>Updated: {this.state.number.next}</h2>
          <input className={"number"} ref={this.numberRef} />
          <button className={"spin"} onClick={this.onSpinClick}>
            Spin
          </button>
        </div> */}
        
      
      </div>
    );
  }
}

export default RouletteWrapper;
