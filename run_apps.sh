#!/bin/bash

cd ~ && cd SpellingBeeApp/frontend && npm run start 1>/dev/null &

cd ~ && cd SpellingBeeApp/backend && npm run start 1>/dev/null &

while true; do sleep 1; done