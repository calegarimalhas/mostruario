import re

with open('catalogo.js', 'r', encoding='utf-8') as f:
    code = f.read()

def replace_between(text, start_str, end_str, replacement):
    start = text.find(start_str)
    if start == -1: return text
    end = text.find(end_str, start)
    if end == -1: return text
    return text[:start] + replacement + text[end:]

# 1. Add logic for Variations inside openModal
variation_logic = '''    // Lógica das Variações (Videos/Strass Dinâmico)
    const variationContainer = document.getElementById('variation-selector-container');
    const variationOptions = document.getElementById('variation-options');
    
    // Função local para atualizar a mídia
    function updateMedia(mediaUrl) {
        if (mediaUrl.toLowerCase().endsWith('.mp4')) {
            imgEl.style.display = 'none';
            videoEl.style.display = 'block';
            videoEl.src = mediaUrl;
            videoEl.playbackRate = 2.5;
        } else {
            videoEl.style.display = 'none';
            videoEl.src = '';
            imgEl.style.display = 'block';
            imgEl.src = mediaUrl;
        }
    }
    
    if (item.variations && item.variations.length > 1) {
        variationContainer.style.display = 'block';
        variationOptions.innerHTML = '';
        
        item.variations.forEach((vari, index) => {
            const label = document.createElement('label');
            label.className = 'variant-option';
            
            const isChecked = index === 0 ? 'checked' : '';
            
            label.innerHTML = 
                <input type="radio" name="variation-option" value="" >
                <span class="variant-btn"></span>
            ;
            
            // Event listener para trocar video na hora
            label.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    updateMedia(vari.image);
                }
            });
            
            variationOptions.appendChild(label);
        });
        
        // Exibe o primeiro por padrão
        updateMedia(item.variations[0].image);
    } else {
        variationContainer.style.display = 'none';
        updateMedia(item.image);
    }
'''

old_media_logic = '''    if (item.image.toLowerCase().endsWith('.mp4')) {
        imgEl.style.display = 'none';
        videoEl.style.display = 'block';
        videoEl.src = item.image;
        videoEl.playbackRate = 2.5; // Mantém a aceleração do vídeo
    } else {
        videoEl.style.display = 'none';
        videoEl.src = '';
        imgEl.style.display = 'block';
        imgEl.src = item.image;
    }'''

code = code.replace(old_media_logic, variation_logic)

# 2. Add Colors logic for the new tabs
color_logic_start = "    // Exibir cores informativas"
color_logic_end = "    modal.style.display = 'flex';"

new_color_logic = '''    // Exibir cores informativas
    const infoContainer = document.getElementById('info-cores-container');
    const infoInfantil = document.getElementById('info-cores-infantil');
    const infoSilkCamisa = document.getElementById('info-cores-silkscreen');
    const infoSilkEstampa = document.getElementById('info-estampa-silkscreen');
    const infoInfantilSelo = document.getElementById('info-cores-infantil-selo');
    const infoBabylookSelo = document.getElementById('info-cores-babylook-selo');
    
    // Esconde todos
    if(infoInfantil) infoInfantil.style.display = 'none';
    if(infoSilkCamisa) infoSilkCamisa.style.display = 'none';
    if(infoSilkEstampa) infoSilkEstampa.style.display = 'none';
    if(infoInfantilSelo) infoInfantilSelo.style.display = 'none';
    if(infoBabylookSelo) infoBabylookSelo.style.display = 'none';
    
    if (currentCategory === 'Sublimação Infantil' || currentCategory === 'SublimaÃ§Ã£o Infantil') {
        infoContainer.style.display = 'flex';
        if(infoInfantil) infoInfantil.style.display = 'flex';
    } else if (currentCategory === 'Silkscreen') {
        infoContainer.style.display = 'flex';
        if(infoSilkCamisa) infoSilkCamisa.style.display = 'flex';
        if(infoSilkEstampa) infoSilkEstampa.style.display = 'flex';
    } else if (currentCategory === 'Viscolycra Infantil Selo') {
        infoContainer.style.display = 'flex';
        if(infoInfantilSelo) infoInfantilSelo.style.display = 'flex';
    } else if (currentCategory === 'Baby Look Selo') {
        infoContainer.style.display = 'flex';
        if(infoBabylookSelo) infoBabylookSelo.style.display = 'flex';
    } else {
        infoContainer.style.display = 'none';
    }
'''

code = replace_between(code, color_logic_start, color_logic_end, new_color_logic)

with open('catalogo.js', 'w', encoding='utf-8') as f:
    f.write(code)
