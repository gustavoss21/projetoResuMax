FROM python:3.10-alpine
LABEL maintainer "gustavo souza email:santos.gs708@gmail.com"
COPY . /var/www
WORKDIR /var/www
RUN apk update && apk add zlib-dev jpeg-dev gcc musl-dev python3-dev postgresql-dev
RUN pip install -r requirements.txt
ENTRYPOINT gunicorn --bind 0.0.0.0:8000 resumax.wsgi
EXPOSE 8000
