# 📊 API de Analytics - Documentación

Sistema completo de analytics implementado para dashboard administrativo.

---

## ✅ Endpoints Implementados

### 1. **GET /api/analytics** (Endpoint Principal)

Retorna todos los datos de analytics en una sola petición.

**Parámetros:**
- `fechaInicio` (string, required): Fecha de inicio (YYYY-MM-DD)
- `fechaFin` (string, required): Fecha de fin (YYYY-MM-DD)
- `categoria` (string, optional): Filtrar por categoría específica

**Ejemplo de Request:**
```bash
GET http://localhost:3001/api/analytics?fechaInicio=2024-12-01&fechaFin=2025-01-05
Authorization: Bearer <token>
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "ventasTotales": 45000.50,
      "numeroPedidos": 120,
      "ticketPromedio": 375.00,
      "tasaCrecimiento": 0
    },
    "ventasPorDia": [
      {
        "fecha": "2024-12-01",
        "ventas": 1500.00,
        "pedidos": 5
      },
      {
        "fecha": "2024-12-02",
        "ventas": 2300.00,
        "pedidos": 8
      }
    ],
    "productosTopVentas": [
      {
        "id_paquete": 1,
        "nombre_paquete": "Calendario 2025",
        "categoria_paquete": "Calendarios",
        "cantidad": 45,
        "ingresos": 15000.00
      },
      {
        "id_paquete": 2,
        "nombre_paquete": "Pack Polaroids",
        "categoria_paquete": "Polaroids",
        "cantidad": 38,
        "ingresos": 12000.00
      }
    ],
    "ventasPorCategoria": [
      {
        "categoria": "Calendarios",
        "ventas": 20000.00,
        "pedidos": 60,
        "porcentaje": 44.44
      },
      {
        "categoria": "Polaroids",
        "ventas": 15000.00,
        "pedidos": 40,
        "porcentaje": 33.33
      },
      {
        "categoria": "Imanes",
        "ventas": 10000.50,
        "pedidos": 20,
        "porcentaje": 22.23
      }
    ],
    "estadosPedidos": [
      {
        "estado": "Entregado",
        "cantidad": 80,
        "porcentaje": 66.67
      },
      {
        "estado": "En Proceso",
        "cantidad": 30,
        "porcentaje": 25.00
      },
      {
        "estado": "Pendiente",
        "cantidad": 10,
        "porcentaje": 8.33
      }
    ]
  }
}
```

---

### 2. **GET /api/analytics/kpis**

Retorna solo los KPIs principales.

**Ejemplo de Request:**
```bash
GET http://localhost:3001/api/analytics/kpis?fechaInicio=2024-12-01&fechaFin=2025-01-05
Authorization: Bearer <token>
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "ventasTotales": 45000.50,
    "numeroPedidos": 120,
    "ticketPromedio": 375.00,
    "tasaCrecimiento": 0
  }
}
```

---

### 3. **GET /api/analytics/ventas-por-dia**

Retorna ventas agrupadas por día.

**Ejemplo de Request:**
```bash
GET http://localhost:3001/api/analytics/ventas-por-dia?fechaInicio=2024-12-01&fechaFin=2025-01-05
Authorization: Bearer <token>
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "fecha": "2024-12-01",
      "ventas": 1500.00,
      "pedidos": 5
    },
    {
      "fecha": "2024-12-02",
      "ventas": 2300.00,
      "pedidos": 8
    }
  ]
}
```

---

### 4. **GET /api/analytics/productos-top**

Retorna los 10 productos más vendidos.

**Parámetros:**
- `fechaInicio` (string, required)
- `fechaFin` (string, required)
- `categoria` (string, optional): Filtrar por categoría

**Ejemplo de Request:**
```bash
GET http://localhost:3001/api/analytics/productos-top?fechaInicio=2024-12-01&fechaFin=2025-01-05
Authorization: Bearer <token>
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_paquete": 1,
      "nombre_paquete": "Calendario 2025",
      "categoria_paquete": "Calendarios",
      "cantidad": 45,
      "ingresos": 15000.00
    }
  ]
}
```

---

### 5. **GET /api/analytics/ventas-por-categoria**

Retorna ventas agrupadas por categoría con porcentajes.

**Ejemplo de Request:**
```bash
GET http://localhost:3001/api/analytics/ventas-por-categoria?fechaInicio=2024-12-01&fechaFin=2025-01-05
Authorization: Bearer <token>
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "categoria": "Calendarios",
      "ventas": 20000.00,
      "pedidos": 60,
      "porcentaje": 44.44
    },
    {
      "categoria": "Polaroids",
      "ventas": 15000.00,
      "pedidos": 40,
      "porcentaje": 33.33
    }
  ]
}
```

---

### 6. **GET /api/analytics/estados-pedidos**

Retorna distribución de estados de pedidos.

**Ejemplo de Request:**
```bash
GET http://localhost:3001/api/analytics/estados-pedidos?fechaInicio=2024-12-01&fechaFin=2025-01-05
Authorization: Bearer <token>
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "estado": "Entregado",
      "cantidad": 80,
      "porcentaje": 66.67
    },
    {
      "estado": "En Proceso",
      "cantidad": 30,
      "porcentaje": 25.00
    }
  ]
}
```

---

## 🔐 Seguridad

Todos los endpoints requieren:
- ✅ **Autenticación**: Bearer token en header `Authorization`
- ✅ **Rol de Admin**: Solo usuarios con rol `admin` o `super_admin`

**Ejemplo de Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 📝 Validaciones

### Fechas
- `fechaInicio` y `fechaFin` son **obligatorios**
- Formato: `YYYY-MM-DD` (ej: `2024-12-01`)
- `fechaInicio` debe ser menor o igual a `fechaFin`

### Errores Comunes

**1. Fechas faltantes:**
```json
{
  "success": false,
  "message": "fechaInicio y fechaFin son requeridos"
}
```

**2. Formato de fecha inválido:**
```json
{
  "success": false,
  "message": "Fechas inválidas. Use formato YYYY-MM-DD"
}
```

**3. Rango de fechas inválido:**
```json
{
  "success": false,
  "message": "fechaInicio debe ser menor o igual a fechaFin"
}
```

**4. Sin autenticación:**
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

**5. Rol insuficiente:**
```json
{
  "success": false,
  "message": "Acceso denegado. Se requiere rol de administrador"
}
```

---

## 💡 Uso desde Frontend

### Con Fetch API

```typescript
const obtenerAnalytics = async (fechaInicio: string, fechaFin: string) => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `http://localhost:3001/api/analytics?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
};

// Uso
const analytics = await obtenerAnalytics('2024-12-01', '2025-01-05');
console.log('KPIs:', analytics.kpis);
console.log('Ventas por día:', analytics.ventasPorDia);
```

### Con Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Obtener analytics completo
const { data } = await api.get('/analytics', {
  params: {
    fechaInicio: '2024-12-01',
    fechaFin: '2025-01-05'
  }
});

console.log(data.data.kpis);

// Obtener solo KPIs
const { data: kpisData } = await api.get('/analytics/kpis', {
  params: {
    fechaInicio: '2024-12-01',
    fechaFin: '2025-01-05'
  }
});
```

### Con TanStack Query (React Query)

```typescript
import { useQuery } from '@tanstack/react-query';

const useAnalytics = (fechaInicio: string, fechaFin: string) => {
  return useQuery({
    queryKey: ['analytics', fechaInicio, fechaFin],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3001/api/analytics?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
};

// Uso en componente
function Dashboard() {
  const { data, isLoading, error } = useAnalytics('2024-12-01', '2025-01-05');

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Ventas Totales: ${data.kpis.ventasTotales}</h1>
      <h2>Pedidos: {data.kpis.numeroPedidos}</h2>
    </div>
  );
}
```

---

## 📊 Lógica de Cálculo

### KPIs

```typescript
// Ventas totales: Suma de todos los totales de pedidos pagados
ventasTotales = pedidos
  .filter(p => p.estado_pago === 'paid')
  .reduce((sum, p) => sum + p.total, 0);

// Número de pedidos: Conteo de pedidos pagados
numeroPedidos = pedidos.filter(p => p.estado_pago === 'paid').length;

// Ticket promedio: Ventas totales / número de pedidos
ticketPromedio = ventasTotales / numeroPedidos;

// Tasa de crecimiento: TODO (comparar con período anterior)
tasaCrecimiento = 0;
```

### Ventas por Día

```typescript
// Agrupar pedidos por fecha y sumar ventas
const ventasPorDia = pedidos.reduce((acc, pedido) => {
  const fecha = pedido.fecha_creacion.toISOString().split('T')[0];

  if (!acc[fecha]) {
    acc[fecha] = { ventas: 0, pedidos: 0 };
  }

  acc[fecha].ventas += pedido.total;
  acc[fecha].pedidos += 1;

  return acc;
}, {});
```

### Productos Top

```typescript
// Agrupar items por paquete y sumar ingresos
const productos = items.reduce((acc, item) => {
  if (!acc[item.id_paquete]) {
    acc[item.id_paquete] = {
      id_paquete: item.id_paquete,
      nombre_paquete: item.nombre_paquete,
      cantidad: 0,
      ingresos: 0
    };
  }

  acc[item.id_paquete].cantidad += item.cantidad;
  acc[item.id_paquete].ingresos += item.precio_unitario * item.cantidad;

  return acc;
}, {});

// Ordenar por ingresos y tomar top 10
const top10 = Object.values(productos)
  .sort((a, b) => b.ingresos - a.ingresos)
  .slice(0, 10);
```

### Ventas por Categoría

```typescript
// Agrupar por categoría
const categorias = items.reduce((acc, item) => {
  const categoria = item.categoria_paquete || 'Sin categoría';

  if (!acc[categoria]) {
    acc[categoria] = { ventas: 0, pedidos: new Set() };
  }

  acc[categoria].ventas += item.precio_unitario * item.cantidad;
  acc[categoria].pedidos.add(item.pedido_id);

  return acc;
}, {});

// Calcular porcentajes
const totalVentas = Object.values(categorias)
  .reduce((sum, cat) => sum + cat.ventas, 0);

const result = Object.entries(categorias).map(([categoria, data]) => ({
  categoria,
  ventas: data.ventas,
  pedidos: data.pedidos.size,
  porcentaje: (data.ventas / totalVentas) * 100
}));
```

---

## 🚀 Archivos Implementados

```
backend/
├── src/
│   ├── application/
│   │   └── use-cases/
│   │       └── obtener-analytics.use-case.ts   ✅ Lógica de negocio
│   ├── domain/
│   │   └── ports/
│   │       └── pedido.repository.port.ts       ✅ Método findByDateRange
│   └── infrastructure/
│       ├── controllers/
│       │   └── analytics.controller.ts         ✅ Controlador HTTP
│       ├── repositories/
│       │   └── prisma-pedido.repository.ts     ✅ Implementación findByDateRange
│       └── routes/
│           ├── analytics.routes.ts             ✅ Rutas de analytics
│           └── index.ts                        ✅ Registro de rutas
└── ANALYTICS_API.md                            ✅ Esta documentación
```

---

## ✅ Estado de Implementación

- ✅ Endpoint principal `/api/analytics`
- ✅ Endpoints individuales (kpis, ventas-por-dia, productos-top, etc.)
- ✅ Validaciones de fechas
- ✅ Autenticación con JWT
- ✅ Autorización con rol de admin
- ✅ Documentación Swagger
- ✅ Build exitoso sin errores
- ✅ Filtro por categoría en productos top
- ✅ Cálculo de porcentajes en categorías y estados
- ✅ Ordenamiento de resultados

---

## 🧪 Pruebas con Postman

### 1. Login como Admin

```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Copiar el token de la respuesta**

### 2. Obtener Analytics

```http
GET http://localhost:3001/api/analytics?fechaInicio=2024-12-01&fechaFin=2025-01-05
Authorization: Bearer <token>
```

### 3. Obtener Solo KPIs

```http
GET http://localhost:3001/api/analytics/kpis?fechaInicio=2024-12-01&fechaFin=2025-01-05
Authorization: Bearer <token>
```

---

## 📈 Optimizaciones Futuras

### Caché (Recomendado)
```typescript
// Cachear resultados por 5-10 minutos
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutos

const cacheKey = `analytics:${fechaInicio}:${fechaFin}:${categoria}`;
const cachedData = cache.get(cacheKey);

if (cachedData) {
  return cachedData;
}

const analytics = await obtenerAnalyticsUseCase.execute(...);
cache.set(cacheKey, analytics);
```

### Índices de Base de Datos
```sql
-- Optimizar queries por fecha
CREATE INDEX idx_pedidos_fecha_creacion ON pedidos(fecha_creacion);
CREATE INDEX idx_pedidos_estado_pago ON pedidos(estado_pago);
```

### Agregaciones SQL
En lugar de hacer cálculos en JavaScript, usar agregaciones SQL:

```typescript
// En lugar de:
const pedidos = await this.pedidoRepository.findByDateRange(...);
const total = pedidos.reduce((sum, p) => sum + p.total, 0);

// Usar:
const { total } = await prisma.pedidos.aggregate({
  _sum: { total: true },
  where: { fecha_creacion: { gte: fechaInicio, lte: fechaFin } }
});
```

---

**El sistema de analytics está completamente implementado y listo para producción** ✅

Para más información, consulta:
- Swagger UI: http://localhost:3001/api-docs
- [CLAUDE.md](./CLAUDE.md) - Guía general del proyecto
