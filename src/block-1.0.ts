// Copyright 2021 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy
// of the license at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

import { Rewarded } from "../generated/PoS-1.0/PoS"
import { handleRewardedInner, handleBlockProduced } from "./block-common"

export function handleRewarded(event: Rewarded): void {
    let reward = event.params.userReward.plus(event.params.beneficiaryReward)
    handleRewardedInner<Rewarded>(event, reward)
}

export { handleBlockProduced }
