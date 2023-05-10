# Server Dockerfile

# https://stackoverflow.com/questions/59574047/how-to-use-optional-chaining-in-node-js-12
# Stage 1 - set Environment Must use node 14! Optional chaining is used in backend "?."
FROM node:14

# Create Directory to store backend API
WORKDIR /usr/src/app/server

# Install Dependencies (Allows cacheing if dependencies installed first)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copies rest of source code into container
COPY . ./

# Environment Vars are now set in Dokku manually to prevent leaking secrets
# COPY .env.production .env

# Ensure that prisma has the generated files to initialize
RUN npm run prisma:generate

# Ensures that environment is run in production
ENV NODE_ENV production

# Opens port 3001 and starts application
EXPOSE 3001
CMD ["node", "server.js"]
USER node