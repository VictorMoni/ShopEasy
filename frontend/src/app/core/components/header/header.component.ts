import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../features/auth/auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
})
export class HeaderComponent implements OnInit, OnDestroy {
  darkMode = document.documentElement.dataset['theme'] === 'dark';
  private syncTheme = () => { this.darkMode = document.documentElement.dataset['theme'] === 'dark'; };

  toggleTheme(): void {
    const theme = this.darkMode ? 'light' : 'dark';
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('shopeasy-theme', theme); } catch { /* Optional persistence. */ }
    this.darkMode = !this.darkMode;
  }

  ngOnDestroy(): void { window.removeEventListener('themechange', this.syncTheme); }

  loggedIn$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    window.addEventListener('themechange', this.syncTheme);
    this.loggedIn$ = this.authService.isLoggedIn$;
    this.isAdmin$ = this.authService.isAdmin$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
