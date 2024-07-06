
const { expect } = require("chai")
const { ethers } = require("hardhat")
const {
    loadFixture
} = require("@nomicfoundation/hardhat-toolbox/network-helpers")

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
        it("deploy AlbumTracker contract & create album", async () => {
            const { 
                albumTracker, owner
             } = await loadFixture(deployFixture)

            const title = "Чай вдвоем"
            const price = ethers.parseEther("0.00005")
            await createAlbum(albumTracker, title, price)
    
            const expectedAlbumAddr = await precomputeAddress(albumTracker) // -- адрес 
            
            // const album = albumTracker.connect(expectedAlbumAddr)
            const albumFactory = await ethers.getContractFactory("AlbumTracker")
            const album = albumFactory.connect(expectedAlbumAddr)
    
            console.log(await album.price())
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