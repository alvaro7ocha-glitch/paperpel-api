FROM baptistearno/typebot-builder:latest

COPY --chmod=755 builder-entrypoint.sh /app/builder-entrypoint.sh

ENTRYPOINT []
CMD ["/bin/bash", "/app/builder-entrypoint.sh"]
