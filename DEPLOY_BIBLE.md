# La Biblia del Despliegue Inicial: Plimsoll AI

Este documento constituye la hoja de ruta definitiva para llevar a Plimsoll AI de un entorno de desarrollo local a un estándar de producción global, resiliente y de alto rendimiento. Se ha diseñado como una arquitectura híbrida que garantiza la soberanía del dato en tierra (Nube) y la supervivencia operativa en el mar (Offline), manteniendo un presupuesto operativo inferior a los $70 USD mensuales.

## Filosofía del Diseño: El Gemelo Digital Resiliente

La arquitectura de Plimsoll no puede permitirse depender de una conexión constante a internet. En muelles de carga pesada o en medio del océano, la conectividad es un lujo, no una garantía. Por ello, nuestra decisión fundacional es tratar la aplicación web como una Progressive Web App (PWA) de nivel avanzado. Esto significa que la aplicación no se "visita", se "instala" en la tablet del inspector. Mediante Service Workers, cacheamos el 100% de la lógica de la interfaz, el motor 3D de Three.js y los recursos estáticos. El para qué de esto es simple: que el inspector pueda abrir su tablet en el punto más remoto del puerto de Róterdam y que la app cargue instantáneamente, permitiéndole iniciar un Draft Survey sin un solo bit de red.

Para que esto sea perfecto, el estado de la aplicación debe ser inmortal. Aquí es donde entra la combinación de Zustand y persistencia en IndexedDB. Al usar el navegador como una base de datos local, cada número de calado, cada densidad de agua y cada nota de voz se guardan físicamente en el chip de memoria de la tablet. Si el dispositivo se apaga bruscamente o la pestaña se cierra, el progreso de la auditoría está blindado. El objetivo es que la tecnología sea invisible para el usuario y solo se manifieste como una herramienta que "simplemente funciona".

## El Cerebro en la Nube: Inferencia Pesada y Almacenamiento

El segundo pilar aborda la potencia de cálculo. Plimsoll no es un simple gestor de formularios; es un sistema de visión computacional que debe procesar videos de alta resolución para detectar milímetros de agua. Tras reconsiderar las opciones de VPS estándar, la decisión para el despliegue inicial es el uso de un Servidor Dedicado (Bare Metal) mediante subastas de Hetzner o proveedores similares. 

¿Por qué un servidor dedicado y no una nube elástica como AWS? En AWS, procesar videos con IA nos costaría cientos de dólares al mes en instancias aceleradas por GPU. Al usar un servidor dedicado de unos $48 USD al mes, obtenemos un CPU Ryzen de 12 núcleos y 64GB de RAM dedicado exclusivamente a nuestro código. Aunque no tiene una tarjeta gráfica dedicada (GPU), usaremos la tecnología OpenVINO de Intel y multihilo masivo para segmentar el agua y el casco (SAM) y leer los números (OCR) en segundos. Esta decisión maximiza cada dólar del presupuesto, dándonos potencia de grado industrial por el precio de un hosting personal.

Para el almacenamiento de los videos, la estrategia es la externalización absoluta mediante Backblaze B2. Guardar videos pesados en el disco duro del servidor es un error de principiante; el disco se llenaría en días y el servidor se volvería lento. Usaremos el estándar S3-compatible de Backblaze, que cuesta apenas $6 USD por cada 1,000 GB de datos. Esto nos permite almacenar miles de auditorías en video de forma eterna y segura, accesibles desde cualquier lugar del mundo mediante una URL única pero protegida, sin consumir los recursos de nuestro servidor de IA.

## El Dojo de Entrenamiento: El Rol de Google Colab

Es vital distinguir entre "aprender" y "ejecutar". Google Colab será nuestra "Escuela de Combate". Lo utilizaremos para entrenar a nuestra IA (YOLOv11 y SAM) utilizando las GPUs de gama alta (A100) que Google ofrece de forma gratuita o por una suscripción mínima de $10 USD. Aquí es donde la IA practica con fotos de barcos oxidados, con espuma de mar y con diferentes condiciones de iluminación hasta alcanzar el 99.9% de precisión.

Una vez que el modelo está entrenado en Colab, descargamos el archivo de "pesos" (el conocimiento destilado de la IA) y lo instalamos en nuestro servidor dedicado. De esta manera, usamos la fuerza bruta de Google para la educación de la IA y la eficiencia de nuestro servidor propio para el trabajo diario, logrando un ciclo de vida de inteligencia artificial profesional sin los costos prohibitivos de Silicon Valley.

## Sincronización: El Puente entre Mundos

El despliegue se completa con un motor de sincronización automática. La lógica que implementaremos detectará el evento de red de la tablet. En cuanto el inspector regrese a la oficina del puerto o active su hotspot satelital, la tablet comenzará un "apretón de manos" silencioso con la nube. Primero enviará los datos ligeros (el reporte de texto) para que el cliente pueda ver el resultado preliminar, y luego comenzará la subida en segundo plano del video hacia Backblaze B2. Una vez que el video llega a la nube, el servidor dedicado lo toma, lo analiza para validar que los datos humanos son correctos y emite el certificado final notarizado.

## Lo que Falta Después: La Fase de Expansión

Una vez que este triángulo (PWA Offline, Servidor de IA Dedicado y S3 de Video) esté en marcha, lo que sigue es el pulido de la infraestructura de cara al cliente enterprise:

1. **Notarización en Blockchain**: Implementar una capa de hash que guarde la huella digital de cada video de auditoría en una red como Ethereum L2, para que un reporte de Plimsoll tenga valor legal ante aseguradoras.
2. **Monitoreo de Salud (Obsidiana)**: Implementar una consola de monitoreo que nos avise al celular si el servidor de IA está sufriendo con una cola de videos muy larga.
3. **Ciberseguridad Avanzada (SOC2 Lite)**: Aunque ya usamos encriptación AES-256, hará falta una auditoría de penetración para asegurar que los videos de barcos estratégicos no puedan ser filtrados.
4. **Automatización CI/CD**: Configurar Github Actions para que cualquier mejora estética que hagas en el código se despliegue automáticamente en Cloudflare y el Servidor Dedicado sin que tengas que tocar una terminal.

Este plan no es solo una configuración técnica; es el cimiento de un sistema que pretende ser el estándar mundial en calados marítimos. Con una inversión de menos de $70 USD, estamos construyendo una plataforma que tiene la arquitectura y la escala para manejar el tráfico de los puertos más importantes del mundo con la precisión de un unicornio tecnológico.
