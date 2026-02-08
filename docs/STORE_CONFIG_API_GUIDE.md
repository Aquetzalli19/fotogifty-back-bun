# Guía de API - Configuración de Tienda

## 📍 Endpoints Implementados

### 1. GET `/api/configuracion-tienda` (Público)

Obtiene la configuración actual de la tienda física.

**No requiere autenticación** ✅

#### Request
```bash
curl http://localhost:3001/api/configuracion-tienda
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "FotoGifty - Tienda Principal",
    "direccion": "Av. Principal #123, Col. Centro",
    "ciudad": "Ciudad de México",
    "estado": "CDMX",
    "codigo_postal": "01000",
    "pais": "México",
    "telefono": "55-1234-5678",
    "email": "contacto@fotogifty.com",
    "latitud": 19.432608,
    "longitud": -99.133209,
    "horario_lunes_viernes": "Lunes a Viernes: 9:00 AM - 7:00 PM",
    "horario_sabado": "Sábado: 10:00 AM - 3:00 PM",
    "horario_domingo": "Domingo: Cerrado",
    "descripcion": "Nuestra tienda principal en el centro de la ciudad",
    "instrucciones_llegada": "Estamos frente al parque central, edificio azul",
    "fecha_actualizacion": "2026-02-02T09:07:49.708Z",
    "actualizado_por": null
  }
}
```

---

### 2. PUT `/api/configuracion-tienda` (Admin/Super Admin)

Actualiza la configuración de la tienda.

**Requiere autenticación y rol de administrador** 🔒

#### Request
```bash
curl -X PUT http://localhost:3001/api/configuracion-tienda \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "FotoGifty - Nueva Ubicación",
    "direccion": "Calle Nueva #456, Col. Reforma",
    "ciudad": "Guadalajara",
    "estado": "Jalisco",
    "codigo_postal": "44100",
    "pais": "México",
    "telefono": "33-9876-5432",
    "email": "tienda@fotogifty.com",
    "latitud": 20.676667,
    "longitud": -103.347222,
    "horario_lunes_viernes": "Lunes a Viernes: 10:00 AM - 8:00 PM",
    "horario_sabado": "Sábado: 10:00 AM - 5:00 PM",
    "horario_domingo": "Domingo: 11:00 AM - 3:00 PM",
    "descripcion": "Nueva ubicación en el centro de Guadalajara",
    "instrucciones_llegada": "Frente a la plaza comercial"
  }'
```

#### Campos Requeridos
- `nombre` (string)
- `direccion` (string)
- `ciudad` (string)
- `estado` (string)
- `codigo_postal` (string)
- `pais` (string)
- `telefono` (string)
- `latitud` (number, entre -90 y 90)
- `longitud` (number, entre -180 y 180)

#### Campos Opcionales
- `email` (string)
- `horario_lunes_viernes` (string)
- `horario_sabado` (string)
- `horario_domingo` (string)
- `descripcion` (string)
- `instrucciones_llegada` (string)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Configuración de tienda actualizada correctamente",
  "data": { /* configuración actualizada */ }
}
```

#### Response (401 Unauthorized)
```json
{
  "success": false,
  "message": "Acceso denegado. No se proporcionó token de autenticación"
}
```

#### Response (403 Forbidden)
```json
{
  "success": false,
  "message": "Acceso denegado. Se requiere rol de administrador"
}
```

#### Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Latitud inválida (debe estar entre -90 y 90)"
}
```

---

## 🗺️ Uso de Coordenadas para Mapas

### Google Maps
```javascript
const { latitud, longitud } = data;
const mapUrl = `https://www.google.com/maps?q=${latitud},${longitud}`;
```

### React con Google Maps
```jsx
import { GoogleMap, Marker } from '@react-google-maps/api';

function StoreMap({ config }) {
  const center = {
    lat: config.latitud,
    lng: config.longitud
  };

  return (
    <GoogleMap center={center} zoom={15}>
      <Marker position={center} />
    </GoogleMap>
  );
}
```

### Leaflet (Open Source)
```javascript
import L from 'leaflet';

const map = L.map('map').setView([config.latitud, config.longitud], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker([config.latitud, config.longitud]).addTo(map);
```

---

## 📦 Ejemplo de Integración en Carrito

```jsx
import { useEffect, useState } from 'react';

function CheckoutPage() {
  const [storeConfig, setStoreConfig] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('envio_domicilio');

  useEffect(() => {
    // Obtener configuración de la tienda
    fetch('http://localhost:3001/api/configuracion-tienda')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStoreConfig(data.data);
        }
      });
  }, []);

  return (
    <div>
      <h2>Método de Entrega</h2>

      <label>
        <input
          type="radio"
          value="envio_domicilio"
          checked={deliveryMethod === 'envio_domicilio'}
          onChange={(e) => setDeliveryMethod(e.target.value)}
        />
        Envío a domicilio
      </label>

      <label>
        <input
          type="radio"
          value="recoger_tienda"
          checked={deliveryMethod === 'recoger_tienda'}
          onChange={(e) => setDeliveryMethod(e.target.value)}
        />
        Recoger en tienda
      </label>

      {deliveryMethod === 'recoger_tienda' && storeConfig && (
        <div className="store-info">
          <h3>Ubicación de la Tienda</h3>
          <p><strong>{storeConfig.nombre}</strong></p>
          <p>{storeConfig.direccion}</p>
          <p>{storeConfig.ciudad}, {storeConfig.estado} {storeConfig.codigo_postal}</p>
          <p>📞 {storeConfig.telefono}</p>

          {storeConfig.horario_lunes_viernes && (
            <div>
              <h4>Horarios</h4>
              <p>{storeConfig.horario_lunes_viernes}</p>
              <p>{storeConfig.horario_sabado}</p>
              <p>{storeConfig.horario_domingo}</p>
            </div>
          )}

          {storeConfig.instrucciones_llegada && (
            <div>
              <h4>Cómo llegar</h4>
              <p>{storeConfig.instrucciones_llegada}</p>
            </div>
          )}

          {/* Mapa */}
          <a
            href={`https://www.google.com/maps?q=${storeConfig.latitud},${storeConfig.longitud}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver en Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Ejemplo de Integración en Landing Page

```jsx
function StoreSection() {
  const [storeConfig, setStoreConfig] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/configuracion-tienda')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStoreConfig(data.data);
        }
      });
  }, []);

  if (!storeConfig) return <div>Cargando...</div>;

  return (
    <section className="store-location">
      <h2>Visítanos</h2>
      <div className="store-details">
        <div className="info">
          <h3>{storeConfig.nombre}</h3>
          <p>{storeConfig.descripcion}</p>

          <div className="address">
            <h4>Dirección</h4>
            <p>{storeConfig.direccion}</p>
            <p>{storeConfig.ciudad}, {storeConfig.estado}</p>
            <p>CP: {storeConfig.codigo_postal}</p>
          </div>

          <div className="contact">
            <p>📞 {storeConfig.telefono}</p>
            {storeConfig.email && <p>✉️ {storeConfig.email}</p>}
          </div>

          <div className="hours">
            <h4>Horarios</h4>
            <p>{storeConfig.horario_lunes_viernes}</p>
            <p>{storeConfig.horario_sabado}</p>
            <p>{storeConfig.horario_domingo}</p>
          </div>
        </div>

        <div className="map">
          {/* Integrar mapa aquí */}
          <iframe
            width="100%"
            height="400"
            frameBorder="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${storeConfig.longitud-0.01},${storeConfig.latitud-0.01},${storeConfig.longitud+0.01},${storeConfig.latitud+0.01}&marker=${storeConfig.latitud},${storeConfig.longitud}`}
          />
        </div>
      </div>
    </section>
  );
}
```

---

## 🔐 Panel de Admin

Para actualizar la configuración, necesitas:

1. Obtener un token de administrador (login con cuenta admin)
2. Usar el endpoint PUT con el token en el header Authorization

```javascript
async function updateStoreConfig(token, newConfig) {
  const response = await fetch('http://localhost:3001/api/configuracion-tienda', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newConfig)
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ Configuración actualizada:', data.message);
  } else {
    console.error('❌ Error:', data.message);
  }
}
```

---

## 📚 Documentación Swagger

La documentación completa está disponible en:

**http://localhost:3001/api-docs**

Busca la sección "Configuración de Tienda" para probar los endpoints directamente desde el navegador.

---

## 🗄️ Base de Datos

La configuración se almacena en la tabla `configuracion_tienda`:

```sql
SELECT * FROM configuracion_tienda WHERE id = 1;
```

**Nota:** Solo debe existir UN registro en esta tabla (id=1).

---

## 🔧 Comandos Útiles

```bash
# Regenerar la configuración inicial
bun run scripts/seed-store-config.ts

# Ver la configuración actual
curl http://localhost:3001/api/configuracion-tienda | jq

# Iniciar el servidor
bun run dev

# Ver documentación Swagger
open http://localhost:3001/api-docs
```

---

## 🎯 Próximos Pasos

1. ✅ **Backend completado**
2. 🔄 **Frontend - Carrito**: Integrar GET en la página de checkout
3. 🔄 **Frontend - Landing**: Agregar sección con mapa de ubicación
4. 🔄 **Frontend - Admin Panel**: Crear formulario para actualizar configuración
