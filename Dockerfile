FROM ubuntu:25.04

# Step 1: docker build -t spellingbee .
# Step 2: docker run -d --name spellingbee -p 1024:1024 -it spellingbee

COPY run_apps.sh /root/run_apps.sh
RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y npm
RUN cd ~ && git clone https://github.com/SpellingBeeApp/SpellingBeeApp.git
RUN npm i -g tsc next

# Installs & Builds frontend
RUN cd ~ && cd SpellingBeeApp && cd frontend && npm i && npm run build && cd ~

# Installs & Builds backend
RUN cd ~ && cd SpellingBeeApp && cd backend && npm i && npm run build && cd ~

SHELL ["/bin/bash", "-c"]
CMD ["/root/run_apps.sh"]
# RUN cd SpellingBeeApp && cd frontend && npm run start 1>/dev/null &
# RUN cd ~ && cd SpellingBeeApp && cd backend && npm run start