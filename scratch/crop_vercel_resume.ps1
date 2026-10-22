Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\Deekshitha P\.gemini\antigravity-ide\brain\4e4ad996-55c9-48be-b9eb-10be6225ad95\vercel_interview_configuration_form_1792674296772.png'
$outPath = 'C:\Users\Deekshitha P\.gemini\antigravity-ide\brain\4e4ad996-55c9-48be-b9eb-10be6225ad95\vercel_resume_upload_field.png'

$src = [System.Drawing.Bitmap]::FromFile($sourcePath)
Write-Host "Vercel Source Width: $($src.Width), Height: $($src.Height)"

$cropX = 520
$cropY = 680
$cropW = 880
$cropH = 230

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $src.Clone($rect, $src.PixelFormat)
$cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$cropped.Dispose()
$src.Dispose()

Write-Host "Vercel Resume Upload field cropped and saved to $outPath"
