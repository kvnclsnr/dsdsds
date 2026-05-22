Generate a detailed, multi-screen high-fidelity design flow for a premium native mobile application named 'DesVía', optimized for the latest smartphone screens, focusing on an advanced traffic impact analysis tool for the city of Santa Marta, Colombia.

**CRITICAL REQUIREMENT:** All user-facing text, labels, buttons, titles, graph axes, placeholders, and simulated data throughout the entire application MUST be written strictly in Spanish.

**Overall Aesthetic:** The application must embody a cutting-edge "Liquid Glass" design language of the highest sophistication, inspired by premium iOS aesthetics and deep dark mode. This style features subtle multi-layered glass textures, refined multi-point light play, soft glowing edges, and translucent surfaces with smooth, beveled edges. Surfaces look slick and almost wet. Accent colors are soft, glowing cyan-blues and magenta-purples, with precise light-refraction effects. Typography is clean, elegant, and highly readable. *The default Material Design look is forbidden.*

**Screen 1: Dashboard / Inicio (Initial Screen):**
* This screen is a rich, detailed dashboard based on image_3.png, rendered in the full Liquid Glass style.
* **Custom Scrollbar:** A visible, ultra-thin and elegant scrollbar, made of frosted translucent glass with softly beveled edges, integrated seamlessly.
* **Header:** A Liquid Glass frosted header card with the app name 'DesVía' and subtitle 'Planificación de Tráfico Urbano'. Includes a refined Liquid Glass profile icon.
* **Summary Metrics (Cards):** Three Liquid Glass frosted blocks (from image_3.png), with custom icon, label, and value. (Analysis: '12', Improvement: '18.5%' (glowing green), Streets: '8').
* **Main Action Button:** A large Liquid Glass frosted block with a soft, glowing blue-to-purple gradient. Features a prominent, raised '+' icon, and text 'Nuevo análisis' and 'Simular cambios en vías'. Clicking this block transitions to Screen 2.
* **Recent Analysis List:** 'Análisis recientes' section, with elegant individual via cards from image_3.png (e.g., 'Av. del Río', 'Cra 5ta Centro'). Each card is made of dark, slick Liquid Glass.
* **Bottom Navigation Bar:** A detailed Liquid Glass bottom bar from image_3.png with custom glowing icons and labels: 'Inicio' (active), 'Análisis', 'Historial', 'Perfil'.

**Screen 2: Drawing Route / Trazar Ruta (After clicking 'Nuevo análisis'):**
* **Base Layer: Visible Santa Marta Map:** The dark-mode vector map of Santa Marta city must be prominently visible as the background layer, showing major streets and the coastline. Controls and points layer on top.
* **Top Overlay Card:** Title: 'Dibujar ruta'. Subtitle: 'Toca en el mapa para marcar puntos...'. Includes a search bar and a road name bar (both with placeholders, e.g., 'Nombre de la vía: Av. del Río').
* **Mapping Logic:** When the user taps to place a point on the Santa Marta map, it must automatically snap and center itself on the centerline of the closest existing street or road. Points are numbered and connect with glowing lines.
* **'Ambos Carriles' Toggle:** A custom glass design switch toggle. Title: 'Ambos carriles'. Subtext: 'Aplica el cambio en ambas direcciones'. When active, points snap to the exact geometric center of double-carriage roads, and the line is much thicker, covering both lanes geometrically.
* **Route Display (on map):** Show numbered points (1, 2, 3) connected by soft, glowing cyan-blue lines following street directions as seen in image_1.png (except in 'Ambos carriles' mode, which ignores direction). Add map zoom controls (+, -).
* **Points Counter Card:** From image_1.png: 'Puntos marcados', '3 puntos', '15 metros ajustados', red 'Limpiar' button.
* **Bottom Controls:** Retain 'Cancelar' and 'Confirmar' rounded glass buttons.

**Screen 3: Define Change (After route confirmation):**
* A clean, icon-driven frosted Liquid Glass interface. Title: 'Definir Cambio en el Tramo'.
* **Step 1: Change Type.** Select change: 'Cierre total por construcción', 'Cambio de sentido (doble a único)', 'Restricción: Motos', 'Restricción: Vehículos Particulares', 'Zona de parqueo prohibido'.
* **Step 2: Schedule.** Change hours: 'Las 24 horas del día' vs. 'Ciertas horas específicas'.
* **Step 3: Time Intervals (Conditional).** Custom picker/fields for 'Desde' and 'Hasta', with a visible '+' button 'Añadir otro intervalo'. Show added intervals.

**Screen 4: Analysis Screen (Final Results):**
* Title: 'Análisis de Impacto: Santa Marta' (with 'DesVía' branding).
* **Text Analysis Block:** High-fidelity paragraph of text explaining the detailed analysis (e.g., 'El cambio en la Av. del Río aumentará el tráfico en la zona Centro y El Rodadero... El tiempo promedio...').
* **Graphical Data Visualization:** A large, detailed, custom line or area graph made of refracted glass light. Shows 24h timeline (00:00 to 24:00) on X-axis, and impact percentage (-100% to +100%) on Y-axis. Show two glowing lines: 'Proyección del Cambio' and 'Tráfico Base'. Visually highlight and label 'Horas Pico' zones (e.g., 07:00-09:00, 17:00-19:00). Callout labels to graph points: '+75% a las 18:00 (Hora Pico)', '-20% a las 11:00 (Hora Normal)'. Text label: 'Efectividad Proyectada vs. Tráfico Base'.
* **Final Summary Card:** 'Tramo Analizado: [Nombre del tramo]'. Key metrics with percentages: 'Impacto Global: +35% congestión', 'Impacto en Horas Pico: +60%', 'Efectividad de Desvíos: 40%', 'Afectación en Zonas Aledañas: +15%'.
* All UI elements feature the iOS 26 Liquid Glass style, with soft glows, precise light play, and deep translucency.