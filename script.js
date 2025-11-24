document.addEventListener('DOMContentLoaded', () => {
    const personaContainer = document.querySelector(".persona-container");
    const botaoBusca = document.getElementById('botao-busca');
    const inputBusca = document.getElementById('busca-input');
    let dados = [];
    const scrollBtn = document.getElementById('scroll-to-top');
    const mainElement = document.querySelector('main'); // Seleciona o elemento main

    async function carregarDados() {
        try {
            const resposta = await fetch("data.json");
            dados = await resposta.json();
            renderizarCards(dados); // Exibe todos os cards ao carregar a página
        } catch (error) {
            console.error("Erro ao carregar os dados:", error);
        }
    }

    function iniciarBusca() {
        const termoBusca = inputBusca.value.toLowerCase();
        if (!termoBusca) { // Se a busca estiver vazia
            renderizarCards(dados); // Mostra todos os cards
            return;
        }

        const resultados = dados.filter(dado => {
            const termoPrincipal = dado.nome?.toLowerCase().includes(termoBusca) ||
                dado.data_criacao?.toLowerCase().includes(termoBusca) ||
                dado.descricao?.toLowerCase().includes(termoBusca) ||
                dado.Consoles?.toLowerCase().includes(termoBusca) ||
                dado.tags?.some(tag => tag.toLowerCase().includes(termoBusca));

            const termoVariacao = dado.variations?.some(v => v.nome.toLowerCase().includes(termoBusca));
            return termoPrincipal || termoVariacao;
        });
        renderizarCards(resultados);
    }

    function renderizarCards(dadosParaRenderizar) {
        personaContainer.innerHTML = ''; // Limpa os resultados anteriores
        dadosParaRenderizar.forEach((dado, index) => {
            const card = document.createElement('div');
            card.className = 'p5-info-card';
            card.id = `card-${dado.nome.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

            if (dado.theme) {
                card.style.setProperty('--card-bg-color', dado.theme.bg || dado.theme.primary);
                card.style.setProperty('--card-text-color', dado.theme.secondary);
            }

            // Função para gerar o HTML dos protagonistas
            function gerarProtagonistasHTML(dadosJogo) {
                if (dadosJogo.protagonistas && Array.isArray(dadosJogo.protagonistas) && dadosJogo.protagonistas.length > 2) {
                    return dadosJogo.protagonistas.map((p, i) => `<img src="${p}" class="protagonista-multi protagonista-multi-${i + 1}">`).join('');
                } else if (dadosJogo.protagonistas && Array.isArray(dadosJogo.protagonistas)) {
                    return `<img src="${dadosJogo.protagonistas[0]}" class="protagonista-img-left"><img src="${dadosJogo.protagonistas[1]}" class="protagonista-img-right">`;
                }
                return dadosJogo.protagonista ? `<img src="${dadosJogo.protagonista}" class="protagonista-img">` : '<div class="protagonista-img-placeholder"></div>';
            }

            // Cria a nova estrutura interna do card
            card.innerHTML = `
                <div class="p5-card-content">
                    <h3 class="card-title">${dado.nome}</h3>
                    <p class="card-year">${dado.data_criacao || ''}</p>
                    <p class="card-desc">${dado.descricao || ''}</p>
                    <p class="card-consoles">${dado.Consoles || ''}</p>
                    <a href="${dado.link}" class="card-link-info">Informações</a>
                    ${dado.hlb ? `<a href="${dado.hlb}" class="card-link-hlb">Quanto tempo para zerar?</a>` : ''}
                    
                    <div class="image-container">
                        ${gerarProtagonistasHTML(dado)}
                    </div>
                </div>
            `;

            // Adiciona as bolhas de variação, se existirem
            if (dado.variations && dado.variations.length > 0) {
                const variationsContainer = document.createElement('div');
                variationsContainer.className = 'variations-container';

                // Adiciona a bolha para voltar ao estado original
                const backBubble = document.createElement('div');
                backBubble.className = 'variation-bubble back-to-default-bubble';
                backBubble.innerHTML = '↲'; // Símbolo de "Enter" ao contrário
                backBubble.title = 'Voltar ao Padrão';
                backBubble.style.animationDelay = `${Math.random() * 2}s`; // Delay aleatório para a animação
                backBubble.onclick = (e) => {
                    e.stopPropagation();
                    atualizarCard(card, dado); // Restaura com os dados originais
                };
                variationsContainer.appendChild(backBubble);

                dado.variations.forEach(variation => {
                    const bubble = document.createElement('div');
                    bubble.className = 'variation-bubble';
                    bubble.style.backgroundImage = `url('${variation.bubble_icon}')`;
                    bubble.title = variation.nome; // Tooltip com o nome do jogo

                    bubble.onclick = (e) => {
                        e.stopPropagation(); // Impede que o clique na bolha dispare o hover do card
                        atualizarCard(card, variation);
                    };
                    bubble.style.animationDelay = `${Math.random() * 2}s`; // Delay aleatório para a animação
                    variationsContainer.appendChild(bubble);
                });
                card.appendChild(variationsContainer);
            }

            personaContainer.appendChild(card);
        });
    }

    function atualizarCard(cardElement, dadosVariacao) {
        // Seleciona os elementos dentro do card que precisam ser atualizados
        const content = cardElement.querySelector('.p5-card-content');
        const title = content.querySelector('.card-title');
        const year = cardElement.querySelector('.card-year');
        const desc = cardElement.querySelector('.card-desc');
        const consoles = cardElement.querySelector('.card-consoles');
        const linkHlb = cardElement.querySelector('.card-link-hlb');
        const imageContainer = cardElement.querySelector('.image-container');

        // Limpa efeitos especiais de fundo anteriores
        cardElement.classList.remove('pq-theme-active', 'pq2-theme-active');

        // Remove bolhas antigas do body ou do card
        const existingBubbleContainer = document.getElementById('pq-bubbles');
        if (existingBubbleContainer) {
            existingBubbleContainer.remove();
        }

        // Atualiza as cores do card
        if (dadosVariacao.theme) {
            cardElement.style.setProperty('--card-bg-color', dadosVariacao.theme.bg || dadosVariacao.theme.primary);
            cardElement.style.setProperty('--card-text-color', dadosVariacao.theme.secondary);
        }

        // Lógica expandida para criar bolhas para todos os temas com cores definidas
        const tema = dadosVariacao.theme;
        if (tema) {
            const bubbleContainer = document.createElement('div');
            bubbleContainer.id = 'pq-bubbles';
            bubbleContainer.className = 'pq-bubbles-container';

            let coresDasBolhas = [];
            // Define as cores das bolhas com base no tema
            if (tema === 'pq') {
                coresDasBolhas = ['bubble-blue', 'bubble-yellow']; // P3 e P4
            } else if (tema === 'pq2') {
                // Para o PQ2, as bolhas terão as 4 cores dos protagonistas
                coresDasBolhas = ['bubble-red', 'bubble-yellow', 'bubble-blue', 'bubble-pink'];
            } else if (tema.primary) {
                // Para temas padrão (P1, P2, P3, etc.), cria bolhas com a cor primária e terciária
                const corPrimaria = tema.primary;
                const corTerciaria = tema.tertiary;
                const bubble1 = document.createElement('div');
                bubble1.style.backgroundColor = corPrimaria;
                const bubble2 = document.createElement('div');
                bubble2.style.backgroundColor = corTerciaria;
                coresDasBolhas = [bubble1, bubble2]; // Usaremos os elementos diretamente
            }

            for (let i = 0; i < 15; i++) { // Aumentando o número de bolhas para um efeito mais preenchido
                const bubble = document.createElement('div');
                const corAleatoria = coresDasBolhas[Math.floor(Math.random() * coresDasBolhas.length)];

                // Adiciona a classe base e a classe de cor específica
                bubble.className = 'pq-bubble';
                if (typeof corAleatoria === 'string') {
                    bubble.classList.add(corAleatoria);
                } else {
                    bubble.style.backgroundColor = corAleatoria.style.backgroundColor;
                }

                bubble.style.left = `${Math.random() * 100}%`; // Posição relativa ao card
                bubble.style.top = `${Math.random() * 100}%`;  // Posição relativa ao card
                bubble.style.animationDelay = `${Math.random() * 8}s`; // Aumenta o delay para mais variedade
                bubbleContainer.appendChild(bubble);
            }
            cardElement.appendChild(bubbleContainer); // Adiciona as bolhas DENTRO do card
            // Ativa a classe de tema específica se for 'pq' ou 'pq2'
            if (typeof tema === 'string') {
                cardElement.classList.add(`${tema}-theme-active`); // Adiciona a classe AO CARD
            }
        }

        // Atualiza o conteúdo com os dados da variação
        title.textContent = dadosVariacao.nome;

        // Limpa protagonistas antigos
        imageContainer.innerHTML = '';

        // Adiciona os novos protagonistas
        if (dadosVariacao.protagonistas && Array.isArray(dadosVariacao.protagonistas) && dadosVariacao.protagonistas.length > 2) {
            // Lógica para 4 protagonistas
            imageContainer.innerHTML += dadosVariacao.protagonistas.map((p, i) => `<img src="${p}" class="protagonista-multi protagonista-multi-${i + 1}">`).join('');
        } else if (dadosVariacao.protagonistas && Array.isArray(dadosVariacao.protagonistas)) {
            // Lógica para 2 protagonistas
            imageContainer.innerHTML += `<img src="${dadosVariacao.protagonistas[0]}" class="protagonista-img-left"><img src="${dadosVariacao.protagonistas[1]}" class="protagonista-img-right">`;
        } else if (dadosVariacao.protagonista) {
            // Lógica para 1 protagonista
            imageContainer.innerHTML += `<img src="${dadosVariacao.protagonista}" class="protagonista-img">`;
        } else {
            // Placeholder se não houver protagonista
            imageContainer.innerHTML += '<div class="protagonista-img-placeholder"></div>';
        }

        year.textContent = dadosVariacao.data_criacao || '';
        desc.textContent = dadosVariacao.descricao || '';
        consoles.textContent = dadosVariacao.Consoles || '';
        content.querySelector('.card-link-info').href = dadosVariacao.link || '#';

        // Atualiza o link "Quanto tempo para zerar?"
        if (linkHlb) {
            if (dadosVariacao.hlb) {
                linkHlb.href = dadosVariacao.hlb;
                linkHlb.style.display = 'inline'; // Garante que o link esteja visível
            } else {
                linkHlb.style.display = 'none'; // Esconde o link se a variação não tiver
            }
        }
    }

    botaoBusca.addEventListener('click', iniciarBusca);
    inputBusca.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            iniciarBusca();
        }
    });

    carregarDados();

    // Lógica para o botão "Voltar ao Topo" (Novo estilo P5)
    const scrollThreshold = 300;

    // 1. Mostrar/Esconder o botão na rolagem (adaptado para o elemento 'main')
    mainElement.addEventListener('scroll', function() {
        const scrolled = mainElement.scrollTop;
        if (scrolled > scrollThreshold) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });

    // 2. Ação de rolagem suave ao clicar (adaptado para o elemento 'main')
    scrollBtn.addEventListener('click', function() {
        mainElement.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});