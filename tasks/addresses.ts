// Display the accounts on local HardHat
import { task } from "hardhat/config";

task("addresses", "Local addressese", async (args, hre) => {
    const {initialIndex, count} = hre.config.networks.hardhat.accounts as any;
    console.log("Accounts");
    console.log("========");
    for (let i = initialIndex; i < initialIndex + count; i++) {
      const wallet = hre.ethers.Wallet.fromMnemonic('test test test test test test test test test test test junk', `m/44'/60'/0'/0/${i}`);
  
      console.log(`Account #${i}: ${wallet.address}\nPrivate Key: ${wallet.privateKey}\n`);
    }
});
