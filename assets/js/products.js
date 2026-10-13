/* ═══════════════════════════════════════════════════════════
   THE FATO — catálogo de produtos
   Fonte única dos produtos do site: Home, Drops, coleções e a
   página de produto são geradas a partir daqui. Para trocar um
   nome, preço, foto ou ficha, edite só este arquivo.
   ═══════════════════════════════════════════════════════════ */

// color: cor-tema da coleção (faixas, ficha de espécie, hero)
const COLLECTIONS = {
    'bicharada': {
        name: 'Bicharada',
        color: 'green',
        tagline: 'Bichos, trocadilhos e a fauna que mora na sua cabeça.',
        page: 'colecao-bicharada.html',
    },
    'consumo': {
        name: 'Consumo',
        color: 'magenta',
        tagline: 'Coisas que a gente compra, engole e nem precisava.',
        page: 'colecao-consumo.html',
    },
    'conceitos': {
        name: 'Conceitos',
        color: 'blue',
        tagline: 'Ideias grandes demais para caber numa camiseta. Cabem.',
        page: 'colecao-conceitos.html',
    },
};

// Regras comerciais do protótipo (valores de exemplo: troque aqui)
const STORE = {
    freeShippingFrom: 299,          // frete grátis a partir deste subtotal (R$)
    pixDiscount: 0.05,              // desconto no PIX (5%)
    maxInstallments: 3,             // parcelas sem juros no cartão
    coupons: { BICHARADA10: 0.10 }, // cupom: desconto sobre o subtotal
    whatsapp: '5511900000000',      // número fictício: troque pelo real
};

// selos dos cards: novo | mais-vendido | ultimas
const BADGES = {
    'novo': 'Novo',
    'mais-vendido': 'Mais vendido',
    'ultimas': 'Últimas unidades',
};

const BASE_DESCRIPTION = 'Modelagem streetwear oversized. Tecido 100% algodão premium sustentável. Estampa em DTF de alta durabilidade. Produzido no Brasil.';

const ART = 'assets/images/products/estampas/';

// concept: o trocadilho explicado · species: ficha de espécie da página de produto
const PRODUCTS = [
    // ── Bicharada ──
    {
        id: 'a-lontra-do-mal', badge: 'mais-vendido', name: 'A Lontra do Mal', collection: 'bicharada', price: 149.90,
        images: [ART + 'a-lontra-do-mal.webp'], kaomoji: '(°ᴥ°)',
        concept: 'A ariranha só aparece com o olho fora d’água, esperando o momento certo. Todo mundo conhece alguém assim.',
        species: { nome: 'Pteronura malvadus', habitat: 'Rios do Pantanal e a sua lista de contatos', ameaca: 'Garimpo, pesca predatória e fofoca', nota: 'A ariranha é ameaçada de extinção no Brasil. Do mal mesmo é quem suja o rio dela.' },
    },
    {
        id: 'let-it-quack', mainColor: 'preta', badge: 'mais-vendido', name: 'Let It Quack', collection: 'bicharada', price: 149.90,
        images: [ART + 'let-it-quack.webp'], kaomoji: '(°>',
        concept: 'Let it be, versão pato. Um teste de Rorschach em que todo mundo vê a mesma coisa: um pato.',
        species: { nome: 'Anas deixaquackensis', habitat: 'Lagos, praças e borrões de tinta', ameaca: 'Pão jogado por turista', nota: 'Pão faz mal para patos. Deixe quackar em paz.' },
    },
    {
        id: 'melzinho-na-chupeta', name: 'Melzinho na Chupeta', collection: 'bicharada', price: 149.90,
        images: [ART + 'melzinho-na-chupeta.webp'], kaomoji: '~~( ε:>',
        concept: 'A expressão pra quando tudo vem fácil. A abelha, que fez o mel, discorda.',
        species: { nome: 'Apis facilitata', habitat: 'Flores, colmeias e promessas fáceis', ameaca: 'Agrotóxicos e quem acha que mel nasce no pote', nota: 'Cerca de 75% das culturas agrícolas dependem em algum grau de polinizadores.' },
    },
    {
        id: 'malandro', mainColor: 'preta', name: 'Malandro', collection: 'bicharada', price: 149.90,
        images: [ART + 'malandro.webp'], kaomoji: '><(((°>',
        concept: 'O cavalo-marinho se finge de peixe para não ter que puxar carroça. Malandragem evolutiva.',
        species: { nome: 'Hippocampus malandrus', habitat: 'Recifes, mangues e a sombra mais fresca', ameaca: 'Trabalho braçal e pesca de arrasto', nota: 'Nos cavalos-marinhos é o macho que fica grávido. Malandro, mas não tanto.' },
    },
    {
        id: 'ainda-se-lembra', name: 'Ainda Se Lembra?', collection: 'bicharada', price: 149.90,
        images: [ART + 'ainda-se-lembra.webp', ART + 'ainda-se-lembra-traco.webp'], kaomoji: 'ʚïɞ',
        concept: 'Ovo, lagarta, casulo, borboleta. A borboleta lembra de quando era lagarta? Uma pergunta para quem mudou muito — ou nada.',
        species: { nome: 'Papilio nostalgicus', habitat: 'Jardins e grupos antigos de WhatsApp', ameaca: 'Perda de habitat e foto antiga marcada', nota: 'Há estudos indicando que borboletas podem guardar memórias da fase de lagarta.' },
    },
    {
        id: 'correr-atras', badge: 'novo', name: 'Correr Atrás', collection: 'bicharada', price: 149.90,
        images: [ART + 'gato.webp'], kaomoji: '(=^･ω･^=)', mockupId: 'gato',
        concept: '“Eu não quero correr atrás de algo que não é real.” Disse o gato, olhando para a luzinha do laser.',
        species: { nome: 'Felis laserensis', habitat: 'Sofás, caixas de papelão e o chão da sala às 3 da manhã', ameaca: 'Pontinho vermelho e metas dos outros', nota: 'Veterinários recomendam terminar a brincadeira com laser num brinquedo que o gato consiga pegar, para ele não ficar frustrado.' },
    },
    {
        id: 'amor-cego', badge: 'novo', mainColor: 'preta', name: '(A)mor Cego', collection: 'bicharada', price: 149.90,
        images: [ART + 'amor-cego.webp'], kaomoji: '/(°∀°)\\',
        concept: 'Dizem que o amor é cego. O morcego, coitado, ficou com a fama junto.',
        species: { nome: 'Chiroptera apaixonadus', habitat: 'Cavernas, forros e encontros às 3 da manhã', ameaca: 'Desmatamento e ex que volta', nota: 'Morcegos não são cegos: muitos enxergam bem e ainda usam ecolocalização para voar no escuro.' },
    },

    // ── Consumo ──
    {
        id: 'tenho-2-desse', name: 'Tenho 2 Desse Dentro de Mim', collection: 'consumo', price: 149.90,
        images: [ART + 'tenho-2-desse.webp'], kaomoji: '[$_$]',
        concept: 'A gente ingere microplástico toda semana. A estampa faz a conta e conclui: já comi dois cartões de crédito.',
        species: { nome: 'Homo plasticus', habitat: 'Cidades, oceanos e a sua corrente sanguínea', ameaca: 'Embalagem descartável', nota: 'Estimativa da WWF (2019): até 5 g de plástico por semana — o peso de um cartão de crédito.' },
    },
    {
        id: 'desnecessario', name: 'Desnecessário', collection: 'consumo', price: 149.90,
        images: [ART + 'desnecessario.webp'], kaomoji: '[???]',
        concept: 'Desnecessário como frasco de shampoo: tem versão em barra, sem embalagem, que dura mais.',
        species: { nome: 'Flasconis inutilis', habitat: 'Box do banheiro, lixo e oceano', ameaca: 'Você, se escolher a barra', nota: 'Um shampoo em barra costuma durar o mesmo que 2 ou 3 frascos — e não deixa embalagem plástica.' },
    },
    {
        id: 'o-inimigo-agora-e-outro', name: 'O Inimigo Agora É Outro', collection: 'consumo', price: 149.90,
        images: [ART + 'o-inimigo-agora-e-outro.webp'], kaomoji: '(°>',
        concept: 'O patinho de borracha cresceu. Filme de monstro onde o monstro é o plástico que a gente jogou fora.',
        species: { nome: 'Anas plasticus gigantea', habitat: 'Banheiras, rios e o horizonte', ameaca: 'Nenhuma. Ele é a ameaça.', nota: 'Em 1992, um contêiner com quase 29 mil bichinhos de borracha (patinhos inclusive) caiu no Pacífico. Por anos, eles foram parar em praias do mundo todo.' },
    },
    {
        id: 'pare', badge: 'ultimas', name: 'Pare', collection: 'consumo', price: 149.90,
        images: [ART + 'pare.webp'], kaomoji: '[$]',
        concept: 'A estrada vira cifrão e as placas pedem: pare. Nem todo caminho precisa terminar numa compra.',
        species: { nome: 'Cifrao rodoviarius', habitat: 'Vitrines, apps e madrugadas', ameaca: 'Parcelamento sem juros', nota: 'Antes de comprar, espere 24 h. Se ainda quiser, talvez precise mesmo.' },
    },
    {
        id: 'possui-ecobag', name: 'Possui Ecobag', collection: 'consumo', price: 149.90,
        images: [ART + 'possui-ecobag.webp'], kaomoji: '\\_/',
        concept: 'Carregar a própria sacola é o mínimo. O título de “possui ecobag” é para quem lembra de levar.',
        species: { nome: 'Saccus reutilizabilis', habitat: 'Porta-malas e ombros conscientes', ameaca: 'Esquecimento na hora do mercado', nota: 'Uma sacola reutilizável compensa quando usada muitas vezes. Use até rasgar.' },
    },
    {
        id: 'casal', badge: 'novo', mainColor: 'preta', name: 'Casal: Cigarro & Cigarra', collection: 'consumo', price: 149.90,
        images: [ART + 'casal.webp'], kaomoji: '~(°·°)~',
        concept: 'Uma letra de diferença. A cigarra canta no verão; o cigarro faz fumaça o ano inteiro e ainda vai parar no chão.',
        species: { nome: 'Cicada nicotiana', habitat: 'Árvores no verão e bitucas na calçada', ameaca: 'Bituca jogada no chão', nota: 'A bituca de cigarro está entre os resíduos mais recolhidos em mutirões de limpeza de praias no mundo.' },
    },

    // ── Conceitos ──
    {
        id: 'pensamenos', name: 'Pensamenos', collection: 'conceitos', price: 149.90,
        images: [ART + 'pensamenos.webp'], kaomoji: '(-_-)',
        concept: 'O Pensador de Rodin, versão economia de energia. Às vezes pensar menos é pensar melhor.',
        species: { nome: 'Homo pensamenus', habitat: 'Museus, sofás e reuniões que podiam ser e-mail', ameaca: 'Excesso de abas abertas', nota: 'Rodin criou O Pensador para observar a Porta do Inferno. Pensou demais.' },
    },
    {
        id: 'humano', name: 'Humano©', collection: 'conceitos', price: 149.90,
        images: [ART + 'humano.webp'], kaomoji: '(•_•)',
        concept: 'Um ser biopsicossocial — com direitos autorais. Produto original, sem versão pirata.',
        species: { nome: 'Homo sapiens registradus', habitat: 'Todos. Infelizmente.', ameaca: 'Ele mesmo', nota: 'Biopsicossocial: o modelo que vê a gente como corpo, mente e convivência ao mesmo tempo.' },
    },
    {
        id: 'populacao-global', name: 'População Global', collection: 'conceitos', price: 149.90,
        images: [ART + 'populacao-global.webp'], kaomoji: '[o_o]',
        concept: 'Gráfico definitivo da humanidade: 1% malandro, 99% otário. Em pixel, com Comic Sans e janela de 1995.',
        species: { nome: 'Otarius vulgaris', habitat: 'Internet discada e atual', ameaca: 'Golpe do pix', nota: 'Dados de pesquisa nenhuma. Mas você sabe de que lado está.' },
    },
    {
        id: 'se-pa', badge: 'novo', name: 'Se Pa...', collection: 'conceitos', price: 149.90,
        images: [ART + 'se-pa.webp'], kaomoji: '(・_・ )?',
        concept: 'O Pensador passou anos pensando e chegou à conclusão mais honesta possível: se pá.',
        species: { nome: 'Homo talvezensis', habitat: 'Grupos de decisão e cardápios grandes demais', ameaca: 'Certezas absolutas', nota: '“Se pá” é gíria brasileira para “talvez”, “quem sabe”.' },
    },
];

// Cores da camiseta: cada peça tem um mockup (foto do modelo com a estampa aplicada).
// images[] guarda só a arte; a foto da cor escolhida entra na frente.
const MOCKUPS = 'assets/images/products/mockups/';
const IMG_V = 3; // suba este número ao refazer mockups/artes, para o navegador não mostrar a versão antiga
const TEE_COLORS = {
    branca: { name: 'Branca', hex: '#ffffff' },
    preta: { name: 'Preta', hex: '#000000' },
};
// mainColor: cor da foto do card e cor inicial da página (padrão branca; estampas de tinta clara abrem na preta)
PRODUCTS.forEach(p => {
    p.colors = {};
    Object.keys(TEE_COLORS).forEach(c => { p.colors[c] = `${MOCKUPS}${p.mockupId || p.id}-${c}.webp?v=${IMG_V}`; });
    p.images = p.images.map(src => `${src}?v=${IMG_V}`);
    p.mainColor = p.mainColor || 'branca';
    p.colorLabel = 'Branca ou preta';
});

function getProduct(id) {
    return PRODUCTS.find(p => p.id === id) || null;
}
