FROM node:16-alpine
WORKDIR /app
COPY package.json package-lock.json README.md LICENSE ./
COPY src ./src/
RUN npm install
CMD ["npm", "start"]
