# Use the official Node.js 18 Alpine image as the base
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

COPY .env .env

# Expose the port that the application will run on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "run" , "start:dev"]