import { ethers } from "ethers";
import React, { useEffect, useState } from 'react';
import {
  Button, Card,
  CardBody,
  CardTitle,
  Col, Container, Form, FormGroup, Input, Label,
  Row
} from 'reactstrap';
import config from '../config';
import * as contractRoot from '../contracts/all.json';
;

declare global {
  interface Window {
      ethereum:any;
  }
}

function ContractExplorer(props) {

  const [activeTab, setActiveTab] = useState('');
  const [web3Provider, setWeb3Provider] = useState<ethers.providers.JsonRpcProvider>(null);
  const [metamaskProvider, setMetamaskProvider] = useState<ethers.providers.Web3Provider>(null);
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
    
    metamaskContract.on("TransferSingle", (sender, from, to, id, amount, eventInfo) => {
      setLogText("Token id " + id + " created.");
      setReceiptLink("https://rinkeby.etherscan.io/tx/" + eventInfo.transactionHash);
    });

    setReadOnlyContract(erc1155);
    setContract(metamaskContract);

    let contractOwner = await erc1155.owner();
    setContractOwner(contractOwner);

    let contractUri = await erc1155.contractURI();
    setContractUri(contractUri);

    setRefreshingContract(false);
  }

  useEffect(() => {

      // on first call, initialize web3Provider
      if (web3Provider === null)
        initializeProvider();
      
      if (refreshingContract)
      {
        refreshContract('EcoFiERC1155');
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
               
               " tokens for address " + parsedData["ownerMintAddress"] + "...");
    setReceiptLink(null);

    let result;

    

    try {

      const accounts = await metamaskProvider.send(
        'eth_requestAccounts', null
      );

      const signer = metamaskProvider.getSigner(accounts[0]);

      let data = {
        tokenId: 1,
        uri: 'Nekaj',
        supply: 1,
        creators: [
          {account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', value: 10000}
        ],
        royalties: [
          {account: parsedData["ownerMintAddress"], value: 10000}
        ]
      };

      const msgParams = JSON.stringify(data);

      var from = parsedData["ownerMintAddress"];

      var params = [from, msgParams];
      var method = 'eth_signTypedData_v4';

      const mm = await signer.signMessage(msgParams);
      //metamaskProvider

      console.log(mm);

      result = await contract.mintAndTransfer( {
        ...data,
        signatures: [
          mm
        ]
      },
      parsedData["ownerMintAddress"], 
      parsedData["quantity"]);
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
    const accounts = await metamaskProvider.send(
      'eth_requestAccounts', null
    );

    const signer = metamaskProvider.getSigner(accounts[0]);

    let data = {
      tokenId: 1,
      uri: 'Nekaj',
      supply: 1,
      creators: [
        {account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', value: 10000}
      ],
      royalties: [
        {account: parsedData["ownerMintAddress"], value: 10000}
      ]
    };

    const msgParams = JSON.stringify(data);

    const mm = await signer.signMessage(msgParams);
    
    let result = await contract.transferFromOrMint(
      {
        ...data,
        signatures: [
          mm
        ]
      },
      parsedData["userAddress"], 
      parsedData["recieverAddress"],
      1
    );
      
    setLogText("Balance of token id " + parsedData["tokenToCheck"] +
    " for address " + parsedData["userAddress"] + ": " + result);

  } catch (e) {
    console.log(e);
  }

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
      
      <Container fluid="true" key={props.contract}>
        
          <h5>Contract Name: {props.contract}</h5>
          
          <h6>Address: {contractRoot.contracts[props.contract].address}</h6>
          <h6>Owner: {contractOwner ? contractOwner : "Loading..."}</h6>
          <h6>URI: {contractUri ? contractUri : "Loading..."}</h6>
        
        <Row>
          {/* <Col sm="4">
          <Card>
          <CardBody>
            <CardTitle tag="h5">Create New Token</CardTitle>
          <Form onSubmit={handleCreateToken}>
            <FormGroup>
              <Label for="ownerAddressId">Owner Address</Label>
              <Input
              name="ownerAddress"
              id="ownerAddressId"
              placeholder="0x..."
            />
              <Label for="initialSupplyId">Initial Supply</Label>
           
              <Input
                type="number"
              name="initialSupply"
              id="initialSupplyId"
              placeholder="1"
            />
            </FormGroup>
            <Button disabled={inProgress}>Create Token</Button>
          </Form>
          </CardBody>
        </Card>
          </Col> */}
        
        

        <Col sm="4">
        <Card>
          <CardBody>
            <CardTitle tag="h5">Mint Token</CardTitle>
          
          <Form onSubmit={handleMintToken}>
            <FormGroup>
            
              <Label for="ownerMintAddressId">Owner Address</Label>
            
              <Input
              name="ownerMintAddress"
              id="ownerMintAddressId"
              placeholder="0x..."
              value="0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
            />
             
              {/* <Label for="tokenId">Token Id</Label>
             
              
              <Input
                type="number"
              name="token"
              id="tokenId"
              placeholder="1"
            /> */}
              <Label for="quantityId">Quantity</Label>
           
              <Input
                type="number"
              name="quantity"
              id="quantityId"
              placeholder="1"
              value="1"
            /></FormGroup>
            <Button disabled={inProgress}>Mint Token</Button>
            
          </Form>
          </CardBody>
        </Card>
        </Col>

        <Col sm="4">
        <Card>
          <CardBody>
          <CardTitle tag="h5">Check Token Balance</CardTitle>
          <Form onSubmit={handleCheckBalance}>
            <FormGroup>
            
              <Label for="userAddressId">User Address</Label>
            
              <Input
              name="userAddress"
              id="userAddressId"
              placeholder="0x..."
            />
              <Label for="tokenToCheckId">Token Id</Label>
            
              <Input
                type="number"
              name="tokenToCheck"
              id="tokenToCheckId"
              placeholder="0"
            />
            </FormGroup>
            <Button disabled={inProgress}>Check Balance</Button>
            
            
          </Form>
          </CardBody>
        </Card>
        </Col>

        <Col sm="4">
        <Card>
          <CardBody>
            <CardTitle tag="h5">Send token</CardTitle>
          
          <Form onSubmit={sendToken}>
            <FormGroup>
        
              <Label for="userAddressId">User Address</Label>
            
              <Input
              name="userAddress"
              id="userAddressId"
              placeholder="0x..."
              value="0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
            />
              <Label for="recieverAddressId">Reciever Address</Label>
            
              <Input
              name="recieverAddress"
              id="recieverAddressId"
              placeholder="0x..."
              value="0xdD2FD4581271e230360230F9337D5c0430Bf44C0"
            />
              <Label for="tokenToCheckId">Token Id</Label>
           
              <Input
                type="number"
              name="tokenToSend"
              id="tokenToCheckId"
              placeholder="0"
              value="1"
            />
              <Label for="amountToSendId">Amount</Label>
            
              <Input
                type="number"
              name="amountToSend"
              id="amountToSendId"
              placeholder="0"
              value="1"
            /></FormGroup>
            <Button disabled={inProgress}>Sent token</Button>
            
          </Form>
          </CardBody>
        </Card>
        </Col>
        <Col sm="4">
        <Card>
          <CardBody>
          <CardTitle tag="h5">Get Token Metadata</CardTitle>
          <Form onSubmit={handleGetMetadata}>
            <FormGroup>
            
              <Label for="metadataId">Token Id</Label>
            
              <Input
              name="metadata"
              id="metadataId"
              placeholder="0"
            />
            </FormGroup>
            <Button disabled={inProgress}>Get Metadata</Button>
          </Form>
          </CardBody>
        </Card>
        </Col>

        </Row>

        <Card>
          <h6>Log:</h6>
          {logText ? logText : ""}
          {
            receiptLink ?
            <a href={receiptLink}>Etherscan</a> : ""
          }
        </Card>

      </Container>
              
    </>
  );
}

export { ContractExplorer };
