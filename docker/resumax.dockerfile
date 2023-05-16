FROM python:3.9.0-alpine
LABEL maintainer "gutavos souza <santos.gs708@gamil.com>"
COPY . /var/www
WORKDIR /var/www
RUN apk update && apk add zlib-dev jpeg-dev gcc musl-dev python3-dev postgresql-dev && pip install -r requirements.txt
ENTRYPOINT gunicorn --bind 0.0.0.0:8000 resumax.wsgi
EXPOSE 8000
