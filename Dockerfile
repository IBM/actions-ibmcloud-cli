FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y curl

COPY entrypoint.sh /entrypoint.sh

CMD ["/entrypoint.sh"]
