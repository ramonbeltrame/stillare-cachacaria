import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default admin
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  await prisma.admin.upsert({
    where: { email: "admin@stillare.com.br" },
    update: {},
    create: {
      email: "admin@stillare.com.br",
      passwordHash: adminPassword,
      fullName: "Diego Henrique Batista",
      role: "OWNER",
    },
  });
  console.log("✅ Admin created: admin@stillare.com.br / Admin@123456");

  // Create categories
  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { slug: "cachaca-classica" },
      update: {},
      create: { name: "Cachaça Clássica", slug: "cachaca-classica", description: "Cachaças tradicionais, puras e equilibradas", displayOrder: 1 },
    }),
    prisma.productCategory.upsert({
      where: { slug: "cachaca-premium" },
      update: {},
      create: { name: "Cachaça Premium", slug: "cachaca-premium", description: "Envelhecidas em madeiras nobres", displayOrder: 2 },
    }),
    prisma.productCategory.upsert({
      where: { slug: "cachaca-envelhecida" },
      update: {},
      create: { name: "Cachaça Envelhecida", slug: "cachaca-envelhecida", description: "Longa maturação em barris selecionados", displayOrder: 3 },
    }),
    prisma.productCategory.upsert({
      where: { slug: "cachaca-artesanal" },
      update: {},
      create: { name: "Cachaça Artesanal", slug: "cachaca-artesanal", description: "Produção limitada e cuidadosa", displayOrder: 4 },
    }),
  ]);
  console.log("✅ Categories created");

  // Create products
  const products = [
    {
      categoryId: categories[0].id,
      name: "Stillare Tradicional",
      slug: "stillare-tradicional",
      sku: "STL-TRD-500",
      description: "Cachaça pura e equilibrada, perfeita para o dia a dia. Produzida com cana selecionada da região de Charqueada-SP.",
      longDescription: "A Stillare Tradicional é a expressão mais pura da cana-de-açúcar. Destilada em alambique de cobre, preserva o sabor autêntico com notas levemente adocicadas e final limpo. Ideal para drinks clássicos como a caipirinha ou para ser apreciada pura.",
      price: 59.90,
      costPrice: 39.90,
      stock: 200,
      reorderLevel: 30,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: 500,
      alcoholPercentage: 40.0,
      madeira: null,
      weightGrams: 900,
      isActive: true,
      isFeatured: true,
    },
    {
      categoryId: categories[1].id,
      name: "Stillare Carvalho Europeu",
      slug: "stillare-carvalho-europeu",
      sku: "STL-CRV-500",
      description: "Envelhecida 24 meses em barris de Carvalho Europeu. Notas de frutas, figo maduro e mel.",
      longDescription: "A Stillare Carvalho envelhece por 24 meses em barris de Carvalho Europeu — madeira que trabalha com precisão, que não impõe, que aprofunda. O resultado é uma cachaça de coloração dourada marcante, com notas frutadas, figo maduro e mel envoltos por um amadeirado fino e contido. No paladar, é macia. Equilibrada. Com final persistente.",
      price: 89.90,
      costPrice: 59.90,
      stock: 120,
      reorderLevel: 20,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: 500,
      alcoholPercentage: 40.0,
      madeira: "Carvalho Europeu",
      weightGrams: 900,
      isActive: true,
      isFeatured: true,
    },
    {
      categoryId: categories[2].id,
      name: "Stillare Blend Premium",
      slug: "stillare-blend-premium",
      sku: "STL-BLD-750",
      description: "Blend de Carvalho Europeu e Amburana, 24 meses. Complexa e marcante.",
      longDescription: "A Stillare Blend Premium une Carvalho Europeu e Amburana em um envelhecimento de 24 meses. Dois caracteres distintos, dois tempos de expressão, uma única garrafa. O carvalho traz estrutura e contenção. A amburana responde com intensidade aromática e um dulçor natural. O resultado tem coloração dourada intensa, aromas amadeirados equilibrados, notas de baunilha e frutas secas.",
      price: 119.90,
      costPrice: 79.90,
      stock: 80,
      reorderLevel: 15,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: 750,
      alcoholPercentage: 40.0,
      madeira: "Carvalho Europeu + Amburana",
      weightGrams: 1300,
      isActive: true,
      isFeatured: true,
    },
    {
      categoryId: categories[3].id,
      name: "Stillare Bourbon Extra Premium",
      slug: "stillare-bourbon-extra-premium",
      sku: "STL-BRB-750",
      description: "Envelhecida 3 anos em barris de Carvalho Americano Ex-Bourbon. Experiência única.",
      longDescription: "A Stillare Bourbon Extra Premium envelhece por 3 anos em barris de Carvalho Americano que anteriormente armazenaram Whiskey Bourbon. A madeira impregnada de uma história diferente empresta profundidade, camadas e uma complexidade que o tempo sozinho não alcança. Coloração dourado-âmbar intensa. Aromas de mel, baunilha e frutas secas, com sutis notas caramelizadas.",
      price: 249.90,
      costPrice: 169.90,
      stock: 30,
      reorderLevel: 5,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: 750,
      alcoholPercentage: 40.0,
      madeira: "Carvalho Americano (Ex-Bourbon)",
      weightGrams: 1350,
      isActive: true,
      isFeatured: true,
    },
    {
      categoryId: categories[0].id,
      name: "Stillare Mini",
      slug: "stillare-mini",
      sku: "STL-MIN-375",
      description: "Versão compacta da Stillare Tradicional. Perfeita para presentear ou degustar.",
      longDescription: "A versão mini da Stillare Tradicional traz toda a qualidade da nossa cachaça em um formato compacto de 375ml. Ideal para quem quer conhecer a marca, presentear ou ter uma opção portátil para momentos especiais. A mesma pureza e equilíbrio da versão tradicional.",
      price: 29.90,
      costPrice: 19.90,
      stock: 300,
      reorderLevel: 50,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: 375,
      alcoholPercentage: 40.0,
      madeira: null,
      weightGrams: 650,
      isActive: true,
      isFeatured: false,
    },
    {
      categoryId: categories[1].id,
      name: "Stillare Amburana",
      slug: "stillare-amburana",
      sku: "STL-AMB-500",
      description: "Envelhecida em Amburana. Aroma intenso com dulçor natural e notas de especiarias.",
      longDescription: "A Stillare Amburana é uma experiência sensorial única. Envelhecida em barris de Amburana, madeira tipicamente brasileira, esta cachaça desenvolve um perfil aromático intenso com notas de canela, baunilha e um dulçor natural que surpreende. Coloração amarelada com reflexos dourados.",
      price: 94.90,
      costPrice: 64.90,
      stock: 60,
      reorderLevel: 10,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: 500,
      alcoholPercentage: 40.0,
      madeira: "Amburana",
      weightGrams: 900,
      isActive: true,
      isFeatured: false,
    },
    {
      categoryId: categories[3].id,
      name: "Kit Degustação Stillare",
      slug: "kit-degustacao-stillare",
      sku: "STL-KIT-3X200",
      description: "Kit com 3 miniaturas: Tradicional, Carvalho e Blend. Presente perfeito.",
      longDescription: "O Kit Degustação Stillare é a porta de entrada para o universo da nossa cachaça. Contém 3 frascos de 200ml: Stillare Tradicional, Stillare Carvalho Europeu e Stillare Blend Premium. Acompanha manual de degustação com notas sensoriais de cada variedade. Embalagem premium para presente.",
      price: 99.90,
      costPrice: 69.90,
      stock: 50,
      reorderLevel: 10,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: 600,
      alcoholPercentage: 40.0,
      madeira: null,
      weightGrams: 1200,
      isActive: true,
      isFeatured: false,
    },
    {
      categoryId: categories[2].id,
      name: "Stillare Jequitibá Rosa",
      slug: "stillare-jequitiba-rosa",
      sku: "STL-JEQ-500",
      description: "Envelhecida 18 meses em Jequitibá Rosa. Suave e floral, edição limitada.",
      longDescription: "Envelhecida por 18 meses em barris de Jequitibá Rosa, esta edição limitada traz uma cachaça de personalidade única. O Jequitibá confere suavidade excepcional e notas florais delicadas. Uma cachaça para momentos especiais, produzida em quantidade limitada.",
      price: 139.90,
      costPrice: 94.90,
      stock: 20,
      reorderLevel: 5,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: 500,
      alcoholPercentage: 40.0,
      madeira: "Jequitibá Rosa",
      weightGrams: 900,
      isActive: true,
      isFeatured: false,
    },
    {
      categoryId: categories[0].id,
      name: "Stillare Prata Clássica",
      slug: "stillare-prata-classica",
      sku: "STL-PRT-700",
      description: "Cachaça prata, sem envelhecimento. Pura expressão da cana, cristalina e refrescante.",
      longDescription: "A Stillare Prata Clássica é a expressão mais pura da cana-de-açúcar. Sem passar por madeira, preserva todas as características originais da destilação. Cristalina, com aroma suave e sabor limpo. Ideal para drinks refrescantes e caipirinhas premium.",
      price: 49.90,
      costPrice: 32.90,
      stock: 150,
      reorderLevel: 25,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: 700,
      alcoholPercentage: 40.0,
      madeira: null,
      weightGrams: 1100,
      isActive: true,
      isFeatured: false,
    },
    {
      categoryId: categories[1].id,
      name: "Stillare Edição Comemorativa",
      slug: "stillare-edicao-comemorativa",
      sku: "STL-EDC-750",
      description: "Edição especial numerada. Blend premium com 36 meses de envelhecimento.",
      longDescription: "Edição comemorativa de 3 anos da Stillare. Esta cachaça excepcional envelheceu 36 meses em uma combinação especial de barris de Carvalho Europeu e Americano. Cada garrafa é numerada e vem em embalagem especial de madeira com certificado de autenticidade. Tiragem limitada de 200 garrafas.",
      price: 299.90,
      costPrice: 199.90,
      stock: 15,
      reorderLevel: 3,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: 750,
      alcoholPercentage: 42.0,
      madeira: null,
      weightGrams: 1400,
      isActive: true,
      isFeatured: false,
    },
  ];

  // Product image mapping: each product gets 2-3 images from the pool of 43 photos
  const productImages: Record<string, string[]> = {
    "stillare-tradicional": ["/images/products/product-001.jpeg", "/images/products/product-002.jpeg", "/images/products/product-003.jpeg"],
    "stillare-carvalho-europeu": ["/images/products/product-004.jpeg", "/images/products/product-005.jpeg", "/images/products/product-006.jpeg"],
    "stillare-blend-premium": ["/images/products/product-007.jpeg", "/images/products/product-008.jpeg", "/images/products/product-009.jpeg"],
    "stillare-bourbon-extra-premium": ["/images/products/product-010.jpeg", "/images/products/product-011.jpeg", "/images/products/product-012.jpeg"],
    "stillare-mini": ["/images/products/product-013.jpeg", "/images/products/product-014.jpeg", "/images/products/product-015.jpeg"],
    "stillare-amburana": ["/images/products/product-016.jpeg", "/images/products/product-017.jpeg", "/images/products/product-018.jpeg"],
    "kit-degustacao-stillare": ["/images/products/product-019.jpeg", "/images/products/product-020.jpeg", "/images/products/product-021.jpeg"],
    "stillare-jequitiba-rosa": ["/images/products/product-022.jpeg", "/images/products/product-023.jpeg", "/images/products/product-024.jpeg"],
    "stillare-prata-classica": ["/images/products/product-025.jpeg", "/images/products/product-026.jpeg", "/images/products/product-027.jpeg"],
    "stillare-edicao-comemorativa": ["/images/products/product-028.jpeg", "/images/products/product-029.jpeg", "/images/products/product-030.jpeg"],
  };

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });

    // Create product images if any mapped
    const imageUrls = productImages[product.slug] || [];
    if (imageUrls.length > 0) {
      // Delete existing images for this product first
      await prisma.productImage.deleteMany({ where: { productId: created.id } });

      for (let i = 0; i < imageUrls.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: created.id,
            imageUrl: imageUrls[i],
            altText: `${product.name} - Imagem ${i + 1}`,
            displayOrder: i,
            isPrimary: i === 0,
          },
        });
      }
    }
    console.log(`✅ Product: ${product.name} (${imageUrls.length} images)`);
  }

  console.log("🌱 Seed complete!");

  // Create blog posts
  const blogPosts = [
    {
      slug: "como-a-cachaca-e-feita",
      title: "Como a Cachaça é Feita: Do Plantio ao Envelhecimento",
      excerpt: "Descubra cada etapa da produção da cachaça artesanal, desde a escolha da cana-de-açúcar até o envelhecimento em barris de madeira nobre.",
      content: `<p>A cachaça é uma das bebidas mais emblemáticas do Brasil, com uma história que remonta ao período colonial. Mas você já parou para pensar em como essa bebida é produzida? Vamos explorar cada etapa do processo.</p>

<h2>1. O Plantio da Cana</h2>
<p>Tudo começa no campo. A cana-de-açúcar utilizada na produção da Stillare é cultivada na região de Charqueada, interior de São Paulo, em solo rico e clima favorável. A colheita é feita manualmente, sem queima, preservando a qualidade do caldo.</p>

<h2>2. Moagem e Fermentação</h2>
<p>Após a colheita, a cana é moída em até 24 horas para extrair o caldo fresco — a garapa. Este caldo é então fermentado com leveduras selecionadas, em um processo que dura de 18 a 24 horas, transformando os açúcares em álcool.</p>

<h2>3. Destilação em Alambique de Cobre</h2>
<p>O vinho fermentado segue para o coração da produção: o alambique de cobre. A destilação é feita lentamente, separando-se apenas o "coração" do destilado — a porção mais nobre, descartando-se a "cabeça" e a "cauda", que contêm compostos indesejáveis.</p>

<h2>4. Envelhecimento em Madeira</h2>
<p>É aqui que a mágica acontece. A cachaça recém-destilada, cristalina e intensa, repousa em barris de madeiras nobres como Carvalho Europeu, Amburana, Jequitibá Rosa e Carvalho Americano. O tempo de descanso varia de meses a anos, e cada madeira confere características únicas de cor, aroma e sabor.</p>

<h2>5. Engarrafamento</h2>
<p>Após o período de maturação, a cachaça é cuidadosamente filtrada, padronizada e engarrafada. Cada lote é analisado para garantir a qualidade e consistência que a Stillare promete.</p>

<p>Da cana ao copo, cada etapa é realizada com paixão e respeito pela tradição. É por isso que cada gole de Stillare carrega séculos de história.</p>`,
      coverImage: "/images/hero/hero-bg.jpeg",
      author: "Stillare",
      category: "Produção",
      tags: "cachaça, produção, alambique, envelhecimento, stillare",
      isPublished: true,
      publishedAt: new Date("2025-04-15"),
    },
    {
      slug: "tipos-de-madeira-para-envelhecer-cachaca",
      title: "Tipos de Madeira para Envelhecer Cachaça: Guia Completo",
      excerpt: "Conheça as principais madeiras utilizadas no envelhecimento da cachaça e como cada uma influencia o sabor, aroma e cor da bebida.",
      content: `<p>O envelhecimento em madeira é o que transforma uma boa cachaça em uma experiência sensorial inesquecível. Cada tipo de madeira confere características únicas à bebida. Vamos conhecê-las.</p>

<h2>Carvalho Europeu (Quercus petraea)</h2>
<p>O Carvalho Europeu é a madeira mais tradicional e nobre do mundo dos destilados. Confere coloração dourada marcante, notas de frutas secas, figo maduro, mel e um amadeirado fino e contido. No paladar, é macio e equilibrado, com final longo e persistente. A Stillare Carvalho Europeu envelhece 24 meses nessa madeira.</p>

<h2>Carvalho Americano (Quercus alba)</h2>
<p>Mais intenso que o europeu, o Carvalho Americano traz notas marcantes de baunilha, coco e caramelo. Quando os barris são ex-Bourbon, como no caso da Stillare Bourbon Extra Premium, a madeira já impregnada de whiskey adiciona camadas extras de complexidade.</p>

<h2>Amburana (Amburana cearensis)</h2>
<p>Tipicamente brasileira, a Amburana é intensa e aromática. Confere dulçor natural, notas de canela, baunilha e especiarias. A coloração tende ao amarelo-dourado. A Stillare Amburana é uma excelente porta de entrada para quem quer explorar madeiras brasileiras.</p>

<h2>Jequitibá Rosa (Cariniana legalis)</h2>
<p>Madeira brasileira de personalidade sutil. O Jequitibá Rosa confere suavidade excepcional, com notas florais delicadas e um amadeirado muito discreto. Ideal para quem aprecia cachaças mais leves e elegantes.</p>

<h2>Bálsamo (Myroxylon balsamum)</h2>
<p>Outra madeira brasileira que vem ganhando destaque. Confere notas balsâmicas, adocicadas e um leve toque de especiarias. Produz cachaças de personalidade marcante.</p>

<p>A escolha da madeira é uma arte. Na Stillare, cada barril é selecionado pensando no perfil sensorial que queremos alcançar. O resultado está em cada garrafa.</p>`,
      coverImage: null,
      author: "Stillare",
      category: "Curiosidades",
      tags: "cachaça, madeira, envelhecimento, carvalho, amburana, jequitibá",
      isPublished: true,
      publishedAt: new Date("2025-05-01"),
    },
    {
      slug: "cachaca-vs-rum-diferencas",
      title: "Cachaça vs Rum: Diferenças que Todo Apreciador Deve Saber",
      excerpt: "Muita gente confunde cachaça com rum. Descubra as diferenças fundamentais entre essas duas bebidas, da matéria-prima ao sabor final.",
      content: `<p>É comum ver a cachaça sendo chamada de "rum brasileiro" — mas isso é um erro. Embora ambas sejam destilados de cana-de-açúcar, as semelhanças param por aí.</p>

<h2>Matéria-Prima</h2>
<p><strong>Cachaça:</strong> Produzida exclusivamente com caldo de cana-de-açúcar fresco (garapa). A legislação brasileira exige que a cachaça seja feita apenas com esse mosto fermentado e destilado.<br />
<strong>Rum:</strong> Pode ser feito tanto com caldo de cana quanto com melaço — um subproduto da produção de açúcar. A maior parte do rum mundial é produzida a partir do melaço.</p>

<h2>Teor Alcoólico e Destilação</h2>
<p><strong>Cachaça:</strong> Destilada entre 38% e 48% de graduação alcoólica na saída do alambique. Pode ser engarrafada entre 38% e 48%.<br />
<strong>Rum:</strong> Destilado em graduações mais altas, geralmente acima de 65%, e depois diluído. Pode chegar ao consumidor com 40% a 75% de álcool.</p>

<h2>Envelhecimento</h2>
<p><strong>Cachaça:</strong> Tradicionalmente envelhecida em madeiras brasileiras (Amburana, Jequitibá, Bálsamo, Ipê) ou importadas (Carvalho). O tempo mínimo para ser chamada de "envelhecida" é 1 ano.<br />
<strong>Rum:</strong> Predominantemente envelhecido em barris de carvalho americano (muitas vezes ex-Bourbon). O envelhecimento tropical acelera a maturação.</p>

<h2>Sabor</h2>
<p><strong>Cachaça:</strong> Perfil herbáceo característico, com notas que lembram cana fresca. As versões envelhecidas ganham complexidade com notas amadeiradas, frutadas e de especiarias.<br />
<strong>Rum:</strong> Perfil mais adocicado, com notas de caramelo, baunilha e frutas tropicais. Os runs mais envelhecidos lembram whiskey.</p>

<h2>Região e Denominação</h2>
<p>Cachaça é exclusivamente brasileira — assim como o Champagne é francês e o Tequila é mexicano. O Decreto 4.062/2001 define e protege a denominação "cachaça" como produto brasileiro.</p>

<p>Então, na próxima vez que alguém chamar cachaça de rum, você já sabe: são bebidas distintas, cada uma com sua história, tradição e personalidade. E a nossa, claro, tem o sabor do Brasil.</p>`,
      coverImage: null,
      author: "Stillare",
      category: "Curiosidades",
      tags: "cachaça, rum, diferenças, destilados, curiosidades",
      isPublished: true,
      publishedAt: new Date("2025-05-20"),
    },
    {
      slug: "harmonizacao-cachaca-gastronomia",
      title: "Harmonização: Cachaça e Gastronomia Brasileira",
      excerpt: "Aprenda a harmonizar diferentes tipos de cachaça com pratos da culinária brasileira. Combinações surpreendentes que elevam a experiência gastronômica.",
      content: `<p>A cachaça não é apenas uma bebida para o happy hour ou para a caipirinha. Quando bem harmonizada, ela pode ser a estrela de uma experiência gastronômica completa. Vamos explorar algumas combinações.</p>

<h2>Cachaça Prata (Branca) — Frescor e Leveza</h2>
<p>As cachaças não envelhecidas, como a Stillare Prata Clássica, são cristalinas e preservam o sabor puro da cana. Harmonizam perfeitamente com:</p>
<ul>
<li>Moqueca de peixe ou camarão</li>
<li>Ceviche e frutos do mar</li>
<li>Saladas com manga e hortelã</li>
<li>Queijo minas frescal com mel</li>
</ul>

<h2>Cachaça Envelhecida em Carvalho — Estrutura e Elegância</h2>
<p>A Stillare Carvalho Europeu, com seus 24 meses em barris de carvalho, entrega notas de frutas secas e mel. Ideal para:</p>
<ul>
<li>Carnes assadas (picanha, maminha)</li>
<li>Risoto de funghi</li>
<li>Queijos curados (parmesão, gruyère)</li>
<li>Chocolate 70% cacau</li>
</ul>

<h2>Cachaça Envelhecida em Amburana — Dulçor e Especiarias</h2>
<p>A Stillare Amburana tem notas de canela e baunilha. Combina com:</p>
<ul>
<li>Feijoada completa</li>
<li>Costela ao molho barbecue</li>
<li>Sobremesas com doce de leite</li>
<li>Queijo coalho grelhado</li>
</ul>

<h2>Blends Premium — Complexidade para Ocasiões Especiais</h2>
<p>A Stillare Blend Premium, que une Carvalho Europeu e Amburana, pede pratos igualmente complexos:</p>
<ul>
<li>Cordeiro assado com ervas</li>
<li>Magret de pato</li>
<li>Queijos azuis (gorgonzola, roquefort)</li>
<li>Torta de nozes com caramelo</li>
</ul>

<h2>Dicas Práticas</h2>
<ul>
<li>Sirva a cachaça em temperatura ambiente (16-20°C) para apreciar todos os aromas</li>
<li>Use copos do tipo tulipa ou snifter para concentrar os aromas</li>
<li>Sirva pequenas doses (30-50ml) e aprecie lentamente</li>
<li>Intercale goles de água para limpar o paladar</li>
</ul>

<p>A harmonização é uma arte pessoal — use estas sugestões como ponto de partida e descubra suas próprias combinações favoritas.</p>`,
      coverImage: null,
      author: "Stillare",
      category: "Harmonização",
      tags: "cachaça, harmonização, gastronomia, culinária brasileira, stillare",
      isPublished: true,
      publishedAt: new Date("2025-06-10"),
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
    console.log(`✅ Blog post: ${post.title}`);
  }

  // Create default coupon
  await prisma.coupon.upsert({
    where: { code: "BEMVINDO10" },
    update: {},
    create: {
      code: "BEMVINDO10",
      description: "10% de desconto na primeira compra — bem-vindo à Stillare!",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 50,
      maxUses: 200,
      isActive: true,
      validFrom: new Date("2025-01-01"),
      validUntil: new Date("2027-12-31"),
    },
  });
  console.log("✅ Coupon: BEMVINDO10");

  console.log("🌱 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
