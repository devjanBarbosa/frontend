import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GoogleAnalyticsService } from '../../services/googleAnalyticsService';

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

  lojaInfo = {
    nome: 'Leda Freitas Cosméticos',
    endereco: 'Estr. da Água Branca, 4497 - Bangu',
    cidade: 'Rio de Janeiro - RJ',
    cep: '21862-371',
    whatsapp: '5521997883761',
    email: 'contato@ledacosmeticos.com.br',
    instagramUrl: 'https://instagram.com/ledafreitas_cosmeticos',
    facebookUrl: 'https://web.facebook.com/profile.php?id=100029668196851',
    horarios: [
      { dia: 'Segunda a Sexta', hora: '08:00 - 18:00' },
      { dia: 'Sábado', hora: '08:00 - 14:00' },
      { dia: 'Domingo', hora: 'Fechado' }
    ],
    coordenadas: { lat: -22.86228, lng: -43.45731 }
  };

  currentYear = new Date().getFullYear();
  mapLoaded = false;

  constructor(private toastr: ToastrService, private cdr: ChangeDetectorRef, private googleAnalyticsService: GoogleAnalyticsService) {}

  ngOnInit(): void {
    this.loadGoogleMapsScript();
  }

  ngAfterViewInit(): void {
    if (this.mapLoaded) {
      this.initializeMap();
    }
  }

  private loadGoogleMapsScript(): void {
    if (typeof google !== 'undefined' && google.maps) {
      this.mapLoaded = true;
      return;
    }
    const script = document.createElement('script');
    // IMPORTANTE: Substitua 'SUA_CHAVE_API_AQUI' pela sua chave do Google Maps
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD0n53VWgmdVE6zigv-NaSDrOjoKp09xvM&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.mapLoaded = true;
      this.cdr.detectChanges(); // Força a deteção de mudanças
      this.initializeMap();
    };
    script.onerror = () => console.error('Erro ao carregar Google Maps');
    document.head.appendChild(script);
  }

  private initializeMap(): void {
    if (!this.mapContainer?.nativeElement || !this.mapLoaded) return;

    const mapOptions = {
      center: this.lojaInfo.coordenadas,
      zoom: 16,
      disableDefaultUI: true, // Interface mais limpa
    };
    const map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

    new google.maps.Marker({
      position: this.lojaInfo.coordenadas,
      map: map,
      title: this.lojaInfo.nome
    });
  }

  copyToClipboard(text: string, type: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toastr.success(`${type} copiado para a área de transferência!`);
    });
  }

    openDirections(): void {
    this.googleAnalyticsService.reportarEventoPersonalizado('click_get_directions');
    const address = encodeURIComponent(`${this.lojaInfo.endereco}, ${this.lojaInfo.cidade}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  }
}