# 🎮 Minijuego Web - Starlink Señal

## 🎯 Objetivo
Crear un minijuego web interactivo utilizando **React** para la lógica y **Tailwind CSS** para todos los estilos.

La aplicación debe ocupar toda la pantalla (`full screen`) y ser responsive.

---

## 🎨 Diseño

- El fondo debe utilizar la imagen `fondo.png`, cubriendo toda la pantalla (`bg-cover`, `bg-center`).
- En la parte inferior centrada debe mostrarse la imagen `starlink_estandar.png`, representando una antena.
- En la parte superior debe mostrarse la imagen `satelite.png`.

---

## 🛰️ Comportamiento del satélite

- El satélite debe moverse horizontalmente de izquierda a derecha de forma continua y suave.
- El tipo de animación queda a elección:
  - `setInterval`
  - `requestAnimationFrame`
  - CSS animations
  - o librerías externas

---

## 🔫 Interacción

- Al hacer click en cualquier parte de la pantalla, la antena debe disparar un láser hacia arriba.
- El láser puede representarse como:
  - una línea vertical
  - una animación simple
- Debe implementarse usando Tailwind o CSS (no es necesario usar canvas).

---

## 📏 Lógica del juego

- En cada disparo, calcular la distancia horizontal entre:
  - el centro de la antena
  - la posición del satélite

- Según esa distancia, mostrar un mensaje:

| Distancia        | Resultado       |
|-----------------|----------------|
| Muy cerca       | Buena señal     |
| Cerca           | Señal débil     |
| Lejos           | Mala señal      |
| Muy lejos       | Sin señal       |

---

## 💬 UI / Feedback

- Mostrar el resultado centrado en pantalla.
- Debe tener buen contraste sobre el fondo.

Usar Tailwind para:

- Tipografía:
  - `text-xl`, `text-2xl`, `font-bold`
- Colores según estado:
  - Verde → Buena señal
  - Amarillo → Señal débil
  - Naranja → Mala señal
  - Rojo → Sin señal
- Estilos:
  - `shadow`
  - `rounded`
  - `p-*` (padding)

---

## ✨ Extras (opcional pero recomendado)

- Agregar transiciones suaves:
  - `transition`
  - `duration-*`
- Animación del láser:
  - fade
  - escala
  - crecimiento vertical
- Feedback visual adicional:
  - efectos hover
  - glow en aciertos

---

## ⚙️ Restricciones

- ❌ No usar motores de juego (Phaser, Unity, etc.)
- ✅ Usar únicamente React + Tailwind + libreria de animacion si es necesario que te parezca la mejor
- ✅ Código claro, modular y mantenible

---