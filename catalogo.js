// Estado da Aplicação
let currentCategory = '';
let currentProduct = null;

// Configurações de Variantes (Strass)
const strassCategories = ['Infantil', 'Baby Look', 'estampas/Infantil', 'estampas/Baby Look'];
const noStrassItems = ['FTI-002', 'FTI-004', 'FTI-009', 'FTI-015'];
const sublimacaoInfantilStrassIds = ['0001', '0002', '0003', '0004', '0005', '0006', '0008', '0009', '0010', '0012', '0013', '0014', '0015', '0016', '0017', '0018', '0020', '0024', '0029', '0034', '0035', '0036'];

// Elementos DOM
const tabsContainer = document.getElementById('tabs-container');
const catalogContainer = document.getElementById('catalog-container');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // catalogo é carregado do dados.js
    if (typeof catalogo === 'undefined' || Object.keys(catalogo).length === 0) {
        catalogContainer.innerHTML = '<p style="text-align:center;width:100%;padding:50px;">Nenhuma estampa encontrada. Execute o gerador_dados.py</p>';
        return;
    }

    const categories = Object.keys(catalogo);
    currentCategory = categories[0];
    
    renderTabs(categories);
    renderCatalog(currentCategory);
});

// Renderização das Abas
function renderTabs(categories) {
    tabsContainer.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `tab ${cat === currentCategory ? 'active' : ''}`;
        btn.innerText = cat;
        btn.onclick = () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = cat;
            renderCatalog(cat);
        };
        tabsContainer.appendChild(btn);
    });
}

// Renderização do Catálogo
function renderCatalog(category) {
    catalogContainer.innerHTML = '';
    const items = catalogo[category];
    
    if (!items || items.length === 0) {
        catalogContainer.innerHTML = '<p style="text-align:center;width:100%;padding:50px;">Nenhuma estampa nesta categoria.</p>';
        return;
    }
    
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(item);
        
        let loadingAttr = index < 4 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
        card.innerHTML = `
            <img src="${item.thumb || item.image}" alt="Estampa ${item.id}" ${loadingAttr}>
            <div class="codigo">${item.id}</div>
        `;
        catalogContainer.appendChild(card);
    });
}

// Lógica do Modal de Produto (Modo Mostruário Visual)
function openModal(item) {
    currentProduct = item;
    const modal = document.getElementById('product-modal');
    
    const imgEl = document.getElementById('modal-image');
    const videoEl = document.getElementById('modal-video');
    const variationContainer = document.getElementById('variation-selector-container');
    const variationOptions = document.getElementById('variation-options');
    
    // Função para atualizar mídia no visualizador
    function updateMedia(mediaUrl) {
        if (mediaUrl.toLowerCase().endsWith('.mp4')) {
            imgEl.style.display = 'none';
            videoEl.style.display = 'block';
            videoEl.src = mediaUrl;
            videoEl.playbackRate = 2.5; // Mantém aceleração padrão
        } else {
            videoEl.style.display = 'none';
            videoEl.src = '';
            imgEl.style.display = 'block';
            imgEl.src = mediaUrl;
        }
    }
    
    // Lógica das Variações (Baby Look Selo, Viscolycra Infantil Selo, etc.)
    if (item.variations && item.variations.length > 1) {
        variationContainer.style.display = 'block';
        variationOptions.innerHTML = '';
        
        item.variations.forEach((vari, index) => {
            const label = document.createElement('label');
            label.className = 'variant-option';
            const isChecked = index === 0 ? 'checked' : '';
            
            label.innerHTML = `
                <input type="radio" name="variation-option" value="${vari.name}" ${isChecked}>
                <span class="variant-btn">${vari.name}</span>
            `;
            
            label.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked) {
                    updateMedia(vari.image);
                }
            });
            
            variationOptions.appendChild(label);
        });
        
        updateMedia(item.variations[0].image);
    } else {
        variationContainer.style.display = 'none';
        updateMedia(item.image);
    }
    
    document.getElementById('modal-title').innerText = item.id;
    
    // Lógica do Strass (Pedrinha)
    const strassContainer = document.getElementById('strass-selector-container');
    let hasStrass = false;
    
    if (!currentCategory.includes('Body') && strassCategories.some(c => currentCategory.includes(c)) && !currentCategory.includes('Selo') && !noStrassItems.includes(item.id)) {
        hasStrass = true;
    } else if ((currentCategory === 'Sublimação Infantil' || currentCategory === 'Sublimação Infantil') && sublimacaoInfantilStrassIds.includes(item.id)) {
        hasStrass = true;
    }
    
    if (hasStrass) {
        strassContainer.style.display = 'block';
        const strassRadio = document.querySelector('input[name="strass-option"][value="Com Pedrinha"]');
        if (strassRadio) strassRadio.checked = true;
    } else {
        strassContainer.style.display = 'none';
    }
    
    // Lógica de Tecido / Modelo (Baby Look Selo)
    const fabricContainer = document.getElementById('fabric-selector-container');
    if (currentCategory === 'Baby Look Selo') {
        if (fabricContainer) {
            fabricContainer.style.display = 'block';
            const defaultFabric = document.querySelector('input[name="fabric-option"][value="Baby Visco"]');
            if (defaultFabric) defaultFabric.checked = true;
            
            const fabricRadios = document.querySelectorAll('input[name="fabric-option"]');
            fabricRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isPolyester = e.target.value === 'Baby Poliéster';
                    const viscoOnlyOptions = document.querySelectorAll('.color-opt-baby-visco-only');
                    viscoOnlyOptions.forEach(opt => {
                        opt.style.display = isPolyester ? 'none' : 'inline-block';
                    });
                    if (isPolyester) {
                        const checkedColor = document.querySelector('input[name="color-option-babylook-selo"]:checked');
                        if (checkedColor && (checkedColor.value === 'Pink' || checkedColor.value === 'Vinho')) {
                            const defaultColor = document.querySelector('input[name="color-option-babylook-selo"][value="Marinho"]');
                            if (defaultColor) defaultColor.checked = true;
                        }
                    }
                };
            });
        }
    } else {
        if (fabricContainer) fabricContainer.style.display = 'none';
    }

    // Lógica de Cores da Camisa / Viés
    const colorContainer = document.getElementById('color-selector-container');
    const colorTitle = colorContainer ? colorContainer.querySelector('h3') : null;
    const colorAdulto = document.getElementById('color-options-adulto');
    const colorInfantil = document.getElementById('color-options-infantil');
    const colorSilkscreen = document.getElementById('color-options-silkscreen');
    const colorInfantilSelo = document.getElementById('color-options-infantil-selo');
    const colorBabylookSelo = document.getElementById('color-options-babylook-selo');
    const colorBody = document.getElementById('color-options-body');
    
    if (colorAdulto) colorAdulto.style.display = 'none';
    if (colorInfantil) colorInfantil.style.display = 'none';
    if (colorSilkscreen) colorSilkscreen.style.display = 'none';
    if (colorInfantilSelo) colorInfantilSelo.style.display = 'none';
    if (colorBabylookSelo) colorBabylookSelo.style.display = 'none';
    if (colorBody) colorBody.style.display = 'none';
    
    if (currentCategory === 'Body Infantil' || currentCategory === 'estampasbody') {
        colorContainer.style.display = 'block';
        if (colorTitle) colorTitle.innerText = 'Cor do Viés (Gola/Manga):';
        if (colorBody) colorBody.style.display = 'flex';
        const radio = document.querySelector('input[name="color-option-body"][value="Branco"]');
        if (radio) radio.checked = true;
    } else {
        if (colorTitle) colorTitle.innerText = 'Cor da Camisa:';
        if (currentCategory === 'Sublimação Adulta Branca' || currentCategory.includes('Sublimação Adulta')) {
            colorContainer.style.display = 'block';
            if (colorAdulto) colorAdulto.style.display = 'flex';
            const radio = document.querySelector('input[name="color-option-adulto"][value="Branca"]');
            if (radio) radio.checked = true;
        } else if (currentCategory === 'Sublimação Infantil' || currentCategory === 'Sublimação Infantil') {
            colorContainer.style.display = 'block';
            if (colorInfantil) colorInfantil.style.display = 'flex';
            const radio = document.querySelector('input[name="color-option-infantil"][value="Branco"]');
            if (radio) radio.checked = true;
        } else if (currentCategory === 'Silkscreen') {
            colorContainer.style.display = 'block';
            if (colorSilkscreen) colorSilkscreen.style.display = 'flex';
            const radio = document.querySelector('input[name="color-option-silk"][value="Preta"]');
            if (radio) radio.checked = true;
        } else if (currentCategory === 'Viscolycra Infantil Selo') {
            colorContainer.style.display = 'block';
            if (colorInfantilSelo) colorInfantilSelo.style.display = 'flex';
            const radio = document.querySelector('#color-options-infantil-selo input[name="color-option"][value="Preta"]');
            if (radio) radio.checked = true;
        } else if (currentCategory === 'Baby Look Selo') {
            colorContainer.style.display = 'block';
            if (colorBabylookSelo) colorBabylookSelo.style.display = 'flex';
            const viscoOnlyOptions = document.querySelectorAll('.color-opt-baby-visco-only');
            viscoOnlyOptions.forEach(opt => opt.style.display = 'inline-block');
            const radio = document.querySelector('input[name="color-option-babylook-selo"][value="Preta"]');
            if (radio) radio.checked = true;
        } else {
            colorContainer.style.display = 'none';
        }
    }
    
    // Lógica da Cor da Estampa (Silkscreen)
    const printColorContainer = document.getElementById('print-color-selector-container');
    if (currentCategory === 'Silkscreen') {
        printColorContainer.style.display = 'block';
        const radio = document.querySelector('input[name="print-color-option"][value="Branca"]');
        if (radio) radio.checked = true;
    } else {
        printColorContainer.style.display = 'none';
    }
    
    modal.style.display = 'flex';
    history.pushState({ type: 'modal' }, '', '#produto');
}

function closeModal(isPopState = false) {
    const modal = document.getElementById('product-modal');
    if (modal && modal.style.display !== 'none') {
        modal.style.display = 'none';
        currentProduct = null;
        
        const videoEl = document.getElementById('modal-video');
        if (videoEl) {
            videoEl.pause();
            videoEl.src = '';
        }
        
        if (!isPopState && window.location.hash === '#produto') {
            history.back();
        }
    }
}

// Suporte para fechar pelo botão voltar do celular (Navegação Nativa)
window.addEventListener('popstate', function(event) {
    const modal = document.getElementById('product-modal');
    if (modal && modal.style.display !== 'none') {
        closeModal(true);
    }
});

// Fechar modal ao clicar na área externa
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        closeModal();
    }
};
