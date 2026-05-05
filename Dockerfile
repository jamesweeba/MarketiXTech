FROM nginx:stable-alpine

COPY index.html   /usr/share/nginx/html/index.html
COPY style.css    /usr/share/nginx/html/style.css
COPY script.js    /usr/share/nginx/html/script.js
COPY hero-bg.png  /usr/share/nginx/html/hero-bg.png
COPY nginx.conf   /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
