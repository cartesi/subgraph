#!/usr/bin/env bash

if [ "$1" == "eligibility" ]; then
  shift
  yarn workspace eligibility knex migrate:up
  exec yarn eligibility "$@"
fi

exec "$@"