
const { expect } = require("chai")
const { ethers } = require('hardhat');

discribe("AlbumTracker", () => {
    it("controls album states", async () => {
        const [owner] = await ethers.getSigners()

        const AlbumTracker = await ethers.getContractFactory("AlbumTracker");

        const albumTracker = AlbumTracker.deploy();

        await albumTracker.waitForDeployment();

        console.log(albumTracker);
    })
})