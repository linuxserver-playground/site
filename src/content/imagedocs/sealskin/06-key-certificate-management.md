---
image: "sealskin"
section: "key-certificate-management"
title: "Key & Certificate Management"
order: 6
---
The server requires several cryptographic keys to function. You can either let the container perform an automatic setup on its first run or provide your own for more control.

### Automatic First-Run Setup (Recommended)

On the first launch with an empty `/config` volume:

1. An init process generates the mandatory server key (`ssl/server_key.pem`) and a self-signed SSL certificate for the proxy (`ssl/proxy_key.pem`, `ssl/proxy_cert.pem`).
2. The server detects that no administrator exists, creates the default user `admin`, and writes `/config/admin.json` and `/config/root_key` as described above.

### Manual Pre-Configuration (Advanced)

Place the files in the `/config` volume **before** the first launch.

*   **To use a custom Admin Key:**
    1.  Generate your own RSA keypair.
    2.  Create a file containing only your **public key** PEM data at `/path/to/config/.config/sealskin/keys/admins/admin`.
    3.  The server will detect this file and write no `admin.json`. You use your private key to log in from the extension, and `admin` signs in to the web app with the root key alone.

*   **To use a custom SSL Certificate:**
    *   Place your certificate and private key at `/path/to/config/ssl/proxy_cert.pem` and `/path/to/config/ssl/proxy_key.pem`. This overrides the self-signed certificate and can be replaced later with a restart.

*   **To use a custom Server E2EE Key:**
    *   Place your RSA private key at `/path/to/config/ssl/server_key.pem`. This is the core key for the API's end-to-end encryption and validates the server when a client is configured with its public key.
        *   **Generation Command:** `openssl genpkey -algorithm RSA -out /path/to/config/ssl/server_key.pem -pkeyopt rsa_keygen_bits:4096`
        *   **Extraction Command (public key for clients):** `openssl rsa -in server_key.pem -pubout`
