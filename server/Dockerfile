FROM node:20

WORKDIR /app

# Make sure NODE_ENV is NOT set to production (otherwise devDependencies are skipped)
ENV NODE_ENV=development

COPY package*.json ./

# This will install devDependencies too
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]
