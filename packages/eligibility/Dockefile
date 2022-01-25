FROM node:16 as builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

FROM node:16-slim
COPY --from=builder /usr/src/app /usr/src/app
USER node
WORKDIR /usr/src/app
ENTRYPOINT ["npx", "hardhat", "eligibility"]