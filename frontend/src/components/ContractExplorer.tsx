import { BigNumber, ethers } from "ethers";
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

  const [tokenImage, setTokenImage] = useState(null);
  const [receiptLink, setReceiptLink] = useState(null);

  const [inProgress, setInProgress] = useState(false);

  // froms
  const [mintOwnerAddress, setMintOwnerAddress] = useState('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
  const [mintQuantity, setMintQuantity] = useState('10');
  const [mintSupply, setMintSupply] = useState('10');
  const [mintId, setMintId] = useState('1');

  const [sendOwnerAddress, setSendOwnerAddress] = useState('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const [sendRecieverAddress, setSendRecieverAddress] = useState('0xdD2FD4581271e230360230F9337D5c0430Bf44C0');
  const [sendId, setSendId] = useState('1');
  const [sendAmount, setSendAmount] = useState('1');

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
      // setReceiptLink("https://rinkeby.etherscan.io/tx/" + eventInfo.transactionHash);
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

  /* const handleCreateToken = async (event) =>
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

  } */

  const handleMintToken = async (event) => {
    event.preventDefault(); 
    setInProgress(true);

    setLogText(`Minting ${mintQuantity} tokens for address ${mintOwnerAddress}...`);
    setReceiptLink(null);

    let result;

    try {

      const accounts = await metamaskProvider.send(
        'eth_requestAccounts', null
      );

      const signer = metamaskProvider.getSigner(accounts[0]);
      const id = BigNumber.from('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266').toHexString();
      console.log(BigNumber.from('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266').toHexString());
      console.log(BigNumber.from(mintOwnerAddress).shl(96).toHexString());
      console.log(BigNumber.from('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266').shr(96).toHexString());
      //console.log(ethers.utils.formatBytes32String('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' + BigNumber.from(mintId).sh()));

      let data = {
        tokenId: BigNumber.from(mintOwnerAddress).shl(96).add(mintId).toHexString(),
        uri: 'Nekaj',
        supply: mintSupply,
        creators: [
          {account: mintOwnerAddress, value: 10000}
        ],
        royalties: [
          {account: mintOwnerAddress, value: 1000}
        ]
      };

      const msgParams = JSON.stringify(data);

      const mm = await signer.signMessage(msgParams);

      result = await contract.mintWithImage( {
        ...data,
        signatures: [
          mm
        ]
      },
      '', 
      //'data:image/jpeg;base64,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',
      //'data:image/jpeg;base64,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',
      mintOwnerAddress, 
      mintQuantity);

      // const allow = await contract.
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


  setLogText(`Send ${sendAmount} tokens with id ${sendId} from address ${sendOwnerAddress} to address ${sendRecieverAddress}...`);
  setReceiptLink(null);

  try {
    const accounts = await metamaskProvider.send(
      'eth_requestAccounts', null
    );

    const signer = metamaskProvider.getSigner(accounts[0]);

    let data = {
      tokenId: sendId,
      uri: 'Nekaj',
      supply: sendAmount,
      creators: [
        {account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', value: 10000}
      ],
      royalties: [
        {account: sendOwnerAddress, value: 10000}
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
      sendOwnerAddress, 
      sendRecieverAddress,
      sendAmount
    );
      
    setLogText(`Result: ${result}`);

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
    let resultI = await readOnlyContract.image(parsedData["metadata"]);
    setTokenImage(`${resultI}`);
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
              value={mintOwnerAddress}
              onChange={(e)=>setMintOwnerAddress(e.target.value)}
            />
             
              <Label for="quantityId">Quantity</Label>
           
              <Input
                type="number"
                name="quantity"
                id="quantityId"
                placeholder="1"
                value={mintQuantity}
                onChange={(e)=>setMintQuantity(e.target.value)}
              />

              <Label for="supplyId">Supply</Label>
           
              <Input
                type="number"
                name="supply"
                id="supplyId"
                placeholder="1"
                value={mintSupply}
                onChange={(e)=>setMintSupply(e.target.value)}
              />

              <Label for="tokenidId">TokenId</Label>
           
              <Input
                type="number"
                name="tokenid"
                id="tokenidId"
                placeholder="1"
                value={mintId}
                onChange={(e)=>setMintId(e.target.value)}
              />
            </FormGroup>
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
              value={sendOwnerAddress}
              onChange={(e)=>setSendOwnerAddress(e.target.value)}
            />
              <Label for="recieverAddressId">Reciever Address</Label>
            
              <Input
              name="recieverAddress"
              id="recieverAddressId"
              placeholder="0x..."
              value={sendRecieverAddress}
              onChange={(e)=>setSendRecieverAddress(e.target.value)}
            />
              <Label for="tokenToCheckId">Token Id</Label>
           
              <Input
                type="number"
              name="tokenToSend"
              id="tokenToCheckId"
              placeholder="0"
              value={sendId}
              onChange={(e)=>setSendId(e.target.value)}
            />
              <Label for="amountToSendId">Amount</Label>
            
              <Input
                type="number"
              name="amountToSend"
              id="amountToSendId"
              placeholder="0"
              value={sendAmount}
              onChange={(e)=>setSendAmount(e.target.value)}
            />
            </FormGroup>
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
          {tokenImage && 
          <img width="150" src={tokenImage}></img>
          }
        </Card>

      </Container>
              
    </>
  );
}

export { ContractExplorer };
