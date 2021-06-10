import { recoverTypedSignature_v4 } from "eth-sig-util";
import { ethers } from "ethers";
import React, { Fragment, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row
} from "reactstrap";
import config from "../config";
import * as contractRoot from "../contracts/all.json";

const ETH_ASSET_CLASS = "0xaaaebeba";
const ERC20_ASSET_CLASS = "0x8ae85d84";
const ERC1155_ASSET_CLASS = "0x973bb640";
const ECO_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const SIG_BODY = {
  domain: {
    // Defining the chain aka Rinkeby testnet or Ethereum Main Net
    chainId: 1337,
    // Give a user friendly name to the specific contract you are signing for.
    name: "Exchange",
    // Just let's you know the latest version. Definitely make sure the field name is correct.
    version: "2",
    verifyingContract: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  },
  primaryType: "Order",
  types: {
    // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { type: "address", name: "verifyingContract" },
    ],
    Order: [
      { type: "address", name: "maker" },
      { type: "Asset", name: "makeAsset" },
      { type: "address", name: "taker" },
      { type: "Asset", name: "takeAsset" },
      { type: "uint256", name: "salt" },
      { type: "uint256", name: "start" },
      { type: "uint256", name: "end" },
      { type: "bytes4", name: "dataType" },
      { type: "bytes", name: "data" },
    ],
    Asset: [
      { type: "AssetType", name: "assetType" },
      { type: "uint256", name: "value" },
    ],
    AssetType: [
      { type: "bytes4", name: "assetClass" },
      { type: "bytes", name: "data" },
    ],
  },
};

declare global {
  interface Window {
    ethereum: any;
  }
}

function ContractExcExplorer(props) {
  const [web3Provider, setWeb3Provider] = useState(null);
  const [metamaskProvider, setMetamaskProvider] =
    useState<ethers.providers.Web3Provider>(null);
  const [contract, setContract] = useState(null);
  const [readOnlyContract, setReadOnlyContract] = useState(null);
  const [refreshingContract, setRefreshingContract] = useState(false);
  const [contractOwner, setContractOwner] = useState(null);

  const [logText, setLogText] = useState(null);
  const [receiptLink, setReceiptLink] = useState(null);

  const [inProgress, setInProgress] = useState(false);

  // forms
  const [sendOwnerAddress, setSendOwnerAddress] = useState(
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
  );
  const [sendRecieverAddress, setSendRecieverAddress] = useState(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  );
  const [sendId, setSendId] = useState("1");
  const [sendAmount, setSendAmount] = useState("1");

  const [sellSignature, setSellSignature] = useState("");
  const [sellOrder, setSellOrder] = useState(undefined);
  const [buySignature, setBuySignature] = useState("");
  const [buyOrder, setBuyOrder] = useState(undefined);

  const initializeProvider = () => {
    // display contractRoot
    // console.log(contractRoot);

    // initialize provider depending on network
    Object.keys(contractRoot).map(async (network) => {
      let networkName = contractRoot[network].name;

      switch (networkName) {
        case "rinkeby":
          let rinkebyProvider = new ethers.providers.JsonRpcProvider(
            "https://rinkeby.infura.io/v3/" + config.infuraKey
          );
          let metamaskProvider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          setWeb3Provider(rinkebyProvider);
          setMetamaskProvider(metamaskProvider);
          setRefreshingContract(true);
          break;
        case "localhost":
          let localProvider = new ethers.providers.JsonRpcProvider();
          let metamaskProvider1 = new ethers.providers.Web3Provider(
            window.ethereum
          );
          setWeb3Provider(localProvider);
          setMetamaskProvider(metamaskProvider1);
          setRefreshingContract(true);
          /* const addr = await metamaskProvider1.send('eth_requestAccounts', []);
            console.log(addr); */
          break;
      }
    });
  };

  const refreshContract = async (name: string) => {
    let contractAddress, contractAbi, erc1155, metamaskContract;

    //Object.keys(contractRoot.contracts).map(contractName => {
    contractAddress = contractRoot.contracts[name].address;
    contractAbi = contractRoot.contracts[name].abi;
    //})

    await window.ethereum.enable();
    erc1155 = new ethers.Contract(contractAddress, contractAbi, web3Provider);
    metamaskContract = new ethers.Contract(
      contractAddress,
      contractAbi,
      metamaskProvider.getSigner()
    );

    setReadOnlyContract(erc1155);
    setContract(metamaskContract);

    let contractOwner = await erc1155.owner();
    setContractOwner(contractOwner);

    setRefreshingContract(false);
  };

  useEffect(() => {
    // on first call, initialize web3Provider
    if (web3Provider === null) initializeProvider();

    if (refreshingContract) {
      refreshContract("EcoFiExchangeV2");
    }
  }, [refreshContract, refreshingContract, web3Provider]);

  const handleSellSig = async (event) => {
    event.preventDefault();
    setInProgress(true);

    let result;

    try {
      const accounts = await metamaskProvider.send("eth_requestAccounts", null);

      const signer = metamaskProvider.getSigner(accounts[0]);

      let order = {
        maker: sendOwnerAddress,
        makeAsset: {
          assetType: {
            assetClass: ERC1155_ASSET_CLASS,
            data: ethers.utils.defaultAbiCoder.encode(['address', 'uint'],[contractRoot.contracts['EcoFiERC1155'].address, 1])
          },
          value: 1,
        },
        taker: "0x0000000000000000000000000000000000000000",
        takeAsset: {
          assetType: {
            assetClass: ERC20_ASSET_CLASS,
            data: ethers.utils.defaultAbiCoder.encode(['address', 'uint'],[contractRoot.contracts['EcoFiToken'].address, 1]),
          },
          value: ethers.utils.defaultAbiCoder.encode(['uint256'],[2]),
        },
        salt: 1623305370620,
        start: 0,
        end: 1623305370620 + 1000 * 60 * 60 * 24 * 7,
        dataType: "0xffffffff",
        data: sendOwnerAddress,
      };

      const msgParams = JSON.stringify({
        ...SIG_BODY,
        message: order,
      });

      // const mm = await signer.signMessage(msgParams);

      var params = [accounts[0], msgParams];
      var method = "eth_signTypedData_v4";

      const result = await metamaskProvider.send(method, params);

      setSellSignature(result);
      setSellOrder(order);
      setLogText(`Sell signature: ${result}`);

      const recovered = recoverTypedSignature_v4({
        data: JSON.parse(msgParams),
        sig: result,
      });

      console.log("Signer address:", recovered);

      // console.log('The signer:', TypedDataUtils.sign(JSON.parse(msgParams)).toString('hex'));
    } catch (e) {
      console.log(e);
      result = e;
    }

    setInProgress(false);
  };

  const handleBuySig = async (event) => {
    event.preventDefault();
    setInProgress(true);

    let result;

    try {
      const accounts = await metamaskProvider.send("eth_requestAccounts", null);

      const signer1 = metamaskProvider.getSigner(accounts[0]);

      let order = {
        maker: sendRecieverAddress,
        makeAsset: {
          assetType: {
            assetClass: ERC20_ASSET_CLASS,
            data: ethers.utils.defaultAbiCoder.encode(['address', 'uint'],[contractRoot.contracts['EcoFiToken'].address, 1])
          },
          value: ethers.utils.defaultAbiCoder.encode(['uint256'],[2]),
        },
        taker: sendOwnerAddress,
        takeAsset: {
          assetType: {
            assetClass: ERC1155_ASSET_CLASS,
            data: ethers.utils.defaultAbiCoder.encode(['address', 'uint'],[contractRoot.contracts['EcoFiERC1155'].address, 1])
          },
          value: 1,
        },
        salt: 1623305370620,
        start: 0,
        end: 1623305370620 + 1000 * 60 * 60 * 24 * 7,
        dataType: "0xffffffff",
        data: sendOwnerAddress,
      };

      const msgParams1 = JSON.stringify({
        ...SIG_BODY,
        message: order,
      });

      //const mm1 = await signer1.signMessage(msgParams1);

      var params = [accounts[0], msgParams1];
      var method = "eth_signTypedData_v4";

      const result = await metamaskProvider.send(method, params);

      const recovered = recoverTypedSignature_v4({
        data: JSON.parse(
          JSON.stringify({
            message: order,
            ...SIG_BODY,
          })
        ),
        sig: result,
      });

      console.log("Signer address:", recovered);

      setBuySignature(result);
      setBuyOrder(order);
      //console.log(result);

      setLogText(`Buy signature: ${result}`);
    } catch (e) {
      console.log(e);
      result = e;
    }

    setInProgress(false);
  };

  const handleTrasfer = async (event) => {
    event.preventDefault();
    setInProgress(true);

    setLogText(
      `Send ${sendAmount} tokens with id ${sendId} from address ${sendOwnerAddress} to address ${sendRecieverAddress}...`
    );
    setReceiptLink(null);

    let result;

    try {
      result = await contract.matchOrders(
        sellOrder,
        sellSignature,
        buyOrder,
        buySignature
      );
    } catch (e) {
      console.log(e);
      result = e;
    }

    try {
      setLogText(result.toString());
    } catch (e) {}
    setInProgress(false);
  };

  return (
    <>
      <Fragment key={props.contract}>
        <h5>Contract Name: {props.contract}</h5>
        <h6>Address: {contractRoot.contracts[props.contract].address}</h6>
        <h6>Owner: {contractOwner ? contractOwner : "Loading..."}</h6>
        <Row>
          <Col sm="4">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Mint Token</CardTitle>

                <Form>
                  <FormGroup>
                    <Label for="userAddressId">User Address</Label>

                    <Input
                      name="userAddress"
                      id="userAddressId"
                      placeholder="0x..."
                      value={sendOwnerAddress}
                      onChange={(e) => setSendOwnerAddress(e.target.value)}
                    />
                    <Label for="recieverAddressId">Reciever Address</Label>

                    <Input
                      name="recieverAddress"
                      id="recieverAddressId"
                      placeholder="0x..."
                      value={sendRecieverAddress}
                      onChange={(e) => setSendRecieverAddress(e.target.value)}
                    />

                    <Label for="tokenToCheckId">Token Id</Label>

                    <Input
                      type="number"
                      name="tokenToSend"
                      id="tokenToCheckId"
                      placeholder="0"
                      value={sendId}
                      onChange={(e) => setSendId(e.target.value)}
                    />
                    <Label for="amountToSendId">Amount</Label>

                    <Input
                      type="number"
                      name="amountToSend"
                      id="amountToSendId"
                      placeholder="0"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                    />
                  </FormGroup>

                  <Button disabled={inProgress} onClick={handleSellSig}>
                    Create sell
                  </Button>
                  <Button disabled={inProgress} onClick={handleBuySig}>
                    Create buy
                  </Button>
                  <Button disabled={inProgress} onClick={handleTrasfer}>
                    Send
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Card>
          <h6>Log:</h6>
          {logText ? logText : ""}
          {receiptLink ? <a href={receiptLink}>Etherscan</a> : ""}
        </Card>
      </Fragment>
    </>
  );
}

export { ContractExcExplorer };
