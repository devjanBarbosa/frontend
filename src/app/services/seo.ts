import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { ProductService, Produto } from './product';
import { environment } from '../../environments/environment'; // Importe o environment

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  private renderer: Renderer2;
  private currentSchemaScript?: HTMLElement;
  private canonicalLink?: HTMLElement;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

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
      
      // Constrói a URL canônica completa usando a variável do environment
      const canonicalUrl = `${environment.apiUrl}${this.router.url.split('?')[0]}`;
      this.updateCanonicalUrl(canonicalUrl);

      if (productId) {
        this.productService.buscarProdutoPorId(productId).subscribe(produto => {
          const title = `Comprar ${produto.nome} | Leda Cosméticos`;
          const description = produto.descricao.substring(0, 155);
          this.updateMetaTags(title, description, produto.urlImagem);
          this.setProductSchema(produto, canonicalUrl);
        });
      } else {
        const currentRoute = this.router.url.split('?')[0];
        this.updateTagsForStaticPage(currentRoute);
        this.setLocalBusinessSchema();
      }
    });
  }

  private updateMetaTags(title: string, description: string, imageUrl?: string): void {
    // Define uma imagem padrão (seu logo) para páginas que não têm imagem própria
    const defaultImageUrl = `${environment.apiUrl}/assets/logo-social.png`; // Crie um logo de 1200x630px e salve em assets
    const effectiveImageUrl = imageUrl || defaultImageUrl;

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    
    // Tags para compartilhamento (Open Graph)
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: effectiveImageUrl });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
  }

  private updateCanonicalUrl(url: string): void {
    if (this.canonicalLink) {
      this.renderer.setAttribute(this.canonicalLink, 'href', url);
    } else {
      const link: HTMLElement = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'canonical');
      this.renderer.setAttribute(link, 'href', url);
      this.renderer.appendChild(this.document.head, link);
      this.canonicalLink = link;
    }
  }

  private setProductSchema(produto: Produto, canonicalUrl: string): void {
    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: produto.nome,
      image: [produto.urlImagem], // A URL da imagem do produto já deve ser absoluta
      description: produto.descricao,
      sku: produto.id,
      offers: {
        '@type': 'Offer',
        url: canonicalUrl, // Usa a URL canônica completa
        priceCurrency: 'BRL',
        price: produto.preco,
        availability: produto.estoque > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Leda Cosméticos'
        }
      }
    };
    this.injectSchema(schema);
  }

  private setLocalBusinessSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'Leda Cosméticos',
      image: `${environment.apiUrl}/assets/logo-social.png`, // Usa a URL completa
      telephone: '+5521997883761',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Estr. da Água Branca, 4497',
        addressLocality: 'Bangu',
        addressRegion: 'RJ',
        postalCode: '21862-371',
        addressCountry: 'BR'
      },
      // ... o resto do seu schema
    };
    this.injectSchema(schema);
  }

  private injectSchema(schema: object): void {
    if (this.currentSchemaScript) {
      this.renderer.removeChild(this.document.head, this.currentSchemaScript);
    }
    const script: HTMLScriptElement = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, script);
    this.currentSchemaScript = script;
  }

  private updateTagsForStaticPage(url: string): void {
    // Títulos e descrições continuam os mesmos
    let title = 'Leda Cosméticos | Entrega Rápida em Bangu, RJ';
    let description = 'Descubra nossa seleção de cosméticos e presentes em Bangu, com entrega rápida. A curadoria especial da Leda para a sua beleza.';

    switch (url) {
      case '/produtos':
        title = 'Todos os Produtos | Leda Cosméticos';
        description = 'Explore nosso catálogo completo de produtos de beleza, de skincare a maquiagem.';
        break;
      case '/presentes':
        title = 'Presentes Especiais | Leda Cosméticos';
        description = 'Encontre a cesta ou o presente perfeito para surpreender quem você ama.';
        break;
      case '/sobre-nos':
        title = 'Sobre Nós | Leda Cosméticos';
        description = 'Conheça a história da Leda e a paixão por trás da nossa loja de cosméticos em Bangu.';
        break;
    }
    this.updateMetaTags(title, description);
  }
}