import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Precisamos importar as ferramentas para formulários reativos
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  // 2. Adicionamos o ReactiveFormsModule e RouterModule aqui
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        alert('Login realizado com sucesso!');
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        alert('Email ou senha inválidos.');
      }
    });
  }
}