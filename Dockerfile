# Usar la imagen base de Node.js
FROM node:20

# Establecer el directorio de trabajo en /app
WORKDIR /app

# Instalar las dependencias de la aplicación
COPY package.json .
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación se ejecuta
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]
