FROM node:latest

WORKDIR /opt/app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

ENV PORT=80

EXPOSE 80

CMD ["npm", "run", "start"]