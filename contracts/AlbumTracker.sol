// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Album.sol";

contract AlbumTracker is Ownable {
    enum AlbumState {
        Created, Paid, Delivered
    }

    struct AlbumProduct {
        Album album;
        AlbumState state;
        uint price;
        string title;
    }

    event AlbumStateChange(address indexed _albumAddress, uint _albumIndex, string _title, uint _stateNum);

    mapping(uint => AlbumProduct) public albums;
    uint public currentIndex;

    constructor() Ownable(msg.sender) { }

    /**
     * @notice create album & add to mapping
     * @param _price {uint} - album price
     * @param _title {string memory} - album title 
     */
    function createAlbum(uint _price, string memory _title) public onlyOwner  {
        Album newAlbum = new Album(_price, _title, currentIndex, this);

        albums[currentIndex].album = newAlbum;
        albums[currentIndex].state = AlbumState.Created;
        albums[currentIndex].price = _price;
        albums[currentIndex].title = _title;

        emit AlbumStateChange(address(newAlbum), currentIndex, _title, uint(albums[currentIndex].state));

        currentIndex++;
    }

    /**
     * @notice trigger to purshare album (state change)
     * @param _index {uint} album mapping index
     */
    function triggerPayment(uint _index) public payable {
        require(albums[_index].state == AlbumState.Created, "This album is already purshared!");
        require(albums[_index].price == msg.value, "We accept only full payments!");

        albums[_index].state = AlbumState.Paid;

        emit AlbumStateChange(address(albums[_index].album), _index, albums[_index].title, uint(albums[_index].state));
    }

    /**
     * @notice trigger to album delivered (state change)
     * @param _index {uint} 
     */
    function triggerDelivery(uint _index) public onlyOwner {
        require(albums[_index].state == AlbumState.Paid, "This album is not paid for!");

        albums[_index].state = AlbumState.Delivered;

        emit AlbumStateChange(address(albums[_index].album), _index, albums[_index].title, uint(albums[_index].state));
    }
}