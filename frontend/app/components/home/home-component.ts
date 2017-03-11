import {Component} from '@angular/core';
import {Router} from '@angular/router'

@Component({
  //selector: 'trade-app',
  templateUrl: '/app/components/home/templates/homeTemplate.html'
})
export class HomeComponent {
  constructor(private router: Router) { }

  redirectToProp(){
      this.router.navigate(['./proportions']);
  }

  redirectToGeos(){
      this.router.navigate(['./geos']);
  }

}
