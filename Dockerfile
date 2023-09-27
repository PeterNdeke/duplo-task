FROM node:18-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git curl openssh make py-pip busybox-extras

RUN npm install -g npm

RUN npm install -g typescript@4 pm2@5

RUN mkdir -p /home/duplo

COPY . /home/duplo

WORKDIR /home/duplo

# exposed port
EXPOSE 9020

ADD docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
