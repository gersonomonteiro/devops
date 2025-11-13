FROM postgres:15

COPY ./scripts /docker-entrypoint-initdb.d/
RUN chmod -R 755 /docker-entrypoint-initdb.d || true

EXPOSE 5432

CMD ["postgres"]