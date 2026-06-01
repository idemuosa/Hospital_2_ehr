FROM node:18-alpine

WORKDIR /app

# Only copy package files first to leverage cache
COPY package.json package-lock.json* ./

# Use a lighter install command
RUN npm install --no-audit --no-fund --network-timeout=1000000

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
