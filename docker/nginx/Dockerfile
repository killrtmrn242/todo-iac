FROM nginx:alpine

# Копируем конфиг Nginx
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Копируем index.html в корень для фронта
COPY todo-app/index.html /usr/share/nginx/html/index.html
