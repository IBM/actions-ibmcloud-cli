FROM ubuntu:18.04

COPY entrypoint.sh /entrypoint.sh

CMD ["/entrypoint.sh"]
