FROM node:16 as builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

COPY ./packages/eligibility/ ./packages/eligibility/

RUN yarn

FROM node:16-slim
COPY --from=builder /usr/src/app /usr/src/app
USER node
WORKDIR /usr/src/app
COPY ./packages/eligibility/docker-entrypoint.sh /usr/local/bin
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["eligibility"]