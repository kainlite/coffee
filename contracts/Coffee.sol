// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Coffee is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping (uint256 => address) public tokenIndexToOwner;

    constructor() public ERC721("Get yourself a crypto coffee", "QFI") {}

    function awardCoffee(address donator, string memory tokenURI) public payable returns (uint256)
    {
        _tokenIds.increment();

        uint256 newCoffeeId = _tokenIds.current();
        _mint(donator, newCoffeeId);
        _setTokenURI(newCoffeeId, tokenURI);

        return newCoffeeId;
    }

    // RBAC would be really nice, but KISS for now
    // Only the admin is allowed to burn
    function burn(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }
}
