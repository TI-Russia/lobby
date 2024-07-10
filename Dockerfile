# Используем официальный образ Ruby 3.2.0
FROM ruby:3.2.0

# Установка Node.js 18.x
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Установка необходимых зависимостей
RUN apt-get update -qq
# Установка рабочей директории
WORKDIR /app

# Копирование Gemfile и Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Установка гемов
RUN bundle install

# Копирование package.json
COPY package.json package-lock.json ./

# Установка npm пакетов
RUN npm install

# Копирование остальных файлов проекта
COPY . .

# Команда для сборки приложения
RUN npm run build:combined

# Команда для запуска приложения
CMD ["node", "prod-mode.js"]