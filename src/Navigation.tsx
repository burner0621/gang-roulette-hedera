import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import gp_logo from "../src/assets/GP_Logo.png"


import "./styles.css";









function ResponsiveAppBar() {
  
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  

  return (
    <AppBar className='navbar' position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters> 
          <img src={gp_logo} alt="logo"></img>
          <div >
          
          </div>
       
          
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
