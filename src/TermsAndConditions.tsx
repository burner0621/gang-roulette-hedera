import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useEffect, useState } from "react";
import InfoIcon from '@mui/icons-material/Info';

import DepositTutorial from './assets/TutorialDeposit.svg'

import './styles.css';


export default function BasicModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [displayPopUp, setDisplayPopUp] = useState(true);
  const closePopUp = () => {
    // setting key "seenPopUp" with value true into localStorage
    localStorage.setItem("seenPopUp", "true");
    // setting state to false to not display pop-up
    setDisplayPopUp(false);
  };

  // the useEffect to trigger on first render and check if in the localStorage we already have data about user seen and closed the pop-up
  useEffect(() => {
    // getting value of "seenPopUp" key from localStorage
    let returningUser = localStorage.getItem("seenPopUp");
    // if it's not there, for a new user, it will be null
    // if it's there it will be boolean true
    // setting the opposite to state, false for returning user, true for a new user
    setDisplayPopUp(!returningUser);
  }, []);

  return (
    <>
      <div>
{/* conditional rendering, if displayPopUp is truthy we will show the modal */}
        {displayPopUp && (
          <Modal
            open={true}
// once pop-up will close "closePopUp" function will be executed
            onClose={closePopUp}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
{/* in the line below we pass our custom styles object to the modal via 'sx' prop*/}
            <div className='rouletteText terms' >

{/* what user will see in the modal is defined below */}
              <h1>Terms and Conditions</h1>
              <ol style={{color:"lightgray", 
              textAlign:"start",
              backgroundColor:"#00000080",
              borderRadius:"0.5em", 
              paddingLeft:"0.5em",
              paddingRight:"0.5em", 
              marginBottom:"3em",
              fontWeight:"300", 
              maxWidth:"70%",
              height:"15em",
              overflow:"auto",
              }}><li className='termsText'>ELIGIBILITY TO USE HBAR ROULETTE’s SERVICES:</li>
              <li style={{display:"flex"}}>1.1 You may participate in any of the Games if and only if:</li>
              <li style={{display:"flex"}}>1.1.1 You are over eighteen (18) years of age or such higher minimum legal age of majority as stipulated in the jurisdiction of Your residence; and</li>
              <li style={{display:"flex"}}>1.1.2 It is legal for You to participate in the Games according to applicable laws in the jurisdiction of your residence.</li>
              <li style={{display:"flex",marginBottom:"1em"}}>1.2 It is entirely and solely Your responsibility to enquire and ensure that You do not breach laws applicable to you by participating in the Games.</li>
              <li className='termsText'>YOUR OBLIGATIONS AS A PLAYER:</li>
              <li style={{display:"flex"}}>2.1 You hereby declare and warrant that:</li>
              <li style={{display:"flex"}}>2.1.1 You are over 18 years of age or such higher minimum legal age of majority as stipulated if the jurisdiction of Your residence (e.g. Estonia – 21 years) and, under the laws applicable to You, legally allowed to participate in the Games offered on the Website.</li>
              <li style={{display:"flex"}}>2.1.2 You participate in the Games strictly in your personal non-professional capacity for recreational and entertainment reasons only;</li>
              <li style={{display:"flex"}}>2.1.3 You participate in the Games on your own behalf and not on behalf of any other person;</li>
              <li style={{display:"flex"}}>2.1.4 All information that You provide to Gangsters Paradise during the term of validity of this agreement is true, complete, and correct, and that You shall immediately notify Gangsters Paradise of any change of such information;</li>
              <li style={{display:"flex"}}>2.1.5 You are solely responsible for reporting and accounting for any taxes applicable to You under relevant laws for any winnings that You receive from Gangsters Paradise;</li>
              <li style={{display:"flex"}}>2.1.6 You understand that by participating in the Games you take the risk of losing Virtual Funds deposited into Your Member Account;</li>
              <li style={{display:"flex"}}>2.1.7 You shall not be involved in any fraudulent, collusive, fixing or other unlawful activity in relation to Your or third parties’ participation in any of the Games and shall not use any software-assisted methods or techniques or hardware devices for Your participation in any of the Games. Gangsters Paradise hereby reserves the right to invalidate any wager in the event of such behaviour;</li>
              <li style={{display:"flex"}}>2.1.8 You understand that Virtual Funds as Bitcoin are not considered a legal currency or tender and as such on the Website they are treated as virtual funds with no intrinsic value.
2.1.9 You understand that HBAR value can change dramatically depending on the market value.</li>
              <li style={{display:"flex"}}>2.1.9 You understand that HBAR value can change dramatically depending on the market value.</li>
              <li style={{display:"flex"}}>2.1.10 You are not allowed to use any payment methods that belong to a Third party or person. If we determine during the security checks that you have violated this condition, your winnings will be confiscated and the original deposit will be returned to the owner of the payment account. The Company is not responsible for the lost funds deposited from third party accounts.</li>
              <li style={{display:"flex"}}>2.2 You are not allowed to transfer Virtual Funds from your Account to other players or to receive Virtual Funds from other players into your Account, or to transfer, sell and/or acquire, user accounts.</li>
              <li style={{display:"flex"}}>2.3 Games played on Our site should be played in the same manner as games played in any other setting. This means that players should be courteous to each other and avoid rude or obscene comments.</li>
              <li style={{display:"flex"}}>2.4 Some circumstances may arise where a wager is confirmed, or a payment is performed, by us in error. In all these cases Gangsters Paradise reserves the right to cancel all the wagers accepted containing such an error, or to correct the mistake made re-settling all the wagers at the correct prices/spreads/terms that should have been available at the time that the wager was placed in the absence of the error.</li>
              <li style={{display:"flex"}}>2.5 Should the user become aware of possible errors or incompleteness in the software, he/she agrees to refrain from taking advantage of them. Moreover, the user agrees to report any error or incompleteness immediately to Gangsters Paradise. Should the user fail to fulfil the obligations stated in this clause, Gangsters Paradise has a right to full compensation for all costs related to the error or incompleteness, including any costs incurred in association with the respective error/incompleteness and the failed notification by the user.</li>
              <li style={{display:"flex"}}>2.6 In the event a game is started but miscarries because of website.</li>
              <li style={{display:"flex",marginBottom:"1em"}}>2.7 We exclaim any liability for loss of funds resulting from errors, bugs, hacks,  </li>
              <li className='termsText'>BREACHES, PENALTIES AND TERMINATION:</li>
              <li style={{display:"flex"}}>2.8 If You breach any provision of these T&C or Gangsters Paradise has a reasonable ground to suspect that You have breached them, Gangsters Paradise reserves the right not to open, suspend, close Your Member Account, withhold payment of your winnings and apply such funds on account of any damages due by You.</li>
              <li style={{display:"flex"}}>2.9 You acknowledge that Gangsters Paradise shall be the final decision-maker of whether you have violated Gangsters Paradise rules, terms or conditions in a manner that results in your suspension or permanent barring from participation in our site.</li>
              </ol>
              <p style={{opacity:"0.8"}}>By clicking the "I ACCEPT button you will accept the Terms & Conditions.</p>
              <button  className='disconnect terms' onClick={closePopUp}>I ACCEPT</button>
            </div>
          </Modal>
        )}
      </div>

    </>
  );
}