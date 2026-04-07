using UnityEngine;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// PLIMSOLL AI - SYNTHETIC DOJO
/// Randomizes ship parameters (Draft, Texture, Light, Sea State) for training data generation.
/// </summary>
public class Synthetic_Ship_Gen : MonoBehaviour
{
    [Header("Ship References")]
    public Transform shipHull;
    public Material[] hullMaterials; // Rust, New paint, Fouled
    public Transform waterSurface;
    
    [Header("Simulation Parameters")]
    public Vector2 draftRange = new Vector2(5.0f, 15.0f);
    public Vector2 waveHeightRange = new Vector2(0.1f, 2.5f);
    public Light sunLight;

    [Header("Draft Marks")]
    public GameObject draftMarksPrefab;
    
    private void Start()
    {
        // Start the generation loop if in headless mode or auto-run
        // StartCoroutine(GenerationLoop());
    }

    public void RandomizeScene()
    {
        // 1. Randomize Draft (Sink the ship)
        float randomDraft = Random.Range(draftRange.x, draftRange.y);
        // Assuming ship pivot is at keel (y=0)
        shipHull.localPosition = new Vector3(0, -randomDraft, 0);

        // 2. Randomize Hull Texture (Rust/Corrosion)
        if (hullMaterials.Length > 0)
        {
            var renderer = shipHull.GetComponent<Renderer>();
            renderer.material = hullMaterials[Random.Range(0, hullMaterials.Length)];
        }

        // 3. Randomize Sea State (Shader Parameters)
        if (waterSurface)
        {
            var waterMat = waterSurface.GetComponent<Renderer>().material;
            waterMat.SetFloat("_WaveHeight", Random.Range(waveHeightRange.x, waveHeightRange.y));
            waterMat.SetFloat("_Choppiness", Random.Range(0.0f, 1.0f));
        }

        // 4. Randomize Lighting (Time of Day)
        if (sunLight)
        {
            // Random angle between 10 deg (sunset) and 90 deg (noon)
            float sunAngle = Random.Range(10f, 90f);
            float yRot = Random.Range(0f, 360f);
            sunLight.transform.rotation = Quaternion.Euler(sunAngle, yRot, 0);
            
            // Random Intensity
            sunLight.intensity = Random.Range(0.5f, 1.5f);
            
            // Random Color (Golden Hour vs Blue Noon)
            sunLight.color = Color.Lerp(new Color(1f, 0.9f, 0.8f), Color.white, Random.value);
        }

        // 5. Randomize Camera Position (Drone Jitter)
        Camera.main.transform.position += Random.insideUnitSphere * 0.5f;
        Camera.main.transform.LookAt(shipHull.position + Vector3.up * 2f);
    }
}
