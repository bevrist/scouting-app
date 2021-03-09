# Build static site and move files to simple nginx server
FROM node as builder
WORKDIR /app
COPY ./package.json ./
RUN npm install --only=dev
COPY . .
RUN npm run build


# move built files to nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
