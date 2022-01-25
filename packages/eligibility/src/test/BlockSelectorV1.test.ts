import { BigNumber, utils } from "ethers"
import { mocked } from "ts-jest/utils"
import { BlockSelector } from "../BlockSelectorV1"
import { BlockSelectorContextState } from "../model/blockSelectorContext"
import { User } from "../model/user"
// import { EtherBlocks } from "../model/etherBlocks"
import { Range } from "../utils/range"

jest.mock("../model/blockSelectorContext")
jest.mock("../model/user")

const blockSelectorAddress = "0x742fcf5ba052d9912499acf208d5410ae31d49ac"
const lastestBlockNumber = 13577372
const chainId = 0

//Chain 0 first block was produced at eth blockNum 11499137
// second block was produced at eth blockNum 11499397
// we will use the interval to write tests for before and after block production

describe("BlockSelectorV1", () => {
    const MockedBSCClass = mocked(BlockSelectorContextState, true)
    const MockedUserClass = mocked(User, true)
    const MockedBlocks = {
        loadRange: jest.fn(),
        getHash: jest.fn(),
        getTimeStamp: jest.fn(),
        getBlock: jest.fn(),
        latestBlock: jest.fn(),
        clear: jest.fn(),
        size: jest.fn(),
    }

    beforeEach(() => {
        // Clears the record of calls to the mock constructor function and its methods
        MockedBSCClass.mockClear()
        MockedUserClass.mockClear()
    })

    it("it should allow producing without errors", async () => {
        MockedBSCClass.prototype.id = `${blockSelectorAddress}-0`
        MockedBSCClass.prototype.getContext = jest.fn()
        MockedBSCClass.prototype.getContext.mockReturnValue({
            min_difficulty: BigNumber.from(1000000000),
            target_interval: 1800,
            difficulty_adjustment_parameter: 50000,
            eth_block_checkpoint: 11499138,
            difficulty: BigNumber.from("17099999999999999999999999"),
            last_block_timestamp: 1608585469,
            block_range: new Range(11499137, 11499397),
        })
        const producerAddress = "0xd27a20a18496ae3200358e569b107d62a1e3f463"
        const producerHashedAddress = utils.solidityKeccak256(
            ["address"],
            [producerAddress]
        )
        const userBalance = BigNumber.from("1000000000000000000000")

        MockedUserClass.prototype.hashedAddress = producerHashedAddress
        MockedUserClass.prototype.getStakedBalance = jest.fn()
        MockedUserClass.prototype.getStakedBalance.mockReturnValue(
            Promise.resolve(BigNumber.from(userBalance))
        )

        // this is the hash of block 11499394
        // since getSeed(11499138, 11499397) --> 11499394
        MockedBlocks.getHash.mockReturnValue(
            Promise.resolve(
                "0xa6d15a4fb45c06ab36dbdcf591bd35e40511ac6e52e87cb1e028f1ea38687f69"
            )
        )
        MockedBlocks.getTimeStamp.mockReturnValue(Promise.resolve(1608588546))

        const mockedUser = new User("", [], MockedBlocks, 0)
        const mockedbsc = new BlockSelectorContextState(
            blockSelectorAddress,
            0,
            lastestBlockNumber
        )
        const bs = new BlockSelector(mockedbsc, MockedBlocks)

        const res = await bs.canProduceBlock(mockedUser, 11499397)
        expect(res).toBe(true)
    })

    it("it should not allow to produce for different user", async () => {
        MockedBSCClass.prototype.id = `${blockSelectorAddress}-0`
        MockedBSCClass.prototype.getContext = jest.fn()
        MockedBSCClass.prototype.getContext.mockReturnValue({
            min_difficulty: BigNumber.from(1000000000),
            target_interval: 1800,
            difficulty_adjustment_parameter: 50000,
            eth_block_checkpoint: 11499138,
            difficulty: BigNumber.from("17099999999999999999999999"),
            last_block_timestamp: 1608585469,
            block_range: new Range(11499137, 11499397),
        })
        const producerAddress = blockSelectorAddress
        const producerHashedAddress = utils.solidityKeccak256(
            ["address"],
            [producerAddress]
        )
        const userBalance = BigNumber.from("1000000000000000000000")

        MockedUserClass.prototype.hashedAddress = producerHashedAddress
        MockedUserClass.prototype.getStakedBalance = jest.fn()
        MockedUserClass.prototype.getStakedBalance.mockReturnValue(
            Promise.resolve(BigNumber.from(userBalance))
        )

        // this is the hash of block 11499394
        // since getSeed(11499138, 11499397) --> 11499394
        MockedBlocks.getHash.mockReturnValue(
            Promise.resolve(
                "0xa6d15a4fb45c06ab36dbdcf591bd35e40511ac6e52e87cb1e028f1ea38687f69"
            )
        )
        MockedBlocks.getTimeStamp.mockReturnValue(Promise.resolve(1608588546))

        const mockedUser = new User("", [], MockedBlocks, 0)
        const mockedbsc = new BlockSelectorContextState(
            blockSelectorAddress,
            0,
            lastestBlockNumber
        )
        const bs = new BlockSelector(mockedbsc, MockedBlocks)

        const res = await bs.canProduceBlock(mockedUser, 11499397)
        expect(res).toBe(false)
    })
})
