import { StrictMode } from "react";
import { useInputState } from "@mantine/hooks";
import { Button, TextInput } from "@mantine/core";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import RouletteWrapper from "./RouletteWrapper";
import Modal from '@mui/material/Modal';
import NavBar from "./Navigation"
import HashConnectProvider from "./assets/api/HashConnectAPIProvider";
import { HashConnect } from "hashconnect";
import HashPackConnectModal from "./components/HashPackConnectModal";
import { useHashConnect } from "./assets/api/HashConnectAPIProvider";
import ScanQR from "./assets/HandScanning.png"
import QRCode from 'react-qr-code';

import "./styles.css";

import { postRequest } from "./assets/api/apiRequests";

import { ToastContainer } from "react-toastify";

import * as env from "./env";

const rootElement = document.getElementById("app") as HTMLElement;
const root = createRoot(rootElement);
const hashConnect = new HashConnect(true);

function App()
{
  const [stringValue, setStringValue] = useState("");
  const [usernameValue, setUsernameValue] = useState("");
  const [walletConnectModalViewFlag, setWalletConnectModalViewFlag] = useState(false);
  const { walletData, installedExtensions, connect, disconnect } = useHashConnect();
  const { accountIds } = walletData;

  const { sendHbarToTreasury } = useHashConnect();

  const deposit = async(hbarAmount) => {
    console.log ('hbarAmount: ' + hbarAmount);

    const _approveResult = await sendHbarToTreasury(hbarAmount);

    if (!_approveResult){
      alert("something went wrong with approve!");
      return false;
    }

    const data = {
      a: btoa(accountIds[0]),
      b: btoa(hbarAmount)
    }

    console.log ("aaaaaaaaaaaaaaaa", data)

    const _postResult = await postRequest(env.SERVER_URL + "/sendHbarToTreasury", data);

    return _postResult;
  }

  const onClickWalletConnectModalClose = () => {
    setWalletConnectModalViewFlag(false);
  }

  const onClickDisconnectHashPack = () => {
    disconnect();
    setWalletConnectModalViewFlag(false);
  };

  const onClickCopyPairingStr = () => {
    navigator.clipboard.writeText(walletData.pairingString);
  };

  const onClickConnectHashPack = () => {
    console.log("onClickConnectHashPack log - 1");

    //alert(installedExtensions);

    if (installedExtensions) {
      connect();
      setWalletConnectModalViewFlag(false);
      //      setPageStatus(PAGE_STATUS[0]);
    } else {
      alert(
        "Please install HashPack wallet extension first. from chrome web store."
      );
    }
  };

  const disconnectWallet = () => {
    setUsernameValue("");
    setWalletConnectModalViewFlag(true);
  }

  if (usernameValue === "") {
    return (
      <div className="masterlogin">
         <div className="scanqr"><img className="scanHand" src={ScanQR}></img></div>
        <div className="loginsplash" >
       
          </div>
          <div className={"auth-user"}>
        
      <QRCode className="QR-code" value="aabbcc"/>
      <Button
        className="loginbutton"
        onClick={(event) => {
            if(accountIds)
              setUsernameValue(accountIds[0]);
            else
              setUsernameValue("");
            setWalletConnectModalViewFlag(true);
        }}
      >
      {accountIds ? 'Play Game' : 'Connect Wallet'}
      </Button>
      
      <Modal 
        open={walletConnectModalViewFlag}
        onClose={() => onClickWalletConnectModalClose()}
        className="hashpack-connect-modal"
      >
        <HashPackConnectModal
                  pairingString={walletData.pairingString}
                  connectedAccount={accountIds}
                  onClickConnectHashPack={onClickConnectHashPack}
                  onClickCopyPairingStr={onClickCopyPairingStr}
                  onClickDisconnectHashPack={onClickDisconnectHashPack}
        />
      </Modal>
      
    </div></div>
      
    );
  } else {
    return <RouletteWrapper username={usernameValue} depositFunc = {deposit} disconnectWallet = {disconnectWallet}/>;
  }
}
export default App;
root.render(
  
  <HashConnectProvider hashConnect={hashConnect} debug>
    <ToastContainer autoClose={5000} draggableDirection="x" />
    <NavBar/>
    <App />
  </HashConnectProvider>
);
