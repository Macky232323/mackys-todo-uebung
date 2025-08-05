# Basis-Image
FROM node:18-slim

# Arbeitsverzeichnis im Container setzen
WORKDIR /app

# package.json und package-lock.json kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm install

# Den restlichen Quellcode kopieren
COPY . .

# Den Port freigeben, auf dem die App läuft
EXPOSE 3000

# Der Befehl, der beim Starten des Containers ausgeführt wird
CMD [ "npm", "start" ]