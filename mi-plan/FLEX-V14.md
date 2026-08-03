# FinanzasFácil v14 · preparación de IBKR Flex

La función `netlify/functions/ibkr-flex-sync.mjs` es un **andamiaje personal/beta**, no una integración SaaS multiusuario terminada.

## Variables de entorno de Netlify

Configurar en la interfaz de Netlify, con alcance **Functions**:

- `IBKR_FLEX_TOKEN`
- `IBKR_FLEX_QUERY_ID`
- `FF_SYNC_SECRET`

No colocar estos valores en `netlify.toml`, JavaScript público, GitHub ni `localStorage`.

## Llamada de prueba

```bash
curl -X POST https://TU-SITIO.netlify.app/api/ibkr-flex-sync \
  -H "x-finanzasfacil-secret: TU_SECRETO" \
  -o activity-flex.csv
```

## Antes de abrirlo a usuarios

Hace falta autenticación de usuario, almacenamiento cifrado por usuario, rotación/revocación de tokens, registro de consentimientos, límites de frecuencia, auditoría y una base de datos que guarde el histórico normalizado. La función actual no debe llamarse desde el navegador con `FF_SYNC_SECRET`, porque expondría el secreto.
