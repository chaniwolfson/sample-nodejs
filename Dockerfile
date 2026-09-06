FROM node:18-alpine

WORKDIR /app

ARG APP_VERSION=1.0.0
ENV APP_VERSION=$APP_VERSION

COPY package*.json ./
RUN npm install

RUN npm ci --only=production

COPY . .

# העברת הרשאות תיקיית העבודה למשתמש הלא-הרשאתי
RUN chown -R node:node /app

# הגדרת הרצת ה-Container תחת המשתמש node בלבד
USER node

EXPOSE 8080

CMD ["node", "app.js"]