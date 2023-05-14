FROM python:3.10-alpine
LABEL maintainer "gustavo souza email:santos.gs708@gmail.com"
COPY . /var/www
WORKDIR /var/www
RUN apk update && apk add zlib-dev jpeg-dev gcc musl-dev python3-dev postgresql-dev
<<<<<<< HEAD
RUN pip install -r requirements.txt
RUN python3 manage.py collectstatic --noinput
ENTRYPOINT gunicorn --bind 0.0.0.0:8000 resumax.wsgi
EXPOSE  8000

=======
RUN pip install -r requirements.txt && python manage.py collectstatic --noinput
ENTRYPOINT gunicorn --bind 0.0.0.0:8000 resumax.wsgi
EXPOSE 8000
>>>>>>> 0fe3f30ecd2ab199537986faae6360ae3304e95d
