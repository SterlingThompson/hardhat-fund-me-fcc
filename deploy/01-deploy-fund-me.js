
// The deploy folder that this file is found in is where hardhat-deploy module
// looks to deploy code.

// function deployFunc() {
//     console.log("Hi");
// };


// module.exports.default = deployFunc;

//This is the same as what's done above but it's utilizing a javascript 
//anonymous function. So no need for the deployFunc() method above.

//'hre' stands for hardhat runtime environment.

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre;
// }

//To write the above using one line of code refer to line 26:

const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {

    //This line gets the deploy and log functions from the deployments 
    //object above.
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // Get address based on chainId

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

    // if contract doesn't exist we create a minimal version of it for 
    // our local testing.

    let ethUsdPriceFeedAddress;

    if(developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    }else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    };

    console.log(ethUsdPriceFeedAddress);

    // what happens when we want to change chains?
    // when going for localhost or harhat network we want to use a mock

    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, 
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if(!developmentChains.includes(network.name) &&
       process.env.ETHERSCAN_API_KEY){
        //verify & publish contract

        await verify(fundMe.address, args)
    }
    log("---------------------------------------------------------")
    
}

module.exports.tags = ["all", "fundme"];