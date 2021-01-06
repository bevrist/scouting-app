# first stage installs npm and tools to minimize and optimize html/css/js files
FROM ubuntu:20.04 as web-builder
ENV DEBIAN_FRONTEND=noninteractive
# RUN apt-get update && apt-get install npm -y
# RUN npm install --global google-closure-compiler html-minifier csso-cli
WORKDIR /app
COPY ./www ./www
# # compile all web files into optimized and minified versions
# RUN find ./ -type f -name "*.js" -exec google-closure-compiler --language_out=ECMASCRIPT_2017 --js {} --js_output_file {}.min \; -exec mv {}.min {} \;
# RUN find ./ -type f -name "*.css" -exec csso {} -o {}.min \; -exec mv {}.min {} \;
# RUN find ./ -type f -name "*.html" -exec html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true {} -o {}.min \; -exec mv {}.min {} \;


# second build stage compiles a static binary of the golang server
FROM golang:1 as go-builder
RUN go get -v github.com/gorilla/mux github.com/natefinch/atomic
WORKDIR /app
COPY ./scout-server/ .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o scout-server .


# third build stage moves compiled/minimized web files and compiled server binary to small alpine os image
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=go-builder /app/scout-server .
COPY --from=web-builder /app/www ./www
CMD ["./scout-server"]

ENV LISTEN_ADDRESS=0.0.0.0:80
EXPOSE 80
