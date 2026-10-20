import { Component, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class LoginComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  get requiresLogin(): boolean {
    return this.route.snapshot.queryParamMap.get('reason') === 'signin-required';
  }
  loginForm!: FormGroup;
  error: string | null = null;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    this.error = null;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/products']);
      },
      error: (err: Error) => {
        this.loading = false;
        this.error = err.message || 'Erro ao efetuar login';
      },
    });
  }
}
