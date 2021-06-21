import { recoverTypedSignature_v4 } from "eth-sig-util";
import { BigNumber, Contract, ethers } from "ethers";
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
const SPRT_TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const SIG_BODY = ({chainId, verifyingContract}) => {
  return {
    domain: {
      chainId,
      name: "Exchange",
      version: "2",
      verifyingContract,
    },
    primaryType: "Order",
    types: {
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
  }
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
  const [contract, setContract] = useState<Contract>(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [readOnlyContract, setReadOnlyContract] = useState(null);
  const [refreshingContract, setRefreshingContract] = useState(false);
  const [contractOwner, setContractOwner] = useState(null);

  const [logText, setLogText] = useState(null);
  const [receiptLink, setReceiptLink] = useState(null);

  const [inProgress, setInProgress] = useState(false);

  // forms
  const [sendOwnerAddress, setSendOwnerAddress] = useState(
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
  );
  const [sendTokenAddress, setSendTokenAddress] = useState(
    ECO_TOKEN_ADDRESS
  );
  const [sendRecieverAddress, setSendRecieverAddress] = useState(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  );
  const [sendId, setSendId] = useState("27260337350786580164241416129611462941146473970058656530868906316215946838017");
  const [sendAmount, setSendAmount] = useState("1");
  const [sendCurAmount, setSendCurAmount] = useState("1");
  const [sendAllowAmount, setSendAllowAmount] = useState("1");

  const [sellSignature, setSellSignature] = useState("");
  const [sellOrder, setSellOrder] = useState(undefined);
  const [buySignature, setBuySignature] = useState("");
  const [buyOrder, setBuyOrder] = useState(undefined);

  const initializeProvider = () => {
    // display contractRoot
    console.log(contractRoot);

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
    console.log("refreshing");
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

  const updateTokenContract = async (name: string) => {
    let contractAddress, contractAbi, metamaskContract;

    //Object.keys(contractRoot.contracts).map(contractName => {
    contractAddress = contractRoot.contracts[name].address;
    contractAbi = contractRoot.contracts[name].abi;
    //})

    console.log(contractAddress);

    await window.ethereum.enable();
    metamaskContract = new ethers.Contract(
      contractAddress,
      contractAbi,
      metamaskProvider.getSigner()
    );

    setTokenContract(metamaskContract);
    
    setRefreshingContract(false);
    
    return metamaskContract;
  };

  useEffect(() => {
    // on first call, initialize web3Provider
    if (web3Provider === null) initializeProvider();

    if (refreshingContract) {
      refreshContract("EcoFiExchangeV2");
    }
  }, [refreshingContract]);

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
            data: ethers.utils.defaultAbiCoder.encode(
              ['address', 'uint'],
              [contractRoot.contracts['EcoFiERC1155'].address, sendId]
            )
          },
          value: 1,
        },
        taker: "0x0000000000000000000000000000000000000000",
        takeAsset: {
          assetType: {
            assetClass: ETH_ASSET_CLASS,
            data: ethers.utils.defaultAbiCoder.encode(
              ['uint'],
              [1]
            ),
            /* assetClass: ERC20_ASSET_CLASS,
            data: ethers.utils.defaultAbiCoder.encode(
              ['address', 'uint'],
              [contractRoot.contracts['EcoFiToken'].address, 1]
            ), */
          },
          value: ethers.utils.defaultAbiCoder.encode(['uint256'],[convert(sendCurAmount)]),
          // value: ethers.utils.defaultAbiCoder.encode(['uint256'],[sendCurAmount]),
        },
        salt: Date.now(),
        start: 0,
        end: Date.now() + 1000 * 60 * 60 * 24 * 7,
        dataType: "0xffffffff",
        data: sendOwnerAddress,
      };

      const msgParams = JSON.stringify({
        ...SIG_BODY({chainId: 1337, verifyingContract: contractRoot.contracts['EcoFiExchangeV2'].address}),
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
            assetClass: ETH_ASSET_CLASS,
            data: ethers.utils.defaultAbiCoder.encode(
              ['uint'],
              [1]
            ),
            /* assetClass: ERC20_ASSET_CLASS,
            data: ethers.utils.defaultAbiCoder.encode(
              ['address', 'uint'],
              [contractRoot.contracts['EcoFiToken'].address, 1]
            ) */
          },
          value: ethers.utils.defaultAbiCoder.encode(['uint256'],[convert(sendCurAmount)]),
          // value: ethers.utils.defaultAbiCoder.encode(['uint256'],[sendCurAmount]),
        },
        taker: sendOwnerAddress,
        takeAsset: {
          assetType: {
            assetClass: ERC1155_ASSET_CLASS,
            data: ethers.utils.defaultAbiCoder.encode(
              ['address', 'uint'],
              [contractRoot.contracts['EcoFiERC1155'].address, sendId]
            )
          },
          value: 1,
        },
        salt: Date.now(),
        start: 0,
        end: Date.now() + 1000 * 60 * 60 * 24 * 7,
        dataType: "0xffffffff",
        data: sendRecieverAddress,
      };

      const msgParams1 = JSON.stringify({
        ...SIG_BODY({chainId: 1337, verifyingContract: contractRoot.contracts['EcoFiExchangeV2'].address}),
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
            ...SIG_BODY({chainId: 1337, verifyingContract: contractRoot.contracts['EcoFiExchangeV2'].address}),
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
    const overrides = {
      value: convert(sendCurAmount).add(convert(1).div(50)),
    }

    try {
      result = await contract.matchOrders(
        sellOrder,
        sellSignature,
        buyOrder,
        buySignature,
        overrides
      );
      console.log(result);
    } catch (e) {
      console.log(e);
      result = e;
    }

    try {
      setLogText(result.toString());
    } catch (e) {}
    setInProgress(false);
  };

  const handleAllowance = async (event) => {
    event.preventDefault();
    setInProgress(true);

    setLogText(
      `Allow ${sendAllowAmount} tokens from address ${sendTokenAddress} to address ${sendRecieverAddress}...`
    );
    setReceiptLink(null);

    let result;

    try {
      const ctr = await updateTokenContract('EcoFiToken');
      console.log(tokenContract);
      result = await ctr.approve(
        contractRoot.contracts['ERC20TransferProxy'].address,
        ethers.utils.defaultAbiCoder.encode(['uint256'],[convert(sendAllowAmount)])
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

  const convert = (input) => {
    return BigNumber.from(input).mul(BigNumber.from(10).pow(18));
  }

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
                <CardTitle tag="h5">Allow spend</CardTitle>

                <Form>
                  <FormGroup>
                    <Label for="tokenAddressId">Token Address</Label>

                    <Input
                      name="tokenAddress"
                      id="tokenAddressId"
                      placeholder="0x..."
                      value={sendTokenAddress}
                      onChange={(e) => setSendTokenAddress(e.target.value)}
                    />

                    <Label for="amountToAllowId">Allow amount</Label>

                    <Input
                      type="number"
                      name="amountToAllow"
                      id="amountToAllowId"
                      placeholder="0"
                      value={sendAllowAmount}
                      onChange={(e) => setSendAllowAmount(e.target.value)}
                    />
                  </FormGroup>

                  <Button disabled={inProgress} onClick={handleAllowance}>
                    Set allowance
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
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
                    <Label for="amountToSendCurId">Price</Label>
                    <Input
                      type="number"
                      name="amountToSendCur"
                      id="amountToSendCurId"
                      placeholder="0"
                      value={sendCurAmount}
                      onChange={(e) => setSendCurAmount(e.target.value)}
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
