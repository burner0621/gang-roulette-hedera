import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import InfoIcon from '@mui/icons-material/Info';
import CellTutorial from './assets/celltut.mp4';
import DepositTutorial from './assets/TutorialDeposit.svg'
import SelectChip from './assets/SelectChip.gif'
import './styles.css';
import SingleBet from '../src/assets/SingleBet.gif';
import DoubleBet from '../src/assets/DoubleBet.gif';
import TripleBet from '../src/assets/TripleBet.gif';
import QuadBet from '../src/assets/QuadBet.gif';

export default function BasicModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button className='disconnect modalCancel' onClick={handleOpen}>How to Play<InfoIcon sx={{marginLeft:"0.3em"}} fontSize="small"/></Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className='rouletteText'>
        <ol style={{paddingInlineStart:"1em"}}>
            <h2  className='ModalTitle'  >How to play GANGSTERS PARADISE CASINO ROULETTE?</h2>
             <li className='Li' >

                            <p className='tutorialp'>
                              Be sure to have enough amount of HBAR in your wallet to place a bet. You can Deposit any time.</p>
                              <img className='chipselection'  src={DepositTutorial} alt='TutorialDeposit' /></li>

              <li className='Li'>

                            <p className='tutorialp'>Select a Chip corresponding to the amount you want to bet and place it in the position you like on the table.</p>
                           <img className='chipselection'  src={SelectChip} alt='selectchip' />
                             </li>

              <li className='Li'>

                            <p className='tutorialp'>Place the chip in the desired number you like to bet. There are Single, Double, Triple and Quad bets.</p>
                            <div className='chipselection'>
                            <div className='divimgbet'><img className='imgbet'  src={SingleBet} alt='TutorialBetting' /><p  className='cellbettext' >Single Bet</p></div>
                            <div className='divimgbet'><img className='imgbet' src={DoubleBet} alt='TutorialBetting' /><p className='cellbettext' >Double Bet</p></div>
                            <div className='divimgbet'><img className='imgbet' src={TripleBet} alt='TutorialBetting' /><p className='cellbettext'>Triple Bet</p></div>
                            <div className='divimgbet'><img style={{height:"5em", width:"100%", maxWidth:"none", backgroundColor:"black", borderRadius:"0.5em"}} src={QuadBet} alt='TutorialBetting' /><p className='cellbettext'>Quad Bet</p></div>
                            </div>
                            
                            </li>
              
              <li className='Li'><p className='tutorialp'>Click "Place Bet" button and test your Gangster Luck!</p></li>
            </ol>
            
        </div>
        
      </Modal>
      
    </div>
  );
}