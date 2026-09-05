FROM node:18-alpine

WORKDIR /app

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