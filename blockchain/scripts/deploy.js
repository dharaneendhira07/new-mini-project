import hre from "hardhat";
import fs from "fs";

async function main() {
    const AcademicIdentity = await hre.ethers.deployContract("AcademicIdentity");
    await AcademicIdentity.waitForDeployment();
    const address = AcademicIdentity.target;
    console.log(`AcademicIdentity deployed to ${address}`);
    
    // Save address to a file so the agent/environment can read it
    fs.writeFileSync("deployed_address.txt", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
