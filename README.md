# Studio Boss

**Studio Boss** es un gestor de disciplina creativa para compositores y productores musicales. La app convierte el seguimiento de sesiones de estudio, descanso y progreso musical en una experiencia gamificada con estética arcade/neón.

El proyecto ha sido refactorizado para pasar de una aplicación de archivo único a una estructura web más clara, mantenible y cercana a un proyecto profesional de DAM.

## Concepto

La idea central es sencilla: ayudar a un compositor a mantener el equilibrio entre producción musical, descanso y vida real.

La app propone un sistema de control semanal donde el usuario registra si ha cumplido sus horarios de trabajo creativo o si se ha pasado de los límites marcados. En lugar de plantearlo como una herramienta fría de productividad, Studio Boss lo convierte en una pequeña máquina arcade personal: puntos, recompensas, historial y estética retro.

## Funcionalidades principales

- Seguimiento del progreso de canciones con objetivo de **60 temas**.
- Barra de progreso y porcentaje completado.
- Sistema de pestañas: **Hoy**, **Semana** e **Historial/Récord**.
- Registro diario de cumplimiento o incumplimiento.
- Horarios diferenciados por día de la semana.
- Días libres protegidos para descanso.
- Sistema de puntos positivos y negativos.
- Recompensas semanales según puntuación.
- Campo de notas para registrar qué se está grabando.
- Historial semanal con estadísticas acumuladas.
- Música 8-bit generada con Web Audio API.
- Persistencia local mediante `localStorage`.
- Estructura separada en HTML, CSS y JavaScript.

## Sistema de juego

Studio Boss utiliza una lógica de recompensa sencilla:

- Cumplir el horario o respetar el descanso suma puntos.
- Saltarse el horario o grabar en días libres resta puntos.
- Al alcanzar cierta puntuación semanal, la app desbloquea pequeñas recompensas simbólicas.

La intención no es castigar, sino hacer visible el equilibrio entre constancia, límites y descanso.

## Horarios configurados

La app incluye una planificación semanal personalizada:

- **Lunes, martes y miércoles:** sesiones de 23:00 a 01:30.
- **Jueves:** sesión extendida de tarde hasta las 03:00, con máximo de 6 horas.
- **Viernes, sábado y domingo:** días libres protegidos.

## Tecnologías utilizadas

- HTML
- CSS
- JavaScript
- LocalStorage
- Web Audio API
- Google Fonts
- Netlify para despliegue online

## Estructura del proyecto

```txt
studio-boss/
├── README.md
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── studio-boss-3.html
```

> `studio-boss-3.html` se conserva como versión original/legacy. La entrada principal del proyecto refactorizado es `index.html`.

## Cómo usarlo

1. Descargar o clonar el repositorio.
2. Abrir `index.html` en el navegador.
3. Registrar el progreso de canciones.
4. Marcar cada día como cumplido, descansado o incumplido.
5. Revisar la puntuación semanal y el historial.

No requiere instalación ni servidor externo.

## Aprendizajes trabajados

Este proyecto sirve para practicar:

- Separación de responsabilidades entre HTML, CSS y JavaScript.
- Creación de aplicaciones web con estructura mantenible.
- Diseño de interfaces con identidad visual fuerte.
- Manipulación dinámica del DOM con JavaScript.
- Persistencia de datos en navegador con `localStorage`.
- Lógica de gamificación aplicada a hábitos reales.
- Gestión de fechas, semanas y registro histórico.
- Uso básico de audio en navegador mediante Web Audio API.
- Diseño responsive orientado a uso cotidiano.

## Posibles mejoras futuras

- Añadir enlace directo a la demo de Netlify.
- Añadir capturas de pantalla al README.
- Añadir exportación/importación de datos.
- Crear modo edición para personalizar horarios y recompensas.
- Añadir estadísticas visuales más completas.
- Incluir modo oscuro/retro alternativo.
- Revisar accesibilidad y navegación con teclado.

## Estado del proyecto

Proyecto funcional en fase de aprendizaje y mejora continua.

## Autor

Proyecto creado por **Sergio Devece** dentro de su proceso de aprendizaje en desarrollo web, productividad creativa y aplicaciones personalizadas.
