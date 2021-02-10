var Coffee = artifacts.require("./Coffee.sol");

module.exports = async function(deployer) {
  await deployer.deploy(Coffee);
};
