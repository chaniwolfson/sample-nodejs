FROM node:22-alpine

# עדכון חבילות מערכת ההפעלה לגרסאות האבטחה העדכניות ביותר
RUN apk update && apk upgrade --no-cache
# update global npm and clear its cache
RUN npm install -g npm@latest && npm cache clean --force

WORKDIR /app

ARG APP_VERSION=1.0.0
ENV APP_VERSION=$APP_VERSION

COPY package*.json ./
# 1. התקנת החבילות של האפליקציה
# 2. ניקוי ה-Cache
# 3. הסרת כלי ה-npm הגלובלי כליל (כדי שלא יישאר בתוך ה-Image ויגרום להתרעות Trivy)
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY . .

# העברת הרשאות תיקיית העבודה למשתמש הלא-הרשאתי
RUN chown -R node:node /app

# הגדרת הרצת ה-Container תחת המשתמש node
USER node

EXPOSE 8080

CMD ["node", "app.js"]