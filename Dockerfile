ARG ALPINE_VERSION=3.16
# FROM alpine:${ALPINE_VERSION}
FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive
#todo update
# LABEL Maintainer="Tim de Pater <code@trafex.nl>"
# LABEL Description="Lightweight container with Nginx 1.22 & PHP 8.1 based on Alpine Linux."
# Setup document root
WORKDIR /var/www/html

# Install packages and remove default server definition
RUN echo 'APT::Install-Suggests "0";' >> /etc/apt/apt.conf.d/00-docker
RUN echo 'APT::Install-Recommends "0";' >> /etc/apt/apt.conf.d/00-docker

#Setup VSCODE user
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Create the user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    #
    # [Optional] Add sudo support. Omit if you don't need to install software after connecting.
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME


RUN apt-get update &&\
apt-get install -y nginx \
  gphoto2 \
  php8.1\
  php8.1-fpm\
  php8.1-common\
  php8.1-mysql\
  php8.1-xml\
  php8.1-xmlrpc\
  php8.1-curl\
  php8.1-gd\
  php8.1-imagick\
  php8.1-cli\
  php8.1-dev\
  php8.1-imap\
  php8.1-mbstring\
  php8.1-soap\
  php8.1-zip\
  php8.1-bcmath\
  php8.1-xdebug\
  curl\
  supervisor;

# Create symlink so programs depending on `php` still function
# RUN ln -s /usr/bin/php81 /usr/bin/php
# COPY GphotoDeamon /usr/bin/gphotodeamon

RUN mkdir /nonexistent


# Configure nginx
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY webserver.conf /etc/nginx/conf.d/webserver.conf
# Configure PHP-FPM
COPY config/fpm-pool.conf /etc/php/8.1/fpm/pool.d/www.conf
# COPY config/php.ini /etc/php81/conf.d/custom.ini

# Configure supervisord
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN touch /var/log/php8.1-fpm.log
RUN chown 666 /var/log/php8.1-fpm.log

# nobody
# www-data
# Make sure files/folders needed by the processes are accessable when they run under the nobody user
RUN chown -R $USERNAME /var/www /run /var/lib/nginx /var/log/nginx /var/log/php8.1-fpm.log /var/log/supervisor

# # Switch to use a non-root user from here on
USER $USERNAME
# Add application
COPY src/ /var/www

# Expose the port nginx is reachable on
EXPOSE 8080

# Let supervisord start nginx & php-fpm
# CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Configure a healthcheck to validate that everything is up&running
HEALTHCHECK --timeout=10s CMD curl --silent --fail http://127.0.0.1:8080/fpm-ping
LABEL Name=webserver Version=0.0.1
