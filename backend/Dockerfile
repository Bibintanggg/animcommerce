FROM golang:1.26.3-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /main ./cmd

FROM alpine:3.23

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=builder /main /app/main

RUN mkdir -p /app/storage/invoices && chown -R app:app /app

USER app

EXPOSE 8080

CMD ["./main"]
