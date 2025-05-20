const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
  const crowdfunding = await CrowdFunding.deploy();

  await crowdfunding.waitForDeployment();

  const contractAddress = await crowdfunding.target;
  console.log("CrowdFunding deployed to:", contractAddress);

  // Update client .env file with the new contract address
  try {
    const envPath = path.join(__dirname, "../../client/.env");
    const envContent = `VITE_CONTRACT_ADDRESS=${contractAddress}\n`;

    fs.writeFileSync(envPath, envContent);
    console.log(`Contract address saved to client/.env file`);
  } catch (error) {
    console.error("Error saving contract address to .env file:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
