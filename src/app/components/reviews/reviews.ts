import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interface para tipar os dados da avaliação
export interface Review {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews.html',
  styleUrls: ['./reviews.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Para o Swiper.js
})
export class ReviewsComponent implements OnInit {
  
  reviews$: Observable<Review[]> | undefined;

  constructor(private http: HttpClient) {}

   ngOnInit(): void {
    // 2. CONSTRUA O URL DINAMICAMENTE
    const apiUrl = `${environment.apiUrl}/api/reviews`; 

    this.reviews$ = this.http.get<any>(apiUrl).pipe( // <-- USE A VARIÁVEL apiUrl
      map(response => response.result?.reviews
        ?.filter((r: Review) => r.rating === 5)
        .slice(0, 5) 
      )
    );
  }

  // Função para criar um array para o *ngFor das estrelas
  getStars(rating: number): any[] {
    return new Array(rating);
  }
}