// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AlbumTracker.sol";

contract Album {
    uint public price;
    string public title;
    bool public purchared;
    uint public index;
    AlbumTracker tracker;

    constructor(uint _price, string memory _title, uint _index, AlbumTracker _tracker) {
        price = _price;
        title = _title;
        index = _index;
        tracker = _tracker;
    }

    /**
     * @notice album pursharing
     */
    receive() external payable {
        require(!purchared, "This album is already purchared!");
        require(price == msg.value, "We accept only full payments!");

        (bool success, ) = address(tracker).call{value: msg.value}
        (abi.encodeWithSignature("triggerPayment(uint256)", index));
        require(success, "Sorry, we could not process your transaction.");

        purchared = true;
    }
}