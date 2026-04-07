using UnityEngine;
using System.IO;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// PLIMSOLL AI - DATASET EXPORTER
/// Captures camera frames and generates YOLO/COCO bounding box annotations.
/// </summary>
[RequireComponent(typeof(Synthetic_Ship_Gen))]
public class Dataset_Exporter : MonoBehaviour
{
    public int datasetSize = 1000;
    public string outputDirectory = "C:/Plimsoll_Training_Data";
    
    private Synthetic_Ship_Gen generator;
    private int currentSample = 0;
    
    // Bounds of the "Waterline" object for auto-labeling
    public Collider waterlineCollider; 

    private void Start()
    {
        generator = GetComponent<Synthetic_Ship_Gen>();
        
        if (!Directory.Exists(outputDirectory))
            Directory.CreateDirectory(outputDirectory);
            
        StartCoroutine(CaptureLoop());
    }

    IEnumerator CaptureLoop()
    {
        yield return new WaitForSeconds(1.0f); // Warmup

        while (currentSample < datasetSize)
        {
            // 1. Randomize
            generator.RandomizeScene();
            
            // Wait for visual update
            yield return new WaitForEndOfFrame();

            // 2. Capture Screenshot
            string filename = $"plimsoll_synth_{currentSample:0000}.jpg";
            string path = Path.Combine(outputDirectory, filename);
            
            Texture2D screenCap = new Texture2D(Screen.width, Screen.height, TextureFormat.RGB24, false);
            screenCap.ReadPixels(new Rect(0, 0, Screen.width, Screen.height), 0, 0);
            screenCap.Apply();
            
            byte[] bytes = screenCap.EncodeToJPG();
            File.WriteAllBytes(path, bytes);
            Destroy(screenCap);

            // 3. Generate Label (YOLO Format: class x_center y_center width height)
            if (waterlineCollider)
            {
                // Project 3D bounds to 2D
                Bounds b = waterlineCollider.bounds;
                // Simplified 2D projection logic for MVP (Ideally use 8 corners)
                Vector3 center = Camera.main.WorldToViewportPoint(b.center);
                
                // Only if visible
                if (center.z > 0 && center.x > 0 && center.x < 1 && center.y > 0 && center.y < 1)
                {
                    string labelPath = Path.Combine(outputDirectory, $"plimsoll_synth_{currentSample:0000}.txt");
                    // Assuming class 0 = Waterline
                    // Note: This is a placeholder. Real 3D->2D bbox requires corner projection min/max.
                    string annotation = $"0 {center.x} {1-center.y} 0.5 0.1"; 
                    File.WriteAllText(labelPath, annotation);
                }
            }

            Debug.Log($"Generated Sample {currentSample}/{datasetSize}");
            currentSample++;
            
            yield return null; // Next frame
        }

        Debug.Log("DATASET GENERATION COMPLETE.");
    }
}
