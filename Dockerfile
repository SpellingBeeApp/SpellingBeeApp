FROM ubuntu:25.04

RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y npm
RUN cd ~
RUN git clone https://github.com/SpellingBeeApp/SpellingBeeApp.git
RUN npm i -g tsc next

# Installs & Builds frontend
RUN cd SpellingBeeApp && cd frontend && npm i && npm run build && cd ~

# Installs & Builds backend
RUN cd SpellingBeeApp && cd backend && npm i && npm run build && cd ~

RUN cd SpellingBeeApp && cd frontend && npm run start 1>/dev/null &
RUN cd ~ && cd SpellingBeeApp && cd backend && npm run start