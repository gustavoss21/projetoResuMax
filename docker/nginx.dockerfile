FROM nginx:1.19.4-alpine
LABEL maintainer "gustavo <santos.gs708@gmail.com>"
ENV PYTHONUBUFFERED 1
ENV LANG C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive
COPY /docker/nginx.conf /etc/nginx/sites-enabled/default
COPY /docker/ssl-params.conf /etc/nginx/snippets/ssl-params.conf
COPY . /var/www
EXPOSE 443
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
