FROM ubuntu:20.04 as base

ARG BUILDPLATFORM=linux/x86_64
ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=Etc/UTC
ARG NVM_VERSION=0.39.1
ARG NODE_VERSION=16.14.2
ARG MATCHSTICK_VERSION=0.5.0

ENV NVM_DIR=/root/.nvm
ENV ARGS=""
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN apt-get update \
    && apt-get install -y \
        git \
        postgresql \
        curl \
        cmake \
    # nodejs + npm + yarn
    && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh | bash \
    && . "$NVM_DIR/nvm.sh" \
    && nvm install ${NODE_VERSION} \
    && nvm use v${NODE_VERSION} \
    && nvm alias default v${NODE_VERSION} \
    && npm install -g yarn \
    # matchstick
    && curl -o /bin/matchstick -L https://github.com/LimeChain/matchstick/releases/download/${MATCHSTICK_VERSION}/binary-linux-20 \
    && chmod a+x /bin/matchstick \
    && mkdir matchstick \
    && apt-get remove -y --purge curl \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /matchstick
CMD matchstick ${ARGS}

FROM base as libs
COPY package.json yarn.lock ./
RUN yarn

FROM libs as code
ARG PROJECT_ID
COPY . ./
RUN yarn prepare:goerli \
    && mv subgraph.goerli.yaml subgraph.yaml \
    && yarn codegen subgraph.yaml

FROM code as test
RUN matchstick ${ARGS}
