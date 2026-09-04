# Product Requirements Document (PRD) / Project Brief
## Portal y Aplicación Móvil de Socios & Control Operativo
### San Ignacio Rugby Club (SIR 1979) — Mar del Plata

---

## 1. Resumen Ejecutivo (Executive Summary)
**San Ignacio Rugby Club** es una institución deportiva y social fundada en 1979 en Mar del Plata (predio Valle Hermoso), con disciplinas principales de Rugby y Hockey en todas sus divisiones competitivas y formativas.

El presente proyecto abarca la concepción, arquitectura de información y diseño de interfaces para el ecosistema digital del club, compuesto por:
1. **PWA Mobile First para Socios y Jugadores**: Carnet digital con validación QR offline-ready, consulta de estado de cuota, reserva de quinchos/parrillas, directorio de beneficios comerciales y ficha institucional del club.
2. **Portal Web / Desktop de Gestión & Onboarding**: Flujos de inicio de sesión institucional y solicitud de alta / empadronamiento digital con validación administrativa.
3. **Módulo Operativo de Control de Acceso (Portería / Guardia Nocturna)**: Interfaz de escaneo QR de alto contraste optimizada para condiciones nocturnas y validación en tiempo real de vehículos y peatones.

---

## 2. Objetivos del Producto & Métricas de Éxito

### Objetivos Clave
- **Eliminar el carnet plástico físico**: Digitalizar al 100% las credenciales de socios y jugadores mediante carnets con código QR dinámico y compatibilidad offline en zonas con baja conectividad celular (Valle Hermoso).
- **Agilizar el acceso al predio**: Reducir los tiempos de espera en la guardia de portería a menos de 4 segundos por socio/vehículo.
- **Transparencia en cobranzas y cuotas**: Visibilidad instantánea del estado de pago (Al día vs. En mora) para incentivar la regularización antes de fines de semana de partidos.
- **Optimizar la utilización de instalaciones**: Centralizar la reserva de parrillas y quinchos bajo reglas claras (reserva por franja horaria, cancelación con 24 h de anticipación).
- **Fidelizar la comunidad SIR**: Poner en valor los acuerdos comerciales locales en Mar del Plata (gastronomía, deportes, salud).

### Métricas de Éxito (KPIs)
- **Adopción de PWA**: > 85% de socios activos con credencial digital instalada en los primeros 90 días.
- **Reducción de morosidad pasiva**: Disminución del 30% en socios con más de 2 meses adeudados mediante avisos y bloqueos preventivos en carnet.
- **Tasa de éxito en portería**: > 98% de lecturas validadas exitosamente sin necesidad de intervención manual por DNI.

---

## 3. Perfiles de Usuario (User Personas)

1. **El Jugador / Socio Activo (18–35 años)**:
   - Requiere acceso inmediato a su carnet para ingresar al predio los días de entrenamiento y partido, consultar partidos del fin de semana (fixture) y reservar parrillas para terceros tiempos.
2. **El Socio Familiar / Padre o Madre (35–55 años)**:
   - Gestiona el acceso de sus hijos a categorías infantiles/juveniles, consulta estado de cuota familiar y aprovecha descuentos en comercios adheridos.
3. **El Socio Vitalicio / Mayor (55+ años)**:
   - Requiere tipografía legible, alto contraste visual, textos claros y sin interfaces saturadas o flujos complejos.
4. **El Personal de Portería / Guardia**:
   - Opera en exteriores y cabina de noche; requiere modo oscuro/nocturno sin encandilamiento, feedback visual grande (verde/rojo) y opciones de anulación manual de barrera con registro de excepciones.
5. **Secretaría Administrativa**:
   - Recibe solicitudes de empadronamiento, valida altas y gestiona padrón de socios.

---

## 4. Arquitectura de Información & Pantallas Diseñadas

### 4.1. Módulo Socio (PWA Mobile — 390 × 844 px)
- **Carnet Digital de Socio (Pantalla Principal)**:
  - Header verde `#2D5233` institucional con isotipo SIR y acceso a notificaciones.
  - Credencial central con foto de socio, escudo del club, número de socio, DNI, categoría deportiva (e.g. Rugby Plantel Superior) y QR de acceso con brillo táctil automático.
  - Indicador de estado de cuota (*Cuota al día* con chip verde).
  - Banner informativo offline (*"Tu carnet funciona sin internet"*).
  - Variante de credencial: **Carnet Digital en Mora** (fondo de alerta roja, chip "Socio en mora", detalle de cuotas adeudadas y etiqueta de "Acceso limitado").
  - Barra de navegación inferior de 5 secciones fijas: Carnet, Beneficios, Parrillas, Club, Perfil.

- **Reserva de Parrillas**:
  - Selector de fecha calendario, selector de turno (Mediodía / Noche) y listado de quinchos/parrillas disponibles con capacidad.
  - Hoja modal (*Bottom Sheet*) de confirmación de reserva con resumen de políticas de uso y cancelación obligatoria previa a 24 horas.
  - Pantalla de **Reserva Confirmada** con tilde institucional, código de reserva, opción de compartir por WhatsApp y cancelación directa.

- **Beneficios del Club**:
  - Buscador y filtro por categorías (Gastronomía, Deportes, Salud & Bienestar, Indumentaria).
  - Fichas de comercios locales en Mar del Plata (Parrilla El Tercer Tiempo, Open Sports, etc.) con porcentaje de descuento exclusivo.
  - Pantalla de **Detalle de Beneficio**: Fotografía de comercio, porcentaje destacado, código o botón para exhibir en mostrador, y accesos rápidos (Llamar, Ver en mapa, WhatsApp).

- **El Club & Fixture**:
  - Encabezado con imagen histórica del predio Valle Hermoso, monograma SIR y fundación (1979).
  - Próximos partidos de Rugby y Hockey (Plantel Superior, Intermedia, M-19) con sede, horario y rival.
  - Vías oficiales de contacto, secretaría y enlaces a redes sociales.

- **Mi Perfil**:
  - Avatar del socio, datos personales (DNI, Teléfono, Correo, Dirección) y datos deportivos (Categoría, Disciplina, Fecha de alta).
  - Accesos a estado de cuenta, configuración de privacidad y cierre de sesión.

- **Estado de Cuenta**:
  - Tarjeta de resumen de cuota mensual actual con indicador de vencimiento.
  - Historial de últimos pagos realizados.
  - Aviso de pasarela de pago digital: *"Pago online — próximamente"* y datos de transferencia bancaria de la sede.

### 4.2. Módulo de Autenticación y Onboarding (Web / Responsive)
- **Inicio de Sesión**:
  - Fondo verde institucional `#2D5233` con fotografía sutil de cancha en B&N.
  - Isotipo oficial de San Ignacio Rugby sin fondo.
  - Acceso por DNI/Número de socio y contraseña.
  - Enlace de recuperación y pie de página de acceso restringido a socios registrados.
- **Solicitar Acceso / Activá tu Cuenta**:
  - Formulario de empadronamiento digital (N° de socio opcional, DNI, Email, Teléfono, Contraseña).
  - Aceptación de términos y política del club.
  - Asistencia directa vía WhatsApp con Secretaría para socios que desconocen su número de padrón.

### 4.3. Módulo Operativo de Acceso (Tablet / Desktop — Portería)
- **Control de Acceso (Modo Nocturno)**:
  - Paleta casi negra/verde oscura (`#070c09`) para uso nocturno sin deslumbramiento.
  - Visor de cámara activo con marco guía para escaneo de QR de socio.
  - Contador en vivo: *"Ingresos hoy: 47"* y estado de conexión online.
  - **Tarjeta de lectura positiva**: Indicador verde de barrera abierta, nombre, categoría, cuota al día y aviso de reserva de parrilla del día.
  - **Tarjeta de lectura con alerta de mora**: Indicador rojo, cuotas adeudadas y botón supervisor *"Permitir de todas formas"* con registro de excepción.
  - Lista de los últimos 3 accesos registrados e ingreso manual por DNI.

---

## 5. Identidad Visual & Sistema de Diseño

- **Nombre del Sistema**: San Ignacio Heritage
- **Color Primario Institucional**: Verde Bosque / Verde Inglés Rugby (`#2D5233` / `#1F3A24`)
- **Colores de Acento & Semánticos**:
  - Verde éxito: `#22c55e` / `#15803d`
  - Rojo advertencia / mora: `#991b1b` / `#ef4444` (con fondo contenedor `#450a0a` / `#fef2f2`)
  - Fondo general socio: Superficie clara marfil/gris verdoso suave (`#f4fbf2` / `#f8fafc`)
  - Fondo operativo portería: Carbón verdoso ultra oscuro (`#070c09`)
- **Tipografía**:
  - Títulos y Monogramas: *Libre Caslon Text* / *Libre Baskerville* (remite a la tradición, elegancia y herencia del rugby de clubes).
  - Cuerpo, interfaces y datos numéricos: Sans-serif moderna, alta legibilidad y jerarquía clara.
- **Imagotipo Oficial**: Monograma institucional con siglas entrelazadas SIR y balón ovalado mundialista.

---

## 6. Requerimientos Funcionales y No Funcionales

### Requerimientos Funcionales
1. **Generación & Validación de QR**:
   - Cada socio cuenta con un token QR firmado criptográficamente que caduca periódicamente para evitar capturas de pantalla compartidas entre no socios.
2. **Caché Offline**:
   - Los datos básicos del carnet y el token QR se almacenan en LocalStorage/IndexedDB para permitir acreditación sin cobertura de red.
3. **Gestión de Reservas de Parrillas**:
   - Límite de reservas simultáneas por socio (máximo 1 activa por fin de semana).
   - Bloqueo automático en caso de registrar cuotas en mora.
4. **Registro de Auditoría de Accesos**:
   - Almacenamiento de logs de ingresos en portería con timestamp, operario y estado de barrera.

### Requerimientos No Funcionales
- **Accesibilidad**: Contraste AA/AAA en todas las áreas de texto crítico.
- **Rendimiento**: Tiempo de carga inicial (FCP) menor a 1.5 segundos en redes móviles 3G/4G.
- **Compatibilidad**: Funcionamiento óptimo en navegadores móviles Safari (iOS) y Chrome (Android) como PWA con capacidad de instalación en pantalla de inicio.

---

## 7. Roadmap y Fases de Implementación

| Fase | Alcance | Hito Principal |
| :--- | :--- | :--- |
| **Fase 1 (MVP)** | Carnet Digital PWA + Login + Solicitud de acceso + Control de portería básico. | Digitalización del acceso y reemplazo del carnet físico. |
| **Fase 2** | Sistema de Reserva de Parrillas + Módulo de Beneficios con geolocalización. | Servicios de valor agregado para socios. |
| **Fase 3** | Integración de pasarela de pago (Mercado Pago / Débito automático) + Notificaciones push de fixture. | Autogestión completa de cuotas y vida deportiva. |
