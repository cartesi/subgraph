import { BigNumber, utils } from "ethers"

const log2tableTimes1M =
    "0000000F4240182F421E8480236E082771822AD63A2DC6C0305E8532B04834C96736B3C23876D73A187A3B9D4A3D09003E5EA63FA0C540D17741F28843057D440BA745062945F60246DC1047B917488DC7495ABA4A207C4ADF8A4B98544C4B404CF8AA4DA0E64E44434EE3054F7D6D5013B750A61A5134C851BFF05247BD52CC58534DE753CC8D54486954C19C55384255AC75561E50568DE956FB575766B057D00758376F589CFA5900BA5962BC59C3135A21CA5A7EF15ADA945B34BF5B8D805BE4DF5C3AEA5C8FA95CE3265D356C5D86835DD6735E25455E73005EBFAD5F0B525F55F75F9FA25FE85A60302460770860BD0A61023061467F6189FD61CCAE620E98624FBF62902762CFD5630ECD634D12638AA963C7966403DC643F7F647A8264B4E864EEB56527EC6560906598A365D029660724663D9766738566A8F066DDDA6712476746386779AF67ACAF67DF3A6811526842FA68743268A4FC68D55C6905536934E169640A6992CF69C13169EF326A1CD46A4A186A76FF6AA38C6ACFC0"

const log2tableTimes1MConverted = Array.from(log2tableTimes1M).reduce(
    (acc: BigNumber[], curr, index, base) => {
        if (index % 2) {
            acc.push(BigNumber.from(`0x${base[index - 1]}${curr}0000`))
        }
        return acc
    },
    []
)

export class CartesiMath {
    // mapping values are packed as bytes3 each
    // see test/TestCartesiMath.ts for decimal values

    /// @notice Approximates log2 * 1M
    /// @param _num number to take log2 * 1M of
    /// @return approximate log2 times 1M
    static log2ApproxTimes1M(num: BigNumber): BigNumber {
        if (num.lte(0)) throw new Error("Number cannot be zero")
        let leading = BigNumber.from(0)

        if (num.eq(1)) return BigNumber.from(0)

        while (num.gt(128)) {
            num = num.shr(1)
            leading = leading.add(1)
        }
        return leading.mul("1000000").add(CartesiMath.getLog2TableTimes1M(num))
    }

    static getLog2TableTimes1M(num: BigNumber): BigNumber {
        let result = BigNumber.from(0)
        for (let i = 0; i < 3; i++) {
            let tempResult =
                log2tableTimes1MConverted[num.sub(1).toNumber() * 3 + i]
            result = result.or(tempResult.shr(i * 8))
        }
        return result
    }
}
