#!/bin/sh

name="otds_backend"
docker-compose down
docker image rm $name
docker-compose up