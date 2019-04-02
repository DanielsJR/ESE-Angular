import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { SessionStorageService } from '../../services/session-storage.service';
import { Theme } from './theme';
import { THEMESDARK, THEMESLIGHT } from './themes';
import { ThemeService } from './theme.service';
import { UserLoggedService } from '../../services/user-logged.service';
import { User } from '../../models/user';


@Component({
  selector: 'nx-theme-picker',
  templateUrl: './theme-picker.component.html',
  styleUrls: ['./theme-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThemePickerComponent implements OnInit {
  themesLight = THEMESLIGHT;
  themesDark = THEMESDARK;
  themeArray: Theme[];

  @Input() initialTheme: Theme;
  private defaultTheme: Theme = this.themesLight[4]; //indigo-pink
  private savedTheme: Theme;

  isInstalled: boolean = !!this.sessionStorage.getTheme();

  user: User;

  constructor(public overlayContainer: OverlayContainer,
    private sessionStorage: SessionStorageService,
    private themeService: ThemeService,
    private userLoggedService: UserLoggedService
  ) { }

  ngOnInit() {
    if (!this.isInstalled) {
      this.installTheme((this.initialTheme) ? this.initialTheme : this.defaultTheme);//indigo-pink default
    }
    this.overlayContainer.getContainerElement().classList.add(this.theme().name);
    this.setThemeArray();
    this.userLoggedService.userLogged$.subscribe(user => {
      this.user = user;
    });
  }


  theme(): Theme {
    return this.sessionStorage.getTheme();
  }

  get themeName(): string {
    return this.theme().name;
  }

  get isDark(): boolean {
    return this.theme().isDark;
  }

  setThemeArray(): void {
    this.themeArray = (this.isDark) ? this.themesDark : this.themesLight;
  }

  installTheme(theme: Theme): void {
    let oldThemeName = (this.theme()) ? this.themeName : undefined;
    this.sessionStorage.setTheme(theme);
    if (oldThemeName) this.overlayContainer.getContainerElement().classList.remove(oldThemeName);
    this.overlayContainer.getContainerElement().classList.add(theme.name);
    this.setThemeArray();
    this.isInstalled = true;
    this.sessionStorage.darkThemeNext();

  }

  mouseOverTheme(theme: Theme): void {
    this.savedTheme = this.theme();
    this.installTheme(theme);
    this.isInstalled = false;
  }

  mouseOutTheme(): void {
    if (!this.isInstalled) this.installTheme(this.savedTheme);
  }

  installDarkTheme(): void {
    if (!this.isDark) {
      const darkThemeName = this.themeName + '-dark';
      const darkTheme = this.themesDark.find(t => t.name === darkThemeName);
      this.installTheme(darkTheme);
      if (this.userLoggedService.hasPrivileges()) this.saveThemeOnServer(this.user.id, darkTheme);
    }
  }

  installLightTheme(): void {
    if (this.isDark) {
      const lightThemeName = this.themeName.slice(0, -5);
      const lightTheme = this.themesLight.find(t => t.name === lightThemeName);
      this.installTheme(lightTheme);
      if (this.userLoggedService.hasPrivileges()) this.saveThemeOnServer(this.user.id, lightTheme);
    }
  }


  private saveThemeOnServer(userId: string, theme: Theme) {
    if (this.userLoggedService.hasPrivileges()) {
      this.themeService.saveTheme(userId, theme).subscribe();
    }

  }

}
