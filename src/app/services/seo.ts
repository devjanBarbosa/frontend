import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core'; // 1. Importações Corretas
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { ProductService, Produto } from './product';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  private renderer: Renderer2;
  private currentSchemaScript?: HTMLScriptElement;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    // 2. Inicializa o renderer aqui no construtor
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  // O método init() completo para iniciar o serviço
  init(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      switchMap(route => route.paramMap)
    ).subscribe(paramMap => {
      const productId = paramMap.get('id');
      const currentUrl = this.router.url.split('?')[0];

      if (productId) {
        this.productService.buscarProdutoPorId(productId).subscribe(produto => {
          const title = `Comprar ${produto.nome} | Leda Cosméticos`;
          const description = produto.descricao.substring(0, 155);
          this.updateMetaTags(title, description);
          this.setProductSchema(produto);
        });
      } else {
        this.updateTagsForStaticPage(currentUrl);
        this.setLocalBusinessSchema();
      }
    });
  }

  // --- O resto dos seus métodos (já corretos) ---

  private updateTagsForStaticPage(url: string): void {
    let title = 'Leda Cosméticos - A sua loja de beleza em Bangu, RJ';
    let description = 'Descubra a nossa seleção de cosméticos e presentes, com entrega rápida no seu bairro. A curadoria especial da Leda para a sua beleza.';

    switch (url) {
      case '/produtos':
        title = 'Todos os Produtos | Leda Cosméticos';
        description = 'Explore o nosso catálogo completo de produtos de beleza, desde skincare a maquilhagem.';
        break;
      case '/presentes':
        title = 'Presentes Especiais | Leda Cosméticos';
        description = 'Encontre a cesta ou o presente perfeito para surpreender quem você ama em qualquer ocasião.';
        break;
      case '/sobre-nos':
        title = 'Sobre Nós | Leda Cosméticos';
        description = 'Conheça a história da Leda e a paixão que deu origem à nossa loja de cosméticos local.';
        break;
    }
    this.updateMetaTags(title, description);
  }

  private updateMetaTags(title: string, description: string): void {
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    // this.metaService.updateTag({ property: 'og:image', content: 'URL_DA_SUA_IMAGEM_PADRAO' });
  }

  private setProductSchema(produto: Produto): void {
    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': produto.nome,
      'image': [produto.urlImagem],
      'description': produto.descricao,
      'sku': produto.id,
      'offers': {
        '@type': 'Offer',
        'url': `${window.location.href}`,
        'priceCurrency': 'BRL',
        'price': produto.preco,
        'availability': produto.estoque > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller': {
          '@type': 'Organization',
          'name': 'Leda Cosméticos'
        }
      }
    };
    this.injectSchema(schema);
  }

  private setLocalBusinessSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      'name': 'Leda Cosméticos',
      'image': 'URL_DA_SUA_LOGO_AQUI',
      'telephone': '+5521997883761',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Estr. da Água Branca, 4497',
        'addressLocality': 'Bangu',
        'addressRegion': 'RJ',
        'postalCode': '21862-371',
        'addressCountry': 'BR'
      },
      'openingHoursSpecification': [
        { '@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'opens': '08:00', 'closes': '18:00' },
        { '@type': 'OpeningHoursSpecification', 'dayOfWeek': 'Saturday', 'opens': '08:00', 'closes': '14:00' }
      ]
    };
    this.injectSchema(schema);
  }

  private injectSchema(schema: object): void {
    if (this.currentSchemaScript) {
      this.renderer.removeChild(this.document.head, this.currentSchemaScript);
    }
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, script);
    this.currentSchemaScript = script;
  }
}