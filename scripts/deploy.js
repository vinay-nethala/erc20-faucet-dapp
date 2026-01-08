const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...\n");

  // Deploy Token Contract
  console.log("Deploying Token contract...");
  const Token = await hre.ethers.getContractFactory("MyToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ Token deployed to:", tokenAddress);

  // Deploy Faucet Contract
  console.log("\nDeploying TokenFaucet contract...");
  const Faucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("✅ TokenFaucet deployed to:", faucetAddress);

  // Set Faucet Address in Token
  console.log("\nSetting faucet address in token contract...");
  const setFaucetTx = await token.setFaucetAddress(faucetAddress);
  await setFaucetTx.wait();
  console.log("✅ Faucet address set in token contract");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    token: tokenAddress,
    faucet: faucetAddress,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to deployments/" + hre.network.name + ".json");
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:        ", hre.network.name);
  console.log("Token Address:  ", tokenAddress);
  console.log("Faucet Address: ", faucetAddress);
  console.log("=".repeat(60));

  // Verify contracts on Etherscan (if not on hardhat network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    console.log("\nVerifying contracts on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [],
      });
      console.log("✅ Token contract verified");
    } catch (error) {
      console.log("⚠️  Token verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: faucetAddress,
        constructorArguments: [tokenAddress],
      });
      console.log("✅ Faucet contract verified");
    } catch (error) {
      console.log("⚠️  Faucet verification failed:", error.message);
    }
  }

  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
