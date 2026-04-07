# 🥋 PLIMSOLL AI - SYNTHETIC DOJO

This folder contains the **Unity Scripts** required to generate infinite synthetic training data for Plimsoll's Computer Vision models (YOLOv8 + SAM).

## 🚀 Setup Instructions

1.  **Install Unity:** Download **Unity 2022.3 LTS** (or newer) via Unity Hub.
2.  **Create Project:** Create a new **3D (URP)** Project named `Plimsoll_Synthetic`.
3.  **Import Assets:**
    *   **Scripts:** Copy the `Scripts/` folder from this repository into your Unity Project's `Assets/` folder (Drag and drop in Project window).
    *   **Ship Models (Sketchfab Guide):**
        1.  Go to **Sketchfab** -> Search "Cargo Ship" -> Filter by **Downloadable**.
        2.  **Preferred:** Download the **FBX (Converted)** version. Drag the `.fbx` (and its `.jpg/.png` textures) into your Unity Project window.
        3.  **Alternative (glTF/GLB):** If only GLB is available, install the free **glTFast** package via Unity Package Manager (`Window > Package Manager > + > Add from git URL > https://github.com/atteneder/glTFast.git`) to support drag-and-drop import.
        4.  **Tip:** Try to find models where the Hull and Bridge are separate meshes for better customization later.
    *   **Water System (Options):**
        *   **FREE (Best Realistic):** The **"Boat Attack" Water System** (Official Unity Demo).
            *   ✅ **INSTALLED FOR YOU:** I have already downloaded the correct files (fixing the Git LFS bug). You can find them in `Assets/BoatAttack_Water`.
            *   **How to use:** Drag the `SeaVisual` prefab from that folder into your scene.
        *   **FREE (Simple):** Search for **"Simple URP Water"** on the Unity Asset Store. Click "Add to My Assets", then in Unity "Window > Package Manager > My Assets > Download > Import".
        *   **PREMIUM ($60-200+):** **Crest Ocean System URP** or **KWS Water System**. Only buy these if necessary.
    *   **Environment:** Add a Skybox for realistic lighting (Window > Rendering > Lighting > Environment).

## 🌟 Quality Guide: "Is More Better?"
**YES!** For training robust AI models (YOLO/SAM), variety is critical. Simulating only one ship on calm water will train the AI to recognize *only* that specific ship in calm water. To make a "production-grade" dataset, you should add:

*   **multiple Hulls:** Import 3-5 different ship types (Container, Bulk Carrier, Tanker) and rotate them in the `Synthetic_Ship_Gen` script.
*   **Sea States:** Vary the wave height and foam intensity.
*   **Lighting Conditions:** Use different Skyboxes (Sunny, Overcast, Sunset, Night) to simulate time of day.
*   **Camera Angles:** Ensure the camera captures the ship from various heights and distances, not just a perfect side view.
*   **Post-Processing:** Add "Post Process Volume" with Film Grain, Vignette, and slight Blur to simulate real-world camera imperfections.

**The goal is to make the synthetic data look as chaotic and varied as the real world.**

## 🎬 Scene Configuration

### Step 0: Create Your Base Scene
Since the water package is just assets, **you need to create the scene**:
1.  In Unity, go to **File > New Scene**.
2.  Select **"Basic (URP)"** (or just Basic 3D).
3.  **Add Water:** 
    *   Go to the Project folder: `Assets/BoatAttack_Water`.
    *   Drag the **`SeaVisual`** prefab into your scene hierarchy.
    *   (Optional) If it looks pink, go to `Edit > Render Pipeline > Universal Render Pipeline > Upgrade Project Materials`.
4.  **Save Scene:** `File > Save As` -> name it `MainScene` inside `Assets/`.

### Step 0.5: 🚨 FIX "MISSING SCRIPTS" ERROR 🚨
If the `SeaVisual` prefab shows yellow errors like **"Missing Script"**, it is because you are missing 2 required packages.
1.  Go to **Window > Package Manager**.
2.  Click the `+` button (top left) -> **"Add package from git URL..."**.
3.  Type `com.unity.burst` and click Add.
4.  Repeat for `com.unity.mathematics`.
5.  (Alternatively, search "Burst" and "Mathematics" in the **Unity Registry** tab and install them).
6.  **Wait for compilation.** The errors will disappear, and the water will work.

### Step 1: Setup Synthetic Generator
1.  **Hierarchy:**
    *   Create an empty GameObject named `SyntheticGen`.
    *   Attach `Synthetic_Ship_Gen.cs` and `Dataset_Exporter.cs` to it.
2.  **References:**
    *   Drag your **Ship Hull** object into the `Ship Hull` slot.
    *   Drag the **`SeaVisual`** (that you just added) into the `Water Surface` slot.
    *   Assign the **Directional Light** to `Sun Light`.
3.  **Waterline Labeling:**
    *   Create a Cube, resize it to cover the "Waterline Area" of your ship.
    *   Remove its Mesh Renderer (make it invisible).
    *   Assign this Collider to the `Waterline Collider` slot in `Dataset_Exporter`.

## 📸 Generation

1.  Press **Play** in the Unity Editor.
2.  The system will:
    *   Randomize the draft, lighting, and sea state every frame.
    *   Capture a screenshot to `C:/Plimsoll_Training_Data/`.
    *   Generate a corresponding YOLO `.txt` label file.
3.  **Dataset Size:** Default is 1000 images. Change `Dataset Size` in the Inspector.

## 🧠 Training

Once generated, zip the `C:/Plimsoll_Training_Data/` folder and upload it to Colab to retrain YOLOv8:

```python
model.train(data='plimsoll_synth.yaml', epochs=100)
```
