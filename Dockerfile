FROM baptistearno/typebot-builder:latest

COPY builder-entrypoint.sh /app/builder-entrypoint.sh

RUN chmod +x /app/builder-entrypoint.sh

ENTRYPOINT ["/bin/bash", "/app/builder-entrypoint.sh"]
