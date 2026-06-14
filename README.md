<<<<<<< HEAD
# CS2 Map Quiz

Quiz interactivo para aprender los nombres de cada zona de los mapas de CS2.

---

## 🚀 Cómo abrir el proyecto en VS Code

1. Abre VS Code
2. Ve a `Archivo > Abrir Carpeta...` y selecciona la carpeta `cs2-quiz`
3. Instala la extensión **Live Server** (busca "Live Server" de Ritwick Dey en el panel de extensiones)
4. Haz clic derecho sobre `index.html` en el explorador de archivos
5. Selecciona **"Open with Live Server"**
6. Se abrirá el navegador en `http://127.0.0.1:5500`

> ⚠️ **Importante:** Siempre abre el proyecto con Live Server, no haciendo doble clic en index.html directamente. El navegador bloquea la carga de archivos locales por seguridad y el JSON no cargaría.

---

## 📁 Estructura de carpetas

```
cs2-quiz/
├── index.html          → HTML principal
├── css/style.css       → Estilos
├── js/
│   ├── app.js          → Controlador de pantallas y UI
│   ├── quiz.js         → Lógica del quiz
│   └── timer.js        → Cronómetro
├── data/maps.json      → Configuración de mapas y ubicaciones
└── images/
    ├── icons/          → Icono de cada mapa (PNG, ~64x64px)
    └── maps/
        ├── mirage/
        ├── dust2/
        ├── inferno/
        └── ...
```

---

## 🖼️ Cómo añadir imágenes

### Imágenes de fondo (portada del mapa)
Guarda una imagen representativa del mapa como:
```
images/maps/mirage/cover.jpg
```
Tamaño recomendado: 800×450px o mayor. Se recortará automáticamente.

### Iconos de mapa
```
images/icons/mirage.png
```
Usa los iconos oficiales del juego o similares (PNG con fondo transparente, ~64×64px).

### Imágenes de ubicaciones
Por cada lugar del mapa, guarda una o varias fotos:
```
images/maps/mirage/a-site-1.jpg
images/maps/mirage/a-site-2.jpg
images/maps/mirage/a-site-3.jpg
```
En cada partida el juego elegirá **una imagen al azar** de las disponibles para ese lugar.

**Cómo conseguir buenas capturas:**
- Entra en CS2 en modo práctica (`practice with bots`)
- Ve a cada zona del mapa
- Usa `F12` para ocultar el HUD antes de hacer la captura
- Toma 2-3 capturas desde ángulos distintos por ubicación
- Guárdalas como JPG o PNG (recomendado JPG para menor tamaño)

---

## 📋 Cómo editar maps.json

El archivo `data/maps.json` controla todos los mapas y sus ubicaciones. La estructura es:

```json
{
  "maps": [
    {
      "id": "mirage",
      "name": "Mirage",
      "icon": "images/icons/mirage.png",
      "coverImage": "images/maps/mirage/cover.jpg",
      "locations": [
        {
          "id": "a-site",
          "name": "A Site",
          "images": [
            "images/maps/mirage/a-site-1.jpg",
            "images/maps/mirage/a-site-2.jpg"
          ]
        }
      ]
    }
  ]
}
```

### Campos obligatorios
| Campo | Descripción |
|-------|-------------|
| `id` | Identificador único (sin espacios, minúsculas) |
| `name` | Nombre que se muestra en el juego |
| `locations` | Array de ubicaciones del mapa |
| `locations[].name` | Nombre del lugar (aparece como opción de respuesta) |
| `locations[].images` | Array con rutas a las imágenes del lugar (mínimo 1) |

### Campos opcionales
| Campo | Descripción |
|-------|-------------|
| `icon` | Ruta al icono del mapa |
| `coverImage` | Imagen de portada en el selector de mapas |

### Reglas importantes
- Cada mapa necesita **mínimo 4 ubicaciones** para poder generar las 4 opciones de respuesta
- Puedes poner **cuantas imágenes quieras** por ubicación; el juego elige una al azar cada partida
- Los nombres en `"name"` deben ser únicos dentro del mismo mapa

---

## ➕ Añadir un mapa nuevo

1. Crea la carpeta `images/maps/nombreMapa/`
2. Añade la imagen de portada: `cover.jpg`
3. Añade el icono en `images/icons/nombreMapa.png`
4. Añade las imágenes de cada ubicación
5. En `data/maps.json`, añade un nuevo objeto al array `maps`:

```json
{
  "id": "overpass",
  "name": "Overpass",
  "icon": "images/icons/overpass.png",
  "coverImage": "images/maps/overpass/cover.jpg",
  "locations": [
    {
      "id": "a-site",
      "name": "A Site",
      "images": ["images/maps/overpass/a-site-1.jpg"]
    },
    ...
  ]
}
```

---

## 🎮 Cómo funciona el quiz

1. El jugador elige un mapa en la pantalla de inicio
2. Para cada ubicación del mapa:
   - Se muestra **una imagen aleatoria** de las disponibles para ese lugar
   - Aparecen **4 opciones de respuesta**: el nombre correcto + 3 nombres de otros lugares del mapa
   - Tras seleccionar una respuesta, se muestra si es correcta o incorrecta
   - Se avanza automáticamente a la siguiente pregunta
3. Al terminar todas las preguntas, se muestra la pantalla de resultados con:
   - Rango (S / A / B / C / D / F)
   - Número de aciertos y fallos
   - Tiempo total y media por pregunta
   - Barra de precisión
   - Lista de lugares fallados

---

## ✏️ Personalización

El archivo `css/style.css` contiene variables en `:root` al principio para cambiar fácilmente los colores:

```css
:root {
  --accent: #e8722a;   /* Color naranja principal */
  --green: #4ade80;    /* Respuesta correcta */
  --red: #f87171;      /* Respuesta incorrecta */
  ...
}
```

---

## 🗺️ Mapas incluidos en maps.json

El archivo ya incluye todos los mapas del pool competitivo de CS2:
- Mirage (16 ubicaciones)
- Dust 2 (16 ubicaciones)
- Inferno (16 ubicaciones)
- Nuke (14 ubicaciones)
- Vertigo (12 ubicaciones)
- Ancient (12 ubicaciones)
- Anubis (12 ubicaciones)

Solo necesitas añadir las imágenes. El juego funcionará aunque alguna imagen no exista (el navegador simplemente mostrará el área vacía).
=======
# game-cs2-quiz
>>>>>>> b6421653b726f8ec5f39e894e948ae65777c94ea
