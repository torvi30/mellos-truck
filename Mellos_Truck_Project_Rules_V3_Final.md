# Especificaciones y Reglas del Proyecto: Mellos Truck 🚛🛠️ (V3 - Final: Arquitectura & Medios)

## 1. Contexto del Negocio
"Mellos Truck" es un negocio de alto nivel dedicado a la modificación, fabricación de bompers, latonería y venta de repuestos / lujos para vehículos de carga pesada.

- **Taller de Modificaciones:** Intervenciones estéticas y estructurales (Kenworth, Mack, Freightliner, International, Peterbilt).
- **Tienda "Container":** Punto de venta físico y distribución de lujos, acero inoxidable e iluminación LED.

## 2. Stack Tecnológico (Optimizado & Escalable)
- **Backend:** Node.js con Express (Arquitectura RESTful).
- **Base de Datos:** MySQL (Consultas parametrizadas, control de transacciones).
- **Control de Versiones:** Git / GitHub (Flujo de ramas por funcionalidad).
- **Frontend:** React / Vite con diseño cinematográfico de alto impacto visual.
- **Automatización:** node-cron (para alertas de inventario) + API Bot Telegram (Notificaciones 100% gratuitas).

## 3. Módulos Core & UX Avanzada

### A. Inventario Inteligente
- Control de stock en tiempo real.
- Sistema de alertas automáticas (Telegram) cuando un producto llega al `min_stock_alert`.
- Categorización avanzada: Lujos, Iluminación, Estructura, Acero Inoxidable, Escapes y Cornetas.

### B. Taller y Órdenes de Trabajo
- Trazabilidad total de la mula (Ingreso -> Taller -> Pintura/Acabados -> Entrega).
- Descuento automático de inventario al asignar piezas a una orden de trabajo.

### C. Showroom Cinematográfico (El Diferenciador "Pro")
- **Galería diseñada para alto impacto visual:** exhibición dinámica y elegante, sin trabas de rendimiento.
- **Streaming de Medios:** Backend en Express sirviendo video en fragmentos (HTTP Status 206 Partial Content) para reproducción instantánea de tomas cinemáticas y vuelos de dron.
- **Soporte para resoluciones altas:** Preparado para planos detalle nítidos (acero, cromo, iluminación).
- **Slider Comparativo:** Componente visual interactivo de "Antes y Después" ultra fluido y responsive.
- **Magic Link Comercial:** Endpoint que emite un enlace público único de solo lectura por vehículo/orden terminada (ej: `/galeria/Kenworth-T800-Placa-WTL123`) para compartir con el dueño por WhatsApp y viralizar el trabajo del taller.

## 4. Estructura de Base de Datos (MySQL)
- `users` (id, rol, nombre, password_hash, created_at)
- `products` (id, nombre, sku, precio, stock, min_stock_alert, categoria, created_at)
- `work_orders` (id, cliente, placa, descripcion, estado, slug, magic_token, created_at, updated_at)
- `work_order_items` (id, order_id, product_id, cantidad)
- `gallery` (id, work_order_id, type [photo/video], url, thumbnail_url, is_before_after, before_url, after_url, title, created_at)

## 5. Directrices de Rendimiento & UI/UX
- **Rendimiento:** Tiempos de respuesta inmediatos, lazy-loading de assets pesados, buffering controlado.
- **Video Streaming:** Controlador especializado (`streaming.controller.js`) que maneje peticiones con cabeceras `Range` y códigos HTTP 206.
- **Diseño Visual:** Dark Industrial cinematográfico (negros profundos, aceros cepillados, acentos ámbar/neón, tipografía robusta e imponente) acorde a la potencia del mundo de vehículos pesados.
