FROM node:20-alpine
WORKDIR /app
COPY server.js ExcelNation-CBT-Edu.html manifest.webmanifest sw.js icon-180.png icon-192.png icon-512.png icon-maskable-512.png ./
ENV PORT=8080 DATA_DIR=/data NODE_ENV=production
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node","server.js"]
