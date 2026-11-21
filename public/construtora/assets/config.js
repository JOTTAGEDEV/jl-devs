/* ==========================================================================
   ARQUEN — configuração do site (window.SITE)
   Projeto conceito desenvolvido por JL Devs. Tudo o que muda de cliente
   para cliente está neste arquivo. Não é preciso mexer em HTML, CSS ou JS.

   COMO ADAPTAR PARA UM CLIENTE REAL
   1. MARCA ...... edite `marca` (nome, nomeCompleto, slogan, monograma).
                   Troque também os arquivos assets/logo.svg e assets/favicon.svg.
   2. CORES ...... edite `cores` (sempre hex). Elas sobrescrevem os tokens CSS:
                   paper = fundo claro · ink = texto/grafite · concrete = texto
                   secundário · stone e sand = superfícies · brass = detalhe
                   (use pouco) · night = seções escuras.
                   Mantenha contraste AA: ink sobre paper e paper sobre night.
   3. CONTATOS ... preencha `contato`. Campo vazio ("") = o item não aparece.
                   whatsapp: só dígitos, com 55 + DDD + número (ex.: "5511999990000").
                   instagram: URL completa do perfil. email/telefone/endereco: texto.
   4. SEO ........ troque `seo.url` (hoje "[TROCAR]") pelo domínio final, com https://.
   5. PROJETOS ... substitua os três empreendimentos conceito pelos reais.
                   `slug` vira o endereço (#projeto/<slug>): minúsculas, sem acento,
                   com hífens. Só publique números que o cliente confirmar.
   6. IMAGENS .... as fotos atuais são do Unsplash (licença livre) e ILUSTRATIVAS:
                   não retratam obras da marca. Troque por fotos ou renders reais.
                   Para Unsplash, basta trocar o ID em img("..."). Para arquivo
                   próprio, use o caminho direto: src: "/construtora/assets/foto.jpg".
                   Todo `alt` descreve o que se vê na imagem — atualize junto.
   7. OBRA ....... `obra.modo: "video"` (padrão) avança o vídeo renderizado no Blender
                   com a rolagem: `obra.video.src` (desktop), `srcMobile` (telas menores),
                   `srcRetrato`/`posterRetrato` (celular em pé, enquadramento vertical),
                   `poster` (primeiro quadro) e `foco` (ponto do vídeo que fica no centro
                   quando a tela recorta as laterais). `"3d"` volta para a cena interativa;
                   `"frames"` usa uma lista de imagens em `obra.frames`.
   ========================================================================== */
(function () {
  "use strict";

  // Monta a URL do Unsplash no formato que o frontend espera (ele troca o w= no srcset).
  function img(id) {
    return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=1600&q=70";
  }

  window.SITE = {
    marca: {
      nome: "ARQUEN",
      nomeCompleto: "Arquen Construtora & Incorporadora",
      slogan: "Projeto, obra e entrega sob a mesma assinatura.",
      monograma: "A"
    },

    cores: {
      paper: "#F2EFE9",
      ink: "#151515",
      concrete: "#8E8A84",
      stone: "#CFC8BC",
      sand: "#E6DFD3",
      brass: "#A88A5A",
      night: "#0E0F10"
    },

    seo: {
      titulo: "ARQUEN — Construtora & Incorporadora | Construímos o futuro",
      descricao: "Residências, edifícios e condomínios de alto padrão. Projeto, obra e entrega conduzidos pela mesma equipe.",
      url: "[TROCAR]"
    },

    // Vazio = não exibir. Veja o item 3 das instruções acima.
    contato: {
      email: "",
      whatsapp: "",
      telefone: "",
      instagram: "",
      endereco: ""
    },

    hero: {
      titulo: "Construímos o futuro.",
      subtitulo: "Da primeira ideia ao último detalhe, transformamos projetos em espaços extraordinários.",
      ctaPrimario: "Explorar projetos",
      ctaSecundario: "Nossa expertise"
    },

    etapas: [
      { id: "terreno", nome: "Terreno", texto: "Leitura do solo, do sol e do entorno antes da primeira máquina." },
      { id: "fundacao", nome: "Fundação", texto: "O que sustenta a casa é executado com a mesma precisão do que fica à vista." },
      { id: "estrutura", nome: "Estrutura", texto: "Pilares e lajes definem os vãos, os balanços e a escala de cada ambiente." },
      { id: "vedacoes", nome: "Vedações & cobertura", texto: "Os volumes se fecham e a obra passa a estar protegida do tempo." },
      { id: "acabamentos", nome: "Acabamentos", texto: "Madeira, pedra e vidro entram na ordem certa, com paginação conferida no local." },
      { id: "entrega", nome: "Entrega", texto: "Vistoria item a item, paisagismo concluído e chaves entregues." }
    ],

    manifesto: {
      titulo: "Mais que estruturas. Legados.",
      paragrafos: [
        "Uma obra bem feita envelhece devagar. Por isso decidimos cedo, detalhamos antes de executar e escolhemos materiais pelo que serão daqui a décadas.",
        "Trabalhamos com poucos projetos por vez. É o que permite manter a mesma equipe do primeiro traço à entrega das chaves.",
        "O resultado é silencioso: proporção correta, luz no lugar certo, encontros de materiais que não pedem explicação."
      ],
      pilares: [
        { titulo: "Rigor", texto: "Nada vai para o canteiro sem detalhe, medida e responsável definidos." },
        { titulo: "Matéria", texto: "Concreto, madeira, pedra e vidro usados como são, sem disfarce." },
        { titulo: "Permanência", texto: "Soluções pensadas para o uso e a manutenção de muitos anos." }
      ]
    },

    // Empreendimentos fictícios. Áreas e números da ficha são estudo de conceito, não oferta.
    projetos: [
      {
        slug: "casa-solar",
        nome: "Casa Solar",
        tipo: "Residência unifamiliar",
        local: "Conceito",
        status: "Projeto conceito",
        ano: "Conceito",
        resumo: "Dois volumes escuros em torno de uma árvore existente.",
        descricao: "A casa se organiza em L ao redor de um eucalipto que já estava no terreno. O térreo se abre por inteiro para o jardim. O pavimento superior, em balanço, protege a varanda e filtra o sol da tarde com brises verticais. Ripado de madeira, painéis grafite e vidro do piso ao teto formam uma paleta curta, repetida dentro e fora.",
        ficha: [
          { rotulo: "Tipologia", valor: "Residência unifamiliar" },
          { rotulo: "Pavimentos", valor: "2" },
          { rotulo: "Área privativa", valor: "Aprox. 420 m² (estudo de conceito)" },
          { rotulo: "Materiais", valor: "Ripado de madeira, painel grafite, vidro" },
          { rotulo: "Status", valor: "Projeto conceito" }
        ],
        capa: {
          src: img("1600585154340-be6161a56a0c"),
          alt: "Casa contemporânea de dois pavimentos ao entardecer, com ripado de madeira escura, grandes panos de vidro iluminados e uma árvore alta no jardim."
        },
        galeria: [
          {
            src: img("1600585154526-990dced4db0d"),
            alt: "Entrada da casa ao anoitecer: volume superior em painéis grafite sobre parede de ripas de madeira clara iluminada."
          },
          {
            src: img("1600585154084-4e5fe7c39198"),
            alt: "Sala de estar com piso de madeira, parede revestida em tábuas e portas de vidro abertas para um deque com mesa de jantar."
          },
          {
            src: img("1600607686527-6fb886090705"),
            alt: "Cozinha branca com torre de forno em carvalho, bancada clara, três banquetas de madeira e duas luminárias pendentes pretas."
          }
        ]
      },
      {
        slug: "edificio-alba",
        nome: "Edifício Alba",
        tipo: "Edifício residencial boutique",
        local: "Conceito",
        status: "Projeto conceito",
        ano: "Conceito",
        resumo: "Poucos apartamentos por andar, fachada clara de modulação rigorosa.",
        descricao: "Um edifício de escala contida, pensado para poucos moradores. A fachada em painéis claros alterna cheios e vazios e avança em balanço nos últimos pavimentos. As plantas privilegiam ventilação cruzada e salas voltadas para a melhor orientação. Nas áreas comuns, os mesmos materiais dos apartamentos.",
        ficha: [
          { rotulo: "Tipologia", valor: "Residencial vertical boutique" },
          { rotulo: "Pavimentos", valor: "9 (estudo de conceito)" },
          { rotulo: "Unidades", valor: "2 por andar" },
          { rotulo: "Área privativa", valor: "Aprox. 180 m² por unidade (estudo de conceito)" },
          { rotulo: "Status", valor: "Projeto conceito" }
        ],
        capa: {
          src: img("1479839672679-a46483c0e7c8"),
          alt: "Edifício residencial branco visto de baixo, com volumes em balanço e fachada modulada em painéis claros contra céu azul pálido."
        },
        galeria: [
          {
            src: img("1545324418-cc1a3fa10c00"),
            alt: "Fachada de edifício residencial ao entardecer, com trecho em madeira escura, tijolo claro, varandas de vidro e caixa de escada iluminada."
          },
          {
            src: img("1600210492486-724fe5c67fb0"),
            alt: "Sala de apartamento em andar alto banhada de sol, com sofá de couro caramelo, poltronas brancas e janelas amplas com vista da cidade."
          },
          {
            src: img("1600566752355-35792bedcfea"),
            alt: "Banheiro revestido em porcelanato grafite, com banheira branca de imersão, box de vidro e janela horizontal alta voltada para as árvores."
          }
        ]
      },
      {
        slug: "vila-cedro",
        nome: "Vila Cedro",
        tipo: "Casas em condomínio",
        local: "Conceito",
        status: "Projeto conceito",
        ano: "Conceito",
        resumo: "Casas de madeira clara e metal escuro, cada uma com seu pátio.",
        descricao: "Um conjunto pequeno de casas com a mesma linguagem e implantações diferentes. Cada unidade se volta para um pátio próprio com piscina, protegido da rua por muros revestidos em madeira. Painéis perfurados controlam o sol no pavimento superior. Escada vazada e pé-direito duplo levam luz natural ao centro da planta.",
        ficha: [
          { rotulo: "Tipologia", valor: "Casas em condomínio fechado" },
          { rotulo: "Pavimentos", valor: "2 + terraço" },
          { rotulo: "Unidades", valor: "8 casas (estudo de conceito)" },
          { rotulo: "Área privativa", valor: "Aprox. 310 m² por casa (estudo de conceito)" },
          { rotulo: "Status", valor: "Projeto conceito" }
        ],
        capa: {
          src: img("1600566753190-17f0baa2a6c3"),
          alt: "Casa contemporânea com fachada em tábuas de madeira clara, muro metálico preto, grande pano de vidro na entrada e cobertura inclinada."
        },
        galeria: [
          {
            src: img("1600573472592-401b489a3cdc"),
            alt: "Pátio com piscina e deque, cercado por parede de madeira clara e fachada com painéis brancos perfurados sob um beiral amplo."
          },
          {
            src: img("1600573472550-8090b5e0745e"),
            alt: "Vista de dentro da casa para o pátio com piscina, através de esquadrias pretas do piso ao teto, com escada vazada de degraus de madeira."
          },
          {
            src: img("1600566753086-00f18fb6b3ea"),
            alt: "Sala de estar integrada com sofás claros, piso de madeira, escada vazada e fachada de vidro com caixilhos escuros."
          }
        ]
      }
    ],

    expertise: [
      {
        titulo: "Incorporação",
        texto: "Estudo de viabilidade, produto e aprovações. O terreno certo, com o projeto que ele comporta.",
        imagem: {
          src: img("1481026469463-66327c86e544"),
          alt: "Quina de edifício com fachada de vidro claro em painéis sobrepostos, vista de baixo contra o céu."
        }
      },
      {
        titulo: "Arquitetura & projeto",
        texto: "Arquitetura, estrutura e instalações compatibilizadas antes do início da obra.",
        imagem: {
          src: img("1523217582562-09d0def993a6"),
          alt: "Casa branca de volumes cúbicos e aberturas pequenas, com sombras marcadas, gramado e um pinheiro ao lado."
        }
      },
      {
        titulo: "Construção",
        texto: "Equipe própria de engenharia no canteiro, cronograma medido toda semana.",
        imagem: {
          src: img("1541888946425-d81bb19240f5"),
          alt: "Equipe de obra com capacetes e coletes sobre uma laje de concreto recém-executada, vista de cima, com sombras longas."
        }
      },
      {
        titulo: "Interiores & acabamentos",
        texto: "Marcenaria, pedras e iluminação detalhadas junto com a arquitetura, não depois.",
        imagem: {
          src: img("1600607687939-ce8a6c25118c"),
          alt: "Sala integrada à cozinha com parede em tábuas de madeira, lareira revestida em pedra cinza, sofá claro e portas de vidro de correr."
        }
      },
      {
        titulo: "Entrega & pós-obra",
        texto: "Vistoria conjunta, manual do proprietário e assistência depois da entrega das chaves.",
        imagem: {
          src: img("1600047509358-9dc75507daeb"),
          alt: "Fachada frontal de casa de dois pavimentos com volumes brancos, painel de madeira, esquadrias escuras, garagem e jardim concluído."
        }
      }
    ],

    imersivo: {
      titulo: "Do traço à matéria.",
      texto: "Todo projeto começa em linha fina sobre o papel. O que vem depois é precisão: cada medida do desenho precisa aparecer inteira na obra.",
      imagens: [
        {
          src: img("1600047509807-ba8f99d2cdde"),
          alt: "Casa de dois pavimentos com volumes brancos, um bloco revestido em madeira avermelhada e esquadrias escuras, vista em diagonal sob céu azul.",
          legenda: "Volume"
        },
        {
          src: img("1613490493576-7fde63acd811"),
          alt: "Casa branca com forros de madeira nos balanços, guarda-corpo de vidro e piscina de borda reta em primeiro plano.",
          legenda: "Balanço"
        },
        {
          src: img("1529290130-4ca3753253ae"),
          alt: "Piscina coberta com parede de ripas horizontais de madeira, pedra clara e luz quente atravessando um brise vertical.",
          legenda: "Matéria"
        },
        {
          src: img("1512917774080-9991f1c4c750"),
          alt: "Casa branca de linhas retas com laje em balanço e portas de vidro abertas para um pátio de piso claro com piscina.",
          legenda: "Luz"
        },
        {
          src: img("1600585154084-4e5fe7c39198"),
          alt: "Sala de estar com parede de madeira e piso claro, aberta por inteiro para um deque coberto com mesa de jantar.",
          legenda: "Transição"
        },
        {
          src: img("1600585154340-be6161a56a0c"),
          alt: "Casa contemporânea iluminada ao entardecer, com ripado de madeira escura, panos de vidro e uma árvore alta no jardim.",
          legenda: "Permanência"
        }
      ]
    },

    contatoSecao: {
      titulo: "Seu próximo projeto começa aqui.",
      texto: "Conte o que você pretende construir. Respondemos com os próximos passos e uma primeira leitura do terreno."
    },

    // "3d" = cena interativa. "frames" = sequência de imagens listada em `frames` (renders reais).
    obra: {
      modo: "video",
      video: {
        src: "/construtora/assets/video/obra-1080.mp4",
        srcMobile: "/construtora/assets/video/obra-720.mp4",
        srcRetrato: "/construtora/assets/video/obra-retrato.mp4",
        poster: "/construtora/assets/video/obra-poster.jpg",
        posterRetrato: "/construtora/assets/video/obra-poster-retrato.jpg",
        foco: [0.62, 0.5]
      },
      frames: []
    }
  };
})();
