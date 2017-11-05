# socket sample

# 1/ Run with Docker
## 1.1/ Requirements:
- docker
- docker-compose
## 1.2/ Steps:
From command line:
- docker-compose build
- docker-compose up -d mongo
- docker-compose up -d redis
- docker-compose up web

# 2/ Use npm start
- In order to use npm start, you need to install mongodb and redis in your computer.
- Modify server.js to point MONGO_HOST, MONGO_PORT, REDIS_PORT, REDIS_HOST to correct values
- Run 'npm start' from your command line

### Access to the web through localhost:8000
- Enter text to textbox and press the button
- New line will be appeared in the line below
- Anytime new text is submitted new line will be appended to the line below the textbox
- Whenever user accesses to the page, it will display all data that are submitted in the past
