# Plimsoll AI: Dataset Packager
# This script bundles your harvested videos for the Colab Pro+ Training

$SourceDir = "backend/data"
$ZipFile = "Plimsoll_Unicorn_Dataset.zip"

if (Test-Path $SourceDir) {
    # Count MP4 files to avoid empty zips
    $VideoCount = (Get-ChildItem -Path $SourceDir -Filter *.mp4).Count
    if ($VideoCount -eq 0) {
        Write-Host "ERROR: No .mp4 videos found in $SourceDir. Harvest data first." -ForegroundColor Red
        exit
    }
    
    Write-Host "Packaging $VideoCount videos from $SourceDir..." -ForegroundColor Cyan
    
    # Remove old zip if exists
    if (Test-Path $ZipFile) { Remove-Item $ZipFile }
    
    # Compress the directory
    Compress-Archive -Path "$SourceDir\*" -DestinationPath $ZipFile -Force
    
    Write-Host "SUCCESS: Dataset packaged into $ZipFile" -ForegroundColor Green
    Write-Host "Now upload this file to your Google Drive as instructed in the guide." -ForegroundColor Yellow
} else {
    Write-Host "ERROR: Source directory $SourceDir not found. Run the harvester first." -ForegroundColor Red
}
