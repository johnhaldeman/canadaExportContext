import { Component } from '@angular/core';

@Component({
  selector: 'trade-app',
  template:`
    <nav class="navbar navbar-dark bg-inverse">
      <!-- <div class="container-fluid"> -->
        <!-- Brand and toggle get grouped for better mobile display -->
        <a class="navbar-brand" href="#"><i class="fa fa-exchange" aria-hidden="true"></i>&nbsp; Canadian Trade in Context</a>

        <!-- Collect the nav links, forms, and other content for toggling -->
        <!-- <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">-->
          <ul class="nav navbar-nav">
            <li class="nav-item" routerLinkActive="active"><a class="nav-link" routerLink="/proportions"><i class="fa fa-tint" aria-hidden="true"></i>&nbsp;Products</a></li>
            <li class="nav-item" routerLinkActive="active"><a class="nav-link" routerLink="/geos"><i class="fa fa-globe" aria-hidden="true"></i>&nbsp;Partners</a></li>
            <li class="nav-item"><a class="nav-link"><i class="fa fa-line-chart" aria-hidden="true"></i>&nbsp;Trends</a></li>
            <li class="nav-item"><a class="nav-link"><i class="fa fa-object-ungroup" aria-hidden="true"></i>&nbsp;Compare</a></li>
          </ul>
          <ul class="nav navbar-nav float-xs-right">
            <li class="nav-item"><a class="nav-link"><i class="fa fa-file-text" aria-hidden="true"></i>&nbsp;Analysis</a></li>
            <li class="nav-item" routerLinkActive="active"><a href="#" class="nav-link" routerLink="/about"><i class="fa fa-info-circle" aria-hidden="true"></i>&nbsp;About</a></li>
          </ul>
        <!-- </div>--><!-- /.navbar-collapse -->
      <!-- </div>--><!-- /.container-fluid -->
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {

}
