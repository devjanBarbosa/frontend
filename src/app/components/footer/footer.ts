import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  // Informações da loja
  lojaInfo = {
    nome: 'Leda Cosméticos',
    endereco: 'Estr. da Água Branca, 4497 - Bangu',
    cidade: 'Rio de Janeiro - RJ',
    cep: '21862-371',
    telefone: '(21) 99788-3761',
    whatsapp: '5521997883761',
    email: 'contato@ledacosmeticos.com.br',
    instagram: '@ledacosmeticos',
    facebook: 'ledacosmeticos',
    horarioFuncionamento: {
      segunda: '08:00 - 18:00',
      terca: '08:00 - 18:00',
      quarta: '08:00 - 18:00',
      quinta: '08:00 - 18:00',
      sexta: '08:00 - 18:00',
      sabado: '08:00 - 14:00',
      domingo: 'Fechado'
    },
    // Coordenadas para o mapa (substitua pelas coordenadas reais)
    coordenadas: {
      lat: -22.862284723242475, // São Paulo como exemplo
      lng: -43.457312618260474
    }
  };

  currentYear = new Date().getFullYear();
  map: any;
  mapLoaded = false;

  constructor() {}

  ngOnInit(): void {
    this.loadGoogleMapsScript();
  }

  ngAfterViewInit(): void {
    // Aguarda o script carregar antes de inicializar o mapa
    if (this.mapLoaded) {
      this.initializeMap();
    }
  }

  /**
   * Carrega o script do Google Maps dinamicamente
   */
  private loadGoogleMapsScript(): void {
    // Verifique se o script já foi carregado
    if (typeof google !== 'undefined' && google.maps) {
      this.mapLoaded = true;
      return;
    }

    // Cria o elemento script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD0n53VWgmdVE6zigv-NaSDrOjoKp09xvM&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      this.mapLoaded = true;
      if (this.mapContainer) {
        this.initializeMap();
      }
    };

    script.onerror = () => {
      console.error('Erro ao carregar Google Maps');
    };

    document.head.appendChild(script);
  }

  /**
   * Inicializa o mapa do Google
   */
  private initializeMap(): void {
    if (!this.mapContainer || !this.mapLoaded) {
      return;
    }

    const mapOptions = {
      center: this.lojaInfo.coordenadas,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ color: '#fef7f0' }]
        },
        {
          featureType: 'road',
          elementType: 'all',
          stylers: [{ color: '#ffffff' }]
        },
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#E91E63' }, { lightness: 80 }]
        }
      ]
    };

    this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

    // Adiciona marcador personalizado
    const marker = new google.maps.Marker({
      position: this.lojaInfo.coordenadas,
      map: this.map,
      title: this.lojaInfo.nome,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#E91E63" stroke="#fff" stroke-width="2"/>
            <text x="20" y="26" font-family="Arial" font-size="24" fill="white" text-anchor="middle">💄</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40)
      }
    });

    // Adiciona janela de informações
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 15px; font-family: 'Poppins', sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #E91E63;">${this.lojaInfo.nome}</h3>
          <p style="margin: 5px 0; color: #333;">
            <strong>📍 Endereço:</strong><br>
            ${this.lojaInfo.endereco}<br>
            ${this.lojaInfo.cidade}
          </p>
          <p style="margin: 5px 0; color: #333;">
            <strong>📞 Telefone:</strong> ${this.lojaInfo.telefone}
          </p>
          <p style="margin: 5px 0; color: #333;">
            <strong>🕐 Horário:</strong> Segunda a Sexta: 08:00-18:00
          </p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  /**
   * Abre o WhatsApp
   */
  openWhatsApp(): void {
    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os produtos da Leda Cosméticos.');
    window.open(`https://wa.me/${this.lojaInfo.whatsapp}?text=${message}`, '_blank');
  }

  /**
   * Abre o Google Maps para navegação
   */
  openDirections(): void {
    const address = encodeURIComponent(`${this.lojaInfo.endereco}, ${this.lojaInfo.cidade}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  }

  /**
   * Abre o Instagram
   */
  openInstagram(): void {
    window.open(`https://instagram.com/${this.lojaInfo.instagram.replace('@', '')}`, '_blank');
  }

  /**
   * Abre o Facebook
   */
  openFacebook(): void {
    window.open(`https://facebook.com/${this.lojaInfo.facebook}`, '_blank');
  }

  /**
   * Copia email para clipboard
   */
  copyEmail(): void {
    navigator.clipboard.writeText(this.lojaInfo.email).then(() => {
      alert('Email copiado para a área de transferência!');
    });
  }
}