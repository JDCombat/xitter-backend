FROM node:latest

WORKDIR /opt/app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN mkdir uploads

ENV PORT=80

EXPOSE 80

CMD ["npm", "run", "start"]