import { ethers } from "ethers";
import React, { Fragment, useEffect, useState } from 'react';
import { Card } from 'reactstrap';
import config from '../config';
import * as contractRoot from '../contracts/all.json';

declare global {
  interface Window {
      ethereum:any;
  }
}

function ContractExcExplorer(props) {

  const [activeTab, setActiveTab] = useState('');
  const [web3Provider, setWeb3Provider] = useState(null);
  const [metamaskProvider, setMetamaskProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [readOnlyContract, setReadOnlyContract] = useState(null);
  const [refreshingContract, setRefreshingContract] = useState(false);
  const [contractOwner, setContractOwner] = useState(null);
  const [contractUri, setContractUri] = useState(null);

  const [logText, setLogText] = useState(null);
  const [receiptLink, setReceiptLink] = useState(null);

  const [inProgress, setInProgress] = useState(false);

  const toggle = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  }

  const initializeProvider = () => {

    // display contractRoot
    console.log(contractRoot);

    // initialize provider depending on network
      Object.keys(contractRoot).map(async network => {
        let networkName = contractRoot[network].name;
        
        switch (networkName) {
          case "rinkeby":
            let rinkebyProvider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/" + config.infuraKey);
            let metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
            setWeb3Provider(rinkebyProvider);
            setMetamaskProvider(metamaskProvider);
            setRefreshingContract(true);
          break;
          case "localhost":
            let localProvider = new ethers.providers.JsonRpcProvider();
            let metamaskProvider1 = new ethers.providers.Web3Provider(window.ethereum);
            setWeb3Provider(localProvider);
            setMetamaskProvider(metamaskProvider1);
            setRefreshingContract(true);
            /* const addr = await metamaskProvider1.send('eth_requestAccounts', []);
            console.log(addr); */
          break;
        }
        })
  }

  const refreshContract = async (name: string) => {

    let contractAddress, contractAbi, erc1155, metamaskContract;

    //Object.keys(contractRoot.contracts).map(contractName => {
      contractAddress = contractRoot.contracts[name].address;
      contractAbi = contractRoot.contracts[name].abi;
    //})

    await window.ethereum.enable()
    erc1155 = new ethers.Contract(contractAddress, contractAbi, web3Provider);
    metamaskContract = new ethers.Contract(contractAddress, contractAbi, metamaskProvider.getSigner());
    

    setReadOnlyContract(erc1155);
    setContract(metamaskContract);

    let contractOwner = await erc1155.owner();
    setContractOwner(contractOwner);


    setRefreshingContract(false);
  }

  useEffect(() => {

      // on first call, initialize web3Provider
      if (web3Provider === null)
        initializeProvider();
      
      if (refreshingContract)
      {
        refreshContract('EcoFiExchangeV2');
      }
    }, [refreshingContract]);

  const handleCreateToken = async (event) =>
  {
    event.preventDefault(); 
    setInProgress(true);
    const form = event.target;
    const data = new FormData(form);
    let parsedData:any = {};
    for (const [name,value] of data) {
      parsedData[name] = value;
    }

    setLogText("Creating " + parsedData["initialSupply"] + 
               " tokens for address " + parsedData["ownerAddress"] + "...");
    setReceiptLink(null);

    let result;

    try {
    result = await contract.create(
          parsedData["ownerAddress"], 
          parsedData["initialSupply"],
          "", []);
    } catch (e) {
      result = e;
    }

    try {
    setLogText(result.message.toString());
    } catch (e) {}
    setInProgress(false);

  }

  const handleMintToken = async (event) => {
    event.preventDefault(); 
    setInProgress(true);
    const form = event.target;
    const data = new FormData(form);
    let parsedData:any = {};
    for (const [name,value] of data) {
      parsedData[name] = value;
    }

    setLogText("Minting " + parsedData["quantity"] + 
               " of token id " + parsedData["token"] +
               " for address " + parsedData["ownerMintAddress"] + "...");
    setReceiptLink(null);

    let result;

    try {
    result = await contract.mint(
          parsedData["ownerMintAddress"], 
          parsedData["token"],
          parsedData["quantity"],
          []);
    } catch (e) {
      result = e;
    }

    try {
    setLogText(result.message.toString());
    } catch (e) {}
    setInProgress(false);
               
  }

const handleCheckBalance = async (event) => {
  event.preventDefault(); 
  setInProgress(true);
  const form = event.target;
  const data = new FormData(form);
  let parsedData:any = {};
  for (const [name,value] of data) {
    parsedData[name] = value;
  }

  setLogText("Checking balance of token id " + parsedData["tokenToCheck"] +
             " for address " + parsedData["userAddress"] + "...");
  setReceiptLink(null);

  try {

    let result = await readOnlyContract.balanceOf(parsedData["userAddress"], parsedData["tokenToCheck"]);

    setLogText("Balance of token id " + parsedData["tokenToCheck"] +
    " for address " + parsedData["userAddress"] + ": " + result);

  } catch (e) {}

  setInProgress(false);
}

const sendToken = async (event) => {
  event.preventDefault(); 
  setInProgress(true);
  const form = event.target;
  const data = new FormData(form);
  let parsedData:any = {};
  for (const [name,value] of data) {
    parsedData[name] = value;
  }

  setLogText("Send " + parsedData["amountToSend"] + " tokens with id " + parsedData["tokenToSend"] +
             " for address " + parsedData["userAddress"] + " to address " + parsedData["recieverAddress"] + "...");
  setReceiptLink(null);

  try {
    
    let result = await contract.safeTransferFrom(
        parsedData["userAddress"], 
        parsedData["recieverAddress"], 
        parsedData["tokenToSend"],
        parsedData["amountToSend"],
        []
      );
      
    setLogText("Balance of token id " + parsedData["tokenToCheck"] +
    " for address " + parsedData["userAddress"] + ": " + result);

  } catch (e) {}

  setInProgress(false);
}

const handleGetMetadata = async (event) => {
  event.preventDefault(); 
  setInProgress(true);
  const form = event.target;
  const data = new FormData(form);
  let parsedData:any = {};
  for (const [name,value] of data) {
    parsedData[name] = value;
  }

  setLogText("Getting metadata of token id " + parsedData["metadata"] + "...");
  setReceiptLink(null);

  try {
    
    let result = await readOnlyContract.uri(parsedData["metadata"]);
    // let metadata = await (await fetch(result)).json();

    setLogText("uri: " + result + " --- ");

  } catch (e) {}

  setInProgress(false);
}


  return (
    <>
    
      <Fragment key={props.contract}>
        <h5>Contract Name: {props.contract}</h5>
        <h6>Address: {contractRoot.contracts[props.contract].address}</h6>
        <h6>Owner: {contractOwner ? contractOwner : "Loading..."}</h6>

        <Card>
          <h6>Log:</h6>
          {logText ? logText : ""}
          {
            receiptLink ?
            <a href={receiptLink}>Etherscan</a> : ""
          }
        </Card>

      </Fragment>
            
    </>
  );
}

export { ContractExcExplorer };
