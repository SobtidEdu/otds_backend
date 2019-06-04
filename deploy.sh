#!/bin/sh

name="otds_api"
docker-compose down
docker image rm otds_api
docker-compose up