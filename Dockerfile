FROM node:latest

WORKDIR /opt/app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN mkdir uploads

ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]