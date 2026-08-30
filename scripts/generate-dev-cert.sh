#!/usr/bin/env sh

set -eu

cert_dir="${DEV_CERT_DIR:-.certs}"
ca_key_file="$cert_dir/localhost-ca-key.pem"
ca_cert_file="$cert_dir/localhost-ca.pem"
key_file="$cert_dir/localhost-key.pem"
cert_file="$cert_dir/localhost.pem"
hosts_file="$cert_dir/localhost.hosts"
dev_cert_hosts="${DEV_CERT_HOSTS:-localhost,127.0.0.1,::1}"

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl is required to generate the local development certificate" >&2
  exit 1
fi

mkdir -p "$cert_dir"

san_entries="$(printf '%s' "$dev_cert_hosts" | awk '
  BEGIN { RS = "," }
  {
    gsub(/^[[:space:]]+|[[:space:]]+$/, "")
    if ($0 == "" || $0 ~ /[^[:alnum:].:-]/) exit 1
    prefix = ($0 ~ /^[0-9]+(\.[0-9]+){3}$/ || $0 ~ /:/) ? "IP:" : "DNS:"
    printf "%s%s%s", (count++ ? "," : ""), prefix, $0
  }
')" || {
  echo "DEV_CERT_HOSTS must be a comma-separated list of DNS names or IP addresses" >&2
  exit 1
}

umask 077

if [ ! -f "$ca_key_file" ] || [ ! -f "$ca_cert_file" ]; then
  openssl req -x509 -newkey rsa:2048 -sha256 -nodes \
    -keyout "$ca_key_file" \
    -out "$ca_cert_file" \
    -days "${DEV_CA_DAYS:-3650}" \
    -subj "/CN=Dashboard Local Development CA" \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,keyCertSign,cRLSign"
fi

if [ -f "$key_file" ] && [ -f "$cert_file" ] && [ -f "$hosts_file" ] &&
  [ "$(cat "$hosts_file")" = "$dev_cert_hosts" ] &&
  openssl verify -CAfile "$ca_cert_file" "$cert_file" >/dev/null 2>&1; then
  chmod 600 "$ca_key_file" "$key_file" "$hosts_file"
  chmod 644 "$ca_cert_file" "$cert_file"
  echo "Development certificate already exists: $cert_file"
  exit 0
fi

temp_dir="$(mktemp -d "${TMPDIR:-/tmp}/dashboard-dev-cert.XXXXXX")"
trap 'rm -rf "$temp_dir"' EXIT HUP INT TERM

openssl req -new -newkey rsa:2048 -sha256 -nodes \
  -keyout "$key_file" \
  -out "$temp_dir/server.csr" \
  -subj "/CN=localhost"

printf '%s\n' \
  'basicConstraints=critical,CA:FALSE' \
  'keyUsage=critical,digitalSignature,keyEncipherment' \
  'extendedKeyUsage=serverAuth' \
  "subjectAltName=$san_entries" > "$temp_dir/server.ext"

openssl x509 -req \
  -in "$temp_dir/server.csr" \
  -CA "$ca_cert_file" \
  -CAkey "$ca_key_file" \
  -CAserial "$temp_dir/localhost-ca.srl" \
  -CAcreateserial \
  -out "$cert_file" \
  -days "${DEV_CERT_DAYS:-30}" \
  -sha256 \
  -extfile "$temp_dir/server.ext"

printf '%s' "$dev_cert_hosts" > "$hosts_file"
chmod 600 "$ca_key_file" "$key_file" "$hosts_file"
chmod 644 "$ca_cert_file" "$cert_file"
echo "Generated development certificate: $cert_file"
