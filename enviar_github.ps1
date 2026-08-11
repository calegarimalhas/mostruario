cd "D:\backup gabriel\Mostruario Digital"

Write-Host "Aumentando o limite de memoria do Git..." -ForegroundColor Cyan
git config http.postBuffer 2147483648
git config core.compression 0

Write-Host "Desfazendo o commit gigante anterior..." -ForegroundColor Cyan
git reset HEAD~1

Write-Host "Enviando os arquivos base do site..." -ForegroundColor Cyan
git add index.html catalogo.js styles.css dados.js strass.png tintabranca.png tintadourada.png tintaprata.png
git commit -m "Arquivos base do site"
git push -u origin master

$pastas = @("silkscreen", "SublimacaoInfantil", "SublimacaoAdulta", "BabyLook", "Infantil")

foreach ($pasta in $pastas) {
    if (Test-Path "estampas\$pasta") {
        Write-Host "Adicionando pasta: $pasta..." -ForegroundColor Yellow
        git add "estampas/$pasta"
        git commit -m "Add $pasta"
        
        Write-Host "Enviando $pasta para o GitHub..." -ForegroundColor Green
        git push
    }
}

Write-Host "Processo concluido! Verifique seu GitHub." -ForegroundColor Cyan
