FROM node:14.17.6-alpine

RUN apk update

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .
COPY tsconfig.json .

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 3031
CMD [ "node", "./dist/server.js" ]