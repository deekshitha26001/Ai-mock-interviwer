Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\Deekshitha P\.gemini\antigravity-ide\brain\4e4ad996-55c9-48be-b9eb-10be6225ad95\01_interview_configuration_form_png_1792673068736.png'
$outPath = 'C:\Users\Deekshitha P\.gemini\antigravity-ide\brain\4e4ad996-55c9-48be-b9eb-10be6225ad95\02_resume_upload_field_focused.png'

$src = [System.Drawing.Bitmap]::FromFile($sourcePath)
Write-Host "Source Width: $($src.Width), Height: $($src.Height)"

# The dialog modal is centered. The resume upload section is roughly:
# X around 39% to 61% of width, Y around 68% to 88% of height
# Let's calculate the bounding box:
$cropX = 520
$cropY = 680
$cropW = 880
$cropH = 230

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $src.Clone($rect, $src.PixelFormat)
$cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$cropped.Dispose()
$src.Dispose()

Write-Host "Focused Resume Upload field screenshot saved to $outPath"
