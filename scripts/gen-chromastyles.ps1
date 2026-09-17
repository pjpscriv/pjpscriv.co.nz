if ($PSVersionTable.PSVersion.Major -lt 7) {
    Write-Error "Earlier versions of PowerShell produce files with UTF-16 encoding. Please use PowerShell version 7 or higher to run this script"
    exit 1
}

# Generate Chroma CSS files for light and dark themes
# Options here: https://gohugo.io/quick-reference/syntax-highlighting-styles/#gallery
$LightTheme = "rainbow_dash"
$DarkTheme = "tokyonight-night"

New-Item -ItemType Directory -Force -Path "static/chroma" | Out-Null
New-Item -ItemType Directory -Force -Path "static/css/chroma" | Out-Null

hugo gen chromastyles --style=$LightTheme > static/chroma/syntax-light.css
hugo gen chromastyles --style=$DarkTheme > static/chroma/syntax-dark.css

# Disable stylelint in both files
$lightFileContent = Get-Content "static/chroma/syntax-light.css"
echo "/* stylelint-disable */" | Out-File -FilePath "static/chroma/syntax-light.css" -Encoding utf8
echo "/* stylelint-disable */" | Out-File -FilePath "static/css/chroma/syntax-light.css" -Encoding utf8
echo $lightFileContent | Add-Content -Path "static/css/chroma/syntax-light.css" -Encoding utf8

$darkFileContent = Get-Content "static/chroma/syntax-dark.css"
echo "/* stylelint-disable */" | Out-File -FilePath "static/chroma/syntax-dark.css" -Encoding utf8
echo "/* stylelint-disable */" | Out-File -FilePath "static/css/chroma/syntax-dark.css" -Encoding utf8
echo $darkFileContent | Add-Content -Path "static/css/chroma/syntax-dark.css" -Encoding utf8
