# HW-03 — raw HTTP/TLS сервер (без http/https)

## Запуск

Без установки залежностей (використовується лише стандартна бібліотека Node).

Plain HTTP (порт 3000):

```bash
node src/server.js
```

HTTPS (порт 3443, потребує сертифікат — див. нижче):

```bash
node src/https-server.js
```

## Маршрути (спільні для обох серверів)

| Запит | Відповідь |
|---|---|
| `GET /` | `200 OK`, `Content-Type: text/plain` |
| `GET /headers` | розпарсені заголовки запиту |
| будь-що інше | `404 Not Found` |

Перевірка:

```bash
curl -sv http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/nope
curl -s http://localhost:3000/headers -H "X-Demo: abc"

curl -sk -o /dev/null -w "%{http_code}\n" https://localhost:3443/
```

## Генерація self-signed сертифіката

`https-server.js` очікує `key.pem` і `cert.pem` у корені репозиторію. Ці файли не комітяться (див. `.gitignore`), генеруються локально:

```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout key.pem -out cert.pem \
  -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

## Debug-сесія: `openssl s_client`

```
$ openssl s_client -connect localhost:3443 -servername localhost </dev/null
depth=0 CN = localhost
verify error:num=18:self signed certificate
verify return:1
depth=0 CN = localhost
verify return:1
CONNECTED(00000005)
---
Certificate chain
 0 s:/CN=localhost
   i:/CN=localhost
---
Server certificate
-----BEGIN CERTIFICATE-----
MIICyTCCAbGgAwIBAgIJAMM5zPz0eCQJMA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNV
BAMMCWxvY2FsaG9zdDAeFw0yNjA4MDUyMzIzMTRaFw0yNzA4MDUyMzIzMTRaMBQx
EjAQBgNVBAMMCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAL96iNdMfEEdVzRsknZgTqmhTLdWYIhcQxUxYuVsfc7SW4mlOfykfS8tsQnz
VnlMkyHoaJUcYL2ZC+ewSqcbRaRGjKwQuwITziOLICvKsQnXIWx/h0L3paeYmRd6
Fi7EGzCo0GmGZofMmoZ9yWaCC/eDOueFlUU6p/fWYGi9wFtH0D7a1RPimQsJ4Rxn
Gd2H6vqzfKmp07joU0VUXyAWR4yA2ykWlA8Cyszyki37Wbw/513UQAyEJhO8xBK9
yszPUMSleWYbZr9LLDrBmbdxuJ/JBKtiPmXPOevokOl2zYckntBtFGNB8Oks/SQM
2hncVekuVxphLr21PbhRKanqmbkCAwEAAaMeMBwwGgYDVR0RBBMwEYIJbG9jYWxo
b3N0hwR/AAABMA0GCSqGSIb3DQEBCwUAA4IBAQCDm7EwHfdkgKADtAmxcCaHVQvf
ypOEMvKkWxNjYEj09GX13+vb0+uCWP9B0wLYJr/TSodVbjzxj3e7WYocR10kERsr
xhfIT8wkYQeYzpwN2CBjnGQCNg1tNt7Dw21V0SHv0GD/M4yV6tInROOVy4Zq7lRT
+MCbsWv3ZyGY2x39V6ae9rOzfLe8TPHA3WUT7MZ/MjC2RU92KFi0Q/FJvmePTZyP
taTL0Z1ooi0832/UUcNCvPGjHgmePrIpcFo7pz93vQMTfzL33ZATn1oMMk3A8rJA
O+HbzN1/v8ZybFsg2HeDnAqanfPQTbH4BuF2G59yXf9PwWs/QG9j7rr6bvd7
-----END CERTIFICATE-----
subject=/CN=localhost
issuer=/CN=localhost
---
SSL-Session:
    Protocol  : TLSv1.3
    Cipher    : AEAD-AES256-GCM-SHA384
    Verify return code: 18 (self signed certificate)
---
```

`verify error:num=18` означає, що сертифікат структурно валідний, але не підписаний жодним довіреним CA — це self-signed сертифікат, і саме таку помилку й очікуємо для локального тестового сертифіката.