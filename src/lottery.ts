import { BigInt } from "@graphprotocol/graph-ts"
import { WinnerPaid } from "../generated/PrizeManager/PrizeManager"
import { RoundClaimed } from "../generated/Lottery/Lottery"
import { LotteryWinner, LotteryTicket } from "../generated/schema"
import { GlobalState } from "./GlobalState"

const GLOBAL_STATE_INDEX = "global"

function getGlobalState(): GlobalState {
    let globalState = GlobalState.load(GLOBAL_STATE_INDEX)

    if (globalState == null) {
        globalState = new GlobalState(GLOBAL_STATE_INDEX)

        globalState.winnerIndex = BigInt.fromI32(1)
    }

    return globalState!
}

export function handleWinnerPaid(event: WinnerPaid): void {
    let globalState = getGlobalState()

    let entity = new LotteryWinner(globalState.winnerIndex.toHex())

    entity.winner = event.params._winner
    entity.prize = event.params._prize
    entity.time = event.block.timestamp
    entity.index = globalState.winnerIndex

    entity.txHash = event.transaction.hash.toHex()
    entity.ticket = event.transaction.hash.toHex()

    entity.save()

    globalState.winnerIndex = globalState.winnerIndex + BigInt.fromI32(1)
    globalState.save()
}

export function handleRoundClaimed(event: RoundClaimed): void {
    let entity = LotteryTicket.load(event.transaction.hash.toHex())

    if (entity == null) {
        entity = new LotteryTicket(event.transaction.hash.toHex())

        entity.count = BigInt.fromI32(0)
    }

    entity.count = entity.count + BigInt.fromI32(1)

    entity._winner = event.params._winner
    entity._roundCount = event.params._roundCount
    entity._difficulty = event.params._difficulty

    entity.save()
}
