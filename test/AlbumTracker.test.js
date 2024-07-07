
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")


describe("AlbumTracker", () => {

    const deployFixture = async () => {
        const [owner, addr1, addr2] = await ethers.getSigners()
        const albumTracker = await ethers.deployContract("AlbumTracker")
        albumTracker.waitForDeployment()

        return { 
            albumTracker, owner, addr1, addr2
        }
    }

    describe("deploy", () => {
        it("deploys album", async () => {
            const { 
                albumTracker, owner
             } = await loadFixture(deployFixture)

            const title = "Чай вдвоем - Слава КПСС"
            const price = ethers.parseEther("0.00005")
            const createAlbumTx = await createAlbum(albumTracker, title, price)
    
            const expectedAlbumAddr = await precomputeAddress(albumTracker) // -- адрес дочернего контракта
            
            const album = await ethers.getContractAt("Album", expectedAlbumAddr)
            await album.waitForDeployment()

            expect(await album.price()).to.equal(price)
            expect(await album.title()).to.equal(title)
            expect(await album.purchared()).to.false
        })
    })

})

/**
 * 
 * @param {*} tracker 
 * @param {*} title 
 * @param {*} price 
 * @returns 
 */
const createAlbum = async (tracker, title, price) => {
    const createAlbumTx = await tracker.createAlbum(price, title)
    return await createAlbumTx.wait()
}

/**
 * 
 * @param {*} contract 
 * @param {*} nonce 
 * @returns 
 */
const precomputeAddress = async (contract, nonce = 1) => {
    return ethers.getCreateAddress({
        from: await contract.getAddress(),
        nonce
    })
}