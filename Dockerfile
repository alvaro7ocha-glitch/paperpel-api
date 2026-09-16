FROM baptistearno/typebot-builder:latest

ENTRYPOINT ["sh", "-c", "NODE_OPTIONS='--no-node-snapshot --max-old-space-size=448' node apps/builder/server.js"]
