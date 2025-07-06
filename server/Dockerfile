FROM node:20

WORKDIR /app

COPY package*.json ./

# Ensure devDependencies are installed
RUN npm install

COPY . .

# Ensure type packages are present before build
RUN npm install @types/node @types/ws @types/dotenv

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]
