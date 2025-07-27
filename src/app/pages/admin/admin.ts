import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from "@angular/router";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {

}