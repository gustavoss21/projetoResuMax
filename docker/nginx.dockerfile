FROM nginx:1.19.4-alpine
LABEL maintainer "gustavo <santos.gs708@gmail.com>"
ENV PYTHONUBUFFERED 1
ENV LANG C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive
COPY /docker/nginx.conf /etc/nginx/nginx.conf
COPY . /var/www
EXPOSE 80 443
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]