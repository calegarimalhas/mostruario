// Estado da Aplicação
let currentCategory = '';
let currentSubFilter = 'Todos';
let currentProduct = null;
let searchQuery = '';
let sortOrder = 'asc';
let currentPage = 1;
const ITEMS_PER_PAGE = 24;

// Configurações de Variantes (Strass)
const strassCategories = ['Infantil', 'Baby Look', 'Frente Total BabyLook', 'Frente Total Infantil', 'estampas/Infantil', 'estampas/Baby Look'];
const noStrassItems = ['FTI-002', 'FTI-004', 'FTI-009', 'FTI-015', 'FTI-019', 'FTI-020', 'FTI-021', 'FTI-022', 'FTI-023'];
const sublimacaoInfantilStrassIds = ['0002', '0004', '0005', '0006', '0008', '0009', '0010', '0012', '0013', '0014', '0015', '0016', '0018', '0020', '0029', '0035', '0036'];

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
    currentSubFilter = 'Todos';
    currentPage = 1;
    
    renderTabs(categories);
    renderSubFilters(currentCategory);
    renderCatalog();

    setupToolbar();
    setupQuickScroll();

    const tabsNav = document.getElementById('tabs-container');
    if (tabsNav) {
        tabsNav.addEventListener('scroll', updateTabsArrows);
        window.addEventListener('resize', updateTabsArrows);
    }
    updateTabsArrows();
    setTimeout(updateTabsArrows, 200);
});

// Configuração da Barra de Ferramentas (Busca e Ordenação)
function setupToolbar() {
    const searchInput = document.getElementById('catalog-search');
    const clearBtn = document.getElementById('search-clear-btn');
    const sortSelect = document.getElementById('catalog-sort');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            currentPage = 1;
            if (clearBtn) {
                clearBtn.style.display = searchQuery ? 'flex' : 'none';
            }
            renderCatalog();
        });
    }

    if (clearBtn) {
        clearBtn.onclick = () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            clearBtn.style.display = 'none';
            currentPage = 1;
            renderCatalog();
        };
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortOrder = e.target.value;
            currentPage = 1;
            renderCatalog();
        });
    }
}

// Configuração dos Botões Flutuantes Rápidos (Topo e Fim)
function setupQuickScroll() {
    const btnTop = document.getElementById('btn-scroll-top');
    const btnBottom = document.getElementById('btn-scroll-bottom');

    if (btnTop) {
        btnTop.onclick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
    if (btnBottom) {
        btnBottom.onclick = () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        };
    }

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        
        if (btnTop) {
            btnTop.style.opacity = scrollY > 250 ? '1' : '0.25';
            btnTop.style.pointerEvents = scrollY > 250 ? 'auto' : 'none';
        }
        if (btnBottom) {
            btnBottom.style.opacity = scrollY < maxScroll - 250 ? '1' : '0.25';
            btnBottom.style.pointerEvents = scrollY < maxScroll - 250 ? 'auto' : 'none';
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
}

// Funções para controle da navegação das abas por setas
function scrollTabs(amount) {
    const container = document.getElementById('tabs-container');
    if (container) {
        container.scrollBy({ left: amount, behavior: 'smooth' });
    }
}

function updateTabsArrows() {
    const container = document.getElementById('tabs-container');
    const leftBtn = document.querySelector('.tabs-arrow-left');
    const rightBtn = document.querySelector('.tabs-arrow-right');

    if (!container || !leftBtn || !rightBtn) return;

    const isScrollable = container.scrollWidth > container.clientWidth + 5;
    if (!isScrollable) {
        leftBtn.style.display = 'none';
        rightBtn.style.display = 'none';
        return;
    }

    leftBtn.style.display = 'flex';
    rightBtn.style.display = 'flex';

    if (container.scrollLeft <= 5) {
        leftBtn.style.opacity = '0.3';
        leftBtn.style.pointerEvents = 'none';
    } else {
        leftBtn.style.opacity = '1';
        leftBtn.style.pointerEvents = 'auto';
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    if (container.scrollLeft >= maxScrollLeft - 5) {
        rightBtn.style.opacity = '0.3';
        rightBtn.style.pointerEvents = 'none';
    } else {
        rightBtn.style.opacity = '1';
        rightBtn.style.pointerEvents = 'auto';
    }
}

// Obter Temas Disponíveis na Categoria Atual (Descoberta Automática de Subpastas)
function getCategoryThemes(category) {
    const items = catalogo[category] || [];
    const themeSet = new Set();
    items.forEach(item => {
        if (item.tema && item.tema.trim() !== '') {
            themeSet.add(item.tema.trim());
        }
    });
    const themes = Array.from(themeSet);
    // Ordena temas alfabeticamente, garantindo que 'Outros' fique no final
    themes.sort((a, b) => {
        if (a.toLowerCase() === 'outros') return 1;
        if (b.toLowerCase() === 'outros') return -1;
        return a.localeCompare(b, 'pt-BR');
    });
    return themes;
}

// Renderização dos Sub-filtros por Tema
function renderSubFilters(category) {
    const container = document.getElementById('subfilters-container');
    const list = document.getElementById('subfilters-list');
    
    if (!container || !list) return;
    
    const themes = getCategoryThemes(category);
    
    // Se não houver subtemas ou apenas 1 ("Outros"), oculta a barra
    if (themes.length <= 1) {
        container.style.display = 'none';
        list.innerHTML = '';
        currentSubFilter = 'Todos';
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = '';
    
    // Botão "Todos"
    const allBtn = document.createElement('button');
    allBtn.className = `subfilter-btn ${currentSubFilter === 'Todos' ? 'active' : ''}`;
    allBtn.innerText = 'Todos';
    allBtn.onclick = () => {
        currentSubFilter = 'Todos';
        currentPage = 1;
        renderSubFilters(category);
        renderCatalog();
    };
    list.appendChild(allBtn);
    
    // Botões dos Temas
    themes.forEach(themeName => {
        const btn = document.createElement('button');
        btn.className = `subfilter-btn ${currentSubFilter === themeName ? 'active' : ''}`;
        btn.innerText = themeName;
        btn.onclick = () => {
            currentSubFilter = themeName;
            currentPage = 1;
            renderSubFilters(category);
            renderCatalog();
        };
        list.appendChild(btn);
    });
}

// Renderização das Abas de Categorias
function renderTabs(categories) {
    tabsContainer.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `tab ${cat === currentCategory ? 'active' : ''}`;
        btn.innerText = cat;
        btn.onclick = () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            currentCategory = cat;
            currentSubFilter = 'Todos';
            currentPage = 1;
            renderSubFilters(cat);
            renderCatalog();
            setTimeout(updateTabsArrows, 300);
        };
        tabsContainer.appendChild(btn);
    });
    setTimeout(updateTabsArrows, 100);
}

// Filtra, Busca e Ordena os Itens
function getFilteredItems() {
    let items = catalogo[currentCategory] || [];
    
    // 1. Filtro por Tema (Sub-filtro)
    if (currentSubFilter && currentSubFilter !== 'Todos') {
        items = items.filter(item => (item.tema || 'Outros') === currentSubFilter);
    }
    
    // 2. Busca Instantânea
    if (searchQuery.trim()) {
        const term = searchQuery.trim().toLowerCase();
        items = items.filter(item => {
            const idMatch = item.id && item.id.toLowerCase().includes(term);
            const temaMatch = item.tema && item.tema.toLowerCase().includes(term);
            return idMatch || temaMatch;
        });
    }
    
    // 3. Ordenação
    items = [...items];
    if (sortOrder === 'desc') {
        items.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' }));
    } else {
        items.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));
    }
    
    return items;
}

// Renderização do Catálogo com Paginação
function renderCatalog() {
    catalogContainer.innerHTML = '';
    const filteredItems = getFilteredItems();
    const totalItems = filteredItems.length;
    
    if (totalItems === 0) {
        catalogContainer.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 50px 15px; color: #666;">
                <p style="font-size: 1.15rem; font-weight: 700; margin-bottom: 6px;">Nenhuma estampa encontrada.</p>
                <p style="font-size: 0.92rem; color: #888;">Tente outro termo na busca ou selecione outro tema.</p>
            </div>
        `;
        renderPagination(0, 1);
        return;
    }
    
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    const pageItems = filteredItems.slice(startIndex, endIndex);
    
    pageItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openModal(item);
        
        let loadingAttr = index < 6 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
        card.innerHTML = `
            <img src="${item.thumb || item.image}" alt="Estampa ${item.id}" ${loadingAttr}>
            <div class="codigo">${item.id}</div>
        `;
        catalogContainer.appendChild(card);
    });
    
    renderPagination(totalItems, totalPages);
}

// Renderização da Barra de Paginação
function renderPagination(totalItems, totalPages) {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    
    container.style.display = 'flex';
    container.innerHTML = `
        <div class="pagination-info">
            Página <strong>${currentPage}</strong> de <strong>${totalPages}</strong>
            <span class="pagination-total">(${totalItems} estampas)</span>
        </div>
        <div class="pagination-controls">
            <button class="pag-btn" id="pag-first" title="Primeira página" ${currentPage === 1 ? 'disabled' : ''}>« Primeira</button>
            <button class="pag-btn" id="pag-prev" title="Página anterior" ${currentPage === 1 ? 'disabled' : ''}>‹ Anterior</button>
            <div class="pag-pages" id="pag-pages-list"></div>
            <button class="pag-btn" id="pag-next" title="Próxima página" ${currentPage === totalPages ? 'disabled' : ''}>Próxima ›</button>
            <button class="pag-btn" id="pag-last" title="Última página (ir ao fim)" ${currentPage === totalPages ? 'disabled' : ''}>Última »</button>
        </div>
    `;
    
    document.getElementById('pag-first').onclick = () => goToPage(1);
    document.getElementById('pag-prev').onclick = () => goToPage(currentPage - 1);
    document.getElementById('pag-next').onclick = () => goToPage(currentPage + 1);
    document.getElementById('pag-last').onclick = () => goToPage(totalPages);
    
    // Geração de botões numéricos
    const pagesList = document.getElementById('pag-pages-list');
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let p = startPage; p <= endPage; p++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pag-num-btn ${p === currentPage ? 'active' : ''}`;
        pageBtn.innerText = p;
        pageBtn.onclick = () => goToPage(p);
        pagesList.appendChild(pageBtn);
    }
}

// Navegação para uma Página com Rolagem Suave para o Topo do Catálogo
function goToPage(page) {
    currentPage = page;
    renderCatalog();
    const anchor = document.querySelector('.catalog-toolbar') || tabsContainer;
    if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    
    // Descrição Especial (Frente Total Camiseta e Infantil Selo)
    const descContainer = document.getElementById('modal-description');
    if (currentCategory === 'Frente Total Camiseta' || currentCategory === 'Frente Total') {
        if (descContainer) {
            descContainer.style.display = 'block';
            descContainer.innerText = 'Tamanhos: P ao GG | Manga e costas brancas';
        }
    } else if (currentCategory.includes('Infantil Selo') || currentCategory.includes('Visco Infantil Selo') || currentCategory === 'Viscolycra Infantil Selo') {
        if (descContainer) {
            descContainer.style.display = 'block';
            const isSi004 = item && (item.id === 'SI-004' || item.id === 'SI_004' || String(item.id).toUpperCase().replace(/[_ ]/g, '-') === 'SI-004');
            descContainer.innerText = isSi004 ? 'Tamanhos disponíveis: PP ao GG' : 'Tamanhos disponíveis: P ao GG';
        }
    } else {
        if (descContainer) descContainer.style.display = 'none';
    }

    // Lógica do Strass (Pedrinha)
    const strassContainer = document.getElementById('strass-selector-container');
    let hasStrass = false;
    
    if (currentCategory.includes('Sublimação Infantil')) {
        hasStrass = sublimacaoInfantilStrassIds.includes(item.id);
    } else if (!currentCategory.includes('Body') && currentCategory !== 'Frente Total Camiseta' && currentCategory !== 'Frente Total' && !currentCategory.includes('DTF') && strassCategories.some(c => currentCategory.includes(c)) && !currentCategory.includes('Selo') && !noStrassItems.includes(item.id)) {
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
    const colorSublimacaoMachao = document.getElementById('color-options-sublimacao-machao');
    const colorInfantil = document.getElementById('color-options-infantil');
    const colorSilkscreenAdulto = document.getElementById('color-options-silkscreen-adulto');
    const colorSilkscreenBaby = document.getElementById('color-options-silkscreen-baby');
    const colorInfantilSeloCamiseta = document.getElementById('color-options-infantil-selo-camiseta');
    const colorInfantilSeloBaby = document.getElementById('color-options-infantil-selo-baby');
    const colorBabylookSelo = document.getElementById('color-options-babylook-selo');
    const colorBody = document.getElementById('color-options-body');
    const colorDtfPolyester = document.getElementById('color-options-dtf-polyester');
    const colorDtfBabylook = document.getElementById('color-options-dtf-babylook');
    const colorDtfInfantilCamiseta = document.getElementById('color-options-dtf-infantil-camiseta');
    const colorDtfInfantilBaby = document.getElementById('color-options-dtf-infantil-baby');

    // Lógica do Modelo de Camiseta (Sublimação Adulto)
    const sublimacaoAdultoModelContainer = document.getElementById('sublimacao-adulto-model-selector-container');
    if (currentCategory.includes('Sublimação Adulta') || currentCategory.includes('Sublimação Adulto')) {
        if (sublimacaoAdultoModelContainer) {
            sublimacaoAdultoModelContainer.style.display = 'block';
            const defaultModel = document.querySelector('input[name="sublimacao-adulto-model-option"][value="Camiseta"]');
            if (defaultModel) defaultModel.checked = true;

            const sublimacaoModelRadios = document.querySelectorAll('input[name="sublimacao-adulto-model-option"]');
            sublimacaoModelRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isMachao = e.target.value === 'Camiseta Machão';
                    if (isMachao) {
                        if (colorAdulto) colorAdulto.style.display = 'none';
                        if (colorSublimacaoMachao) colorSublimacaoMachao.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-sublimacao-machao input[name="color-option-sublimacao-machao"][value="Branca"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    } else {
                        if (colorSublimacaoMachao) colorSublimacaoMachao.style.display = 'none';
                        if (colorAdulto) colorAdulto.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-adulto input[name="color-option-adulto"][value="Branca"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (sublimacaoAdultoModelContainer) sublimacaoAdultoModelContainer.style.display = 'none';
    }

    // Lógica do Modelo de Camiseta (Silkscreen - Visual)
    const silkModelContainer = document.getElementById('silk-model-selector-container');
    if (currentCategory === 'Silkscreen') {
        if (silkModelContainer) {
            silkModelContainer.style.display = 'block';
            const defaultModel = document.querySelector('input[name="silk-model-option"][value="Adulto"]');
            if (defaultModel) defaultModel.checked = true;

            const silkModelRadios = document.querySelectorAll('input[name="silk-model-option"]');
            silkModelRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isBaby = e.target.value === 'Baby Viscolycra';
                    if (isBaby) {
                        if (colorSilkscreenAdulto) colorSilkscreenAdulto.style.display = 'none';
                        if (colorSilkscreenBaby) colorSilkscreenBaby.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-silkscreen-baby input[name="color-option-silk"][value="Preto"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    } else {
                        if (colorSilkscreenBaby) colorSilkscreenBaby.style.display = 'none';
                        if (colorSilkscreenAdulto) colorSilkscreenAdulto.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-silkscreen-adulto input[name="color-option-silk"][value="Preta"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (silkModelContainer) silkModelContainer.style.display = 'none';
    }

    // Lógica de Modelo / Tecido (DTF Adulto)
    const dtfModelContainer = document.getElementById('dtf-model-selector-container');
    if (currentCategory === 'DTF ADULTO' || currentCategory === 'DTF Adulto') {
        if (dtfModelContainer) {
            dtfModelContainer.style.display = 'block';
            const defaultModel = document.querySelector('input[name="dtf-model-option"][value="Camiseta Poliéster"]');
            if (defaultModel) defaultModel.checked = true;

            const dtfModelRadios = document.querySelectorAll('input[name="dtf-model-option"]');
            dtfModelRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isBaby = e.target.value === 'BabyLook Viscolycra';
                    if (isBaby) {
                        if (colorDtfPolyester) colorDtfPolyester.style.display = 'none';
                        if (colorDtfBabylook) colorDtfBabylook.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-dtf-babylook input[name="color-option-dtf-babylook"][value="Preto"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    } else {
                        if (colorDtfBabylook) colorDtfBabylook.style.display = 'none';
                        if (colorDtfPolyester) colorDtfPolyester.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-dtf-polyester input[name="color-option-dtf-polyester"][value="Preto"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (dtfModelContainer) dtfModelContainer.style.display = 'none';
    }

    // Lógica de Modelo / Tecido (DTF Infantil)
    const dtfInfantilModelContainer = document.getElementById('dtf-infantil-model-selector-container');
    if (currentCategory === 'DTF Infantil') {
        if (dtfInfantilModelContainer) {
            dtfInfantilModelContainer.style.display = 'block';
            const defaultModel = document.querySelector('input[name="dtf-infantil-model-option"][value="Camiseta"]');
            if (defaultModel) defaultModel.checked = true;

            const dtfInfantilModelRadios = document.querySelectorAll('input[name="dtf-infantil-model-option"]');
            dtfInfantilModelRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isBaby = e.target.value.includes('Baby');
                    if (isBaby) {
                        updateMedia(item.image_baby || item.image);
                        if (colorDtfInfantilCamiseta) colorDtfInfantilCamiseta.style.display = 'none';
                        if (colorDtfInfantilBaby) colorDtfInfantilBaby.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-dtf-infantil-baby input[name="color-option-dtf-infantil-baby"][value="Preto"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    } else {
                        updateMedia(item.image);
                        if (colorDtfInfantilBaby) colorDtfInfantilBaby.style.display = 'none';
                        if (colorDtfInfantilCamiseta) colorDtfInfantilCamiseta.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-dtf-infantil-camiseta input[name="color-option-dtf-infantil-camiseta"][value="Preto"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (dtfInfantilModelContainer) dtfInfantilModelContainer.style.display = 'none';
    }

    // Lógica de Modelo / Tecido (Infantil Selo)
    const infantilSeloModelContainer = document.getElementById('infantil-selo-model-selector-container');
    if (currentCategory.includes('Infantil Selo') || currentCategory.includes('Visco Infantil Selo') || currentCategory === 'Viscolycra Infantil Selo') {
        if (infantilSeloModelContainer) {
            infantilSeloModelContainer.style.display = 'block';
            const defaultModel = document.querySelector('input[name="infantil-selo-model-option"][value="Camiseta"]');
            if (defaultModel) defaultModel.checked = true;

            const infantilSeloModelRadios = document.querySelectorAll('input[name="infantil-selo-model-option"]');
            infantilSeloModelRadios.forEach(radio => {
                radio.onchange = (e) => {
                    const isBaby = e.target.value === 'Baby Look Viscolycra';
                    if (isBaby) {
                        if (colorInfantilSeloCamiseta) colorInfantilSeloCamiseta.style.display = 'none';
                        if (colorInfantilSeloBaby) colorInfantilSeloBaby.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-infantil-selo-baby input[name="color-option-infantil-selo-baby"][value="Preto"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    } else {
                        if (colorInfantilSeloBaby) colorInfantilSeloBaby.style.display = 'none';
                        if (colorInfantilSeloCamiseta) colorInfantilSeloCamiseta.style.display = 'flex';
                        const defaultRadio = document.querySelector('#color-options-infantil-selo-camiseta input[name="color-option-infantil-selo-camiseta"][value="Preto"]');
                        if (defaultRadio) defaultRadio.checked = true;
                    }
                };
            });
        }
    } else {
        if (infantilSeloModelContainer) infantilSeloModelContainer.style.display = 'none';
    }
    
    if (colorAdulto) colorAdulto.style.display = 'none';
    if (colorSublimacaoMachao) colorSublimacaoMachao.style.display = 'none';
    if (colorInfantil) colorInfantil.style.display = 'none';
    if (colorSilkscreenAdulto) colorSilkscreenAdulto.style.display = 'none';
    if (colorSilkscreenBaby) colorSilkscreenBaby.style.display = 'none';
    if (colorInfantilSeloCamiseta) colorInfantilSeloCamiseta.style.display = 'none';
    if (colorInfantilSeloBaby) colorInfantilSeloBaby.style.display = 'none';
    if (colorBabylookSelo) colorBabylookSelo.style.display = 'none';
    if (colorBody) colorBody.style.display = 'none';
    if (colorDtfPolyester) colorDtfPolyester.style.display = 'none';
    if (colorDtfBabylook) colorDtfBabylook.style.display = 'none';
    if (colorDtfInfantilCamiseta) colorDtfInfantilCamiseta.style.display = 'none';
    if (colorDtfInfantilBaby) colorDtfInfantilBaby.style.display = 'none';
    
    if (colorContainer) {
        if (currentCategory === 'Body' || currentCategory === 'Body Infantil' || currentCategory === 'estampasbody') {
            colorContainer.style.display = 'block';
            if (colorTitle) colorTitle.innerText = 'Cor do Viés (Gola/Manga):';
            if (colorBody) colorBody.style.display = 'flex';
            const radio = document.querySelector('input[name="color-option-body"][value="Branco"]');
            if (radio) radio.checked = true;
        } else {
            if (colorTitle) colorTitle.innerText = 'Cor da Camisa:';
            if (currentCategory.includes('Sublimação Adulta') || currentCategory.includes('Sublimação Adulto')) {
                colorContainer.style.display = 'block';
                const selectedSubModel = document.querySelector('input[name="sublimacao-adulto-model-option"]:checked');
                const isMachao = selectedSubModel && selectedSubModel.value === 'Camiseta Machão';
                if (isMachao) {
                    if (colorSublimacaoMachao) colorSublimacaoMachao.style.display = 'flex';
                    const radio = document.querySelector('input[name="color-option-sublimacao-machao"][value="Branca"]');
                    if (radio) radio.checked = true;
                } else {
                    if (colorAdulto) colorAdulto.style.display = 'flex';
                    const radio = document.querySelector('input[name="color-option-adulto"][value="Branca"]');
                    if (radio) radio.checked = true;
                }
            } else if (currentCategory === 'Sublimação Infantil' || currentCategory === 'Sublimação Infantil') {
                colorContainer.style.display = 'block';
                if (colorInfantil) colorInfantil.style.display = 'flex';
                const radio = document.querySelector('input[name="color-option-infantil"][value="Branco"]');
                if (radio) radio.checked = true;
            } else if (currentCategory === 'Silkscreen') {
                colorContainer.style.display = 'block';
                const silkModelRadio = document.querySelector('input[name="silk-model-option"]:checked');
                const isBabyVisco = silkModelRadio && silkModelRadio.value === 'Baby Viscolycra';
                if (isBabyVisco) {
                    if (colorSilkscreenBaby) colorSilkscreenBaby.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-silkscreen-baby input[name="color-option-silk"][value="Preto"]');
                    if (defaultRadio) defaultRadio.checked = true;
                } else {
                    if (colorSilkscreenAdulto) colorSilkscreenAdulto.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-silkscreen-adulto input[name="color-option-silk"][value="Preta"]');
                    if (defaultRadio) defaultRadio.checked = true;
                }
            } else if (currentCategory.includes('Infantil Selo') || currentCategory.includes('Visco Infantil Selo') || currentCategory === 'Viscolycra Infantil Selo') {
                colorContainer.style.display = 'block';
                const selectedModel = document.querySelector('input[name="infantil-selo-model-option"]:checked');
                const isBaby = selectedModel && selectedModel.value === 'Baby Look Viscolycra';
                if (isBaby) {
                    if (colorInfantilSeloCamiseta) colorInfantilSeloCamiseta.style.display = 'none';
                    if (colorInfantilSeloBaby) colorInfantilSeloBaby.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-infantil-selo-baby input[name="color-option-infantil-selo-baby"][value="Preto"]');
                    if (defaultRadio) defaultRadio.checked = true;
                } else {
                    if (colorInfantilSeloBaby) colorInfantilSeloBaby.style.display = 'none';
                    if (colorInfantilSeloCamiseta) colorInfantilSeloCamiseta.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-infantil-selo-camiseta input[name="color-option-infantil-selo-camiseta"][value="Preto"]');
                    if (defaultRadio) defaultRadio.checked = true;
                }
            } else if (currentCategory === 'Baby Look Selo') {
                colorContainer.style.display = 'block';
                if (colorBabylookSelo) colorBabylookSelo.style.display = 'flex';
                const viscoOnlyOptions = document.querySelectorAll('.color-opt-baby-visco-only');
                viscoOnlyOptions.forEach(opt => opt.style.display = 'inline-block');
                const radio = document.querySelector('input[name="color-option-babylook-selo"][value="Preta"]');
                if (radio) radio.checked = true;
            } else if (currentCategory === 'DTF ADULTO' || currentCategory === 'DTF Adulto') {
                colorContainer.style.display = 'block';
                const selectedDtfModel = document.querySelector('input[name="dtf-model-option"]:checked');
                const isBaby = selectedDtfModel && selectedDtfModel.value === 'BabyLook Viscolycra';
                if (isBaby) {
                    if (colorDtfBabylook) colorDtfBabylook.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-dtf-babylook input[name="color-option-dtf-babylook"][value="Preto"]');
                    if (defaultRadio) defaultRadio.checked = true;
                } else {
                    if (colorDtfPolyester) colorDtfPolyester.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-dtf-polyester input[name="color-option-dtf-polyester"][value="Preto"]');
                    if (defaultRadio) defaultRadio.checked = true;
                }
            } else if (currentCategory === 'DTF Infantil') {
                colorContainer.style.display = 'block';
                const selectedDtfModel = document.querySelector('input[name="dtf-infantil-model-option"]:checked');
                const isBaby = selectedDtfModel && selectedDtfModel.value.includes('Baby');
                if (isBaby) {
                    if (colorDtfInfantilBaby) colorDtfInfantilBaby.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-dtf-infantil-baby input[name="color-option-dtf-infantil-baby"][value="Preto"]');
                    if (defaultRadio) defaultRadio.checked = true;
                } else {
                    if (colorDtfInfantilCamiseta) colorDtfInfantilCamiseta.style.display = 'flex';
                    const defaultRadio = document.querySelector('#color-options-dtf-infantil-camiseta input[name="color-option-dtf-infantil-camiseta"][value="Preto"]');
                    if (defaultRadio) defaultRadio.checked = true;
                }
            } else {
                colorContainer.style.display = 'none';
            }
        }
    }
    // Lógica da Cor da Estampa (Silkscreen)
    const printColorContainer = document.getElementById('print-color-selector-container');
    if (currentCategory === 'Silkscreen') {
        if (printColorContainer) printColorContainer.style.display = 'block';
        const radio = document.querySelector('input[name="print-color-option"][value="Branca"]');
        if (radio) radio.checked = true;
    } else {
        if (printColorContainer) printColorContainer.style.display = 'none';
    }
    
    // Passo a Passo Numerado Dinâmico para Facilitar para Idosos
    let stepNum = 1;

    if (hasStrass && strassContainer) {
        const h3 = strassContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Acabamento:`;
        stepNum++;
    }
    if ((currentCategory.includes('Sublimação Adulta') || currentCategory.includes('Sublimação Adulto')) && sublimacaoAdultoModelContainer) {
        const h3 = sublimacaoAdultoModelContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo:`;
        stepNum++;
    }
    if (currentCategory === 'Baby Look Selo' && fabricContainer) {
        const h3 = fabricContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo / Tecido:`;
        stepNum++;
    }
    if ((currentCategory === 'DTF ADULTO' || currentCategory === 'DTF Adulto') && dtfModelContainer) {
        const h3 = dtfModelContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo / Tecido:`;
        stepNum++;
    }
    if (currentCategory === 'DTF Infantil' && dtfInfantilModelContainer) {
        const h3 = dtfInfantilModelContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo / Tecido:`;
        stepNum++;
    }
    if ((currentCategory.includes('Infantil Selo') || currentCategory.includes('Visco Infantil Selo') || currentCategory === 'Viscolycra Infantil Selo') && infantilSeloModelContainer) {
        const h3 = infantilSeloModelContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo / Tecido:`;
        stepNum++;
    }
    if (currentCategory === 'Silkscreen' && silkModelContainer) {
        const h3 = silkModelContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Escolha o Modelo:`;
        stepNum++;
    }
    if (colorContainer && colorContainer.style.display !== 'none') {
        const isBody = currentCategory === 'Body' || currentCategory === 'Body Infantil' || currentCategory === 'estampasbody';
        const labelText = isBody ? 'Cor do Viés (Gola/Manga):' : 'Cor da Camisa:';
        if (colorTitle) colorTitle.innerText = `${stepNum}. ${labelText}`;
        stepNum++;
    }
    if (currentCategory === 'Silkscreen' && printColorContainer) {
        const h3 = printColorContainer.querySelector('h3');
        if (h3) h3.innerText = `${stepNum}. Cor da Estampa:`;
        stepNum++;
    }

    modal.style.display = 'flex';
    history.pushState({ type: 'modal' }, '', '#produto');
}

// Funções para o Modal de Zoom na Imagem (Lightbox)
function openZoomModal() {
    const imgEl = document.getElementById('modal-image');
    const videoEl = document.getElementById('modal-video');
    const zoomModal = document.getElementById('zoom-modal');
    const zoomImg = document.getElementById('zoom-image');
    const zoomVideo = document.getElementById('zoom-video');

    if (!zoomModal || !zoomImg || !zoomVideo) return;

    if (videoEl && videoEl.style.display !== 'none' && videoEl.src) {
        zoomImg.style.display = 'none';
        zoomVideo.style.display = 'block';
        zoomVideo.src = videoEl.src;
        zoomVideo.playbackRate = 2.5;
    } else if (imgEl && imgEl.src) {
        zoomVideo.style.display = 'none';
        zoomVideo.src = '';
        zoomImg.style.display = 'block';
        zoomImg.src = imgEl.src;
    }

    zoomModal.style.display = 'flex';
}

function closeZoomModal() {
    const zoomModal = document.getElementById('zoom-modal');
    if (zoomModal) zoomModal.style.display = 'none';
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
