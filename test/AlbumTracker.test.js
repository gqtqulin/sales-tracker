
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

    describe("AlbumTracker", () => {
        it("deploys tracker", async () => {
            const { 
                albumTracker, owner
             } = await loadFixture(deployFixture)

            expect(await albumTracker.currentIndex()).to.equal(0n)
        })

        it("deploys album", async () => {
            const { 
                albumTracker, owner
             } = await loadFixture(deployFixture)

            const title = "Чай вдвоем - Слава КПСС"
            const price = ethers.parseEther("0.00005")
            const createAlbumTx = await createAlbum(albumTracker, title, price)
            //console.log(`createAlbumTx: ${JSON.stringify(createAlbumTx)}`)
    
            // -- адрес дочернего контракта
            const expectedAlbumAddr = await precomputeAddress(albumTracker)
            
            const album = await ethers.getContractAt("Album", expectedAlbumAddr)
            await album.waitForDeployment()

            expect(await album.price()).to.equal(price)
            expect(await album.title()).to.equal(title)
            expect(await album.purchared()).to.false

            expect(await albumTracker.currentIndex()).to.equal(1n)
        })

        it("tests album purchasing", async () => {
            const {
                albumTracker, owner, addr1
            } = await loadFixture(deployFixture)

            const title = "BACKGROUND I - remember."
            const price = ethers.parseEther("0.0001")
            const createAlbumTx = await createAlbum(albumTracker, title, price)

            const expectedAlbumAddr = await precomputeAddress(albumTracker)

            const album = await ethers.getContractAt("Album", expectedAlbumAddr)
            await album.waitForDeployment()

            const buyTxData = {
                to: expectedAlbumAddr,
                value: price
            }

            /**
             * проверка на revert при некорректной плате
             */
            expect(
                addr1.sendTransaction({
                    to: expectedAlbumAddr,
                    value: ethers.parseEther("0.0000001")
                })
            ).to.revertedWith("We accept only full payments!")

            // -- покупка альбома
            const buyTx = await addr1.sendTransaction(buyTxData)
            await buyTx.wait()

            /**
             * проверка на событие
             * у определенного контракта было ли событие
             * со следующими входными параметрами
             */
            await expect(buyTx).to.emit(albumTracker, "AlbumStateChange").withArgs(
                expectedAlbumAddr, 0, title, 1
            )

            /**
             * проверка на true во флаге куплен/не куплен
             */
            expect(await album.purchared()).to.true 

            /**
             * после покупки альбома состояние = 1 (Paid)
             */
            expect(
                (await albumTracker.albums(0))
            .state).to.equal(1)

            /**
             * поменялся баланс у покупатели и контракта
             */
            await expect(buyTx).to.changeEtherBalances(
                [addr1, albumTracker], [-price, price]
            )

            /**
             * проверка на revert на попытку повторной покупки
             */
            expect(
                addr1.sendTransaction(buyTxData)
            ).to.be.revertedWith("This album is already purchared!")

        })

        it("tests album delivering", async () => {
            const {
                albumTracker, owner, addr1
            } = await loadFixture(deployFixture)

            const title = "Nevermind - Nirvana"
            const price = ethers.parseEther("0.01")
            const albumCreateTx = await createAlbum(albumTracker, title, price)

            const expectedAlbumAddr = await precomputeAddress(albumTracker)

            const album = await ethers.getContractAt("Album", expectedAlbumAddr)

            /**
             * 
             */
            expect(
                albumTracker.triggerDelivery(0)
            ).to.be.revertedWith("This album is not paid for!")

            const buyTx = await addr1.sendTransaction({
                to: expectedAlbumAddr,
                value: price
            })

            /**
             * 
             */
            expect(
                await album.purchared()
            ).to.true

            /**
             * 
             */
            // expect(
            //     await  addr1.call()albumTracker.triggerDelivery()
            // ).to.emit()


            // проверитб что на доставку делает не owner
            

            // expect(
            //     (await albumTracker.albums(0)).state
            // ).to.equal(2)
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