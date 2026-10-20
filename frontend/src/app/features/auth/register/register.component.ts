import { environment } from '../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class RegisterComponent implements OnInit {
  readonly allowAdminRegistration = environment.allowAdminRegistration;
  registerForm!: FormGroup;
  error: string | null = null;
  success: string | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      role: new FormControl('USER', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    this.loading = true;
    this.error = null;
    const { username, password, role } = this.registerForm.value;

    this.authService.register(username, password, role).subscribe({
      next: () => {
        this.success =
          'Cadastro realizado com sucesso! Redirecionando para login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
        this.loading = false;
      },
      error: (err: Error) => {
        this.loading = false;
        this.error = err.message || 'Erro ao registrar usuário';
      },
    });
  }
}
