#!/bin/sh
docker run --name mongo -v $(pwd)/data:/data/db -p 27017:27017 -d mongo 