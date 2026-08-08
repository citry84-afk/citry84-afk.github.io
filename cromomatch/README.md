# CromoMatch · MVP

Aplicación web/PWA para gestionar álbumes de cromos y descubrir intercambios compatibles mediante QR.

## Qué funciona en esta V1

- Álbum de demostración con estado 0 / 1 / 2 / 3+ por cromo.
- Filtros por equipo y estado.
- Cálculo automático de faltantes y repes.
- QR compacto de la colección.
- El QR abre una URL que contiene una instantánea comprimida del álbum.
- Comparación automática: lo que la otra persona te puede dar y lo que tú le puedes dar.
- Propuesta automática de intercambio equilibrado 1×1.
- Escáner QR integrado cuando el navegador lo permite.
- PWA instalable.
- Backup/importación JSON.
- Sin cuenta obligatoria y sin datos personales dentro del QR.

## Diseño del QR

Cada cromo ocupa 2 bits (0, 1, 2 o 3+ copias). Esto permite transportar cientos de cromos en un QR sin enviar toda la lista como texto.

## Siguiente fase

1. Catálogo real Liga Este cuando esté disponible.
2. Backend/sincronización opcional.
3. Confirmación del intercambio en ambos móviles.
4. Familia / álbum compartido.
5. Cámara para alta rápida de cromos.
6. Multiálbum.
7. Capacitor para iOS y Android.
8. Preparación App Store / Google Play.

CromoMatch es un proyecto independiente y no está afiliado a Panini.
