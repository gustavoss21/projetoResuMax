FROM python:3.10-alpine
LABEL maintainer "gustavo souza email:santos.gs708@gmail.com"
ENV SECRET_KEY: "l&7n=nm$fl_q_75!r*2dmh8ev7)sy*70%s*_dpkicm_%*i_(mz"
COPY . /var/www
WORKDIR /var/www
RUN apk update && apk add zlib-dev jpeg-dev gcc musl-dev python3-dev postgresql-dev
RUN pip install -r requirements.txt && python manage.py collectstatic --noinput
ENTRYPOINT gunicorn --bind 0.0.0.0:8000 resumax.wsgi
EXPOSE 8000
