FROM denoland/deno:2.6.8
COPY . .
RUN deno install
CMD ["deno", "run", "-A", "main.js"]