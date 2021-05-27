import React from 'react';
import { ContractLayout } from './components/ContractLayout';
import { useAuth } from './context/auth-context';


// import {MetadataExplorer} from './components/MetadataExplorer'

function App() {

  const { user } = useAuth()
  console.log(user);
  return (
    <>
      <ContractLayout/>
      {
      // <MetadataExplorer/>
      }
    </>
  )
}

export { App };

