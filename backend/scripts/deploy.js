import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying DecentraSplit...");

  const DecentraSplit = await hre.ethers.getContractFactory("DecentraSplit");
  const decentraSplit = await DecentraSplit.deploy();
  await decentraSplit.waitForDeployment();

  const address = await decentraSplit.getAddress();
  console.log(`DecentraSplit deployed to: ${address}`);

  // Write the address and ABI to a JSON file for the frontend
  const artifact = await hre.artifacts.readArtifact("DecentraSplit");

  const deploymentData = {
    address: address,
    abi: artifact.abi,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "DecentraSplit.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log(`Contract data written to frontend/src/contracts/DecentraSplit.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
