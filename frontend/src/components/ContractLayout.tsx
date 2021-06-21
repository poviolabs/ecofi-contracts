import classnames from 'classnames';
import { ethers } from "ethers";
import React, { useEffect, useState } from 'react';
import {
  Nav, NavItem, NavLink,
  TabContent, TabPane
} from 'reactstrap';
import config from '../config';
import * as contractRoot from '../contracts/all.json';
import { ContractExcExplorer } from './ContractExcExplorer';
import { ContractExplorer } from './ContractExplorer';

declare global {
  interface Window {
      ethereum:any;
  }
}

function ContractLayout() {

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
    // console.log(contractRoot);

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
    
    /* metamaskContract.on("TransferSingle", (sender, from, to, id, amount, eventInfo) => {
      setLogText("Token id " + id + " created.");
      setReceiptLink("https://rinkeby.etherscan.io/tx/" + eventInfo.transactionHash);
    }); */

    setReadOnlyContract(erc1155);
    setContract(metamaskContract);

    let contractOwner = await erc1155.owner();
    setContractOwner(contractOwner);

    /* let contractUri = await erc1155.contractURI();
    setContractUri(contractUri); */

    setRefreshingContract(false);
  }

  useEffect(() => {
      setActiveTab('EcoFiExchangeV2');

      // on first call, initialize web3Provider
      if (web3Provider === null)
        initializeProvider();
      
      if (refreshingContract)
      {
        refreshContract('EcoFiExchangeV2');
      }
    }, [refreshingContract]);


  return (
    <>
      <Nav tabs>
        {
          Object.keys(contractRoot.contracts).map(contract => (
            <NavItem key={contract}>
              <NavLink
                className={classnames({ active: activeTab === contract })}
                onClick={() => { toggle(contract); }}>
                Contract: {contract}
              </NavLink>
            </NavItem>
            )
          )
        }
      </Nav>

      <TabContent activeTab={activeTab}>
        <TabPane tabId={'EcoFiERC1155'}>
          <ContractExplorer contract={'EcoFiERC1155'} active={activeTab}></ContractExplorer>
        </TabPane>
        <TabPane tabId={'EcoFiExchangeV2'}>
          <ContractExcExplorer contract={'EcoFiExchangeV2'} active={activeTab}></ContractExcExplorer>
        </TabPane>
      </TabContent>
    </>
  );
}

export { ContractLayout };
